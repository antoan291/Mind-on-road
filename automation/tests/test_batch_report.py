from pathlib import Path

from document_intelligence.batch_report import assess_extraction
from document_intelligence.batch_report import infer_expected_document_type
from document_intelligence.models import BulgarianDocumentExtraction
from document_intelligence.models import DrivingLicenceCategory


def test_infer_expected_document_type_from_path() -> None:
  assert (
    infer_expected_document_type(
      Path("test-docs/bad-images/antoan-driving-license/photo.jpg")
    )
    == "bulgarian_driving_licence"
  )
  assert (
    infer_expected_document_type(Path("test-docs/bad-images/antoan-id/photo.jpg"))
    == "bulgarian_identity_card"
  )


def test_assess_extraction_marks_strong_identity_card_as_ok() -> None:
  assessment = assess_extraction(
    file_path=Path("test-docs/pdf/id-card.pdf"),
    extraction=BulgarianDocumentExtraction(
      document_type="bulgarian_identity_card",
      first_name="Антоан",
      last_name="Тестов",
      egn="9904041234",
      document_number="123456789",
      place_of_birth="СОФИЯ",
      permanent_address="гр. София, ул. Тест 1",
      confidence=0.93,
      warnings=[],
    ),
  )

  assert assessment.status == "ok"
  assert assessment.reasons == []


def test_assess_extraction_marks_missing_fields_as_review() -> None:
  assessment = assess_extraction(
    file_path=Path("test-docs/bad-images/antoan-driving-license/photo.jpg"),
    extraction=BulgarianDocumentExtraction(
      document_type="bulgarian_driving_licence",
      first_name="Антоан",
      last_name=None,
      egn=None,
      document_number="123456789",
      driving_categories=[DrivingLicenceCategory(category="B", date=None)],
      confidence=0.51,
      warnings=["ocr uncertain"],
    ),
  )

  assert assessment.status == "review"
  assert "last name missing" in assessment.reasons
  assert "egn missing" in assessment.reasons


def test_assess_extraction_keeps_backside_only_driving_licence_as_review() -> None:
  assessment = assess_extraction(
    file_path=Path("test-docs/bad-images/antoan-driving-license/photo-back.jpg"),
    extraction=BulgarianDocumentExtraction(
      document_type="bulgarian_driving_licence",
      first_name=None,
      last_name=None,
      egn=None,
      document_number=None,
      driving_categories=[DrivingLicenceCategory(category="B", date=None)],
      confidence=0.9,
      warnings=["Категориите са разчетени само от гърба на книжката."],
    ),
  )

  assert assessment.status == "review"
