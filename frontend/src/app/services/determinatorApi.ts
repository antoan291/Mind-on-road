import { apiClient } from './apiClient';

export type DeterminatorSessionDto = {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  measuredAt: string;
  autoTempoCorrectReactions: number;
  autoTempoWrongReactions: number;
  autoTempoSuccessCoefficient: number;
  forcedTempoCorrectReactions: number;
  forcedTempoDelayedReactions: number;
  forcedTempoWrongResults: number;
  forcedTempoMissedStimuli: number;
  forcedTempoSuccessCoefficient: number;
  overallResult: string;
  instructorNote: string;
};

export type CreateDeterminatorSessionPayload = {
  studentId: string;
  registrationNumber: string;
  autoTempoCorrectReactions: number;
  autoTempoWrongReactions: number;
  forcedTempoCorrectReactions: number;
  forcedTempoDelayedReactions: number;
  forcedTempoWrongResults: number;
  forcedTempoMissedStimuli: number;
  overallResult: string | null;
  instructorNote: string | null;
};

export async function fetchDeterminatorSessions(studentId?: string) {
  const query = studentId ? `?studentId=${studentId}` : '';
  const response = await apiClient.get<{ items: DeterminatorSessionDto[] }>(
    `/determinator/sessions${query}`,
  );

  return response.items;
}

export async function createDeterminatorSession(
  payload: CreateDeterminatorSessionPayload,
  csrfToken: string,
) {
  return apiClient.post<DeterminatorSessionDto>(
    '/determinator/sessions',
    payload,
    csrfToken,
  );
}
