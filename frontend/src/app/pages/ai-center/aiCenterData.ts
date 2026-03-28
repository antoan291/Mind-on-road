export type AITabKey = 'risk' | 'assistant' | 'documents';

export const aiTabs: Array<{ key: AITabKey; label: string }> = [
  { key: 'risk', label: 'Риск от отпадане' },
  { key: 'assistant', label: 'Бизнес асистент' },
  { key: 'documents', label: 'Проверка документи' },
];

export const riskSummary = [
  { label: 'Висок риск', value: '3', tone: 'high' as const, icon: 'trend' },
  { label: 'Среден', value: '7', tone: 'medium' as const, icon: 'bars' },
  { label: 'Нисък', value: '37', tone: 'low' as const, icon: 'check' },
];

export const riskStudents = [
  {
    initials: 'МГ',
    name: 'М. Георгиева',
    category: 'B',
    risk: 7.2,
    factors: 'Пропуснати 3 урока',
    delta: '+5ч',
    action: 'Обади се',
    recommendation:
      'Предложете преместване в група с по-ясен час или 1 бонус час за наваксване, за да стабилизирате ангажираността през следващите 7 дни.',
    signals: ['Спад в мотивацията след теория', '3 поредни отказа от учебни часове', 'Географска дистанция от полигона'],
  },
  {
    initials: 'СВ',
    name: 'С. Василев',
    category: 'B',
    risk: 6.8,
    factors: 'Без урок 28 дни',
    delta: '+3ч',
    action: 'Обади се',
  },
  {
    initials: 'КГ',
    name: 'К. Георгиев',
    category: 'C',
    risk: 5.1,
    factors: 'Намалена честота',
    delta: '+2ч',
    action: 'Наблюдавай',
  },
];

export const assistantPrompts = [
  'Какъв е очакваният приход за април?',
  'Кои документи изтичат тази седмица?',
  'Анализирай натовареността на автопарка',
];

export const assistantReasons = [
  { date: '12.05.2024', reason: 'Техн. неизправност', status: 'Отменен' },
  { date: '14.05.2024', reason: 'Техн. неизправност', status: 'Отменен' },
  { date: '15.05.2024', reason: 'Техн. неизправност', status: 'Отменен' },
];

export const assistantWeeklyStats = [
  { label: 'Нови записвания', value: '+24%' },
  { label: 'Оптимално представяне', value: 'Да' },
];

export const documentFindings = [
  {
    status: 'blocked' as const,
    title: 'Липсва ДДС №',
    badge: 'Задължително',
    description: 'В документа не е намерен валиден идентификационен номер по ДДС за доставчика.',
    suggestion: 'BG204857193',
    action: 'Поправи',
  },
  {
    status: 'warning' as const,
    title: 'Необичайна сума',
    badge: 'Предупреждение',
    description: 'Общата сума се отклонява с над 45% от средната за този тип фактури през последните 3 месеца.',
    suggestion: 'Проверете за правописна грешка в десетичната запетая или грешна валута.',
    action: 'Прегледай',
  },
];

export const recentDocumentChecks = [
  { id: '#DOC-8472', date: '12.10.2023', owner: 'Петър Иванов', status: 'Потвърден', amount: '450,00 лв' },
  { id: '#DOC-8469', date: '12.10.2023', owner: 'Авто-Мобил ООД', status: 'Блокиран', amount: '1 240,00 лв' },
  { id: '#DOC-8461', date: '11.10.2023', owner: 'Мария Стойчева', status: 'Потвърден', amount: '85,00 лв' },
];
