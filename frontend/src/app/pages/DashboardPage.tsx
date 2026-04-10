import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Modal,
  PageContent,
  PageHeader,
  Select,
  StatCard,
  Textarea,
} from "../components/shared";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Download,
  FileText,
  MapPin,
  Plus,
  Upload,
  User,
  Users,
} from "lucide-react";
import {
  DashboardQuickActionDialog,
  type DashboardQuickActionFormState,
} from "./dashboard/DashboardQuickActionDialog";
import { FinanceOverviewCard } from "./dashboard/FinanceOverviewCard";
import { dashboardHeader, dashboardSections, dashboardQuickActions, getDashboardIcon } from "./dashboard/dashboardContent";
import {
  type StudentOperationalRecord,
} from "../content/studentOperations";
import type { VehicleRow } from "./secondary/secondaryData";
import { createDocumentRecord } from "../services/documentsApi";
import {
  fetchExpenseRecords,
  type ExpenseRecordView,
} from "../services/expensesApi";
import { fetchInstructorRows } from "../services/instructorsApi";
import {
  createPaymentRecord,
  fetchPaymentRecords,
  type PaymentRecordView,
} from "../services/paymentsApi";
import { createPracticalLessonRecord } from "../services/practicalLessonsApi";
import {
  createStudentRecord,
  fetchStudentOperations,
} from "../services/studentsApi";
import { useAuthSession } from "../services/authSession";
import { useNotificationsState } from "../services/notificationsState";
import { hasFullAccessRole } from "../services/roleUtils";
import { fetchVehicleRows } from "../services/vehiclesApi";

type QuickActionKey = "newStudent" | "newLesson" | "newDocument" | "registerPayment";
type QuickActionDialogMeta = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type LessonItem = {
  time: string;
  student: string;
  instructor: string;
  location: string;
  status: "active" | "upcoming";
  statusLabel: string;
  targetPath: string;
};

type PaymentAlertItem = {
  student: string;
  amount: string;
  daysOverdue: number;
  targetPath: string;
};

type DocumentAlertItem = {
  student: string;
  document: string;
  daysLeft: number;
  targetPath: string;
};

type DashboardMetricItem = {
  label: string;
  value: string;
  trend: string;
  color: string;
  icon: 'calendar' | 'currency' | 'file' | 'users';
};


export function DashboardPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const roleKeys = session?.user.roleKeys ?? [];
  const permissionKeys = session?.user.permissionKeys ?? [];
  const hasInstructorRole =
    roleKeys.includes("instructor") || roleKeys.includes("simulator_instructor");
  const hasWideDashboardAccess =
    hasFullAccessRole(roleKeys) ||
    roleKeys.includes("administration") ||
    roleKeys.includes("accountant");
  const isInstructorDashboard = hasInstructorRole && !hasWideDashboardAccess;
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionKey | null>(null);
  const [students, setStudents] = useState<StudentOperationalRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecordView[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecordView[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [sourceStatus, setSourceStatus] = useState<"loading" | "backend" | "fallback">("loading");
  const [quickActionSubmitError, setQuickActionSubmitError] = useState<
    string | null
  >(null);
  const [isQuickActionSubmitting, setIsQuickActionSubmitting] = useState(false);
  const { notifications, refreshNotifications } = useNotificationsState();

  const loadDashboardData = useCallback(async () => {
    const canReadStudents =
      permissionKeys.includes("students.read") || hasFullAccessRole(roleKeys);
    const canReadPayments =
      permissionKeys.includes("payments.read") || hasFullAccessRole(roleKeys);
    const canManageUsers =
      permissionKeys.includes("users.manage") || hasFullAccessRole(roleKeys);
    const canReadVehicles =
      permissionKeys.includes("vehicles.read") || hasFullAccessRole(roleKeys);

    const [records, paymentRecords, expenseRecords, instructorRows, vehicleRows] =
      await Promise.all([
        canReadStudents ? fetchStudentOperations() : Promise.resolve([]),
        canReadPayments ? fetchPaymentRecords() : Promise.resolve([]),
        canReadPayments ? fetchExpenseRecords() : Promise.resolve([]),
        canManageUsers ? fetchInstructorRows() : Promise.resolve([]),
        canReadVehicles ? fetchVehicleRows() : Promise.resolve([]),
      ]);

    setStudents(records);
    setPayments(paymentRecords);
    setExpenses(expenseRecords);
    setInstructorOptions(
      instructorRows.map((instructor) => ({
        value: instructor.name,
        label: instructor.name,
      })),
    );
    setVehicleOptions(
      vehicleRows.map((vehicle) => ({
        value: vehicle.vehicle,
        label: vehicle.vehicle,
      })),
    );
    setVehicles(vehicleRows);
    setSourceStatus("backend");
  }, [permissionKeys, roleKeys]);

  useEffect(() => {
    let isMounted = true;

    loadDashboardData()
      .then(() => {
        if (!isMounted) return;
      })
      .catch(() => {
        if (!isMounted) return;
        setStudents([]);
        setPayments([]);
        setExpenses([]);
        setVehicles([]);
        setInstructorOptions([]);
        setVehicleOptions([]);
        setSourceStatus("fallback");
      });

    return () => {
      isMounted = false;
    };
  }, [loadDashboardData]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  const quickActionMeta = useMemo<Record<QuickActionKey, QuickActionDialogMeta>>(
    () => ({
      newStudent: {
        title: dashboardQuickActions.newStudent.title,
        description: dashboardQuickActions.newStudent.description,
        confirmLabel: dashboardQuickActions.newStudent.confirmLabel,
        fields: [
          { label: "Име и фамилия", value: "Например: Иван Петров", kind: "input" },
          { label: "Категория", value: "B", kind: "select" },
          { label: "Телефон", value: "0886612503", kind: "input" },
        ],
        onConfirm: () => navigate("/students/new"),
      },
      newLesson: {
        title: dashboardQuickActions.newLesson.title,
        description: dashboardQuickActions.newLesson.description,
        confirmLabel: dashboardQuickActions.newLesson.confirmLabel,
        fields: [
          { label: "Тип час", value: "Практика", kind: "select" },
          { label: "Инструктор", value: "Георги Петров", kind: "input" },
          { label: "Час", value: "Днес, 16:30", kind: "input" },
        ],
        onConfirm: () => navigate("/schedule"),
      },
      newDocument: {
        title: dashboardQuickActions.newDocument.title,
        description: dashboardQuickActions.newDocument.description,
        confirmLabel: dashboardQuickActions.newDocument.confirmLabel,
        fields: [
          { label: "Тип документ", value: "Декларация", kind: "select" },
          { label: "Курсист", value: "Изберете курсист", kind: "input" },
          { label: "Начин", value: "OCR сканиране", kind: "select" },
        ],
        onConfirm: () => navigate("/documents"),
      },
      registerPayment: {
        title: dashboardQuickActions.registerPayment.title,
        description: dashboardQuickActions.registerPayment.description,
        confirmLabel: dashboardQuickActions.registerPayment.confirmLabel,
        fields: [
          { label: "Курсист", value: "Изберете курсист", kind: "input" },
          { label: "Сума", value: "250 €", kind: "input" },
          { label: "Метод", value: "В брой", kind: "select" },
        ],
        onConfirm: () => navigate("/payments"),
      },
    }),
    [navigate],
  );

  const activeDialog = activeQuickAction ? quickActionMeta[activeQuickAction] : null;
  const quickActionStudentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: String(student.id),
        label: student.name,
        category: student.category,
      })),
    [students],
  );
  const dashboardInstructorOptions = useMemo(() => {
    if (!isInstructorDashboard) {
      return instructorOptions;
    }

    const displayName = session?.user.displayName?.trim();

    return displayName
      ? [{ value: displayName, label: displayName }]
      : instructorOptions;
  }, [instructorOptions, isInstructorDashboard, session?.user.displayName]);
  const theoryGroupOptions = useMemo(() => {
    const uniqueGroupNumbers = Array.from(
      new Set(
        students
          .map((student) => student.groupNumber?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    );

    return uniqueGroupNumbers.map((groupNumber) => ({
      value: groupNumber,
      label: groupNumber,
    }));
  }, [students]);
  const currentInactiveAlerts =
    sourceStatus === "backend"
      ? students
          .filter((student) => student.inactivityAlert)
          .map((student) => ({
            studentId: student.id,
            studentName: student.name,
            message: `${student.name} не е карал ${student.daysWithoutPractice} дни. Последен час: ${student.lastPracticeDate}.`,
          }))
      : [];
  const currentEarlyReminders =
    sourceStatus === "backend"
      ? students
          .filter((student) => student.adminReminderDue)
          .map((student) => ({
            studentId: student.id,
            studentName: student.name,
            message: `Ранно записване: ${student.name} трябва да бъде потърсен преди ${student.expectedArrivalDate}.`,
          }))
      : [];

  const operationalAlerts = [
    ...currentInactiveAlerts.map((alert) => ({
      variant: "warning" as const,
      title: `Курсист без практика над 30 дни: ${alert.studentName}`,
      message: alert.message,
      actionLabel: "Отвори досие",
      targetPath: `/students/${alert.studentId}`,
    })),
    ...currentEarlyReminders.map((reminder) => ({
      variant: "warning" as const,
      title: `Ранно записване · напомни на админ за ${reminder.studentName}`,
      message: reminder.message,
      actionLabel: "Отвори досие",
      targetPath: `/students/${reminder.studentId}`,
    })),
    ...notifications
      .filter((notification) => notification.kind === "INSTRUCTOR_DOCUMENT_EXPIRY")
      .map((notification) => ({
        variant:
          notification.severity === "error"
            ? ("error" as const)
            : ("warning" as const),
        title: notification.title,
        message: notification.message,
        actionLabel: "Отвори инструктор",
        targetPath: notification.actionTarget ?? "/instructors",
      })),
  ];
  const instructorVehicleAlerts = useMemo(
    () =>
      vehicles
        .filter(
          (vehicle) =>
            vehicle.status !== "success" ||
            (vehicle.issue && vehicle.issue !== "Няма активни проблеми"),
        )
        .map((vehicle) => ({
          variant:
            vehicle.status === "error"
              ? ("error" as const)
              : ("warning" as const),
          title: `Автомобил: ${vehicle.vehicle}`,
          message:
            vehicle.issue && vehicle.issue !== "Няма активни проблеми"
              ? vehicle.issue
              : `Провери състоянието на автомобила и следващия технически преглед: ${vehicle.nextInspection}.`,
          actionLabel: "Отвори автомобили",
          targetPath: "/vehicles",
        })),
    [vehicles],
  );
  const instructorDashboardAlerts = [
    ...operationalAlerts,
    ...instructorVehicleAlerts,
  ];
  const dashboardStudentLessons: LessonItem[] =
    students.length > 0
      ? students.slice(0, 3).map((student) => ({
          time: (student.nextLesson ?? '').replace('Днес · ', '') || '09:00',
          student: student.name,
          instructor: student.instructor || 'Няма зададен инструктор',
          location: 'Централна зона',
          status: 'upcoming',
          statusLabel: 'Предстоящ',
          targetPath: `/students/${student.id}`,
        }))
      : [];
  const dashboardStudentPayments: PaymentAlertItem[] =
    payments.length > 0
      ? payments.slice(0, 5).map((payment) => ({
          student: payment.student,
          amount: `${payment.remainingAmount} €`,
          daysOverdue: payment.paymentStatus === 'overdue' ? 1 : 0,
          targetPath: `/students/${payment.studentId}`,
        }))
      : [];
  const dashboardStudentDocuments: DocumentAlertItem[] =
    students.length > 0
      ? students.slice(0, 3).map((student) => ({
          student: student.name,
          document: 'Лична карта',
          daysLeft: 365,
          targetPath: `/students/${student.id}`,
        }))
      : [];

  const dashboardLiveStats = useMemo<DashboardMetricItem[]>(
    () => [
      {
        label: 'Активни курсисти',
        value: String(students.length),
        trend:
          sourceStatus === 'backend'
            ? 'Заредено от PostgreSQL'
            : 'Fallback тестови данни',
        color: 'var(--primary-accent)',
        icon: 'users',
      },
      {
        label: 'Платени суми',
        value: `${payments
          .reduce((sum, payment) => sum + payment.paidAmount, 0)
          .toLocaleString('bg-BG')} €`,
        trend: `${payments.length} плащания`,
        color: 'var(--status-success)',
        icon: 'currency',
      },
      {
        label: 'Оставащи суми',
        value: `${payments
          .reduce((sum, payment) => sum + payment.remainingAmount, 0)
          .toLocaleString('bg-BG')} €`,
        trend: 'Дължими суми по активни досиета',
        color: 'var(--status-warning)',
        icon: 'currency',
      },
      {
        label: 'Сигнали 30+ дни / ранно записване',
        value: String(currentInactiveAlerts.length + currentEarlyReminders.length),
        trend: 'Оперативни известия от курсистите',
        color: 'var(--status-error)',
        icon: 'calendar',
      },
    ],
    [students, payments, sourceStatus, currentInactiveAlerts.length, currentEarlyReminders.length],
  );

  if (isInstructorDashboard) {
    return (
      <PageContent className="space-y-6 pb-8">
        <PageHeader
          title="Моето табло"
          subtitle={`Известия за твоите курсисти и автомобили • ${
            sourceStatus === "backend"
              ? "Данни от PostgreSQL"
              : sourceStatus === "fallback"
                ? "Fallback към локални тестови данни"
                : "Зареждане..."
          }`}
          actions={
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => setActiveQuickAction("newLesson")}
            >
              Запиши час
            </Button>
          }
        />

        <div className="space-y-3">
          {instructorDashboardAlerts.length ? (
            instructorDashboardAlerts.map((item) => (
              <Alert
                key={`${item.title}-${item.targetPath}`}
                variant={item.variant as "warning" | "error"}
                title={item.title}
                message={item.message}
                action={{
                  label: item.actionLabel,
                  onClick: () => navigate(item.targetPath),
                }}
              />
            ))
          ) : (
            <Card>
              <CardHeader
                title="Няма нови известия"
                subtitle="В момента няма сигнали за твоите курсисти или автомобили."
              />
            </Card>
          )}
        </div>

        <DashboardQuickActionDialog
          activeAction={activeQuickAction}
          studentOptions={quickActionStudentOptions}
          instructorOptions={dashboardInstructorOptions}
          vehicleOptions={vehicleOptions}
          theoryGroupOptions={theoryGroupOptions}
          isSubmitting={isQuickActionSubmitting}
          submitError={quickActionSubmitError}
          onClose={() => setActiveQuickAction(null)}
          onConfirm={(action, formState) =>
            handleConfirmQuickAction(
              action,
              formState,
              students,
              session?.csrfToken,
              loadDashboardData,
              setQuickActionSubmitError,
              setIsQuickActionSubmitting,
              setActiveQuickAction,
            )
          }
        />
      </PageContent>
    );
  }

  return (
    <PageContent className="space-y-6 pb-8">
      <PageHeader
        title={dashboardHeader.title}
        subtitle={`${dashboardHeader.subtitle} • ${
          sourceStatus === "backend"
            ? "Данни от PostgreSQL"
            : sourceStatus === "fallback"
              ? "Fallback към локални тестови данни"
              : "Зареждане..."
        }`}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() =>
                exportDashboardCsv(
                  dashboardLiveStats,
                  dashboardStudentLessons,
                  dashboardStudentPayments,
                  dashboardStudentDocuments,
                )
              }
            >
              {dashboardHeader.actions.export}
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setActiveQuickAction("newLesson")}>
              {dashboardHeader.actions.newLesson}
            </Button>
          </>
        }
      />

      <div className="space-y-3">
        {operationalAlerts.map((item) => (
          <Alert
            key={item.title}
            variant={item.variant as "warning" | "error"}
            title={item.title}
            message={item.message}
            action={{ label: item.actionLabel, onClick: () => navigate(item.targetPath) }}
          />
        ))}
      </div>

      <FinanceOverviewCard payments={payments} expenses={expenses} />




      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardLiveStats.map((item) => {
          const Icon = getDashboardIcon(item.icon as "calendar" | "currency" | "file" | "plus" | "users");
          return <StatCard key={item.label} icon={<Icon size={20} />} label={item.label} value={item.value} trend={item.trend} color={item.color} />;
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={dashboardSections.schedule.title}
            subtitle={dashboardSections.schedule.subtitle}
            action={<Button variant="ghost" size="sm" onClick={() => navigate("/schedule")}>{dashboardSections.schedule.actionLabel}</Button>}
          />
          <div className="space-y-3">
            {dashboardStudentLessons.map((lesson) => (
              <LessonRow key={`${lesson.time}-${lesson.student}`} lesson={lesson} onClick={() => navigate(lesson.targetPath)} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={dashboardSections.documents.title}
            subtitle={dashboardSections.documents.subtitle}
            action={<Button variant="ghost" size="sm" onClick={() => navigate("/documents")}>{dashboardSections.documents.actionLabel}</Button>}
          />
          <div className="space-y-3">
            {dashboardStudentDocuments.map((item) => (
              <DocumentAlertRow key={`${item.student}-${item.document}`} item={item} onClick={() => navigate(item.targetPath)} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={dashboardSections.payments.title} subtitle={dashboardSections.payments.subtitle} />
          <div className="space-y-3">
            {dashboardStudentPayments.map((item) => (
              <PaymentAlertRow key={`${item.student}-${item.amount}`} item={item} onClick={() => navigate(item.targetPath)} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={dashboardSections.quickActions.title} subtitle={dashboardSections.quickActions.subtitle} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickActionButton icon={<Plus size={20} />} label={dashboardQuickActions.newStudent.buttonLabel} onClick={() => setActiveQuickAction("newStudent")} />
            <QuickActionButton icon={<Calendar size={20} />} label={dashboardQuickActions.newLesson.buttonLabel} onClick={() => setActiveQuickAction("newLesson")} />
            <QuickActionButton icon={<FileText size={20} />} label={dashboardQuickActions.newDocument.buttonLabel} onClick={() => setActiveQuickAction("newDocument")} />
            <QuickActionButton icon={<DollarSign size={20} />} label={dashboardQuickActions.registerPayment.buttonLabel} onClick={() => setActiveQuickAction("registerPayment")} />
          </div>
        </Card>
      </div>

      <DashboardQuickActionDialog
        activeAction={activeQuickAction}
        studentOptions={quickActionStudentOptions}
        instructorOptions={dashboardInstructorOptions}
        vehicleOptions={vehicleOptions}
        theoryGroupOptions={theoryGroupOptions}
        isSubmitting={isQuickActionSubmitting}
        submitError={quickActionSubmitError}
        onClose={() => setActiveQuickAction(null)}
        onConfirm={(action, formState) =>
          handleConfirmQuickAction(
            action,
            formState,
            students,
            session?.csrfToken,
            loadDashboardData,
            setQuickActionSubmitError,
            setIsQuickActionSubmitting,
            setActiveQuickAction,
          )
        }
      />
    </PageContent>
  );
}

async function handleConfirmQuickAction(
  action: QuickActionKey,
  formState: DashboardQuickActionFormState,
  students: StudentOperationalRecord[],
  csrfToken: string | undefined,
  reloadDashboardData: () => Promise<void>,
  setQuickActionSubmitError: (value: string | null) => void,
  setIsQuickActionSubmitting: (value: boolean) => void,
  setActiveQuickAction: (value: QuickActionKey | null) => void,
) {
  if (!csrfToken) {
    setQuickActionSubmitError("Липсва активна сесия за запис.");
    return;
  }

  setIsQuickActionSubmitting(true);
  setQuickActionSubmitError(null);

  try {
    if (action === "newStudent") {
      const [firstName = "", ...lastNameParts] = formState.fullName.trim().split(/\s+/);
      const lastName = lastNameParts.join(" ").trim() || "Тест";

      if (!firstName || !formState.phone.trim() || !formState.category.trim()) {
        throw new Error("Попълни име, телефон и категория.");
      }

      await createStudentRecord(
        {
          firstName,
          lastName,
          phone: formState.phone.trim(),
          email: formState.email.trim() || null,
          nationalId: null,
          birthDate: null,
          address: null,
          educationLevel: null,
          parentName: null,
          parentPhone: formState.parentPhone.trim() || null,
          parentEmail: null,
          parentContactStatus: formState.parentPhone.trim()
            ? "ENABLED"
            : "DISABLED",
          status: "ACTIVE",
          enrollment: {
            categoryCode: formState.category.trim(),
            status: "ACTIVE",
            trainingMode: "STANDARD_PACKAGE",
            registerMode: "ELECTRONIC",
            theoryGroupNumber: formState.theoryGroup.trim() || null,
            assignedInstructorName: formState.instructor.trim() || null,
            enrollmentDate: new Date().toISOString().slice(0, 10),
            expectedArrivalDate: null,
            previousLicenseCategory: null,
            packageHours: 30,
            additionalHours: 0,
            completedHours: 0,
            failedExamAttempts: 0,
            lastPracticeAt: null,
            notes: formState.notes.trim() || null,
          },
        },
        csrfToken,
      );
    }

    if (action === "newLesson") {
      const selectedStudent = formState.student.trim();
      const selectedInstructor = formState.instructor.trim();
      const selectedVehicle = formState.vehicle.trim();
      const studentRecord = students.find(
        (student) => String(student.id) === selectedStudent,
      );

      if (
        !selectedStudent ||
        !selectedInstructor ||
        !selectedVehicle ||
        !formState.lessonDate ||
        !formState.lessonTime
      ) {
        throw new Error(
          "Избери курсист, инструктор, автомобил, дата и час.",
        );
      }

      const durationMinutes = Number.parseInt(
        formState.duration === "custom"
          ? formState.customDurationMinutes || "0"
          : formState.duration || "90",
        10,
      );
      const startTimeLabel = formState.lessonTime;

      if (Number.isNaN(durationMinutes) || durationMinutes <= 0) {
        throw new Error("Въведи валидна продължителност в минути.");
      }

      await createPracticalLessonRecord(
        {
          studentId: selectedStudent,
          studentName: studentRecord?.name ?? "Курсист",
          instructorName: selectedInstructor,
          vehicleLabel: selectedVehicle,
          categoryCode: formState.category.trim() || "B",
          lessonDate: formState.lessonDate,
          startTimeLabel,
          endTimeLabel: calculateQuickActionEndTime(
            startTimeLabel,
            durationMinutes,
          ),
          durationMinutes,
          status: "SCHEDULED",
          paymentStatus: "PENDING",
          evaluationStatus: "PENDING",
          routeLabel:
            formState.lessonType === "theory"
              ? "Теоретичен модул"
              : formState.lessonType === "exam-prep"
                ? "Подготовка за изпит"
                : "Практически час",
          notes: formState.notes.trim() || null,
        },
        csrfToken,
      );
    }

    if (action === "newDocument") {
      const studentRecord = students.find(
        (student) => String(student.id) === formState.student.trim(),
      );

      if (!formState.student.trim() || !formState.documentType.trim()) {
        throw new Error("Избери курсист и тип документ.");
      }

      await createDocumentRecord(
        {
          studentId: formState.student.trim(),
          name: mapQuickActionDocumentType(formState.documentType),
          ownerType: "STUDENT",
          ownerName: studentRecord?.name ?? "Курсист",
          ownerRef: formState.student.trim(),
          category: "Курсист",
          documentNo: formState.documentNumber.trim() || null,
          issueDate:
            formState.issueDate || new Date().toISOString().slice(0, 10),
          expiryDate: formState.expiryDate || null,
          status: "VALID",
          fileUrl: formState.uploadedFileName
            ? `mindonroad-local-upload://${formState.uploadedFileName}`
            : null,
          notes: formState.notes.trim() || null,
        },
        csrfToken,
      );
    }

    if (action === "registerPayment") {
      const amount = Number.parseFloat(formState.amount || "0");

      if (
        !formState.student.trim() ||
        Number.isNaN(amount) ||
        amount <= 0 ||
        !formState.paymentDate
      ) {
        throw new Error("Избери курсист, валидна сума и дата на плащане.");
      }

      await createPaymentRecord(
        {
          studentId: formState.student.trim(),
          paymentNumber:
            formState.reference.trim() ||
            `PAY-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}`,
          amount: Math.round(amount),
          method: mapQuickActionPaymentMethod(formState.paymentMethod),
          status: "PAID",
          paidAt: formState.paymentDate,
          note: formState.paymentNote.trim() || "Бързо плащане от табло",
        },
        csrfToken,
      );
    }

    await reloadDashboardData();
    setActiveQuickAction(null);
  } catch (error) {
    setQuickActionSubmitError(
      error instanceof Error
        ? error.message
        : "Неуспешен запис от бързото действие.",
    );
  } finally {
    setIsQuickActionSubmitting(false);
  }
}

function calculateQuickActionEndTime(startTime: string, durationMinutes: number) {
  const [hours = 0, minutes = 0] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  startDate.setMinutes(startDate.getMinutes() + durationMinutes);

  return `${String(startDate.getHours()).padStart(2, "0")}:${String(
    startDate.getMinutes(),
  ).padStart(2, "0")}`;
}

function mapQuickActionDocumentType(documentType: string) {
  const labels: Record<string, string> = {
    medical: "Медицинско свидетелство",
    declaration: "Декларация",
    contract: "Договор",
    receipt: "Квитанция",
  };

  return labels[documentType] ?? "Документ";
}

function mapQuickActionPaymentMethod(paymentMethod: string) {
  const labels: Record<string, string> = {
    cash: "В брой",
    bank: "Банков превод",
    pos: "POS терминал",
  };

  return labels[paymentMethod] ?? "В брой";
}

function exportDashboardCsv(
  stats: DashboardMetricItem[],
  lessons: LessonItem[],
  payments: PaymentAlertItem[],
  documents: DocumentAlertItem[],
) {
  const csvRows = [
    'section,label,value,extra',
    ...stats.map((item) =>
      ['kpi', item.label, item.value, item.trend]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
    ...lessons.map((item) =>
      ['schedule', item.student, item.time, item.instructor]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
    ...payments.map((item) =>
      ['payments', item.student, item.amount, `${item.daysOverdue} дни просрочие`]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
    ...documents.map((item) =>
      ['documents', item.student, item.document, `${item.daysLeft} дни`]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'dashboard_export.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
}

function LessonRow({ lesson, onClick }: { lesson: LessonItem; onClick: () => void }) {
  const badgeVariant = lesson.status === "active" ? "warning" : "info";

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg p-4 text-left transition-all hover:opacity-80"
      style={{
        background: lesson.status === "active" ? "rgba(99, 102, 241, 0.08)" : "var(--bg-panel)",
        border: lesson.status === "active" ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid transparent",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-[60px]">
          <div className="text-lg font-semibold" style={{ color: lesson.status === "active" ? "var(--primary-accent)" : "var(--text-secondary)" }}>
            {lesson.time}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="truncate font-semibold" style={{ color: "var(--text-primary)" }}>
              {lesson.student}
            </p>
            <Badge variant={badgeVariant} size="sm">
              {lesson.statusLabel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="flex items-center gap-1.5"><User size={14} />{lesson.instructor}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} />{lesson.location}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function PaymentAlertRow({ item, onClick }: { item: PaymentAlertItem; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-lg p-3 text-left transition-all hover:opacity-80" style={{ background: "var(--bg-panel)" }}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.student}</p>
        <Badge variant="error" size="sm">{item.daysOverdue} дни</Badge>
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--status-warning)" }}>{item.amount}</p>
    </button>
  );
}

function DocumentAlertRow({ item, onClick }: { item: DocumentAlertItem; onClick: () => void }) {
  const badgeVariant = item.daysLeft === 0 ? "error" : item.daysLeft <= 3 ? "warning" : "info";
  const statusText = item.daysLeft === 0 ? "Изтича днес" : `${item.daysLeft} дни`;

  return (
    <button onClick={onClick} className="w-full rounded-lg p-3 text-left transition-all hover:opacity-80" style={{ background: "var(--bg-panel)" }}>
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.student}</p>
        <Badge variant={badgeVariant} size="sm">{statusText}</Badge>
      </div>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.document}</p>
    </button>
  );
}

function QuickActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-4 text-left transition-all hover:opacity-80"
      style={{ background: "var(--bg-panel)", border: "1px solid var(--ghost-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))", color: "#ffffff" }}
        >
          {icon}
        </div>
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
      </div>
    </button>
  );
}
