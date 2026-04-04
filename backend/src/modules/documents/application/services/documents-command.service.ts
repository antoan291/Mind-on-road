import type {
  DocumentWriteInput,
  DocumentsRepository
} from '../../domain/repositories/documents.repository';
import { toDocumentResponse } from './documents-query.service';

export class DocumentsCommandService {
  public constructor(private readonly documentsRepository: DocumentsRepository) {}

  public async createDocument(params: {
    tenantId: string;
    document: DocumentWriteInput;
  }) {
    const document = await this.documentsRepository.createForTenant(params);

    return document ? toDocumentResponse(document) : null;
  }

  public async updateDocument(params: {
    tenantId: string;
    documentId: string;
    document: DocumentWriteInput;
  }) {
    const document = await this.documentsRepository.updateByTenantAndId(params);

    return document ? toDocumentResponse(document) : null;
  }
}
