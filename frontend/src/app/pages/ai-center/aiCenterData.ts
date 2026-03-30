import { aiCenterContent } from '../../content/staticContent';

export type AITabKey = 'risk' | 'assistant' | 'documents';

export const aiTabs = aiCenterContent.tabs as Array<{ key: AITabKey; label: string }>;
export const riskSummary = aiCenterContent.risk.summary;
export const riskStudents = aiCenterContent.risk.students;
export const assistantPrompts = aiCenterContent.assistant.prompts;
export const assistantReasons = aiCenterContent.assistant.rows;
export const assistantWeeklyStats = [
  { label: aiCenterContent.assistant.weeklyLabel, value: aiCenterContent.assistant.weeklyValue },
  { label: aiCenterContent.assistant.weeklyStatus, value: 'Да' },
];
export const documentFindings = aiCenterContent.documents.findings;
export const recentDocumentChecks = aiCenterContent.documents.recentChecks;
