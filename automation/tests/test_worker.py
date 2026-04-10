from io import BytesIO

from fastapi.testclient import TestClient

from document_intelligence import worker
from document_intelligence.models import BulgarianDocumentExtraction


def test_upload_endpoint_accepts_images_and_custom_output_name(monkeypatch) -> None:
  captured: dict[str, object] = {}

  def fake_extract(*, file_name, file_bytes, output_path, config):
    captured["file_name"] = file_name
    captured["file_bytes"] = file_bytes
    captured["output_path"] = output_path
    captured["config"] = config
    output_path.write_text('{"име":"Иван"}', encoding="utf-8")
    return BulgarianDocumentExtraction(
      document_type="bulgarian_identity_card",
      first_name="Иван",
      review_required=True,
      confidence=0.91,
      warnings=[],
    )

  monkeypatch.setattr(worker, "extract_bulgarian_document_from_upload", fake_extract)

  client = TestClient(worker.app)
  response = client.post(
    "/ocr/extract-upload",
    data={"outputFileName": "student-card.json"},
    files={"file": ("student-card.png", BytesIO(b"image-bytes"), "image/png")},
  )

  assert response.status_code == 200
  payload = response.json()
  assert payload["fileName"] == "student-card.png"
  assert payload["outputFileName"] == "student-card.json"
  assert payload["data"]["име"] == "Иван"
  assert captured["file_name"] == "student-card.png"
  assert captured["file_bytes"] == b"image-bytes"
  assert str(captured["output_path"]).endswith("student-card.json")


def test_upload_endpoint_rejects_unsupported_files() -> None:
  client = TestClient(worker.app)
  response = client.post(
    "/ocr/extract-upload",
    files={"file": ("notes.txt", BytesIO(b"plain"), "text/plain")},
  )

  assert response.status_code == 400
  assert response.json()["detail"] == "Unsupported OCR file type."
