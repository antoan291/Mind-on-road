from __future__ import annotations

import json
from pathlib import Path

from .config import ExtractionConfig
from .models import BulgarianDocumentExtraction
from .ocr_engine import extract_ocr_lines
from .pdf_renderer import render_pdf_pages_to_png_bytes
from .text_parser import parse_bulgarian_document


def default_output_path(pdf_path: Path) -> Path:
  return Path(__file__).resolve().parents[2] / "output" / f"{pdf_path.stem}.json"


def extract_bulgarian_document_data(
  *,
  pdf_path: Path,
  output_path: Path | None = None,
  config: ExtractionConfig,
) -> BulgarianDocumentExtraction:
  page_images = render_pdf_pages_to_png_bytes(
    pdf_path,
    max_pages=config.max_pages,
    render_scale=config.render_scale,
  )

  ocr_lines = extract_ocr_lines(page_images, config)
  extraction = parse_bulgarian_document(ocr_lines)

  destination = output_path or default_output_path(pdf_path)
  destination.parent.mkdir(parents=True, exist_ok=True)
  destination.write_text(
    json.dumps(extraction.to_bulgarian_dict(), ensure_ascii=False, indent=2),
    encoding="utf-8",
  )

  return extraction
