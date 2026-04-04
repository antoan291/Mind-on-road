import type { DocumentsQueryService } from '../../../documents/application/services/documents-query.service';
import type { ExpensesQueryService } from '../../../expenses/application/services/expenses-query.service';
import type { InvoicesQueryService } from '../../../invoicing/application/services/invoices-query.service';
import type { PaymentsQueryService } from '../../../payments/application/services/payments-query.service';
import type { PracticalLessonsQueryService } from '../../../practice/application/services/practical-lessons-query.service';
import type { StudentsQueryService } from '../../../students/application/services/students-query.service';
import type { TheoryGroupsQueryService } from '../../../theory/application/services/theory-groups-query.service';
import type { VehiclesQueryService } from '../../../vehicles/application/services/vehicles-query.service';

type StudentSummary = Awaited<
  ReturnType<StudentsQueryService['listStudents']>
>[number];
type PaymentSummary = Awaited<
  ReturnType<PaymentsQueryService['listPayments']>
>[number];
type ExpenseSummary = Awaited<
  ReturnType<ExpensesQueryService['listExpenses']>
>[number];
type DocumentSummary = Awaited<
  ReturnType<DocumentsQueryService['listDocuments']>
>[number];
type InvoiceSummary = Awaited<
  ReturnType<InvoicesQueryService['listInvoices']>
>[number];
type TheoryGroupSummary = Awaited<
  ReturnType<TheoryGroupsQueryService['listGroups']>
>[number];
type PracticalLessonSummary = Awaited<
  ReturnType<PracticalLessonsQueryService['listLessons']>
>[number];
type VehicleSummary = Awaited<
  ReturnType<VehiclesQueryService['listVehicles']>
>[number];

type BusinessSnapshot = {
  generatedAt: string;
  stats: {
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
  students: Array<{
    name: string;
    phone: string;
    status: string;
    categoryCode: string | null;
    instructorName: string | null;
    remainingHours: number;
    maxHours: number;
    lastPracticeAt: string | null;
    inactiveMoreThan30Days: boolean;
    failedExamAttempts: number;
  }>;
  payments: Array<{
    studentName: string;
    paymentNumber: string;
    amount: number;
    method: string;
    status: string;
    paidAt: string;
    note: string | null;
  }>;
  expenses: Array<{
    type: string;
    title: string;
    category: string;
    amount: number;
    vatAmount: number;
    status: string;
    affectsOperationalExpense: boolean;
    date: string;
  }>;
  documents: Array<{
    name: string;
    ownerName: string;
    ownerType: string;
    category: string;
    status: string;
    expiryDate: string | null;
    daysUntilExpiry: number;
  }>;
  invoices: Array<{
    invoiceNumber: string;
    recipientName: string;
    totalAmount: number;
    status: string;
    paymentStatus: string | null;
    dueDate: string | null;
  }>;
  theoryGroups: Array<{
    name: string;
    categoryCode: string;
    instructorName: string;
    status: string;
    activeStudents: number;
    studentsWithAbsences: number;
    studentsNeedingRecovery: number;
    averageAttendance: number;
  }>;
  practicalLessons: Array<{
    studentName: string;
    instructorName: string;
    vehicleLabel: string;
    lessonDate: string;
    startTimeLabel: string;
    status: string;
    paymentStatus: string;
    evaluationStatus: string;
    parentNotificationSent: boolean;
  }>;
  vehicles: Array<{
    vehicleLabel: string;
    instructorName: string;
    categoryCode: string;
    status: string;
    nextInspection: string;
    activeLessons: number;
    operationalNote: string | null;
  }>;
};

type OpenAiChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_CONTEXT_ITEMS = 80;
const INACTIVITY_THRESHOLD_DAYS = 30;
const EXPIRING_SOON_DAYS = 30;
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const BUSINESS_DOMAIN_TERMS = [
  'курсист',
  'курсисти',
  'ученик',
  'ученици',
  'инструктор',
  'инструктори',
  'плащане',
  'плащания',
  'пари',
  'приход',
  'приходи',
  'оборот',
  'печалба',
  'изкарали',
  'изкарани',
  'спечелили',
  'година',
  'години',
  'месец',
  'месеци',
  'период',
  'фактура',
  'фактури',
  'разход',
  'разходи',
  'документ',
  'документи',
  'теория',
  'практика',
  'график',
  'часове',
  'автомобил',
  'автомобили',
  'автопарк',
  'кола',
  'коли',
  'мпс',
  'превозно',
  'преглед',
  'сервиз',
  'детерминатор',
  'известия',
  'ддс',
  'категория',
  'школа',
  'student',
  'students',
  'instructor',
  'payment',
  'payments',
  'revenue',
  'profit',
  'turnover',
  'invoice',
  'invoices',
  'expense',
  'expenses',
  'document',
  'documents',
  'schedule',
  'vehicle',
  'vehicles',
  'lesson',
  'lessons',
  'business',
  'database'
];

export class BusinessAssistantService {
  public constructor(
    private readonly studentsQueryService: StudentsQueryService,
    private readonly paymentsQueryService: PaymentsQueryService,
    private readonly expensesQueryService: ExpensesQueryService,
    private readonly documentsQueryService: DocumentsQueryService,
    private readonly invoicesQueryService: InvoicesQueryService,
    private readonly theoryGroupsQueryService: TheoryGroupsQueryService,
    private readonly practicalLessonsQueryService: PracticalLessonsQueryService,
    private readonly vehiclesQueryService: VehiclesQueryService
  ) {}

  public async answerQuestion(params: {
    tenantId: string;
    question: string;
    openAiApiKey?: string;
  }) {
    const snapshot = await this.buildBusinessSnapshot(params.tenantId);

    if (!isBusinessScopedQuestion(params.question, snapshot)) {
      return {
        answer:
          'Мога да отговарям само на въпроси за данните и бизнеса на тази автошкола: курсисти, плащания, разходи, фактури, документи, теория, практика, график, инструктори, автомобили и оперативни рискове.',
        generatedAt: snapshot.generatedAt,
        model: 'local-guardrail',
        sourceModules: [
          'students',
          'payments',
          'expenses',
          'documents',
          'invoices',
          'theory',
          'practice',
          'vehicles'
        ],
        stats: snapshot.stats
      };
    }

    if (params.openAiApiKey) {
      const openAiAnswer = await generateOpenAiAnswer({
        apiKey: params.openAiApiKey,
        question: params.question,
        snapshot
      });

      if (openAiAnswer) {
        return {
          answer: openAiAnswer,
          generatedAt: snapshot.generatedAt,
          model: OPENAI_MODEL,
          sourceModules: [
            'students',
            'payments',
            'expenses',
            'documents',
            'invoices',
            'theory',
            'practice',
            'vehicles'
          ],
          stats: snapshot.stats
        };
      }
    }

    return {
      answer: buildFallbackBusinessAnswer(params.question, snapshot),
      generatedAt: snapshot.generatedAt,
      model: 'local-fallback',
      sourceModules: [
        'students',
        'payments',
        'expenses',
        'documents',
        'invoices',
        'theory',
        'practice',
        'vehicles'
      ],
      stats: snapshot.stats
    };
  }

  private async buildBusinessSnapshot(
    tenantId: string
  ): Promise<BusinessSnapshot> {
    const [
      students,
      payments,
      expenses,
      documents,
      invoices,
      theoryGroups,
      practicalLessons,
      vehicles
    ] = await Promise.all([
      this.studentsQueryService.listStudents({ tenantId }),
      this.paymentsQueryService.listPayments({ tenantId }),
      this.expensesQueryService.listExpenses({ tenantId }),
      this.documentsQueryService.listDocuments({ tenantId }),
      this.invoicesQueryService.listInvoices({ tenantId }),
      this.theoryGroupsQueryService.listGroups({ tenantId }),
      this.practicalLessonsQueryService.listLessons({ tenantId }),
      this.vehiclesQueryService.listVehicles({ tenantId })
    ]);

    const now = Date.now();
    const inactiveStudents = students.filter((student) => {
      const lastPracticeAt = student.enrollment?.lastPracticeAt;

      if (!lastPracticeAt) {
        return false;
      }

      const inactiveDays = Math.floor(
        (now - new Date(lastPracticeAt).getTime()) / (24 * 60 * 60 * 1000)
      );

      return inactiveDays > INACTIVITY_THRESHOLD_DAYS;
    });

    return {
      generatedAt: new Date(now).toISOString(),
      stats: {
        studentsCount: students.length,
        activeStudentsCount: students.filter(
          (student) => student.status === 'ACTIVE'
        ).length,
        inactivePracticeStudentsCount: inactiveStudents.length,
        paymentsTotalAmount: payments.reduce(
          (total, payment) => total + payment.amount,
          0
        ),
        expensesTotalAmount: expenses
          .filter((expense) => expense.affectsOperationalExpense)
          .reduce((total, expense) => total + expense.amount, 0),
        friendVatTotalAmount: expenses
          .filter((expense) => expense.type === 'friend-vat-expense')
          .reduce((total, expense) => total + expense.vatAmount, 0),
        invoicesCount: invoices.length,
        documentsExpiringSoonCount: documents.filter(
          (document) =>
            document.expiryDate !== null &&
            document.daysUntilExpiry >= 0 &&
            document.daysUntilExpiry <= EXPIRING_SOON_DAYS
        ).length,
        vehiclesCount: vehicles.length,
        vehiclesNeedingAttentionCount: vehicles.filter(
          (vehicle) => vehicle.status !== 'ACTIVE'
        ).length,
        practicalLessonsCount: practicalLessons.length,
        theoryGroupsCount: theoryGroups.length
      },
      students: students.slice(0, MAX_CONTEXT_ITEMS).map((student) => {
        const lastPracticeAt = student.enrollment?.lastPracticeAt ?? null;
        const inactiveMoreThan30Days = lastPracticeAt
          ? Math.floor(
              (now - new Date(lastPracticeAt).getTime()) /
                (24 * 60 * 60 * 1000)
            ) > INACTIVITY_THRESHOLD_DAYS
          : false;

        return {
          name: student.name,
          phone: student.phone,
          status: student.status,
          categoryCode: student.enrollment?.categoryCode ?? null,
          instructorName: student.enrollment?.instructorName ?? null,
          remainingHours: student.enrollment?.remainingHours ?? 0,
          maxHours: student.enrollment?.maxHours ?? 0,
          lastPracticeAt,
          inactiveMoreThan30Days,
          failedExamAttempts: student.enrollment?.failedExamAttempts ?? 0
        };
      }),
      payments: payments.slice(0, MAX_CONTEXT_ITEMS).map((payment) => ({
        studentName: payment.studentName,
        paymentNumber: payment.paymentNumber,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        paidAt: payment.paidAt,
        note: payment.note
      })),
      expenses: expenses.slice(0, MAX_CONTEXT_ITEMS).map((expense) => ({
        type: expense.type,
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        vatAmount: expense.vatAmount,
        status: expense.status,
        affectsOperationalExpense: expense.affectsOperationalExpense,
        date: expense.date
      })),
      documents: documents.slice(0, MAX_CONTEXT_ITEMS).map((document) => ({
        name: document.name,
        ownerName: document.ownerName,
        ownerType: document.ownerType,
        category: document.category,
        status: document.status,
        expiryDate: document.expiryDate,
        daysUntilExpiry: document.daysUntilExpiry
      })),
      invoices: invoices.slice(0, MAX_CONTEXT_ITEMS).map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        recipientName: invoice.recipientName,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        dueDate: invoice.dueDate
      })),
      theoryGroups: theoryGroups.slice(0, MAX_CONTEXT_ITEMS).map((group) => ({
        name: group.name,
        categoryCode: group.categoryCode,
        instructorName: group.instructorName,
        status: group.status,
        activeStudents: group.activeStudents,
        studentsWithAbsences: group.studentsWithAbsences,
        studentsNeedingRecovery: group.studentsNeedingRecovery,
        averageAttendance: group.averageAttendance
      })),
      practicalLessons: practicalLessons
        .slice(0, MAX_CONTEXT_ITEMS)
        .map((lesson) => ({
          studentName: lesson.studentName,
          instructorName: lesson.instructorName,
          vehicleLabel: lesson.vehicleLabel,
          lessonDate: lesson.lessonDate,
          startTimeLabel: lesson.startTimeLabel,
          status: lesson.status,
          paymentStatus: lesson.paymentStatus,
          evaluationStatus: lesson.evaluationStatus,
          parentNotificationSent: lesson.parentNotificationSent
        })),
      vehicles: vehicles.slice(0, MAX_CONTEXT_ITEMS).map((vehicle) => ({
        vehicleLabel: vehicle.vehicleLabel,
        instructorName: vehicle.instructorName,
        categoryCode: vehicle.categoryCode,
        status: vehicle.status,
        nextInspection: vehicle.nextInspection,
        activeLessons: vehicle.activeLessons,
        operationalNote: vehicle.operationalNote
      }))
    };
  }
}

async function generateOpenAiAnswer(params: {
  apiKey: string;
  question: string;
  snapshot: BusinessSnapshot;
}) {
  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'Ти си senior бизнес асистент за автошкола. Отговаряй само на база предоставения tenant snapshot. Ако въпросът изисква информация извън snapshot-а или извън бизнеса/базата на тази школа, откажи кратко. Не измисляй числа, имена или политики. Не предлагай технически промени по кода, освен ако питането е за данните и оперативните процеси. Пиши на български, ясно и конкретно.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              question: params.question,
              tenantSnapshot: params.snapshot
            })
          }
        ]
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload =
      (await response.json()) as OpenAiChatCompletionResponse;

    return payload.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

function isBusinessScopedQuestion(
  question: string,
  snapshot: BusinessSnapshot
) {
  const normalizedQuestion = normalizeQuestionText(question);

  if (
    BUSINESS_DOMAIN_TERMS.some((term) => normalizedQuestion.includes(term))
  ) {
    return true;
  }

  return [
    ...snapshot.students.map((student) => student.name),
    ...snapshot.students.map((student) => student.phone),
    ...snapshot.students
      .map((student) => student.instructorName)
      .filter((value): value is string => Boolean(value)),
    ...snapshot.vehicles.map((vehicle) => vehicle.vehicleLabel),
    ...snapshot.documents.map((document) => document.ownerName),
    ...snapshot.invoices.map((invoice) => invoice.invoiceNumber)
  ].some((entityValue) =>
    normalizedQuestion.includes(normalizeQuestionText(entityValue))
  );
}

function buildFallbackBusinessAnswer(
  question: string,
  snapshot: BusinessSnapshot
) {
  const normalizedQuestion = normalizeQuestionText(question);
  const reportingPeriod = resolveReportingPeriod(
    normalizedQuestion,
    snapshot.generatedAt
  );

  if (
    normalizedQuestion.includes('плащан') ||
    normalizedQuestion.includes('приход') ||
    normalizedQuestion.includes('фактур') ||
    normalizedQuestion.includes('пари') ||
    normalizedQuestion.includes('оборот') ||
    normalizedQuestion.includes('печалб') ||
    normalizedQuestion.includes('изкарал') ||
    normalizedQuestion.includes('изкаран') ||
    normalizedQuestion.includes('спечел')
  ) {
    const periodPayments = snapshot.payments.filter((payment) =>
      isDateInReportingPeriod(payment.paidAt, reportingPeriod)
    );
    const periodExpenses = snapshot.expenses.filter(
      (expense) =>
        expense.affectsOperationalExpense &&
        isDateInReportingPeriod(expense.date, reportingPeriod)
    );
    const periodRevenueAmount = periodPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
    const periodExpenseAmount = periodExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
    const periodProfitAmount = periodRevenueAmount - periodExpenseAmount;
    const latestPayment = periodPayments[0] ?? snapshot.payments[0];
    const latestInvoice = snapshot.invoices[0];

    return [
      `${reportingPeriod.label}: приходи ${periodRevenueAmount} лв, разходи ${periodExpenseAmount} лв, печалба ${periodProfitAmount} лв. Общо фактури в системата: ${snapshot.stats.invoicesCount}.`,
      latestPayment
        ? `Последно плащане: ${latestPayment.studentName}, ${latestPayment.amount} лв, номер ${latestPayment.paymentNumber}, статус ${latestPayment.status}.`
        : `Няма намерени плащания за периода ${reportingPeriod.label.toLowerCase()}.`,
      latestInvoice
        ? `Последна фактура: ${latestInvoice.invoiceNumber} към ${latestInvoice.recipientName}, ${latestInvoice.totalAmount} лв, статус ${latestInvoice.status}/${latestInvoice.paymentStatus}.`
        : 'Няма намерени фактури в текущия tenant.'
    ].join(' ');
  }

  if (
    normalizedQuestion.includes('разход') ||
    normalizedQuestion.includes('ддс')
  ) {
    const friendVatExpenses = snapshot.expenses.filter(
      (expense) => expense.type === 'friend-vat-expense'
    );

    return `Оперативни разходи: ${snapshot.stats.expensesTotalAmount} лв. ДДС от разходи от приятели: ${snapshot.stats.friendVatTotalAmount} лв. Записите тип "разход от приятели" са ${friendVatExpenses.length} и не увеличават реалния operational expense.`;
  }

  if (
    normalizedQuestion.includes('документ') ||
    normalizedQuestion.includes('изтич')
  ) {
    const expiringDocuments = snapshot.documents.filter(
      (document) =>
        document.expiryDate !== null &&
        document.daysUntilExpiry >= 0 &&
        document.daysUntilExpiry <= EXPIRING_SOON_DAYS
    );

    if (expiringDocuments.length === 0) {
      return 'В момента няма документи със срок до 30 дни в текущия tenant.';
    }

    return `Документи със срок до 30 дни: ${expiringDocuments
      .map(
        (document) =>
          `${document.ownerName} · ${document.name} · ${document.expiryDate}`
      )
      .join('; ')}.`;
  }

  if (
    normalizedQuestion.includes('инструктор') ||
    normalizedQuestion.includes('часов') ||
    normalizedQuestion.includes('практик')
  ) {
    const inactiveStudents = snapshot.students.filter(
      (student) => student.inactiveMoreThan30Days
    );
    const studentsWithHours = snapshot.students
      .filter((student) => student.remainingHours > 0)
      .map(
        (student) =>
          `${student.name}: ${student.remainingHours}/${student.maxHours} часа, инструктор ${student.instructorName ?? 'няма'}`
      )
      .join('; ');

    return [
      `Активни курсисти: ${snapshot.stats.activeStudentsCount}. Практически часове в системата: ${snapshot.stats.practicalLessonsCount}.`,
      studentsWithHours
        ? `Оставащи часове: ${studentsWithHours}.`
        : 'Няма курсисти с оставащи часове.',
      inactiveStudents.length
        ? `Над 30 дни без практика: ${inactiveStudents
            .map((student) => student.name)
            .join(', ')}.`
        : 'Няма курсисти с пауза над 30 дни според текущите данни.'
    ].join(' ');
  }

  if (
    normalizedQuestion.includes('теория') ||
    normalizedQuestion.includes('груп')
  ) {
    if (snapshot.theoryGroups.length === 0) {
      return 'В момента няма намерени теоретични групи в текущия tenant.';
    }

    return `Теоретични групи: ${snapshot.theoryGroups
      .map(
        (group) =>
          `${group.name} (${group.categoryCode}) · инструктор ${group.instructorName} · активни ${group.activeStudents} · за наваксване ${group.studentsNeedingRecovery} · присъствие ${group.averageAttendance}%`
      )
      .join('; ')}.`;
  }

  if (
    normalizedQuestion.includes('автомобил') ||
    normalizedQuestion.includes('автопарк') ||
    normalizedQuestion.includes('кола') ||
    normalizedQuestion.includes('коли') ||
    normalizedQuestion.includes('мпс') ||
    normalizedQuestion.includes('vehicle')
  ) {
    if (snapshot.vehicles.length === 0) {
      return 'В момента няма въведени автомобили в текущия tenant.';
    }

    return [
      `Имаме общо ${snapshot.stats.vehiclesCount} автомобила. От тях ${snapshot.stats.vehiclesNeedingAttentionCount} изискват внимание.`,
      `Списък: ${snapshot.vehicles
        .map(
          (vehicle) =>
            `${vehicle.vehicleLabel} · категория ${vehicle.categoryCode} · статус ${vehicle.status} · инструктор ${vehicle.instructorName} · преглед ${vehicle.nextInspection}`
        )
        .join('; ')}.`
    ].join(' ');
  }

  return `Обобщение за текущия tenant: курсисти ${snapshot.stats.studentsCount}, активни ${snapshot.stats.activeStudentsCount}, плащания ${snapshot.stats.paymentsTotalAmount} лв, оперативни разходи ${snapshot.stats.expensesTotalAmount} лв, фактури ${snapshot.stats.invoicesCount}, документи за преглед до 30 дни ${snapshot.stats.documentsExpiringSoonCount}, теоретични групи ${snapshot.stats.theoryGroupsCount}, практически часове ${snapshot.stats.practicalLessonsCount}.`;
}

function normalizeQuestionText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ');
}

function resolveReportingPeriod(
  normalizedQuestion: string,
  generatedAt: string
) {
  const periodEnd = new Date(generatedAt);

  if (
    normalizedQuestion.includes('последната година') ||
    normalizedQuestion.includes('последна година') ||
    normalizedQuestion.includes('последните 12 месеца') ||
    (normalizedQuestion.includes('последн') &&
      normalizedQuestion.includes('годин'))
  ) {
    const periodStart = new Date(periodEnd);
    periodStart.setFullYear(periodStart.getFullYear() - 1);

    return {
      label: `Последна година (${periodStart.toISOString().slice(0, 10)} - ${periodEnd.toISOString().slice(0, 10)})`,
      periodStart,
      periodEnd
    };
  }

  return {
    label: 'За целия наличен период',
    periodStart: null,
    periodEnd
  };
}

function isDateInReportingPeriod(
  value: string,
  reportingPeriod: {
    periodStart: Date | null;
    periodEnd: Date;
  }
) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  if (!reportingPeriod.periodStart) {
    return true;
  }

  return (
    parsedDate.getTime() >= reportingPeriod.periodStart.getTime() &&
    parsedDate.getTime() <= reportingPeriod.periodEnd.getTime()
  );
}
