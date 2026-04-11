import type {
  DocumentLifecycleStatus,
  DocumentOwnerType
} from '@prisma/client';

export interface DocumentRecord {
  id: string;
  studentId: string | null;
  name: string;
  ownerType: DocumentOwnerType;
  ownerName: string;
  ownerRef: string | null;
  category: string;
  documentNo: string | null;
  issueDate: Date;
  expiryDate: Date | null;
  status: DocumentLifecycleStatus;
  fileUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentWriteInput {
  studentId: string | null;
  name: string;
  ownerType: DocumentOwnerType;
  ownerName: string;
  ownerRef: string | null;
  category: string;
  documentNo: string | null;
  issueDate: Date;
  expiryDate: Date | null;
  status: DocumentLifecycleStatus;
  fileUrl: string | null;
  notes: string | null;
}

export interface DocumentsRepository {
  listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<DocumentRecord[]>;
  createForTenant(params: {
    tenantId: string;
    document: DocumentWriteInput;
  }): Promise<DocumentRecord | null>;
  updateByTenantAndId(params: {
    tenantId: string;
    documentId: string;
    document: DocumentWriteInput;
  }): Promise<DocumentRecord | null>;
  deleteByTenantAndId(params: {
    tenantId: string;
    documentId: string;
  }): Promise<boolean>;
}
import type { QueryReadAccessScope } from '../../../shared/query/read-access-scope';
