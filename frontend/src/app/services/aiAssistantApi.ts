import { apiClient } from './apiClient';

export type BusinessAssistantStats = {
  studentsCount: number;
  activeStudentsCount: number;
  inactivePracticeStudentsCount: number;
  paymentsTotalAmount: number;
  expensesTotalAmount: number;
  friendVatTotalAmount: number;
  invoicesCount: number;
  documentsExpiringSoonCount: number;
  vehiclesCount: number;
  vehiclesNeedingAttentionCount: number;
  practicalLessonsCount: number;
  theoryGroupsCount: number;
};

export type BusinessAssistantResponse = {
  answer: string;
  generatedAt: string;
  model: string;
  sourceModules: string[];
  stats: BusinessAssistantStats;
};

export function askBusinessAssistant(question: string, csrfToken?: string) {
  return apiClient.post<BusinessAssistantResponse>(
    '/ai/business-assistant',
    { question },
    csrfToken,
  );
}
