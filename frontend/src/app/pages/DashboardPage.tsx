import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Modal,
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
import { DashboardQuickActionDialog } from "./dashboard/DashboardQuickActionDialog";
import { FinanceOverviewCard } from "./dashboard/FinanceOverviewCard";
import { dashboardAlerts, dashboardHeader, dashboardSections, dashboardQuickActions, dashboardLessons, dashboardExpiringDocuments, dashboardOverduePayments, dashboardStats, getDashboardIcon } from "./dashboard/dashboardContent";

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


export function DashboardPage() {
  const navigate = useNavigate();
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionKey | null>(null);

  const quickActionMeta = useMemo<Record<QuickActionKey, QuickActionDialogMeta>>(
    () => ({
      newStudent: {
        title: dashboardQuickActions.newStudent.title,
        description: dashboardQuickActions.newStudent.description,
        confirmLabel: dashboardQuickActions.newStudent.confirmLabel,
        fields: [
          { label: "Име и фамилия", value: "Например: Иван Петров", kind: "input" },
          { label: "Категория", value: "B", kind: "select" },
          { label: "Телефон", value: "+359 888 123 456", kind: "input" },
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
          { label: "Сума", value: "250 лв.", kind: "input" },
          { label: "Метод", value: "В брой", kind: "select" },
        ],
        onConfirm: () => navigate("/payments"),
      },
    }),
    [navigate],
  );

  const activeDialog = activeQuickAction ? quickActionMeta[activeQuickAction] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dashboardHeader.title}
        subtitle={dashboardHeader.subtitle}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              {dashboardHeader.actions.export}
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setActiveQuickAction("newLesson")}>
              {dashboardHeader.actions.newLesson}
            </Button>
          </>
        }
      />

      <div className="space-y-3">
        {dashboardAlerts.map((item) => (
          <Alert
            key={item.title}
            variant={item.variant as "warning" | "error"}
            title={item.title}
            message={item.message}
            action={{ label: item.actionLabel, onClick: () => navigate(item.targetPath) }}
          />
        ))}
      </div>

      <FinanceOverviewCard />




      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((item) => {
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
            {dashboardLessons.map((lesson) => (
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
            {dashboardExpiringDocuments.map((item) => (
              <DocumentAlertRow key={`${item.student}-${item.document}`} item={item} onClick={() => navigate(item.targetPath)} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={dashboardSections.payments.title} subtitle={dashboardSections.payments.subtitle} />
          <div className="space-y-3">
            {dashboardOverduePayments.map((item) => (
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
        onClose={() => setActiveQuickAction(null)}
        onConfirm={(action) => {
          setActiveQuickAction(null);
          if (action === "newStudent") navigate("/students/new");
          else if (action === "newLesson") navigate("/schedule");
          else if (action === "newDocument") navigate("/documents");
          else navigate("/payments");
        }}
      />
    </div>
  );
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
