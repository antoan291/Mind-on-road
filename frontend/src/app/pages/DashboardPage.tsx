import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  Button,
  Badge,
  Alert,
} from "../components/shared";
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Clock,
  User,
  MapPin,
  Download,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Административно табло"
        subtitle="Преглед на ключова информация и задачи за днес"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />}>
              Нов час
            </Button>
          </>
        }
      />

      {/* Critical Alerts */}
      <div className="space-y-3">
        <Alert
          variant="warning"
          title="3 просрочени плащания"
          message="Има 3 курсисти с неплатени такси над 14 дни."
          action={{ label: "Преглед", onClick: () => navigate("/payments") }}
        />
        <Alert
          variant="error"
          title="2 документа изтичат днес"
          message="Свидетелства за управление на Мартин Иванов и Петър Георгиев."
          action={{ label: "Провери", onClick: () => navigate("/documents") }}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar size={20} />}
          label="Днешни часове"
          value="18"
          trend="15 практика, 3 теория"
          color="var(--primary-accent)"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Активни курсисти"
          value="124"
          trend="+8 нови този месец"
          color="var(--ai-accent)"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label="Просрочени плащания"
          value="3"
          trend="Общо 1,240 лв"
          color="var(--status-warning)"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Изтичащи документи"
          value="5"
          trend="В следващите 7 дни"
          color="var(--status-error)"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader
            title="Днешен график"
            subtitle="Вторник, 24 Март 2026"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/schedule")}
              >
                Виж всички
              </Button>
            }
          />

          <div className="space-y-3">
            <LessonRow
              time="09:00"
              student="Петър Георгиев"
              instructor="Георги Петров"
              location="Централна зона"
              status="active"
              statusLabel="В процес"
              onClick={() => navigate("/students/1")}
            />
            <LessonRow
              time="10:30"
              student="Елена Димитрова"
              instructor="Иван Димитров"
              location="Южна зона"
              status="upcoming"
              statusLabel="Предстоящ"
              onClick={() => navigate("/students/2")}
            />
            <LessonRow
              time="12:00"
              student="Мартин Иванов"
              instructor="Георги Петров"
              location="Централна зона"
              status="upcoming"
              statusLabel="Предстоящ"
              onClick={() => navigate("/students/3")}
            />
            <LessonRow
              time="14:00"
              student="София Николова"
              instructor="Иван Димитров"
              location="Северна зона"
              status="upcoming"
              statusLabel="Предстоящ"
              onClick={() => navigate("/students/4")}
            />
          </div>
        </Card>

        {/* Upcoming Lessons (Next 3 Days) */}
        <Card>
          <CardHeader
            title="Предстоящи часове"
            subtitle="Следващите 3 дни"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/schedule")}
              >
                Виж всички
              </Button>
            }
          />

          <div className="space-y-4">
            <UpcomingDay
              date="Утре, 25 Март"
              count="16 часа"
              lessons={[
                { time: "09:00", student: "Георги Тодоров" },
                { time: "10:30", student: "Ана Петкова" },
                { time: "12:00", student: "Димитър Стоянов" },
              ]}
            />
            <UpcomingDay
              date="Четвъртък, 26 Март"
              count="14 часа"
              lessons={[
                { time: "09:00", student: "Мария Василева" },
                { time: "11:00", student: "Николай Христов" },
              ]}
            />
            <UpcomingDay
              date="Петък, 27 Март"
              count="12 часа"
              lessons={[
                { time: "10:00", student: "Ивелина Георгиева" },
                { time: "14:00", student: "Стоян Димитров" },
              ]}
            />
          </div>
        </Card>
      </div>

      {/* Alerts and Action Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Payments */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(251, 191, 36, 0.15)" }}
            >
              <DollarSign
                size={20}
                style={{ color: "var(--status-warning)" }}
              />
            </div>
            <div>
              <h3
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Просрочени плащания
              </h3>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                3 курсисти
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <PaymentAlert
              student="Елена Димитрова"
              amount="450 лв"
              daysOverdue={18}
              onClick={() => navigate("/students/2")}
            />
            <PaymentAlert
              student="Мартин Иванов"
              amount="380 лв"
              daysOverdue={15}
              onClick={() => navigate("/students/3")}
            />
            <PaymentAlert
              student="София Николова"
              amount="410 лв"
              daysOverdue={14}
              onClick={() => navigate("/students/4")}
            />
          </div>
        </Card>

        {/* Missing Theory Sessions */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(59, 130, 246, 0.15)" }}
            >
              <FileText size={20} style={{ color: "var(--status-info)" }} />
            </div>
            <div>
              <h3
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Пропуснати теория
              </h3>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                4 курсисти
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <TheoryAlert
              student="Петър Георгиев"
              missed={2}
              total={12}
              onClick={() => navigate("/students/1")}
            />
            <TheoryAlert
              student="Ана Петкова"
              missed={1}
              total={12}
              onClick={() => navigate("/students/6")}
            />
            <TheoryAlert
              student="Димитър Стоянов"
              missed={3}
              total={12}
              onClick={() => navigate("/students/7")}
            />
            <TheoryAlert
              student="Георги Тодоров"
              missed={1}
              total={12}
              onClick={() => navigate("/students/5")}
            />
          </div>
        </Card>

        {/* Expiring Documents */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(239, 68, 68, 0.15)" }}
            >
              <AlertCircle size={20} style={{ color: "var(--status-error)" }} />
            </div>
            <div>
              <h3
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Изтичащи документи
              </h3>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                5 документа
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <DocumentAlert
              student="Мартин Иванов"
              document="Свидетелство за управление"
              daysLeft={0}
              onClick={() => navigate("/students/3")}
            />
            <DocumentAlert
              student="Петър Георгиев"
              document="Свидетелство за управление"
              daysLeft={0}
              onClick={() => navigate("/students/1")}
            />
            <DocumentAlert
              student="София Николова"
              document="Медицинско свидетелство"
              daysLeft={3}
              onClick={() => navigate("/students/4")}
            />
            <DocumentAlert
              student="Елена Димитрова"
              document="Лична карта"
              daysLeft={5}
              onClick={() => navigate("/students/2")}
            />
            <DocumentAlert
              student="Георги Тодоров"
              document="Медицинско свидетелство"
              daysLeft={7}
              onClick={() => navigate("/students/5")}
            />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3
          className="mb-4 font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Бързи действия
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={<Plus size={20} />}
            label="Нов курсист"
            onClick={() => navigate("/students/new")}
          />
          <QuickAction
            icon={<Calendar size={20} />}
            label="Запиши час"
            onClick={() => navigate("/schedule")}
          />
          <QuickAction
            icon={<FileText size={20} />}
            label="Нов документ"
            onClick={() => navigate("/documents")}
          />
          <QuickAction
            icon={<DollarSign size={20} />}
            label="Регистрирай плащане"
            onClick={() => navigate("/payments")}
          />
        </div>
      </Card>
    </div>
  );
}

// Helper Components

function LessonRow({
  time,
  student,
  instructor,
  location,
  status,
  statusLabel,
  onClick,
}: {
  time: string;
  student: string;
  instructor: string;
  location: string;
  status: "active" | "upcoming";
  statusLabel: string;
  onClick: () => void;
}) {
  const variant = status === "active" ? "warning" : "info";

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg transition-all text-left hover:opacity-80"
      style={{
        background:
          status === "active" ? "rgba(99, 102, 241, 0.08)" : "var(--bg-panel)",
        border:
          status === "active"
            ? "1px solid rgba(99, 102, 241, 0.25)"
            : "1px solid transparent",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center justify-center min-w-[60px]">
          <div
            className="text-lg font-semibold"
            style={{
              color:
                status === "active"
                  ? "var(--primary-accent)"
                  : "var(--text-secondary)",
            }}
          >
            {time}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p
              className="font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {student}
            </p>
            <Badge variant={variant} size="sm">
              {statusLabel}
            </Badge>
          </div>
          <div
            className="flex items-center gap-4 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {instructor}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {location}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function UpcomingDay({
  date,
  count,
  lessons,
}: {
  date: string;
  count: string;
  lessons: { time: string; student: string }[];
}) {
  return (
    <div className="p-4 rounded-lg" style={{ background: "var(--bg-panel)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
          {date}
        </p>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          {count}
        </p>
      </div>
      <div className="space-y-2">
        {lessons.map((lesson, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm">
            <span
              className="font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {lesson.time}
            </span>
            <span style={{ color: "var(--text-tertiary)" }}>•</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {lesson.student}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentAlert({
  student,
  amount,
  daysOverdue,
  onClick,
}: {
  student: string;
  amount: string;
  daysOverdue: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg transition-all text-left hover:opacity-80"
      style={{ background: "var(--bg-panel)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p
          className="font-medium text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {student}
        </p>
        <Badge variant="error" size="sm">
          {daysOverdue} дни
        </Badge>
      </div>
      <p
        className="text-sm font-semibold"
        style={{ color: "var(--status-warning)" }}
      >
        {amount}
      </p>
    </button>
  );
}

function TheoryAlert({
  student,
  missed,
  total,
  onClick,
}: {
  student: string;
  missed: number;
  total: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg transition-all text-left hover:opacity-80"
      style={{ background: "var(--bg-panel)" }}
    >
      <p
        className="font-medium text-sm mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {student}
      </p>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        Пропуснати: {missed} от {total} занятия
      </p>
    </button>
  );
}

function DocumentAlert({
  student,
  document,
  daysLeft,
  onClick,
}: {
  student: string;
  document: string;
  daysLeft: number;
  onClick: () => void;
}) {
  const variant = daysLeft === 0 ? "error" : daysLeft <= 3 ? "warning" : "info";
  const statusText = daysLeft === 0 ? "Изтича днес" : `${daysLeft} дни`;

  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg transition-all text-left hover:opacity-80"
      style={{ background: "var(--bg-panel)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p
          className="font-medium text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {student}
        </p>
        <Badge variant={variant} size="sm">
          {statusText}
        </Badge>
      </div>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {document}
      </p>
    </button>
  );
}

function MilestoneAlert({
  student,
  completed,
  total,
  category,
  progress,
  onClick,
}: {
  student: string;
  completed: number;
  total: number;
  category: string;
  progress: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg transition-all text-left hover:opacity-80"
      style={{ background: "var(--bg-panel)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            {student}
          </p>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Категория {category}
          </p>
        </div>
        <Badge variant="success" size="sm">
          {completed}/{total} часа
        </Badge>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Напредък
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {progress}%
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--bg-card)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
            }}
          />
        </div>
      </div>
    </button>
  );
}

function AIInsight({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "rgba(167, 139, 250, 0.1)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-medium text-sm mb-0.5"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-lg transition-all text-left hover:opacity-80"
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--ghost-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
          }}
        >
          <span style={{ color: "#ffffff" }}>{icon}</span>
        </div>
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
      </div>
    </button>
  );
}
