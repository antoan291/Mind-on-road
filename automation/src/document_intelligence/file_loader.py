from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image

from .exceptions import InvalidDocumentError
from .pdf_renderer import render_pdf_pages_to_png_bytes


SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}


def is_supported_document_file(file_name: str) -> bool:
  return Path(file_name).suffix.lower() == ".pdf" or Path(file_name).suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS


def render_document_path_to_png_bytes(
  document_path: Path,
  *,
  max_pages: int = 2,
  render_scale: float = 2.0,
) -> list[bytes]:
  suffix = document_path.suffix.lower()
  if suffix == ".pdf":
    return render_pdf_pages_to_png_bytes(
      document_path,
      max_pages=max_pages,
      render_scale=render_scale,
    )
  if suffix in SUPPORTED_IMAGE_EXTENSIONS:
    return [_normalize_image_bytes(document_path.read_bytes(), file_name=document_path.name)]
  raise InvalidDocumentError("Поддържат се само PDF и изображения (PNG/JPG/JPEG/WEBP/BMP/TIFF).")


def render_uploaded_document_to_png_bytes(
  *,
  file_name: str,
  file_bytes: bytes,
  max_pages: int = 2,
  render_scale: float = 2.0,
) -> list[bytes]:
  suffix = Path(file_name).suffix.lower()
  if suffix == ".pdf":
    temp_path = Path(file_name)
    return render_pdf_bytes_to_png_bytes(file_bytes, pdf_name=temp_path.name, max_pages=max_pages, render_scale=render_scale)
  if suffix in SUPPORTED_IMAGE_EXTENSIONS:
    return [_normalize_image_bytes(file_bytes, file_name=file_name)]
  raise InvalidDocumentError("Поддържат се само PDF и изображения (PNG/JPG/JPEG/WEBP/BMP/TIFF).")


def render_pdf_bytes_to_png_bytes(
  pdf_bytes: bytes,
  *,
  pdf_name: str,
  max_pages: int = 2,
  render_scale: float = 2.0,
) -> list[bytes]:
  import fitz

  if not pdf_bytes:
    raise InvalidDocumentError(f"Файлът е празен: {pdf_name}")

  try:
    document = fitz.open(stream=pdf_bytes, filetype="pdf")
  except Exception as exc:  # pragma: no cover
    raise InvalidDocumentError(f"PDF файлът не може да бъде отворен: {pdf_name}") from exc

  if document.page_count == 0:
    document.close()
    raise InvalidDocumentError("PDF файлът е празен.")

  page_images: list[bytes] = []
  matrix = fitz.Matrix(render_scale, render_scale)

  try:
    for page_index in range(min(document.page_count, max_pages)):
      page = document.load_page(page_index)
      pixmap = page.get_pixmap(matrix=matrix, alpha=False)
      page_images.append(pixmap.tobytes("png"))
  finally:
    document.close()

  if not page_images:
    raise InvalidDocumentError("Не бяха извлечени страници от PDF файла.")

  return page_images


def _normalize_image_bytes(file_bytes: bytes, *, file_name: str) -> bytes:
  if not file_bytes:
    raise InvalidDocumentError(f"Файлът е празен: {file_name}")

  try:
    with Image.open(BytesIO(file_bytes)) as image:
      normalized = image.convert("RGB")
      output = BytesIO()
      normalized.save(output, format="PNG")
      return output.getvalue()
  except Exception as exc:  # pragma: no cover
    raise InvalidDocumentError(f"Изображението не може да бъде обработено: {file_name}") from exc
