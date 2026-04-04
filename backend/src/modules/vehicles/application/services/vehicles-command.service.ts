import type {
  VehiclesRepository,
  VehicleUpdateInput,
  VehicleWriteInput
} from '../../domain/repositories/vehicles.repository';
import { toVehicleResponse } from './vehicles-query.service';

export class VehiclesCommandService {
  public constructor(
    private readonly vehiclesRepository: VehiclesRepository
  ) {}

  public async createVehicle(params: {
    tenantId: string;
    vehicle: VehicleWriteInput;
  }) {
    const vehicle = await this.vehiclesRepository.createForTenant({
      tenantId: params.tenantId,
      vehicle: params.vehicle
    });

    return toVehicleResponse(vehicle);
  }

  public async updateVehicle(params: {
    tenantId: string;
    vehicleId: string;
    vehicle: VehicleUpdateInput;
  }) {
    const vehicle = await this.vehiclesRepository.updateByTenantAndId({
      tenantId: params.tenantId,
      vehicleId: params.vehicleId,
      vehicle: params.vehicle
    });

    return vehicle ? toVehicleResponse(vehicle) : null;
  }
}
