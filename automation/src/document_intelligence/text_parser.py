from __future__ import annotations

import difflib
import re
from collections.abc import Sequence

from .models import BulgarianDocumentExtraction, DrivingLicenceCategory
from .ocr_engine import OCRLine


WHITESPACE_RE = re.compile(r"\s+")
NON_DIGITS_RE = re.compile(r"\D+")
EGN_RE = re.compile(r"\b\d{10}\b")
DOC_NO_RE = re.compile(r"\b\d{9}\b")
YEAR_RE = re.compile(r"\b(?:19|20)\d{2}\b")
DATE_RE = re.compile(r"\b\d{2}\.\d{2}\.(?:\d{2}|\d{4})\b")
DRIVING_CATEGORY_RE = re.compile(r"\b(?:AM|A1|A2|A|B1|B|BE|C1|C|C1E|CE|D1|D|D1E|DE|TKT)\b")
SAFE_LATIN_LOOKALIKE_MAP = {
  "A": "\u0410",
  "B": "\u0412",
  "C": "\u0421",
  "E": "\u0415",
  "H": "\u041d",
  "I": "\u0418",
  "K": "\u041a",
  "M": "\u041c",
  "O": "\u041e",
  "P": "\u0420",
  "T": "\u0422",
  "X": "\u0425",
  "Y": "\u0423",
  "a": "\u0430",
  "c": "\u0441",
  "e": "\u0435",
  "o": "\u043e",
  "p": "\u0440",
  "x": "\u0445",
  "y": "\u0443",
}
SAFE_NAME_LATIN_MAP = {
  **SAFE_LATIN_LOOKALIKE_MAP,
  "D": "\u0414",
  "F": "\u0424",
  "G": "\u0413",
  "J": "\u0419",
  "L": "\u041b",
  "N": "\u041d",
  "R": "\u0420",
  "S": "\u0421",
  "U": "\u0423",
  "V": "\u0412",
  "W": "\u0428",
  "Z": "\u0417",
  "d": "\u0434",
  "f": "\u0444",
  "g": "\u0433",
  "j": "\u0439",
  "l": "\u043b",
  "n": "\u043d",
  "r": "\u0440",
  "s": "\u0441",
  "u": "\u0443",
  "v": "\u0432",
  "w": "\u0448",
  "z": "\u0437",
}
CYRILLIC_TO_LATIN_MAP = {
  "А": "A",
  "Б": "B",
  "В": "V",
  "Г": "G",
  "Д": "D",
  "Е": "E",
  "Ж": "ZH",
  "З": "Z",
  "И": "I",
  "Й": "Y",
  "К": "K",
  "Л": "L",
  "М": "M",
  "Н": "N",
  "О": "O",
  "П": "P",
  "Р": "R",
  "С": "S",
  "Т": "T",
  "У": "U",
  "Ф": "F",
  "Х": "H",
  "Ц": "TS",
  "Ч": "CH",
  "Ш": "SH",
  "Щ": "SHT",
  "Ъ": "A",
  "Ь": "Y",
  "Ю": "YU",
  "Я": "YA",
}
SAFE_KNOWN_BULGARIAN_PLACES = (
  "\u0411\u041b\u0410\u0413\u041e\u0415\u0412\u0413\u0420\u0410\u0414",
  "\u0411\u0423\u0420\u0413\u0410\u0421",
  "\u0412\u0410\u0420\u041d\u0410",
  "\u0412\u0415\u041b\u0418\u041a\u041e \u0422\u042a\u0420\u041d\u041e\u0412\u041e",
  "\u0412\u0418\u0414\u0418\u041d",
  "\u0412\u0420\u0410\u0426\u0410",
  "\u0413\u0410\u0411\u0420\u041e\u0412\u041e",
  "\u0414\u041e\u0411\u0420\u0418\u0427",
  "\u041a\u042a\u0420\u0414\u0416\u0410\u041b\u0418",
  "\u041a\u042e\u0421\u0422\u0415\u041d\u0414\u0418\u041b",
  "\u041b\u041e\u0412\u0415\u0427",
  "\u041c\u041e\u041d\u0422\u0410\u041d\u0410",
  "\u041f\u0410\u0417\u0410\u0420\u0414\u0416\u0418\u041a",
  "\u041f\u0415\u0420\u041d\u0418\u041a",
  "\u041f\u041b\u0415\u0412\u0415\u041d",
  "\u041f\u041b\u041e\u0412\u0414\u0418\u0412",
  "\u0420\u0410\u0417\u0413\u0420\u0410\u0414",
  "\u0420\u0423\u0421\u0415",
  "\u0421\u0418\u041b\u0418\u0421\u0422\u0420\u0410",
  "\u0421\u041b\u0418\u0412\u0415\u041d",
  "\u0421\u041c\u041e\u041b\u042f\u041d",
  "\u0421\u041e\u0424\u0418\u042f",
  "\u0421\u041e\u0424\u0418\u042f-\u0413\u0420\u0410\u0414",
  "\u0421\u0422\u0410\u0420\u0410 \u0417\u0410\u0413\u041e\u0420\u0410",
  "\u0422\u042a\u0420\u0413\u041e\u0412\u0418\u0429\u0415",
  "\u0425\u0410\u0421\u041a\u041e\u0412\u041e",
  "\u0428\u0423\u041c\u0415\u041d",
  "\u042f\u041c\u0411\u041e\u041b",
  "\u041c\u041b\u0410\u0414\u041e\u0421\u0422",
)
ADDRESS_STOP_TOKENS = (
  "HEIGHT",
  "\u0420\u042a\u0421\u0422",
  "COLOR",
  "\u041e\u0427\u0418\u0422\u0415",
  "EYES",
  "\u0418\u0417\u0414\u0410\u0414\u0415\u041d",
  "AUTHORITY",
  "AUTHENTY",
  "DATE OF ISSUE",
  "\u0414\u0410\u0422\u0410 \u041d\u0410 \u0418\u0417\u0414\u0410\u0412\u0410\u041d\u0415",
)
ADDRESS_FRAGMENT_TOKENS = (
  "\u043e\u0431\u043b.",
  "\u043e\u0431\u0449.",
  "\u0433\u0440.",
  "\u0436\u043a.",
  "\u0443\u043b.",
  "\u0431\u0443\u043b.",
  "\u0432\u0445.",
  "\u0435\u0442.",
  "\u0430\u043f.",
)


def _clean_text(text: str) -> str:
  text = text.replace("|", "I").replace("â€ž", '"').replace("â€œ", '"')
  return WHITESPACE_RE.sub(" ", text).strip(" -:\t")


def _normalized_text(text: str) -> str:
  return _clean_text(text).casefold()


def _contains_cyrillic(text: str) -> bool:
  return re.search(r"[\u0400-\u04FF]", text) is not None


def _looks_like_label(text: str) -> bool:
  normalized = _normalized_text(text)
  label_tokens = (
    "\u0444\u0430\u043c\u0438\u043b\u0438\u044f",
    "surname",
    "\u0438\u043c\u0435",
    "name",
    "\u043f\u0440\u0435\u0437\u0438\u043c\u0435",
    "father",
    "\u043c\u044f\u0441\u0442\u043e",
    "place",
    "\u0430\u0434\u0440\u0435\u0441",
    "address",
  )
  return any(token in normalized for token in label_tokens)


def _normalize_bulgarian_value(text: str) -> str:
  cleaned = _clean_text(text)
  if "/" in cleaned:
    parts = [part.strip() for part in cleaned.split("/") if part.strip()]
    if parts:
      cleaned = parts[0]

  normalized = "".join(SAFE_LATIN_LOOKALIKE_MAP.get(character, character) for character in cleaned)
  return _clean_text(normalized)


def _normalize_name_value(text: str) -> str:
  normalized = "".join(SAFE_NAME_LATIN_MAP.get(character, character) for character in _clean_text(text))
  return _clean_text(normalized)


def _looks_like_name_value(value: str) -> bool:
  normalized = _normalize_bulgarian_value(value)
  if not normalized or re.search(r"\d", normalized):
    return False
  if len(normalized) < 3:
    return False
  return True


def _ascii_letters_only(value: str) -> str:
  return re.sub(r"[^A-Z]", "", value.upper())


def _transliterate_to_latin(value: str) -> str:
  transliterated = "".join(CYRILLIC_TO_LATIN_MAP.get(character, character) for character in value)
  return _ascii_letters_only(transliterated)


def _is_probable_latin_duplicate(value: str, reference: str) -> bool:
  candidate = _ascii_letters_only(value)
  if not candidate:
    return False

  reference_latin = _transliterate_to_latin(reference)
  if not reference_latin:
    return False

  similarity = difflib.SequenceMatcher(a=candidate, b=reference_latin).ratio()
  return similarity >= 0.7


def _is_address_stop_line(text: str) -> bool:
  normalized = _normalized_text(text)
  return any(token.casefold() in normalized for token in ADDRESS_STOP_TOKENS)


def _best_known_place(value: str) -> str:
  upper_value = value.upper()
  direct = difflib.get_close_matches(upper_value, SAFE_KNOWN_BULGARIAN_PLACES, n=1, cutoff=0.7)
  if direct:
    return direct[0]
  return value


def _normalize_address_text(value: str) -> str:
  normalized = _normalize_bulgarian_value(value)

  normalized = re.sub(r"\b\u043e\u0431\u043b\.\s*", "\u043e\u0431\u043b. ", normalized, flags=re.IGNORECASE)
  normalized = re.sub(r"\b\u043e\u0431\u0449\.\s*", "\u041e\u0431\u0449. ", normalized, flags=re.IGNORECASE)
  normalized = re.sub(r"\b\u0433\u0440\.\s*", "\u0433\u0440.", normalized, flags=re.IGNORECASE)
  normalized = re.sub(r"\b\u0436\u043a\.\s*", "\u0416\u041a.", normalized, flags=re.IGNORECASE)

  def replace_place_token(match: re.Match[str]) -> str:
    token = match.group(0)
    return _best_known_place(token)

  normalized = re.sub(r"\b[\u0410-\u042f]{4,}(?:\s+[\u0410-\u042f]{4,})?\b", replace_place_token, normalized)
  normalized = normalized.replace("\u041e\u0431\u0449. \u0412\u0410\u0420\u041c\u0410", "\u041e\u0431\u0449. \u0412\u0410\u0420\u041d\u0410")
  return _clean_text(normalized)


def _looks_like_address_fragment(value: str) -> bool:
  normalized = _normalized_text(value)
  if any(token in normalized for token in ADDRESS_FRAGMENT_TOKENS):
    return True
  if re.search(r"\d", value):
    return True
  return False


def _find_line_index(lines: Sequence[OCRLine], candidates: Sequence[str]) -> int | None:
  for index, line in enumerate(lines):
    normalized_line = _normalized_text(line.text)
    for candidate in candidates:
      candidate_normalized = candidate.casefold()
      if normalized_line == candidate_normalized:
        return index

      boundary_pattern = re.compile(rf"(?<!\w){re.escape(candidate_normalized)}(?!\w)")
      if boundary_pattern.search(normalized_line):
        return index

  return None


def _value_after_label(lines: Sequence[OCRLine], candidates: Sequence[str]) -> tuple[str | None, float | None]:
  index = _find_line_index(lines, candidates)
  if index is None:
    return (None, None)

  line = lines[index]
  normalized_line = _normalized_text(line.text)

  # For bilingual cards, the Bulgarian value is often directly above the English label.
  if index > 0:
    previous_line = lines[index - 1]
    if (
      previous_line.page_number == line.page_number
      and not _looks_like_label(previous_line.text)
      and _contains_cyrillic(previous_line.text)
    ):
      return (_normalize_bulgarian_value(previous_line.text), previous_line.confidence)

  for candidate in candidates:
    candidate_normalized = candidate.casefold()
    if candidate_normalized in normalized_line:
      parts = re.split(re.escape(candidate), line.text, flags=re.IGNORECASE)
      if len(parts) > 1:
        direct_value = _normalize_bulgarian_value(parts[-1])
        if direct_value:
          return (direct_value, line.confidence)

  for next_line in lines[index + 1 : index + 4]:
    value = _normalize_bulgarian_value(next_line.text)
    if value and not any(token.casefold() in _normalized_text(value) for token in candidates):
      return (value, next_line.confidence)

  return (None, None)


def _extract_first_match(lines: Sequence[OCRLine], pattern: re.Pattern[str]) -> tuple[str | None, float | None]:
  for line in lines:
    match = pattern.search(_clean_text(line.text))
    if match:
      return (match.group(0), line.confidence)
  return (None, None)


def _detect_document_type(joined_text: str) -> str:
  lowered = joined_text.casefold()
  if "\u043b\u0438\u0447\u043d\u0430 \u043a\u0430\u0440\u0442\u0430" in lowered or "identity card" in lowered:
    return "bulgarian_identity_card"
  if "\u0441\u0432\u0438\u0434\u0435\u0442\u0435\u043b\u0441\u0442\u0432\u043e \u0437\u0430 \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435" in lowered or "driving licence" in lowered or "driving license" in lowered:
    return "bulgarian_driving_licence"
  return "unknown"


def _extract_name_fields(lines: Sequence[OCRLine]) -> tuple[str | None, str | None, str | None, list[str], list[float]]:
  warnings: list[str] = []
  confidences: list[float] = []

  last_name, last_conf = _value_after_label(lines, ["\u0444\u0430\u043c\u0438\u043b\u0438\u044f", "surname"])
  first_name, first_conf = _value_after_label(lines, ["\u0438\u043c\u0435", "name", "given names", "given name"])
  middle_name, middle_conf = _value_after_label(lines, ["\u043f\u0440\u0435\u0437\u0438\u043c\u0435", "father's name", "middle name"])

  if first_name is not None:
    first_name = _normalize_name_value(first_name)
  if middle_name is not None:
    middle_name = _normalize_name_value(middle_name)
  if last_name is not None:
    last_name = _normalize_name_value(last_name)

  if last_conf is not None:
    confidences.append(last_conf)
  if first_conf is not None:
    confidences.append(first_conf)
  if middle_conf is not None:
    confidences.append(middle_conf)

  if first_name is None:
    warnings.append("\u0418\u043c\u0435\u0442\u043e \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u043e \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")
  if last_name is None:
    warnings.append("\u0424\u0430\u043c\u0438\u043b\u0438\u044f\u0442\u0430 \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u0430 \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")

  return (first_name, middle_name, last_name, warnings, confidences)


def _extract_document_number(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  labeled_value, confidence = _value_after_label(
    lines,
    [
      "\u043d\u043e\u043c\u0435\u0440 \u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430",
      "document no",
      "document number",
      "\u043d\u043e\u043c\u0435\u0440 \u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442",
    ],
  )
  if labeled_value:
    match = DOC_NO_RE.search(NON_DIGITS_RE.sub("", labeled_value))
    if match:
      return (match.group(0), confidence)

  return _extract_first_match(lines, DOC_NO_RE)


def _extract_place_of_birth(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  index = _find_line_index(lines, ["\u043c\u044f\u0441\u0442\u043e \u043d\u0430 \u0440\u0430\u0436\u0434\u0430\u043d\u0435", "place of birth", "\u043c\u044f\u0441\u0442\u043e"])
  if index is None:
    return (None, None)

  for next_line in lines[index + 1 : index + 3]:
    value = _best_known_place(_normalize_bulgarian_value(next_line.text))
    if value and not _looks_like_label(value):
      return (value, next_line.confidence)

  return (None, None)


def _extract_address(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  index = _find_line_index(lines, ["\u043f\u043e\u0441\u0442\u043e\u044f\u043d\u0435\u043d \u0430\u0434\u0440\u0435\u0441"])
  if index is None:
    return (None, None)

  collected: list[str] = []
  confidences: list[float] = []

  for next_line in lines[index + 1 : index + 5]:
    value = _normalize_address_text(next_line.text)
    if (
      not value
      or _looks_like_label(value)
      or _is_address_stop_line(value)
      or not _looks_like_address_fragment(value)
    ):
      break
    collected.append(value)
    confidences.append(next_line.confidence)

  if not collected:
    return (None, None)

  return (", ".join(collected), sum(confidences) / len(confidences))


def _extract_identity_card_last_name_fallback(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  page_one_lines = [line for line in lines if line.page_number == 1]

  for index, line in enumerate(page_one_lines):
    normalized = _normalized_text(line.text)
    if "surname" not in normalized and "sumame" not in normalized:
      continue

    for offset in (-1, -2, 1, 2):
      candidate_index = index + offset
      if candidate_index < 0 or candidate_index >= len(page_one_lines):
        continue

      candidate = page_one_lines[candidate_index]
      candidate_value = _normalize_name_value(candidate.text)
      if _looks_like_name_value(candidate_value) and _contains_cyrillic(candidate_value):
        return (candidate_value, candidate.confidence)

  page_one_name_candidates = [
    line for line in page_one_lines
    if _contains_cyrillic(_normalize_name_value(line.text))
    and _looks_like_name_value(_normalize_name_value(line.text))
  ]
  if page_one_name_candidates:
    return (_normalize_name_value(page_one_name_candidates[0].text), page_one_name_candidates[0].confidence)

  return (None, None)


def _extract_identity_card_place_of_birth_fallback(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  for line in lines:
    if line.page_number != 2:
      continue

    raw = _clean_text(line.text)
    if "/" not in raw:
      continue

    normalized = _normalize_bulgarian_value(raw)
    if re.search(r"\d", normalized):
      continue

    for part in [segment.strip() for segment in normalized.split("/") if segment.strip()]:
      place = _best_known_place(part)
      if place in SAFE_KNOWN_BULGARIAN_PLACES:
        return (place, line.confidence)

  return (None, None)


def _extract_identity_card_address_fallback(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  page_two_lines = [line for line in lines if line.page_number == 2]
  collected: list[str] = []
  confidences: list[float] = []
  has_started = False
  explicit_address_prefixes = ("\u043e\u0431\u043b.", "\u043e\u0431\u0449.", "\u0433\u0440.", "\u0436\u043a.", "\u0443\u043b.", "\u0431\u0443\u043b.")

  for line in page_two_lines:
    value = _normalize_bulgarian_value(line.text)
    if not value or _is_address_stop_line(value):
      if has_started:
        break
      continue

    normalized = _normalized_text(value)
    if "place" in normalized or "address" in normalized or "\u043c\u044f\u0441\u0442\u043e" in normalized or "\u0430\u0434\u0440\u0435\u0441" in normalized:
      if has_started:
        break
      continue

    if _looks_like_address_fragment(value) and (has_started or normalized.startswith(explicit_address_prefixes)):
      collected.append(_normalize_address_text(value))
      confidences.append(line.confidence)
      has_started = True
      continue

    if has_started:
      break

  if not collected:
    return (None, None)

  return (", ".join(collected), sum(confidences) / len(confidences))


def _extract_driving_licence_names(lines: Sequence[OCRLine]) -> tuple[str | None, str | None, str | None, list[float]]:
  confidences: list[float] = []
  first_page_lines = [line for line in lines if line.page_number == 1]
  field_two_index = next(
    (index for index, line in enumerate(first_page_lines) if _clean_text(line.text) in {"2", "2."}),
    None,
  )
  field_three_index = next(
    (index for index, line in enumerate(first_page_lines) if _clean_text(line.text) in {"3", "3."}),
    None,
  )

  def collect_name_tokens(start_index: int, end_index: int | None) -> list[tuple[str, float]]:
    candidates: list[tuple[str, float]] = []
    slice_end = end_index if end_index is not None else len(first_page_lines)

    for line in first_page_lines[start_index:slice_end]:
      raw = _clean_text(line.text)
      normalized = _normalize_bulgarian_value(raw)
      compact = re.sub(r"[^A-Za-zА-Яа-я]", "", normalized)

      if not normalized:
        continue
      if re.fullmatch(r"\d+\.?", raw):
        continue
      if len(compact) < 3:
        continue
      if " " in normalized:
        continue
      candidates.append((normalized, line.confidence))

    return candidates

  surname_candidates = collect_name_tokens(0, field_two_index)
  name_candidates = collect_name_tokens((field_two_index + 1) if field_two_index is not None else 0, field_three_index)

  surname = surname_candidates[0][0] if surname_candidates else None
  if surname_candidates:
    confidences.append(surname_candidates[0][1])

  first_name = name_candidates[0][0] if name_candidates else None
  if name_candidates:
    confidences.append(name_candidates[0][1])

  middle_name = None
  if len(name_candidates) >= 3:
    middle_name = name_candidates[2][0]
    confidences.append(name_candidates[2][1])
  elif len(name_candidates) > 1:
    remaining_candidates = name_candidates[1:]
    if remaining_candidates and first_name and _is_probable_latin_duplicate(remaining_candidates[0][0], first_name):
      remaining_candidates = remaining_candidates[1:]

    if remaining_candidates:
      middle_name = remaining_candidates[0][0]
      confidences.append(remaining_candidates[0][1])

  return (first_name, middle_name, surname, confidences)


def _extract_driving_licence_place_of_birth(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  for line in lines:
    normalized = _normalize_bulgarian_value(line.text)
    if normalized.startswith("16.11.") or re.match(r"\d{2}\.\d{2}\.\d{4}", normalized):
      parts = normalized.split(" ", 1)
      if len(parts) > 1:
        place = _best_known_place(_normalize_bulgarian_value(parts[1]))
        return (place, line.confidence)
  return (None, None)


def _extract_driving_licence_egn(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  for line in lines:
    normalized = _clean_text(line.text)
    if normalized.startswith("4d.") or normalized.startswith("4d "):
      match = EGN_RE.search(normalized)
      if match:
        return (match.group(0), line.confidence)
  return _extract_first_match(lines, EGN_RE)


def _extract_driving_licence_document_number(lines: Sequence[OCRLine]) -> tuple[str | None, float | None]:
  for line in lines:
    normalized = _clean_text(line.text)
    if normalized.startswith("5.") or normalized.startswith("5 "):
      match = DOC_NO_RE.search(normalized)
      if match:
        return (match.group(0), line.confidence)
  return _extract_first_match(lines, DOC_NO_RE)


def _extract_driving_licence_categories(lines: Sequence[OCRLine]) -> tuple[list[DrivingLicenceCategory], list[str], list[float]]:
  warnings: list[str] = []
  confidences: list[float] = []

  category_line = next(
    (
      line
      for line in lines
      if line.page_number == 1 and ("," in _clean_text(line.text) or "9" in _clean_text(line.text))
      and DRIVING_CATEGORY_RE.search(_clean_text(line.text))
    ),
    None,
  )

  if category_line is None:
    warnings.append("Категориите на книжката не бяха разпознати сигурно.")
    return ([], warnings, confidences)

  raw_category_tokens = re.split(r"[,/]", _clean_text(category_line.text).upper())
  ordered_categories: list[str] = []
  for raw_token in raw_category_tokens:
    normalized_token = re.sub(r"^[^A-Z]+", "", raw_token.strip())
    match = DRIVING_CATEGORY_RE.fullmatch(normalized_token)
    if match and match.group(0) not in ordered_categories:
      ordered_categories.append(match.group(0))

  confidences.append(category_line.confidence)

  date_lines = [
    line for line in lines
    if line.page_number == 2 and DATE_RE.search(_clean_text(line.text))
  ]
  date_values = [DATE_RE.search(_clean_text(line.text)).group(0) for line in date_lines if DATE_RE.search(_clean_text(line.text))]
  unique_dates: list[str] = []
  for value in date_values:
    if value not in unique_dates:
      unique_dates.append(value)

  categories: list[DrivingLicenceCategory] = []
  if unique_dates and len(unique_dates) == len(ordered_categories):
    for category, date in zip(ordered_categories, unique_dates, strict=False):
      categories.append(DrivingLicenceCategory(category=category, date=date))
    confidences.extend(line.confidence for line in date_lines[: len(unique_dates)])
  else:
    if unique_dates:
      shared_date = unique_dates[0]
      for category in ordered_categories:
        categories.append(DrivingLicenceCategory(category=category, date=shared_date))
      warnings.append(
        "Датите за категориите бяха свързани по ред на OCR, защото гърбът на книжката не се разчете достатъчно ясно по колони."
      )
      confidences.append(date_lines[0].confidence if date_lines else category_line.confidence)
    else:
      for category in ordered_categories:
        categories.append(DrivingLicenceCategory(category=category, date=None))
      warnings.append("Датите към категориите не бяха разпознати сигурно.")

  return (categories, warnings, confidences)


def parse_bulgarian_document(lines: Sequence[OCRLine]) -> BulgarianDocumentExtraction:
  cleaned_lines = [
    OCRLine(
      text=_clean_text(line.text),
      confidence=line.confidence,
      page_number=line.page_number,
      top=line.top,
      left=line.left,
      right=line.right,
      bottom=line.bottom,
    )
    for line in lines
    if _clean_text(line.text)
  ]

  joined_text = "\n".join(line.text for line in cleaned_lines)
  document_type = _detect_document_type(joined_text)

  warnings: list[str] = []
  confidences: list[float] = [line.confidence for line in cleaned_lines]

  if document_type == "bulgarian_driving_licence":
    first_name, middle_name, last_name, name_confidences = _extract_driving_licence_names(cleaned_lines)
    confidences.extend(name_confidences)

    if first_name is None:
      warnings.append("\u0418\u043c\u0435\u0442\u043e \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u043e \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")
    if last_name is None:
      warnings.append("\u0424\u0430\u043c\u0438\u043b\u0438\u044f\u0442\u0430 \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u0430 \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")

    egn, egn_confidence = _extract_driving_licence_egn(cleaned_lines)
    if egn_confidence is not None:
      confidences.append(egn_confidence)
    else:
      warnings.append("\u0415\u0413\u041d \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u043e \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")

    document_number, document_confidence = _extract_driving_licence_document_number(cleaned_lines)
    if document_confidence is not None:
      confidences.append(document_confidence)
    else:
      warnings.append("\u041d\u043e\u043c\u0435\u0440\u044a\u0442 \u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430 \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442 \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")

    place_of_birth, place_confidence = _extract_driving_licence_place_of_birth(cleaned_lines)
    if place_confidence is not None:
      confidences.append(place_confidence)
    else:
      warnings.append("\u041c\u044f\u0441\u0442\u043e\u0442\u043e \u043d\u0430 \u0440\u0430\u0436\u0434\u0430\u043d\u0435 \u043b\u0438\u043f\u0441\u0432\u0430 \u0438\u043b\u0438 \u043d\u0435 \u0441\u0435 \u0432\u0438\u0436\u0434\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u044f\u0441\u043d\u043e.")

    permanent_address = None
    address_confidence = None
    driving_categories, category_warnings, category_confidences = _extract_driving_licence_categories(cleaned_lines)
    warnings.extend(category_warnings)
    confidences.extend(category_confidences)
  else:
    first_name, middle_name, last_name, name_warnings, name_confidences = _extract_name_fields(cleaned_lines)
    warnings.extend(name_warnings)
    confidences.extend(name_confidences)

    if last_name is None:
      fallback_last_name, fallback_last_name_confidence = _extract_identity_card_last_name_fallback(cleaned_lines)
      if fallback_last_name is not None:
        last_name = fallback_last_name
        if fallback_last_name_confidence is not None:
          confidences.append(fallback_last_name_confidence)
        warnings = [
          warning
          for warning in warnings
          if warning != "\u0424\u0430\u043c\u0438\u043b\u0438\u044f\u0442\u0430 \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u0430 \u0441\u0438\u0433\u0443\u0440\u043d\u043e."
        ]

    egn, egn_confidence = _extract_first_match(cleaned_lines, EGN_RE)
    if egn_confidence is not None:
      confidences.append(egn_confidence)
    else:
      warnings.append("\u0415\u0413\u041d \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442\u043e \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")

    document_number, document_confidence = _extract_document_number(cleaned_lines)
    if document_confidence is not None:
      confidences.append(document_confidence)
    else:
      warnings.append("\u041d\u043e\u043c\u0435\u0440\u044a\u0442 \u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430 \u043d\u0435 \u0431\u0435\u0448\u0435 \u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442 \u0441\u0438\u0433\u0443\u0440\u043d\u043e.")

    place_of_birth, place_confidence = _extract_place_of_birth(cleaned_lines)
    if place_confidence is not None:
      confidences.append(place_confidence)
    else:
      fallback_place, fallback_place_confidence = _extract_identity_card_place_of_birth_fallback(cleaned_lines)
      if fallback_place is not None:
        place_of_birth = fallback_place
        if fallback_place_confidence is not None:
          confidences.append(fallback_place_confidence)

    permanent_address, address_confidence = _extract_address(cleaned_lines)
    if address_confidence is not None:
      confidences.append(address_confidence)
    else:
      fallback_address, fallback_address_confidence = _extract_identity_card_address_fallback(cleaned_lines)
      if fallback_address is not None:
        permanent_address = fallback_address
        if fallback_address_confidence is not None:
          confidences.append(fallback_address_confidence)

    if place_of_birth is None:
      warnings.append("\u041c\u044f\u0441\u0442\u043e\u0442\u043e \u043d\u0430 \u0440\u0430\u0436\u0434\u0430\u043d\u0435 \u043b\u0438\u043f\u0441\u0432\u0430 \u0438\u043b\u0438 \u043d\u0435 \u0441\u0435 \u0432\u0438\u0436\u0434\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u044f\u0441\u043d\u043e.")
    if permanent_address is None:
      warnings.append("\u041f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u0438\u044f\u0442 \u0430\u0434\u0440\u0435\u0441 \u043b\u0438\u043f\u0441\u0432\u0430 \u0438\u043b\u0438 \u043d\u0435 \u0441\u0435 \u0432\u0438\u0436\u0434\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u044f\u0441\u043d\u043e.")
    else:
      warnings = [
        warning
        for warning in warnings
        if warning != "\u041f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u0438\u044f\u0442 \u0430\u0434\u0440\u0435\u0441 \u043b\u0438\u043f\u0441\u0432\u0430 \u0438\u043b\u0438 \u043d\u0435 \u0441\u0435 \u0432\u0438\u0436\u0434\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u044f\u0441\u043d\u043e."
      ]
    if place_of_birth is not None:
      warnings = [
        warning
        for warning in warnings
        if warning != "\u041c\u044f\u0441\u0442\u043e\u0442\u043e \u043d\u0430 \u0440\u0430\u0436\u0434\u0430\u043d\u0435 \u043b\u0438\u043f\u0441\u0432\u0430 \u0438\u043b\u0438 \u043d\u0435 \u0441\u0435 \u0432\u0438\u0436\u0434\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u044f\u0441\u043d\u043e."
      ]
    driving_categories = []

  if document_number and YEAR_RE.fullmatch(document_number):
    document_number = None
    warnings.append("\u041e\u0442\u043a\u0440\u0438\u0442\u0438\u044f\u0442 \u043d\u043e\u043c\u0435\u0440 \u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430 \u0438\u0437\u0433\u043b\u0435\u0436\u0434\u0430 \u043a\u0430\u0442\u043e \u0433\u043e\u0434\u0438\u043d\u0430 \u0438 \u0431\u0435\u0448\u0435 \u043e\u0442\u0445\u0432\u044a\u0440\u043b\u0435\u043d.")

  average_confidence = round(sum(confidences) / len(confidences), 4) if confidences else None

  return BulgarianDocumentExtraction(
    document_type=document_type,
    first_name=first_name,
    middle_name=middle_name,
    last_name=last_name,
    egn=egn,
    document_number=document_number,
    place_of_birth=place_of_birth,
    permanent_address=permanent_address,
    driving_categories=driving_categories,
    review_required=True,
    confidence=average_confidence,
    warnings=warnings,
  )






