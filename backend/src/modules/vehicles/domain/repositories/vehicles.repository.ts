import type { VehicleLifecycleStatus } from '@prisma/client';

export interface VehicleRecord {
  id: string;
  vehicleLabel: string;
  instructorName: string;
  categoryCode: string;
  status: VehicleLifecycleStatus;
  nextInspection: Date;
  activeLessons: number;
  operationalNote: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleWriteInput {
  vehicleLabel: string;
  instructorName: string;
  categoryCode: string;
  status: VehicleLifecycleStatus;
  nextInspection: Date;
  activeLessons: number;
  operationalNote: string;
}

export interface VehicleUpdateInput {
  vehicleLabel?: string;
  instructorName?: string;
  categoryCode?: string;
  status?: VehicleLifecycleStatus;
  nextInspection?: Date;
  activeLessons?: number;
  operationalNote?: string;
}

export interface VehiclesRepository {
  listByTenant(params: { tenantId: string }): Promise<VehicleRecord[]>;
  createForTenant(params: {
    tenantId: string;
    vehicle: VehicleWriteInput;
  }): Promise<VehicleRecord>;
  updateByTenantAndId(params: {
    tenantId: string;
    vehicleId: string;
    vehicle: VehicleUpdateInput;
  }): Promise<VehicleRecord | null>;
}
