export type StudentOcrAutofillResponse = {
  documentType: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  nationalId: string | null;
  birthDate: string | null;
  address: string | null;
  documentNumber: string | null;
  previousLicenseCategory: string | null;
  manualReviewRequired: boolean;
  confidence: number | null;
  warnings: string[];
  rawData: Record<string, unknown>;
};

export function mapOcrDataToStudentAutofillResponse(
  rawData: Record<string, unknown>
): StudentOcrAutofillResponse {
  const categories = parseDrivingCategories(rawData['категории']);
  const nationalId =
    toText(rawData['егн']) || toText(rawData['national_id']) || null;

  return {
    documentType:
      toText(rawData['тип_документ']) ||
      toText(rawData['document_type']) ||
      'неразпознат документ',
    firstName: toText(rawData['име']) || null,
    middleName: toText(rawData['презиме']) || null,
    lastName: toText(rawData['фамилия']) || null,
    nationalId,
    birthDate: inferBirthDateFromEgn(nationalId),
    address:
      toText(rawData['постоянен_адрес']) ||
      toText(rawData['address']) ||
      null,
    documentNumber:
      toText(rawData['номер_на_документа']) ||
      toText(rawData['номер_на_документ']) ||
      toText(rawData['document_number']) ||
      null,
    previousLicenseCategory: categories[0] ?? null,
    manualReviewRequired:
      rawData['нужен_ръчен_преглед'] !== false &&
      rawData['manual_review_required'] !== false,
    confidence:
      typeof rawData['увереност'] === 'number'
        ? rawData['увереност']
        : typeof rawData['confidence'] === 'number'
          ? rawData['confidence']
          : null,
    warnings: extractWarnings(rawData),
    rawData,
  };
}

function toText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function extractWarnings(rawData: Record<string, unknown>) {
  const value = rawData['предупреждения'] ?? rawData['warnings'];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function parseDrivingCategories(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return '';
      }

      const record = item as Record<string, unknown>;
      return (
        toText(record['категория']) ||
        toText(record['category']) ||
        ''
      ).toUpperCase();
    })
    .filter(Boolean);
}

function inferBirthDateFromEgn(egn: string | null) {
  if (!egn || !/^\d{10}$/.test(egn)) {
    return null;
  }

  const year = Number(egn.slice(0, 2));
  const monthCode = Number(egn.slice(2, 4));
  const day = Number(egn.slice(4, 6));

  let fullYear = 1900 + year;
  let month = monthCode;

  if (monthCode >= 1 && monthCode <= 12) {
    fullYear = 1900 + year;
    month = monthCode;
  } else if (monthCode >= 21 && monthCode <= 32) {
    fullYear = 1800 + year;
    month = monthCode - 20;
  } else if (monthCode >= 41 && monthCode <= 52) {
    fullYear = 2000 + year;
    month = monthCode - 40;
  } else {
    return null;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return `${String(fullYear).padStart(4, '0')}-${String(month).padStart(
    2,
    '0'
  )}-${String(day).padStart(2, '0')}`;
}
