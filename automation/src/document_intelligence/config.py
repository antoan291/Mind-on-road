from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


@dataclass(frozen=True)
class ExtractionConfig:
  ocr_language: str
  ocr_version: str
  use_gpu: bool
  min_text_confidence: float
  max_pages: int
  render_scale: float

  @classmethod
  def from_env(
    cls,
    *,
    env_file: Path | None = None,
    model_override: str | None = None,
    max_pages: int = 2,
    render_scale: float = 2.0,
  ) -> "ExtractionConfig":
    if env_file is not None and env_file.exists():
      load_dotenv(env_file)
    else:
      load_dotenv()

    ocr_language = (model_override or os.getenv("PADDLEOCR_LANGUAGE", "bg")).strip()
    ocr_version = os.getenv("PADDLEOCR_VERSION", "PP-OCRv5").strip()
    use_gpu = os.getenv("PADDLEOCR_USE_GPU", "false").strip().lower() in {"1", "true", "yes", "on"}
    min_text_confidence = float(os.getenv("PADDLEOCR_MIN_TEXT_CONFIDENCE", "0.35").strip())

    return cls(
      ocr_language=ocr_language,
      ocr_version=ocr_version,
      use_gpu=use_gpu,
      min_text_confidence=min_text_confidence,
      max_pages=max_pages,
      render_scale=render_scale,
    )
