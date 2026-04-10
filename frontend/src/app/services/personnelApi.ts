import { apiClient } from './apiClient';

export type PersonnelRoleKey =
  | 'administration'
  | 'instructor'
  | 'simulator_instructor';

export type PersonnelRow = {
  membershipId: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string | null;
  userStatus: string;
  membershipStatus: string;
  mustChangePassword: boolean;
  joinedAt: string;
  roleKeys: PersonnelRoleKey[];
  roleLabels: string[];
  assignedStudentsCount: number;
};

type PersonnelListResponse = {
  items: PersonnelRow[];
};

type PersonnelMutationPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  roleKeys: PersonnelRoleKey[];
};

type PersonnelMutationResponse = {
  item: PersonnelRow;
  portalAccess: {
    loginIdentifier: string;
    temporaryPassword: string | null;
    status: string;
  } | null;
};

export async function fetchPersonnelRows() {
  const response = await apiClient.get<PersonnelListResponse>('/personnel');
  return response.items;
}

export async function createPersonnel(
  payload: PersonnelMutationPayload,
  csrfToken: string,
) {
  return apiClient.post<PersonnelMutationResponse>(
    '/personnel',
    payload,
    csrfToken,
  );
}

export async function updatePersonnel(
  membershipId: string,
  payload: PersonnelMutationPayload,
  csrfToken: string,
) {
  return apiClient.put<PersonnelMutationResponse>(
    `/personnel/${membershipId}`,
    payload,
    csrfToken,
  );
}

export async function deletePersonnel(
  membershipId: string,
  csrfToken: string,
) {
  return apiClient.delete<void>(`/personnel/${membershipId}`, csrfToken);
}
