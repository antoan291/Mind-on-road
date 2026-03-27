from __future__ import annotations

from pathlib import Path

import fitz

from .exceptions import InvalidPdfError


def render_pdf_pages_to_png_bytes(
  pdf_path: Path,
  *,
  max_pages: int = 2,
  render_scale: float = 2.0,
) -> list[bytes]:
  if not pdf_path.exists():
    raise InvalidPdfError(f"PDF файлът не съществува: {pdf_path}")

  if pdf_path.suffix.lower() != ".pdf":
    raise InvalidPdfError("Поддържа се само PDF вход.")

  try:
    document = fitz.open(pdf_path)
  except Exception as exc:  # pragma: no cover
    raise InvalidPdfError(f"PDF файлът не може да бъде отворен: {pdf_path}") from exc

  if document.page_count == 0:
    raise InvalidPdfError("PDF файлът е празен.")

  page_images: list[bytes] = []
  matrix = fitz.Matrix(render_scale, render_scale)

  for page_index in range(min(document.page_count, max_pages)):
    page = document.load_page(page_index)
    pixmap = page.get_pixmap(matrix=matrix, alpha=False)
    page_images.append(pixmap.tobytes("png"))

  document.close()

  if not page_images:
    raise InvalidPdfError("Не бяха извлечени страници от PDF файла.")

  return page_images
