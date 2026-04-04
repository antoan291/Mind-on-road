import type {
  VehicleRecord,
  VehiclesRepository
} from '../../domain/repositories/vehicles.repository';

export class VehiclesQueryService {
  public constructor(private readonly vehiclesRepository: VehiclesRepository) {}

  public async listVehicles(params: { tenantId: string }) {
    const vehicles = await this.vehiclesRepository.listByTenant({
      tenantId: params.tenantId
    });

    return vehicles.map((vehicle) => toVehicleResponse(vehicle));
  }
}

export function toVehicleResponse(vehicle: VehicleRecord) {
  return {
    id: vehicle.id,
    vehicleLabel: vehicle.vehicleLabel,
    instructorName: vehicle.instructorName,
    categoryCode: vehicle.categoryCode,
    status: vehicle.status,
    nextInspection: vehicle.nextInspection.toISOString().slice(0, 10),
    activeLessons: vehicle.activeLessons,
    operationalNote: vehicle.operationalNote,
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString()
  };
}
