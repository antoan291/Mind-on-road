from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .models import BulgarianDocumentExtraction


SUPPORTED_BATCH_EXTENSIONS = {
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".bmp",
  ".tif",
  ".tiff",
}


@dataclass(frozen=True)
class BatchAssessment:
  status: str
  reasons: list[str]
  expected_document_type: str | None


def collect_supported_documents(root_dir: Path) -> list[Path]:
  return sorted(
    path
    for path in root_dir.rglob("*")
    if path.is_file() and path.suffix.lower() in SUPPORTED_BATCH_EXTENSIONS
  )


def infer_expected_document_type(file_path: Path) -> str | None:
  normalized = str(file_path).casefold()

  if "driving-license" in normalized or "driving_licence" in normalized or "car-card" in normalized or "license" in normalized:
    return "bulgarian_driving_licence"
  if "id-card" in normalized or "id_card" in normalized or "antoan-id" in normalized or "/id/" in normalized:
    return "bulgarian_identity_card"
  return None


def assess_extraction(
  *,
  file_path: Path,
  extraction: BulgarianDocumentExtraction,
) -> BatchAssessment:
  reasons: list[str] = []
  expected_document_type = infer_expected_document_type(file_path)

  if extraction.document_type == "unknown":
    reasons.append("document type is unknown")

  if expected_document_type and extraction.document_type != expected_document_type:
    reasons.append(
      f"expected {expected_document_type}, got {extraction.document_type}"
    )

  if extraction.first_name is None:
    reasons.append("first name missing")
  if extraction.last_name is None:
    reasons.append("last name missing")
  if extraction.egn is None:
    reasons.append("egn missing")
  if extraction.document_number is None:
    reasons.append("document number missing")

  if extraction.document_type == "bulgarian_identity_card":
    if extraction.place_of_birth is None:
      reasons.append("place of birth missing")
    if extraction.permanent_address is None:
      reasons.append("permanent address missing")

  if extraction.document_type == "bulgarian_driving_licence":
    if not extraction.driving_categories:
      reasons.append("driving categories missing")

  if extraction.confidence is not None and extraction.confidence < 0.6:
    reasons.append(f"low confidence {extraction.confidence:.2f}")

  if len(extraction.warnings) >= 4:
    reasons.append(f"many warnings ({len(extraction.warnings)})")

  if not reasons:
    return BatchAssessment(
      status="ok",
      reasons=[],
      expected_document_type=expected_document_type,
    )

  if extraction.document_type == "unknown":
    return BatchAssessment(
      status="failed",
      reasons=reasons,
      expected_document_type=expected_document_type,
    )

  if (
    extraction.first_name is None
    and extraction.last_name is None
    and extraction.egn is None
    and not extraction.driving_categories
  ):
    return BatchAssessment(
      status="failed",
      reasons=reasons,
      expected_document_type=expected_document_type,
    )

  return BatchAssessment(
    status="review",
    reasons=reasons,
    expected_document_type=expected_document_type,
  )
