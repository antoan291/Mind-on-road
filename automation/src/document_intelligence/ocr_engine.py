from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from tempfile import TemporaryDirectory

from .config import ExtractionConfig
from .exceptions import OCRDependencyError
from .exceptions import OCRProcessingError


@dataclass(frozen=True)
class OCRLine:
  text: str
  confidence: float
  page_number: int
  top: float
  left: float
  right: float
  bottom: float


def _extract_coordinates(box: object) -> tuple[float, float, float, float]:
  if not isinstance(box, list) or not box:
    return (0.0, 0.0, 0.0, 0.0)

  xs: list[float] = []
  ys: list[float] = []

  for point in box:
    if isinstance(point, list) and len(point) >= 2:
      try:
        xs.append(float(point[0]))
        ys.append(float(point[1]))
      except (TypeError, ValueError):
        continue

  if not xs or not ys:
    return (0.0, 0.0, 0.0, 0.0)

  return (min(xs), min(ys), max(xs), max(ys))


def _extract_prediction_payload(prediction: object) -> dict[str, object]:
  json_payload = getattr(prediction, "json", None)
  if isinstance(json_payload, dict):
    if "res" in json_payload and isinstance(json_payload["res"], dict):
      return json_payload["res"]
    return json_payload

  if isinstance(json_payload, str):
    try:
      parsed = json.loads(json_payload)
    except json.JSONDecodeError as exc:
      raise OCRProcessingError("PaddleOCR върна невалиден JSON резултат.") from exc

    if isinstance(parsed, dict) and "res" in parsed and isinstance(parsed["res"], dict):
      return parsed["res"]

    if isinstance(parsed, dict):
      return parsed

  raise OCRProcessingError("PaddleOCR върна резултат без JSON payload.")


def _load_paddle_ocr(config: ExtractionConfig):
  try:
    from paddleocr import PaddleOCR
  except ImportError as exc:  # pragma: no cover
    raise OCRDependencyError(
      "PaddleOCR не е инсталиран. Инсталирай първо `paddlepaddle` и `paddleocr`."
    ) from exc

  kwargs = {
    "use_angle_cls": True,
    "lang": config.ocr_language,
    "ocr_version": config.ocr_version,
  }

  try:
    return PaddleOCR(**kwargs)
  except TypeError:
    return PaddleOCR(**kwargs)


def extract_ocr_lines(page_images: list[bytes], config: ExtractionConfig) -> list[OCRLine]:
  ocr = _load_paddle_ocr(config)
  ocr_lines: list[OCRLine] = []

  with TemporaryDirectory(prefix="mindonroad-ocr-") as temp_dir:
    temp_root = Path(temp_dir)

    for page_number, image_bytes in enumerate(page_images, start=1):
      image_path = temp_root / f"page-{page_number}.png"
      image_path.write_bytes(image_bytes)

      try:
        predictions = list(ocr.predict(str(image_path)))
      except Exception as exc:  # pragma: no cover
        raise OCRProcessingError(
          f"PaddleOCR не успя да обработи страница {page_number}: {exc}"
        ) from exc

      if not predictions:
        continue

      for prediction in predictions:
        payload = _extract_prediction_payload(prediction)
        texts = payload.get("rec_texts", [])
        scores = payload.get("rec_scores", [])
        boxes = payload.get("rec_boxes", [])

        if not isinstance(texts, list) or not isinstance(scores, list) or not isinstance(boxes, list):
          continue

        for text, score, box in zip(texts, scores, boxes):
          text = str(text).strip()
          if not text:
            continue

          try:
            confidence = float(score)
          except (TypeError, ValueError):
            confidence = 0.0

          left, top, right, bottom = _extract_coordinates(box)

          if confidence < config.min_text_confidence:
            continue

          ocr_lines.append(
            OCRLine(
              text=text,
              confidence=confidence,
              page_number=page_number,
              top=top,
              left=left,
              right=right,
              bottom=bottom,
            )
          )

  ocr_lines.sort(key=lambda item: (item.page_number, item.top, item.left))
  return ocr_lines
