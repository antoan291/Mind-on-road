from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import UTC, datetime
import os
from pathlib import Path

from document_intelligence.batch_report import assess_extraction
from document_intelligence.batch_report import collect_supported_documents
from document_intelligence.config import ExtractionConfig
from document_intelligence.exceptions import DocumentIntelligenceError
from document_intelligence.pipeline import extract_bulgarian_document_data


def build_parser() -> argparse.ArgumentParser:
  parser = argparse.ArgumentParser(
    description="Batch OCR test for Bulgarian identity cards and driving licences."
  )
  parser.add_argument(
    "input_dir",
    type=Path,
    help="Root directory with PDF/image test documents.",
  )
  parser.add_argument(
    "--report-dir",
    type=Path,
    default=Path(
      os.getenv("DOCUMENT_OCR_OUTPUT_DIR", Path(__file__).resolve().parents[1] / "output")
    ) / "batch-reports",
    help="Directory where JSON report and markdown summary will be written.",
  )
  parser.add_argument(
    "--max-pages",
    type=int,
    default=2,
    help="Maximum pages to OCR from each PDF.",
  )
  parser.add_argument(
    "--render-scale",
    type=float,
    default=2.0,
    help="Render scale for PDF pages.",
  )
  return parser


def main() -> None:
  args = build_parser().parse_args()
  input_dir = args.input_dir.resolve()

  if not input_dir.is_dir():
    raise SystemExit(f"Input directory does not exist: {input_dir}")

  config = ExtractionConfig.from_env(
    max_pages=args.max_pages,
    render_scale=args.render_scale,
  )
  report_root = args.report_dir.resolve()
  timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
  run_dir = report_root / timestamp
  output_dir = run_dir / "json"
  output_dir.mkdir(parents=True, exist_ok=True)

  documents = collect_supported_documents(input_dir)
  if not documents:
    raise SystemExit(f"No supported documents found in: {input_dir}")

  entries: list[dict[str, object]] = []

  for document_path in documents:
    relative_path = document_path.relative_to(input_dir)
    target_output = output_dir / relative_path.with_suffix(".json")
    target_output.parent.mkdir(parents=True, exist_ok=True)

    print(f"[OCR] {relative_path}")

    try:
      extraction = extract_bulgarian_document_data(
        pdf_path=document_path,
        output_path=target_output,
        config=config,
      )
      assessment = assess_extraction(
        file_path=document_path,
        extraction=extraction,
      )
      entries.append(
        {
          "filePath": str(relative_path),
          "documentType": extraction.document_type,
          "expectedDocumentType": assessment.expected_document_type,
          "status": assessment.status,
          "reasons": assessment.reasons,
          "confidence": extraction.confidence,
          "warnings": extraction.warnings,
          "firstName": extraction.first_name,
          "middleName": extraction.middle_name,
          "lastName": extraction.last_name,
          "egn": extraction.egn,
          "documentNumber": extraction.document_number,
          "placeOfBirth": extraction.place_of_birth,
          "permanentAddress": extraction.permanent_address,
          "drivingCategories": [
            {"category": item.category, "date": item.date}
            for item in extraction.driving_categories
          ],
          "outputJson": str(target_output.relative_to(run_dir)),
        }
      )
    except DocumentIntelligenceError as exc:
      entries.append(
        {
          "filePath": str(relative_path),
          "documentType": "error",
          "expectedDocumentType": None,
          "status": "failed",
          "reasons": [str(exc)],
          "confidence": None,
          "warnings": [],
          "firstName": None,
          "middleName": None,
          "lastName": None,
          "egn": None,
          "documentNumber": None,
          "placeOfBirth": None,
          "permanentAddress": None,
          "drivingCategories": [],
          "outputJson": None,
        }
      )

  summary = build_summary(entries)
  report_payload = {
    "generatedAtUtc": timestamp,
    "inputDir": str(input_dir),
    "summary": summary,
    "entries": entries,
  }

  report_json_path = run_dir / "report.json"
  report_md_path = run_dir / "report.md"
  report_json_path.write_text(
    json.dumps(report_payload, ensure_ascii=False, indent=2),
    encoding="utf-8",
  )
  report_md_path.write_text(
    build_markdown_report(report_payload),
    encoding="utf-8",
  )

  print()
  print(f"Report JSON: {report_json_path}")
  print(f"Report MD:   {report_md_path}")
  print(
    "Summary: "
    f"ok={summary['ok']} review={summary['review']} failed={summary['failed']}"
  )


def build_summary(entries: list[dict[str, object]]) -> dict[str, object]:
  status_counter = Counter(str(entry["status"]) for entry in entries)
  document_type_counter = Counter(str(entry["documentType"]) for entry in entries)

  return {
    "total": len(entries),
    "ok": status_counter.get("ok", 0),
    "review": status_counter.get("review", 0),
    "failed": status_counter.get("failed", 0),
    "documentTypes": dict(document_type_counter),
  }


def build_markdown_report(report_payload: dict[str, object]) -> str:
  summary = report_payload["summary"]
  entries = report_payload["entries"]
  assert isinstance(summary, dict)
  assert isinstance(entries, list)

  lines = [
    "# OCR Batch Report",
    "",
    f"- Generated at UTC: `{report_payload['generatedAtUtc']}`",
    f"- Input directory: `{report_payload['inputDir']}`",
    f"- Total files: `{summary['total']}`",
    f"- OK: `{summary['ok']}`",
    f"- Review: `{summary['review']}`",
    f"- Failed: `{summary['failed']}`",
    "",
    "## Files",
    "",
    "| Status | File | Type | Confidence | Reasons |",
    "| --- | --- | --- | --- | --- |",
  ]

  for entry in entries:
    assert isinstance(entry, dict)
    reasons = entry.get("reasons", [])
    if isinstance(reasons, list):
      reasons_text = "; ".join(str(reason) for reason in reasons) or "-"
    else:
      reasons_text = "-"

    confidence = entry.get("confidence")
    confidence_text = (
      f"{confidence:.2f}" if isinstance(confidence, float) else "-"
    )
    lines.append(
      f"| {entry.get('status', '-')} | `{entry.get('filePath', '-')}` | "
      f"`{entry.get('documentType', '-')}` | {confidence_text} | {reasons_text} |"
    )

  return "\n".join(lines) + "\n"


if __name__ == "__main__":
  main()
