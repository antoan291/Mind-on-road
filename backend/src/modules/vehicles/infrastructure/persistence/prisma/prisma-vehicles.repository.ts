import type { Prisma, PrismaClient } from '@prisma/client';

import type { QueryReadAccessScope } from '../../../../shared/query/read-access-scope';
import type {
  VehicleRecord,
  VehiclesRepository,
  VehicleUpdateInput,
  VehicleWriteInput
} from '../../../domain/repositories/vehicles.repository';

const vehicleRecordSelect = {
  id: true,
  vehicleLabel: true,
  instructorName: true,
  categoryCode: true,
  status: true,
  nextInspection: true,
  activeLessons: true,
  operationalNote: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.VehicleRecordSelect;

export class PrismaVehiclesRepository implements VehiclesRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listByTenant(params: {
    tenantId: string;
    scope?: QueryReadAccessScope;
  }): Promise<VehicleRecord[]> {
    return this.prisma.vehicleRecord.findMany({
      where: buildVehicleReadWhere(params.tenantId, params.scope),
      orderBy: {
        nextInspection: 'asc'
      },
      select: vehicleRecordSelect
    });
  }

  public async createForTenant(params: {
    tenantId: string;
    vehicle: VehicleWriteInput;
  }): Promise<VehicleRecord> {
    return this.prisma.vehicleRecord.create({
      data: {
        tenantId: params.tenantId,
        ...params.vehicle
      },
      select: vehicleRecordSelect
    });
  }

  public async updateByTenantAndId(params: {
    tenantId: string;
    vehicleId: string;
    vehicle: VehicleUpdateInput;
  }): Promise<VehicleRecord | null> {
    const updateResult = await this.prisma.vehicleRecord.updateMany({
      where: {
        id: params.vehicleId,
        tenantId: params.tenantId
      },
      data: params.vehicle
    });

    if (updateResult.count === 0) {
      return null;
    }

    return this.prisma.vehicleRecord.findUnique({
      where: {
        id: params.vehicleId
      },
      select: vehicleRecordSelect
    });
  }
}

function buildVehicleReadWhere(
  tenantId: string,
  scope?: QueryReadAccessScope
): Prisma.VehicleRecordWhereInput {
  if (!scope || scope.mode === 'tenant') {
    return { tenantId };
  }

  if (scope.mode === 'instructor') {
    return {
      tenantId,
      instructorName: scope.instructorName
    };
  }

  return { tenantId };
}
