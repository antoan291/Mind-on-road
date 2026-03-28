import { useState } from "react";
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
} from "lucide-react";

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - in real app, fetch based on id
  const student = {
    id: 1,
    name: "Петър Георгиев",
    email: "petar.georgiev@example.com",
    phone: "+359 888 123 456",
    address: "гр. София, ул. Витоша 15, ап. 7",
    birthDate: "15.05.1995",
    idNumber: "9505151234",
    category: "B",
    instructor: "Георги Петров",
    instructorPhone: "+359 888 111 222",
    theoryGroup: "Група 3 - Понеделник и Сряда 18:00",
    startDate: "15.01.2024",
    paidLessons: 20,
    usedLessons: 12,
    remainingLessons: 8,
    progress: 60,
    status: "success",
    statusLabel: "Напреднал",
    theoryCompleted: true,
    theoryAttendance: 10,
    theoryTotal: 12,
    parentName: "Иван Георгиев",
    parentPhone: "+359 887 654 321",
    parentEmail: "ivan.georgiev@example.com",
  };

  const payments = [
    {
      id: 1,
      date: "15.01.2024",
      type: "Пакет 20 часа",
      amount: "1,200 лв",
      method: "Банков превод",
      status: "success",
      statusLabel: "Платено",
      invoiceNumber: "INV-2024-001",
    },
    {
      id: 2,
      date: "20.02.2024",
      type: "Теория",
      amount: "180 лв",
      method: "В брой",
      status: "success",
      statusLabel: "Платено",
      invoiceNumber: "INV-2024-045",
    },
  ];

  const lessons = [
    {
      id: 1,
      date: "24.03.2024",
      time: "10:00",
      type: "Градско шофиране",
      duration: "90 мин",
      instructor: "Георги Петров",
      vehicle: "Toyota Corolla - СА 1234 АВ",
      route: "Център - Младост",
      status: "success",
      statusLabel: "Завършен",
      rating: 4,
      notes: "Отлично се справи с паркирането",
    },
    {
      id: 2,
      date: "22.03.2024",
      time: "14:00",
      type: "Паркиране",
      duration: "90 мин",
      instructor: "Георги Петров",
      vehicle: "Toyota Corolla - СА 1234 АВ",
      route: "Павел Баня - упражнения",
      status: "success",
      statusLabel: "Завършен",
      rating: 5,
      notes: "Перфектно паркиране",
    },
    {
      id: 3,
      date: "20.03.2024",
      time: "11:00",
      type: "Магистрала",
      duration: "90 мин",
      instructor: "Георги Петров",
      vehicle: "Toyota Corolla - СА 1234 АВ",
      route: "София - Перник",
      status: "success",
      statusLabel: "Завършен",
      rating: 4,
      notes: "Добро управление при висока скорост",
    },
  ];

  const documents = [
    {
      id: 1,
      name: "Лична карта",
      type: "Документ за самоличност",
      issueDate: "10.01.2020",
      expiryDate: "10.01.2030",
      status: "success",
      statusLabel: "Валиден",
      daysLeft: 2190,
    },
    {
      id: 2,
      name: "Медицинско свидетелство",
      type: "Здравно състояние",
      issueDate: "05.01.2024",
      expiryDate: "05.01.2025",
      status: "success",
      statusLabel: "Валиден",
      daysLeft: 287,
    },
    {
      id: 3,
      name: "Свидетелство за управление",
      type: "Предходна категория",
      issueDate: "15.01.2024",
      expiryDate: "15.04.2024",
      status: "warning",
      statusLabel: "22 дни",
      daysLeft: 22,
    },
  ];

  const notes = [
    {
      id: 1,
      date: "24.03.2024",
      author: "Георги Петров",
      type: "Инструктор",
      content:
        "Курсистът показва отлични резултати. Готов за по-сложни маневри.",
      important: false,
    },
    {
      id: 2,
      date: "15.03.2024",
      author: "Мария Иванова",
      type: "Администратор",
      content:
        "Родителят се обади да запита за напредъка. Изпратена информация по email.",
      important: false,
    },
    {
      id: 3,
      date: "10.03.2024",
      author: "Георги Петров",
      type: "Инструктор",
      content:
        "Препоръчвам допълнителни часове за паркиране след достигане на 15 часа.",
      important: true,
    },
  ];

  const notifications = [
    {
      id: 1,
      type: "milestone",
      title: "Достигнати 10 часа практика",
      message: "Автоматичен сигнал за категория B",
      date: "20.03.2024",
      status: "info",
    },
    {
      id: 2,
      type: "theory",
      title: "Теория завършена",
      message: "Присъствие: 10/12 занятия",
      date: "15.03.2024",
      status: "success",
    },
    {
      id: 3,
      type: "payment",
      title: "Плащане получено",
      message: "1,200 лв за пакет 20 часа",
      date: "15.01.2024",
      status: "success",
    },
  ];

  const tabs = [
    { id: "overview", label: "Преглед" },
    { id: "lessons", label: "Практика" },
    { id: "payments", label: "Плащания" },
    { id: "documents", label: "Документи" },
    { id: "notes", label: "Бележки" },
    { id: "notifications", label: "Известия" },
  ];

  return (
    <div>
      <PageHeader
        title={student.name}
        description={`Категория ${student.category} • ${student.instructor}`}
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
                        width: `${(student.usedLessons / student.paidLessons) * 100}%`,
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
                {lessons.slice(0, 3).map((lesson) => (
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
                ))}
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
              />
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
                {documents.map((doc) => (
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
                ))}
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
              {notes.map((note) => (
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
              ))}
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
              {notifications.map((notif) => {
                const iconMap = {
                  milestone: <CheckCircle size={20} />,
                  theory: <BookOpen size={20} />,
                  payment: <DollarSign size={20} />,
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
