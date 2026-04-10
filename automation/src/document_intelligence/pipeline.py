from __future__ import annotations

import json
from pathlib import Path

from .config import ExtractionConfig
from .file_loader import render_document_path_to_png_bytes
from .file_loader import render_uploaded_document_to_png_bytes
from .models import BulgarianDocumentExtraction
from .ocr_engine import extract_ocr_lines
from .text_parser import parse_bulgarian_document


def default_output_path(document_name: str) -> Path:
  return Path(__file__).resolve().parents[2] / "output" / f"{Path(document_name).stem}.json"


def extract_bulgarian_document_data(
  *,
  pdf_path: Path,
  output_path: Path | None = None,
  config: ExtractionConfig,
) -> BulgarianDocumentExtraction:
  page_images = render_document_path_to_png_bytes(
    pdf_path,
    max_pages=config.max_pages,
    render_scale=config.render_scale,
  )

  ocr_lines = extract_ocr_lines(page_images, config)
  extraction = parse_bulgarian_document(ocr_lines)

  destination = output_path or default_output_path(pdf_path.name)
  _write_output(destination, extraction)

  return extraction


def extract_bulgarian_document_from_upload(
  *,
  file_name: str,
  file_bytes: bytes,
  output_path: Path | None = None,
  config: ExtractionConfig,
) -> BulgarianDocumentExtraction:
  page_images = render_uploaded_document_to_png_bytes(
    file_name=file_name,
    file_bytes=file_bytes,
    max_pages=config.max_pages,
    render_scale=config.render_scale,
  )

  ocr_lines = extract_ocr_lines(page_images, config)
  extraction = parse_bulgarian_document(ocr_lines)

  destination = output_path or default_output_path(file_name)
  _write_output(destination, extraction)

  return extraction


def _write_output(destination: Path, extraction: BulgarianDocumentExtraction) -> None:
  destination.parent.mkdir(parents=True, exist_ok=True)
  destination.write_text(
    json.dumps(extraction.to_bulgarian_dict(), ensure_ascii=False, indent=2),
    encoding="utf-8",
  )
