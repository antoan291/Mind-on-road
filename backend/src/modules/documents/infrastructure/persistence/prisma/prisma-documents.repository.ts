import type { Prisma, PrismaClient } from '@prisma/client';

import type { QueryReadAccessScope } from '../../../../shared/query/read-access-scope';
import type {
  DocumentRecord,
  DocumentWriteInput,
  DocumentsRepository
} from '../../../domain/repositories/documents.repository';

const documentSelect = {
  id: true,
  studentId: true,
  name: true,
  ownerType: true,
  ownerName: true,
  ownerRef: true,
  category: true,
  documentNo: true,
  issueDate: true,
  expiryDate: true,
  status: true,
  fileUrl: true,
  notes: true,
  createdAt: true,
  updatedAt: true
} as const;

export class PrismaDocumentsRepository implements DocumentsRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<DocumentRecord[]> {
    return this.prisma.documentRecord.findMany({
      where: buildDocumentReadWhere(params.tenantId, params.scope),
      orderBy: [
        {
          status: 'asc'
        },
        {
          expiryDate: 'asc'
        },
        {
          createdAt: 'desc'
        }
      ],
      select: documentSelect
    });
  }

  public async createForTenant(params: {
    tenantId: string;
    document: DocumentWriteInput;
  }): Promise<DocumentRecord | null> {
    const normalizedDocument = await this.normalizeDocumentForTenant(params);

    if (!normalizedDocument) {
      return null;
    }

    return this.prisma.documentRecord.create({
      data: {
        tenantId: params.tenantId,
        ...normalizedDocument
      },
      select: documentSelect
    });
  }

  public async updateByTenantAndId(params: {
    tenantId: string;
    documentId: string;
    document: DocumentWriteInput;
  }): Promise<DocumentRecord | null> {
    const normalizedDocument = await this.normalizeDocumentForTenant({
      tenantId: params.tenantId,
      document: params.document
    });

    if (!normalizedDocument) {
      return null;
    }

    const updatedRows = await this.prisma.documentRecord.updateMany({
      where: {
        id: params.documentId,
        tenantId: params.tenantId
      },
      data: normalizedDocument
    });

    if (updatedRows.count === 0) {
      return null;
    }

    return this.prisma.documentRecord.findFirst({
      where: {
        id: params.documentId,
        tenantId: params.tenantId
      },
      select: documentSelect
    });
  }

  public async deleteByTenantAndId(params: {
    tenantId: string;
    documentId: string;
  }): Promise<boolean> {
    const deletedRows = await this.prisma.documentRecord.deleteMany({
      where: {
        id: params.documentId,
        tenantId: params.tenantId
      }
    });

    return deletedRows.count > 0;
  }

  private async normalizeDocumentForTenant(params: {
    tenantId: string;
    document: DocumentWriteInput;
  }): Promise<DocumentWriteInput | null> {
    if (params.document.ownerType !== 'STUDENT') {
      return {
        ...params.document,
        studentId: null
      };
    }

    if (!params.document.studentId) {
      return null;
    }

    const student = await this.prisma.student.findFirst({
      where: {
        id: params.document.studentId,
        tenantId: params.tenantId
      },
      select: {
        id: true,
        displayName: true
      }
    });

    if (!student) {
      return null;
    }

    return {
      ...params.document,
      studentId: student.id,
      ownerName: student.displayName,
      ownerRef: student.id
    };
  }
}

function buildDocumentReadWhere(
  tenantId: string,
  scope?: QueryReadAccessScope
): Prisma.DocumentRecordWhereInput {
  if (!scope || scope.mode === 'tenant') {
    return { tenantId };
  }

  if (scope.mode === 'instructor') {
    return {
      tenantId,
      OR: [
        {
          studentId: {
            in: scope.studentIds
          }
        },
        {
          ownerName: scope.instructorName
        }
      ]
    };
  }

  return {
    tenantId,
    studentId: {
      in: scope.studentIds
    }
  };
}
