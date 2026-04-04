import type { VehicleRow } from '../pages/secondary/secondaryData';
import { apiClient } from './apiClient';

type BackendVehicleRecord = {
  id: string;
  vehicleLabel: string;
  instructorName: string;
  categoryCode: string;
  status: 'ACTIVE' | 'SERVICE_SOON' | 'OUT_OF_SERVICE';
  nextInspection: string;
  activeLessons: number;
  operationalNote: string;
};

export type VehicleWritePayload = {
  vehicleLabel: string;
  instructorName: string;
  categoryCode: string;
  status: 'ACTIVE' | 'SERVICE_SOON' | 'OUT_OF_SERVICE';
  nextInspection: string;
  activeLessons?: number;
  operationalNote: string;
};

export async function fetchVehicleRows() {
  const response = await apiClient.get<{ items: BackendVehicleRecord[] }>(
    '/vehicles',
  );

  return response.items.map((vehicle) => mapBackendVehicle(vehicle));
}

export async function createVehicleRow(
  payload: VehicleWritePayload,
  csrfToken: string,
) {
  const response = await apiClient.post<BackendVehicleRecord>(
    '/vehicles',
    payload,
    csrfToken,
  );

  return mapBackendVehicle(response);
}

export async function updateVehicleRow(
  vehicleId: string,
  payload: Partial<VehicleWritePayload>,
  csrfToken: string,
) {
  const response = await apiClient.put<BackendVehicleRecord>(
    `/vehicles/${vehicleId}`,
    payload,
    csrfToken,
  );

  return mapBackendVehicle(response);
}

function mapBackendVehicle(vehicle: BackendVehicleRecord): VehicleRow {
  return {
    id: vehicle.id,
    vehicle: vehicle.vehicleLabel,
    instructor: vehicle.instructorName,
    category: vehicle.categoryCode,
    status:
      vehicle.status === 'SERVICE_SOON'
        ? 'warning'
        : vehicle.status === 'OUT_OF_SERVICE'
          ? 'error'
          : 'success',
    nextInspection: formatDate(vehicle.nextInspection),
    activeLessons: vehicle.activeLessons,
    issue: vehicle.operationalNote,
  };
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-');

  return `${day}.${month}.${year}`;
}
