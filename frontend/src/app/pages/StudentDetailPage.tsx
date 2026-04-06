import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { PageHeader } from "../components/ui-system/PageHeader";
import { Button } from "../components/ui-system/Button";
import { StatusBadge } from "../components/ui-system/StatusBadge";
import { DataTable } from "../components/ui-system/DataTable";
import {
  Edit,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  BookOpen,
  Car,
  DollarSign,
  FileText,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  MessageSquare,
  Image as ImageIcon,
  Plus,
  Send,
  BrainCircuit,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  determinatorSessions,
  type StudentOperationalRecord,
} from "../content/studentOperations";
import { useAuthSession } from "../services/authSession";
import {
  deleteStudentRecord,
  fetchStudentOperationalDetail,
} from "../services/studentsApi";

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const routeStudentId = id ?? "";
  const [studentRecord, setStudentRecord] =
    useState<StudentOperationalRecord | null>(null);
  const [studentSourceStatus, setStudentSourceStatus] = useState<
    "loading" | "backend" | "invalid" | "fallback"
  >("loading");
  const [activeTab, setActiveTab] = useState("overview");
  const [parentReportStatus, setParentReportStatus] = useState(
    "Няма изпратен отчет",
  );
  const canDeleteStudent = Boolean(
    session?.user.roleKeys.includes("owner") ||
      session?.user.roleKeys.includes("admin"),
  );

  useEffect(() => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      routeStudentId,
    )) {
      setStudentRecord(null);
      setParentReportStatus("Няма изпратен отчет");
      setStudentSourceStatus("invalid");
      return;
    }

    let isMounted = true;
    setStudentSourceStatus("loading");

    fetchStudentOperationalDetail(routeStudentId)
      .then((record) => {
        if (!isMounted) {
          return;
        }

        setStudentRecord(record);
        setParentReportStatus(record.latestParentFeedbackStatus);
        setStudentSourceStatus("backend");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setStudentRecord(null);
        setParentReportStatus("Няма изпратен отчет");
        setStudentSourceStatus("fallback");
      });

    return () => {
      isMounted = false;
    };
  }, [routeStudentId]);

  if (!studentRecord) {
    const isLoading = studentSourceStatus === "loading";

    return (
      <div>
        <PageHeader
          title={isLoading ? "Зареждане на курсист" : "Курсистът не е намерен"}
          description={
            isLoading
              ? "Зареждане на профила от PostgreSQL."
              : "Отвори курсиста от обновения списък, за да използваш реален backend UUID запис."
          }
          breadcrumbs={[
            { label: "Начало", onClick: () => navigate("/") },
            { label: "Курсисти", onClick: () => navigate("/students") },
            { label: isLoading ? "Зареждане" : "Невалиден запис" },
          ]}
        />

        <div className="p-6 lg:p-8">
          <div
            className="rounded-3xl p-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--ghost-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <TriangleAlert
                size={22}
                style={{ color: "var(--status-warning)" }}
              />
              <p style={{ color: "var(--text-secondary)" }}>
                {isLoading
                  ? "Моля, изчакай..."
                  : studentSourceStatus === "fallback"
                    ? "Неуспешно зареждане на курсиста от базата."
                    : "Невалиден стар локален идентификатор."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data - in real app, fetch based on id
  const student = {
    id: studentRecord.id,
    name: studentRecord.name,
    email: studentRecord.email,
    phone: studentRecord.phone,
    address: studentRecord.address ?? "гр. София, ул. Витоша 15, ап. 7",
    birthDate: studentRecord.birthDate ?? "15.05.1995",
    idNumber: studentRecord.nationalId,
    educationLevel: studentRecord.educationLevel,
    category: studentRecord.category,
    instructor: studentRecord.instructor,
    instructorPhone: "+359 888 111 222",
    groupNumber: studentRecord.groupNumber || "Индивидуална",
    theoryGroup: "Група 3 - Понеделник и Сряда 18:00",
    startDate: studentRecord.trainingStartDate || studentRecord.startDate,
    theoryCompletedAt: studentRecord.theoryCompletedAt || "Няма",
    theoryExamAt: studentRecord.theoryExamAt || "Няма",
    practicalCompletedAt: studentRecord.practicalCompletedAt || "Няма",
    practicalExamAt: studentRecord.practicalExamAt || "Няма",
    extraHours: studentRecord.extraHours,
    paidLessons: studentRecord.maxTrainingHours,
    usedLessons: studentRecord.used,
    remainingLessons: studentRecord.remaining,
    progress: studentRecord.progress,
    status: studentRecord.status,
    statusLabel: studentRecord.statusLabel,
    courseOutcome:
      studentRecord.courseOutcome === "withdrawn" ? "Прекратен" : studentRecord.examOutcomeLabel,
    recordMode:
      studentRecord.trainingMode === "licensed-manual-hours"
        ? "Курсист с книжка · ръчно добавяне на часове"
        : studentRecord.recordMode === "paper"
          ? "Хартиен регистър"
          : "Електронен регистър",
    insuranceStatus: studentRecord.insuranceStatus === "active" ? "Активна" : "Очаква се",
    protocolNumber: "Няма",
    protocolDate: "Няма",
    certificateIssueDate: "Няма",
    theoryCompleted: studentRecord.theoryCompleted,
    theoryAttendance: 0,
    theoryTotal: 0,
    parentName: studentRecord.parentName || "Няма въведен родител",
    parentPhone: studentRecord.parentPhone || "Няма въведен телефон",
    parentEmail: studentRecord.parentEmail || "Няма въведен email",
    studentTypeLabel: studentRecord.studentTypeLabel,
    hoursEntryPolicy: studentRecord.hoursEntryPolicy,
    hasPreviousLicense: studentRecord.hasPreviousLicense,
    previousLicenseCategory: studentRecord.previousLicenseCategory,
    failedExamAttempts: studentRecord.failedExamAttempts,
    lastPracticeDate: studentRecord.lastPracticeDate,
    daysWithoutPractice: studentRecord.daysWithoutPractice,
    inactivityAlert: studentRecord.inactivityAlert,
    earlyEnrollment: studentRecord.earlyEnrollment,
    expectedArrivalDate: studentRecord.expectedArrivalDate,
    adminReminderDue: studentRecord.adminReminderDue,
    parentFeedbackEnabled: studentRecord.parentFeedbackEnabled,
  };

  const payments: Array<{
    id: number;
    date: string;
    type: string;
    amount: string;
    method: string;
    status: string;
    statusLabel: string;
    invoiceNumber: string;
  }> = [];

  const lessons: Array<{
    id: number;
    date: string;
    time: string;
    type: string;
    duration: string;
    instructor: string;
    vehicle: string;
    route: string;
    status: string;
    statusLabel: string;
    rating: number;
    notes: string;
  }> = [];

  const documents: Array<{
    id: number;
    name: string;
    type: string;
    issueDate: string;
    expiryDate: string;
    status: string;
    statusLabel: string;
    daysLeft: number;
  }> = [];

  const notes: Array<{
    id: number;
    date: string;
    author: string;
    type: string;
    content: string;
    important: boolean;
  }> = [];

  const notifications = [
    ...(student.inactivityAlert
      ? [
          {
            id: 100,
            type: "practice",
            title: "Над 30 дни без практика",
            message: `Последен час: ${student.lastPracticeDate}. Нужно е админът или инструкторът да се свърже с курсиста.`,
            date: "03.04.2026",
            status: "warning",
          },
        ]
      : []),
    ...(student.adminReminderDue
      ? [
          {
            id: 101,
            type: "admin",
            title: "Напомняне за ранно записване",
            message: `Курсистът трябва да бъде потърсен 10 дни преди датата на идване: ${student.expectedArrivalDate}.`,
            date: "03.04.2026",
            status: "info",
          },
        ]
      : []),
  ];

  const tabs = [
    { id: "overview", label: "Преглед" },
    { id: "lessons", label: "Практика" },
    { id: "determinator", label: "Детерминатор" },
    { id: "payments", label: "Плащания" },
    { id: "documents", label: "Документи" },
    { id: "notes", label: "Бележки" },
    { id: "notifications", label: "Известия" },
  ];

  const studentDeterminatorSessions = determinatorSessions.filter(
    (session) => session.studentId === student.id,
  );

  const handleSendParentFeedback = () => {
    if (!student.parentFeedbackEnabled) {
      setParentReportStatus(
        "Не може да се изпрати: липсва разрешен родителски контакт.",
      );
      return;
    }

    setParentReportStatus(
      `Изпратен отчет към родител: ${new Date().toLocaleString("bg-BG")} · Последен урок и детерминатор бележки.`,
    );
  };

  const handleDeleteStudent = async () => {
    if (!student || !canDeleteStudent) {
      return;
    }

    const shouldDelete = globalThis.confirm(
      `Сигурен ли си, че искаш да изтриеш курсиста ${student.name}? Това ще премахне и свързаните му записи.`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteStudentRecord(student.id, session?.csrfToken ?? "");
      navigate("/students");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Курсистът не можа да бъде изтрит.";
      globalThis.alert(message);
    }
  };

  return (
    <div>
      <PageHeader
        title={student.name}
        description={`Категория ${student.category} • ${student.instructor} • ${
          studentSourceStatus === "backend"
            ? "Данни от PostgreSQL"
            : studentSourceStatus === "fallback"
              ? "Fallback към локални данни"
              : "Локални mock данни"
        }`}
        breadcrumbs={[
          { label: "Начало", onClick: () => navigate("/") },
          { label: "Курсисти", onClick: () => navigate("/students") },
          { label: student.name },
        ]}
        actions={
          <>
            <Button variant="secondary" icon={<Phone size={18} />}>
              Обади се
            </Button>
            <Button variant="secondary" icon={<MessageSquare size={18} />}>
              Съобщение
            </Button>
            <Button
              variant="primary"
              icon={<Edit size={18} />}
              onClick={() => navigate(`/students/${id}/edit`)}
            >
              Редактирай
            </Button>
            {canDeleteStudent && (
              <Button
                variant="destructive"
                icon={<TriangleAlert size={18} />}
                onClick={() => void handleDeleteStudent()}
              >
                Изтрий
              </Button>
            )}
          </>
        }
      />

      {/* Student Header Card */}
      <div className="p-6 lg:p-8">
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center font-semibold text-3xl flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                color: "#ffffff",
              }}
            >
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            {/* Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact */}
              <div>
                <h4
                  className="text-sm mb-3"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Контакт
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone
                      size={14}
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {student.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} style={{ color: "var(--text-tertiary)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {student.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin
                      size={14}
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {student.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Training Info */}
              <div>
                <h4
                  className="text-sm mb-3"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Обучение
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Car size={14} style={{ color: "var(--text-tertiary)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>
                      Категория {student.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} style={{ color: "var(--text-tertiary)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {student.instructor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar
                      size={14}
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      Начало: {student.startDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText
                      size={14}
                      style={{ color: "var(--text-tertiary)" }}
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      Група: {student.groupNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4
                  className="text-sm mb-3"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Статус
                </h4>
                <StatusBadge status={student.status as any} size="medium">
                  {student.statusLabel}
                </StatusBadge>
                <div className="mt-3">
                  <div
                    className="text-sm space-y-1 mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <p>Изход: {student.courseOutcome}</p>
                    <p>Регистър: {student.recordMode}</p>
                    <p>Застраховка: {student.insuranceStatus}</p>
                    <p>Тип курсист: {student.studentTypeLabel}</p>
                    {student.hasPreviousLicense && (
                      <p>Предходна книжка: {student.previousLicenseCategory}</p>
                    )}
                    {student.failedExamAttempts > 0 && (
                      <p style={{ color: "var(--status-error)" }}>
                        Скъсан: {student.failedExamAttempts} път(и) · назначени{" "}
                        {student.extraHours} доп. часа
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Напредък
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {student.progress}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-panel)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${student.progress}%`,
                        background:
                          "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(student.inactivityAlert || student.adminReminderDue) && (
          <div
            className="mb-6 rounded-xl p-4 flex items-start gap-3"
            style={{
              background: student.inactivityAlert
                ? "var(--status-warning-bg)"
                : "rgba(99, 102, 241, 0.08)",
              border: student.inactivityAlert
                ? "1px solid var(--status-warning-border)"
                : "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            <TriangleAlert
              size={20}
              style={{
                color: student.inactivityAlert
                  ? "var(--status-warning)"
                  : "var(--primary-accent)",
              }}
            />
            <div className="space-y-1">
              {student.inactivityAlert && (
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--status-warning)" }}
                >
                  Курсистът не е карал {student.daysWithoutPractice} дни.
                  Последен практически час: {student.lastPracticeDate}.
                </p>
              )}
              {student.adminReminderDue && (
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ранно записване: изпрати напомняне към админ 10 дни преди{" "}
                  {student.expectedArrivalDate}.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
                style={{
                  background:
                    activeTab === tab.id ? "var(--bg-card)" : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lessons Overview */}
            <div
              className="rounded-xl"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <h3 style={{ color: "var(--text-primary)" }}>Часове</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <LessonStat
                    label="Платени"
                    value={student.paidLessons}
                    icon={
                      <DollarSign
                        size={18}
                        style={{ color: "var(--status-success)" }}
                      />
                    }
                  />
                  <LessonStat
                    label="Проведени"
                    value={student.usedLessons}
                    icon={
                      <CheckCircle
                        size={18}
                        style={{ color: "var(--primary-accent)" }}
                      />
                    }
                  />
                  <LessonStat
                    label="Остават"
                    value={student.remainingLessons}
                    icon={
                      <Clock
                        size={18}
                        style={{ color: "var(--text-secondary)" }}
                      />
                    }
                  />
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-panel)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Използвани часове
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {student.usedLessons} / {student.paidLessons}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${student.paidLessons > 0 ? (student.usedLessons / student.paidLessons) * 100 : 0}%`,
                        background:
                          "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Theory Overview */}
            <div
              className="rounded-xl"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <h3 style={{ color: "var(--text-primary)" }}>Теория</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen
                      size={18}
                      style={{ color: "var(--primary-accent)" }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {student.theoryGroup}
                    </span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Присъствие: {student.theoryAttendance} /{" "}
                    {student.theoryTotal} занятия
                  </p>
                </div>

                <div
                  className="p-4 rounded-lg mb-4"
                  style={{ background: "var(--bg-panel)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Посетени занятия
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {student.theoryAttendance} / {student.theoryTotal}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(student.theoryAttendance / student.theoryTotal) * 100}%`,
                        background:
                          "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                      }}
                    />
                  </div>
                </div>

                {student.theoryCompleted ? (
                  <div
                    className="p-4 rounded-lg flex items-center gap-3"
                    style={{
                      background: "var(--status-success-bg)",
                      border: "1px solid var(--status-success-border)",
                    }}
                  >
                    <CheckCircle
                      size={20}
                      style={{ color: "var(--status-success)" }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: "var(--status-success)" }}
                    >
                      Теория завършена
                    </span>
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-lg flex items-center gap-3"
                    style={{
                      background: "var(--status-warning-bg)",
                      border: "1px solid var(--status-warning-border)",
                    }}
                  >
                    <Clock
                      size={20}
                      style={{ color: "var(--status-warning)" }}
                    />
                    <span
                      className="font-medium"
                      style={{ color: "var(--status-warning)" }}
                    >
                      Теория в процес
                    </span>
                  </div>
                )}

                <div
                  className="mt-4 p-4 rounded-lg space-y-2"
                  style={{ background: "var(--bg-panel)" }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Регистрови етапи
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Теория завършена: {student.theoryCompletedAt}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Теория изпит: {student.theoryExamAt}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Практика завършена: {student.practicalCompletedAt}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Практика изпит: {student.practicalExamAt}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Допълнителни часове: {student.extraHours}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Правило за часове: {student.hoursEntryPolicy}
                  </p>
                </div>
              </div>
            </div>

            {/* Parent Contact */}
            <div
              className="rounded-xl"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <h3 style={{ color: "var(--text-primary)" }}>
                  Родител / Настойник
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <InfoRow
                  icon={<User size={16} />}
                  label="Име"
                  value={student.parentName}
                />
                <InfoRow
                  icon={<Phone size={16} />}
                  label="Телефон"
                  value={student.parentPhone}
                />
                <InfoRow
                  icon={<Mail size={16} />}
                  label="Email"
                  value={student.parentEmail}
                />
                <div
                  className="rounded-lg p-4 space-y-3"
                  style={{ background: "var(--bg-panel)" }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {parentReportStatus}
                  </p>
                  <Button
                    variant="secondary"
                    icon={<Send size={16} />}
                    onClick={handleSendParentFeedback}
                  >
                    Изпрати отчет към родител
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <h3 style={{ color: "var(--text-primary)" }}>
                  Регистър и сертификати
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <InfoRow label="ЕГН" value={student.idNumber} icon={<FileText size={16} />} />
                <InfoRow label="Образование" value={student.educationLevel} icon={<BookOpen size={16} />} />
                <InfoRow label="Протокол" value={`${student.protocolNumber} / ${student.protocolDate}`} icon={<FileText size={16} />} />
                <InfoRow label="Удостоверение" value={student.certificateIssueDate} icon={<CheckCircle size={16} />} />
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="rounded-xl"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <h3 style={{ color: "var(--text-primary)" }}>
                  Последна активност
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {lessons.length === 0 ? (
                  <EmptyDetailState message="Все още няма проведени практически часове." />
                ) : (
                  lessons.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-3 rounded-lg"
                      style={{ background: "var(--bg-panel)" }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {lesson.type}
                        </p>
                        <StatusBadge status={lesson.status as any} size="small">
                          {lesson.statusLabel}
                        </StatusBadge>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {lesson.date} • {lesson.time}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "lessons" && (
          <div className="rounded-xl" style={{ background: "var(--bg-card)" }}>
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--ghost-border)" }}
            >
              <div className="flex items-center justify-between">
                <h3 style={{ color: "var(--text-primary)" }}>
                  История на практиката
                </h3>
                <Button variant="secondary" icon={<Download size={18} />}>
                  Експорт
                </Button>
              </div>
            </div>
            <div className="p-6">
              <DataTable
                columns={[
                  {
                    key: "date",
                    label: "Дата",
                    render: (value: string, row: any) => (
                      <div>
                        <div style={{ color: "var(--text-primary)" }}>
                          {value}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {row.time}
                        </div>
                      </div>
                    ),
                  },
                  { key: "type", label: "Тип" },
                  { key: "instructor", label: "Инструктор" },
                  { key: "vehicle", label: "Автомобил" },
                  {
                    key: "status",
                    label: "Статус",
                    render: (value: string, row: any) => (
                      <StatusBadge status={value as any} size="small">
                        {row.statusLabel}
                      </StatusBadge>
                    ),
                  },
                  {
                    key: "notes",
                    label: "Бележки",
                    render: (value: string) => (
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {value}
                      </span>
                    ),
                  },
                ]}
                data={lessons}
                emptyMessage="Няма проведени практически часове за този курсист."
              />
            </div>
          </div>
        )}

        {activeTab === "determinator" && (
          <div className="rounded-xl" style={{ background: "var(--bg-card)" }}>
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--ghost-border)" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 style={{ color: "var(--text-primary)" }}>
                    История от детерминатор
                  </h3>
                  <p
                    className="text-sm mt-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Отчитане на стойностите от уреда и свързване към историята
                    на курсиста.
                  </p>
                </div>
                <Button variant="primary" icon={<BrainCircuit size={18} />}>
                  Ново измерване
                </Button>
              </div>
            </div>
            <div className="p-6">
              <DataTable
                columns={[
                  { key: "measuredAt", label: "Дата и час" },
                  {
                    key: "reactionScore",
                    label: "Реакция",
                    render: (value: number) => `${value}/100`,
                  },
                  {
                    key: "concentrationScore",
                    label: "Концентрация",
                    render: (value: number) => `${value}/100`,
                  },
                  {
                    key: "stressScore",
                    label: "Стрес",
                    render: (value: number) => `${value}/100`,
                  },
                  {
                    key: "coordinationScore",
                    label: "Координация",
                    render: (value: number) => `${value}/100`,
                  },
                  { key: "overallResult", label: "Обобщение" },
                  { key: "instructorNote", label: "Бележка" },
                ]}
                data={studentDeterminatorSessions}
              />
              {studentDeterminatorSessions.length === 0 && (
                <div
                  className="mt-4 rounded-lg p-4 flex items-center gap-3"
                  style={{
                    background: "var(--bg-panel)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <ShieldCheck size={18} />
                  За този курсист още няма записани измервания от детерминатор.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="rounded-xl" style={{ background: "var(--bg-card)" }}>
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--ghost-border)" }}
            >
              <div className="flex items-center justify-between">
                <h3 style={{ color: "var(--text-primary)" }}>
                  История на плащанията
                </h3>
                <Button variant="primary" icon={<Plus size={18} />}>
                  Ново плащане
                </Button>
              </div>
            </div>
            <div className="p-6">
              <DataTable
                columns={[
                  { key: "date", label: "Дата" },
                  { key: "type", label: "Описание" },
                  {
                    key: "amount",
                    label: "Сума",
                    render: (value: string) => (
                      <span
                        className="font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {value}
                      </span>
                    ),
                  },
                  { key: "method", label: "Метод" },
                  {
                    key: "status",
                    label: "Статус",
                    render: (value: string, row: any) => (
                      <StatusBadge status={value as any} size="small">
                        {row.statusLabel}
                      </StatusBadge>
                    ),
                  },
                  {
                    key: "invoiceNumber",
                    label: "Фактура",
                    render: (value: string) => (
                      <button
                        className="text-sm font-medium hover:underline"
                        style={{ color: "var(--primary-accent)" }}
                      >
                        {value}
                      </button>
                    ),
                  },
                ]}
                data={payments}
                emptyMessage="Няма плащания за този курсист."
              />
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              className="rounded-xl"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <h3 style={{ color: "var(--text-primary)" }}>Документи</h3>
              </div>
              <div className="p-6 space-y-3">
                {documents.length === 0 ? (
                  <EmptyDetailState message="Няма качени документи за този курсист." />
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-lg"
                      style={{ background: "var(--bg-panel)" }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {doc.name}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {doc.type}
                          </p>
                        </div>
                        <StatusBadge status={doc.status as any} size="small">
                          {doc.statusLabel}
                        </StatusBadge>
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Издаден: {doc.issueDate} • Валиден до: {doc.expiryDate}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              className="rounded-xl"
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <h3 style={{ color: "var(--text-primary)" }}>Подпис</h3>
              </div>
              <div className="p-6">
                <div
                  className="rounded-lg border-2 border-dashed p-8 flex flex-col items-center justify-center"
                  style={{
                    borderColor: "var(--ghost-border-medium)",
                    minHeight: "200px",
                  }}
                >
                  <ImageIcon
                    size={48}
                    style={{ color: "var(--text-dim)" }}
                    className="mb-3"
                  />
                  <p
                    className="text-sm mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Сканиран подпис
                  </p>
                  <Button variant="secondary" icon={<Download size={18} />}>
                    Качи подпис
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="rounded-xl" style={{ background: "var(--bg-card)" }}>
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--ghost-border)" }}
            >
              <div className="flex items-center justify-between">
                <h3 style={{ color: "var(--text-primary)" }}>Бележки</h3>
                <Button variant="primary" icon={<Plus size={18} />}>
                  Добави бележка
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {notes.length === 0 ? (
                <EmptyDetailState message="Няма бележки по този курсист." />
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg"
                    style={{
                      background: note.important
                        ? "var(--status-warning-bg)"
                        : "var(--bg-panel)",
                      border: note.important
                        ? "1px solid var(--status-warning-border)"
                        : "1px solid transparent",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
                          color: "#ffffff",
                        }}
                      >
                        {note.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-medium text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {note.author}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            •
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {note.type}
                          </span>
                          {note.important && (
                            <>
                              <span
                                className="text-xs"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                •
                              </span>
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "var(--status-warning)" }}
                              >
                                Важно
                              </span>
                            </>
                          )}
                        </div>
                        <p
                          className="text-sm mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {note.content}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {note.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="rounded-xl" style={{ background: "var(--bg-card)" }}>
            <div
              className="p-6 border-b"
              style={{ borderColor: "var(--ghost-border)" }}
            >
              <h3 style={{ color: "var(--text-primary)" }}>
                Известия и сигнали
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {notifications.length === 0 ? (
                <EmptyDetailState message="Няма известия и сигнали за този курсист." />
              ) : notifications.map((notif) => {
                const iconMap = {
                  milestone: <CheckCircle size={20} />,
                  theory: <BookOpen size={20} />,
                  payment: <DollarSign size={20} />,
                  practice: <TriangleAlert size={20} />,
                  admin: <AlertCircle size={20} />,
                };

                const icon = iconMap[notif.type as keyof typeof iconMap] || (
                  <Bell size={20} />
                );

                return (
                  <div
                    key={notif.id}
                    className="p-4 rounded-lg"
                    style={{ background: "var(--bg-panel)" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "var(--bg-card)",
                          color: "var(--primary-accent)",
                        }}
                      >
                        {icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {notif.title}
                          </p>
                          <p
                            className="text-xs flex-shrink-0"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {notif.date}
                          </p>
                        </div>
                        <p
                          className="text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function EmptyDetailState({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg p-4 text-sm"
      style={{ background: "var(--bg-panel)", color: "var(--text-secondary)" }}
    >
      {message}
    </div>
  );
}

function LessonStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <p
        className="text-2xl font-semibold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: "var(--bg-panel)",
          color: "var(--text-secondary)",
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </p>
        <p
          className="text-sm truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
