from document_intelligence.ocr_engine import OCRLine
from document_intelligence.text_parser import parse_bulgarian_document


def line(text: str, page_number: int = 1, confidence: float = 0.95) -> OCRLine:
  return OCRLine(
    text=text,
    confidence=confidence,
    page_number=page_number,
    top=0.0,
    left=0.0,
    right=0.0,
    bottom=0.0,
  )


def test_unknown_documents_stay_unknown() -> None:
  extraction = parse_bulgarian_document(
    [
      line("Random source document"),
      line("Nothing here matches Bulgarian ID or licence layouts"),
      line("1234567890"),
    ]
  )

  assert extraction.document_type == "unknown"
  assert extraction.review_required is True
  assert extraction.first_name is None
  assert extraction.egn is None
  assert extraction.document_number is None
  assert extraction.place_of_birth is None
  assert extraction.permanent_address is None
  assert extraction.driving_categories == []
  assert any("Типът на документа" in warning for warning in extraction.warnings)


def test_identity_card_is_detected_from_mrz_and_backside_fields() -> None:
  extraction = parse_bulgarian_document(
    [
      line("Фамипия/Surname"),
      line("ДОНЧЕВ"),
      line("Място на раждане/Place of birth"),
      line("Г.ОРЯХОВИЦА"),
      line("Постоянен адрес/Residence"),
      line("обл. ВЕЛИКО ТЪРНОВО"),
      line("IDBGR6520681699<<<<<<<<<<<<<<<"),
      line("0007294M3212013BGR0047291463<2"),
      line("DONCHEV<<ANTOAN<STEFANOV<<<<<<"),
    ]
  )

  assert extraction.document_type == "bulgarian_identity_card"
  assert extraction.egn == "0047291463"
  assert extraction.document_number == "652068169"
  assert extraction.last_name == "ДОНЧЕВ"


def test_driving_licence_is_detected_from_backside_category_table() -> None:
  extraction = parse_bulgarian_document(
    [
      line("9."),
      line("10."),
      line("11."),
      line("12."),
      line("13."),
      line("AM"),
      line("BE"),
      line("C1E"),
      line("CE"),
      line("D1E"),
      line("DE"),
      line("(14.)"),
      line("15.11.18"),
    ]
  )

  assert extraction.document_type == "bulgarian_driving_licence"
  assert [item.category for item in extraction.driving_categories] == ["AM", "BE", "C1E", "CE", "D1E", "DE"]
