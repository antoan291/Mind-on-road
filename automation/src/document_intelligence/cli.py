from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .config import ExtractionConfig
from .exceptions import DocumentIntelligenceError
from .pipeline import default_output_path, extract_bulgarian_document_data


def build_parser() -> argparse.ArgumentParser:
  parser = argparse.ArgumentParser(
    description="Извличане на данни от българска лична карта или шофьорска книжка от PDF файл."
  )
  parser.add_argument("pdf", type=Path, help="Път до PDF файла със сканирани страници.")
  parser.add_argument(
    "--output",
    type=Path,
    default=None,
    help="Път до изходния JSON файл. Ако липсва, ще се използва automation/output/<име>.json",
  )
  parser.add_argument(
    "--model",
    type=str,
    default=None,
    help="Езиков OCR модел за PaddleOCR. По подразбиране се взима от PADDLEOCR_LANGUAGE или cyrillic.",
  )
  parser.add_argument(
    "--max-pages",
    type=int,
    default=2,
    help="Максимален брой страници за анализ. По подразбиране: 2.",
  )
  parser.add_argument(
    "--render-scale",
    type=float,
    default=2.0,
    help="Скалата за рендериране на PDF страниците към PNG. По подразбиране: 2.0.",
  )
  return parser


def main() -> None:
  if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
  if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

  parser = build_parser()
  args = parser.parse_args()

  config = ExtractionConfig.from_env(
    model_override=args.model,
    max_pages=args.max_pages,
    render_scale=args.render_scale,
  )

  output_path = args.output or default_output_path(args.pdf)

  try:
    extraction = extract_bulgarian_document_data(
      pdf_path=args.pdf,
      output_path=output_path,
      config=config,
    )
  except DocumentIntelligenceError as exc:
    print(f"Грешка при извличането: {exc}", file=sys.stderr)
    raise SystemExit(1) from exc

  print(json.dumps(extraction.to_bulgarian_dict(), ensure_ascii=False, indent=2))
  print(f"\nРезултатът е записан в: {output_path}")


if __name__ == "__main__":
  main()
