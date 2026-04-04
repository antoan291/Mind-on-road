from __future__ import annotations

import os
import re
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .config import ExtractionConfig
from .exceptions import DocumentIntelligenceError
from .pipeline import extract_bulgarian_document_data


SAFE_PDF_FILE_RE = re.compile(r"^[A-Za-z0-9._ -]+\.pdf$")


class OcrExtractionRequest(BaseModel):
  sourceFileName: str = Field(min_length=5, max_length=255)


class OcrExtractionResponse(BaseModel):
  fileName: str
  outputFileName: str
  data: dict[str, object]


app = FastAPI(title="MindOnRoad OCR Worker", version="1.0.0")


@app.get("/health")
def healthcheck() -> dict[str, str]:
  return {"status": "ok"}


@app.post("/ocr/extract", response_model=OcrExtractionResponse)
def run_ocr_extraction(
  request: OcrExtractionRequest,
) -> OcrExtractionResponse:
  source_file_name = request.sourceFileName.strip()

  if not SAFE_PDF_FILE_RE.fullmatch(source_file_name):
    raise HTTPException(status_code=400, detail="Invalid OCR source file name.")

  source_dir = Path(
    os.getenv("DOCUMENT_OCR_SOURCE_DIR", "/automation-samples"),
  ).resolve()
  output_dir = Path(
    os.getenv("DOCUMENT_OCR_OUTPUT_DIR", "/automation-output"),
  ).resolve()
  pdf_path = (source_dir / source_file_name).resolve()
  output_path = (output_dir / f"{pdf_path.stem}.json").resolve()

  if source_dir not in pdf_path.parents:
    raise HTTPException(status_code=400, detail="OCR source path is outside the allowed directory.")

  if output_dir not in output_path.parents:
    raise HTTPException(status_code=400, detail="OCR output path is outside the allowed directory.")

  if not pdf_path.is_file():
    raise HTTPException(status_code=404, detail="OCR source PDF was not found.")

  output_dir.mkdir(parents=True, exist_ok=True)

  try:
    extraction = extract_bulgarian_document_data(
      pdf_path=pdf_path,
      output_path=output_path,
      config=ExtractionConfig.from_env(),
    )
  except DocumentIntelligenceError as exc:
    raise HTTPException(status_code=422, detail=str(exc)) from exc

  return OcrExtractionResponse(
    fileName=pdf_path.name,
    outputFileName=output_path.name,
    data=extraction.to_bulgarian_dict(),
  )


def main() -> None:
  port = int(os.getenv("DOCUMENT_OCR_WORKER_PORT", "8080"))
  uvicorn.run(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
  main()
