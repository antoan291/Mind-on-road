import type {
  DocumentRecord,
  DocumentsRepository
} from '../../domain/repositories/documents.repository';

export class DocumentsQueryService {
  public constructor(private readonly documentsRepository: DocumentsRepository) {}

  public async listDocuments(params: { tenantId: string }) {
    const documents = await this.documentsRepository.listByTenant({
      tenantId: params.tenantId
    });

    return documents.map((document) => toDocumentResponse(document));
  }
}

export function toDocumentResponse(document: DocumentRecord) {
  const daysUntilExpiry = document.expiryDate
    ? Math.ceil(
        (document.expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      )
    : 0;

  return {
    id: document.id,
    studentId: document.studentId,
    name: document.name,
    ownerType: document.ownerType,
    ownerName: document.ownerName,
    ownerRef: document.ownerRef,
    category: document.category,
    documentNo: document.documentNo,
    issueDate: document.issueDate.toISOString().slice(0, 10),
    expiryDate: document.expiryDate
      ? document.expiryDate.toISOString().slice(0, 10)
      : null,
    daysUntilExpiry,
    status: document.status,
    fileUrl: document.fileUrl,
    notes: document.notes,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}
