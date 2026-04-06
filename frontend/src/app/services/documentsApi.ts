import { apiClient } from './apiClient';

export type DocumentRecordView = {
  id: string | number;
  name: string;
  type: 'student' | 'instructor' | 'vehicle' | 'school';
  category: string;
  owner: string;
  ownerId: string | number;
  issueDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: 'valid' | 'expiring-soon' | 'expired' | 'missing';
  statusLabel: string;
  fileUrl?: string;
  notes?: string;
};

export type DocumentOcrExtractionView = {
  fileName: string;
  documentName: string;
  extractedName: string;
  documentNumber: string;
  manualReviewRequired: boolean;
  confidence: number | null;
  warnings: string[];
  sourceFileName: string;
  rawData: Record<string, unknown>;
};

type BackendDocumentRecord = {
  id: string;
  studentId: string | null;
  name: string;
  ownerType: 'STUDENT' | 'INSTRUCTOR' | 'VEHICLE' | 'SCHOOL';
  ownerName: string;
  ownerRef: string | null;
  category: string;
  documentNo: string | null;
  issueDate: string;
  expiryDate: string | null;
  daysUntilExpiry: number;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  fileUrl: string | null;
  notes: string | null;
};

type BackendDocumentOcrExtraction = {
  fileName: string;
  data: unknown;
};

export type DocumentWritePayload = {
  studentId?: string | null;
  name: string;
  ownerType: 'STUDENT' | 'INSTRUCTOR' | 'VEHICLE' | 'SCHOOL';
  ownerName: string;
  ownerRef?: string | null;
  category: string;
  documentNo?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  fileUrl?: string | null;
  notes?: string | null;
};

export async function fetchDocumentRecords() {
  const response = await apiClient.get<{ items: BackendDocumentRecord[] }>(
    '/documents',
  );

  return response.items.map((document) => mapBackendDocument(document));
}

export async function fetchDocumentOcrExtractions() {
  const response = await apiClient.get<{
    items: BackendDocumentOcrExtraction[];
  }>('/documents/ocr-extractions');

  return response.items.map((item) => mapOcrExtraction(item));
}

export async function fetchDocumentOcrSourceFiles() {
  const response = await apiClient.get<{ items: string[] }>(
    '/documents/ocr-source-files',
  );

  return response.items;
}

export async function runDocumentOcrExtraction(
  sourceFileName: string,
  csrfToken: string,
) {
  const response = await apiClient.post<BackendDocumentOcrExtraction & {
    outputFileName: string;
  }>(
    '/documents/ocr-extractions/run',
    { sourceFileName },
    csrfToken,
  );

  return mapOcrExtraction({
    fileName: response.outputFileName || response.fileName,
    data: response.data,
  });
}

export async function createDocumentRecord(
  payload: DocumentWritePayload,
  csrfToken: string,
) {
  const response = await apiClient.post<BackendDocumentRecord>(
    '/documents',
    payload,
    csrfToken,
  );

  return mapBackendDocument(response);
}

export async function updateDocumentRecord(
  documentId: string,
  payload: DocumentWritePayload,
  csrfToken: string,
) {
  const response = await apiClient.put<BackendDocumentRecord>(
    `/documents/${documentId}`,
    payload,
    csrfToken,
  );

  return mapBackendDocument(response);
}

function mapBackendDocument(
  document: BackendDocumentRecord,
): DocumentRecordView {
  const status = mapDocumentStatus(document.status);

  return {
    id: document.id,
    name: document.name,
    type: mapDocumentOwnerType(document.ownerType),
    category: document.category,
    owner: document.ownerName,
    ownerId: document.studentId ?? document.ownerRef ?? document.id,
    issueDate: formatDate(document.issueDate),
    expiryDate: document.expiryDate ? formatDate(document.expiryDate) : 'Без срок',
    daysUntilExpiry: document.daysUntilExpiry,
    status,
    statusLabel: mapStatusLabel(status),
    fileUrl: document.fileUrl ?? undefined,
    notes: document.notes ?? undefined,
  };
}

function mapDocumentOwnerType(
  ownerType: BackendDocumentRecord['ownerType'],
): DocumentRecordView['type'] {
  switch (ownerType) {
    case 'INSTRUCTOR':
      return 'instructor';
    case 'VEHICLE':
      return 'vehicle';
    case 'SCHOOL':
      return 'school';
    default:
      return 'student';
  }
}

function mapDocumentStatus(
  status: BackendDocumentRecord['status'],
): DocumentRecordView['status'] {
  switch (status) {
    case 'EXPIRING_SOON':
      return 'expiring-soon';
    case 'EXPIRED':
      return 'expired';
    case 'MISSING':
      return 'missing';
    default:
      return 'valid';
  }
}

function mapStatusLabel(status: DocumentRecordView['status']) {
  switch (status) {
    case 'expiring-soon':
      return 'Изтича скоро';
    case 'expired':
      return 'Изтекъл';
    case 'missing':
      return 'Липсва';
    default:
      return 'Валиден';
  }
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-');

  return `${day}.${month}.${year}`;
}

function mapOcrExtraction(
  extraction: BackendDocumentOcrExtraction,
): DocumentOcrExtractionView {
  const rawData =
    extraction.data &&
    typeof extraction.data === 'object' &&
    !Array.isArray(extraction.data)
      ? (extraction.data as Record<string, unknown>)
      : {};

  const extractedName = [
    toText(rawData['име']),
    toText(rawData['презиме']),
    toText(rawData['фамилия']),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    fileName: extraction.fileName,
    documentName:
      toText(rawData['тип_документ']) ||
      toText(rawData['document_type']) ||
      'OCR документ',
    extractedName: extractedName || 'Неразпознато име',
    documentNumber:
      toText(rawData['номер_на_документ']) ||
      toText(rawData['document_number']) ||
      'Без номер',
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
    sourceFileName: extraction.fileName.replace(/\.json$/i, ''),
    rawData,
  };
}

function toText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function extractWarnings(rawData: Record<string, unknown>) {
  const value = rawData['предупреждения'] ?? rawData['warnings'];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}
