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

const todayLessons: LessonItem[] = [
  {
    time: "09:00",
    student: "Петър Георгиев",
    instructor: "Георги Петров",
    location: "Централна зона",
    status: "active",
    statusLabel: "В процес",
    targetPath: "/students/1",
  },
  {
    time: "10:30",
    student: "Елена Димитрова",
    instructor: "Иван Димитров",
    location: "Южна зона",
    status: "upcoming",
    statusLabel: "Предстоящ",
    targetPath: "/students/2",
  },
  {
    time: "12:00",
    student: "Мартин Иванов",
    instructor: "Георги Петров",
    location: "Централна зона",
    status: "upcoming",
    statusLabel: "Предстоящ",
    targetPath: "/students/3",
  },
  {
    time: "14:00",
    student: "София Николова",
    instructor: "Иван Димитров",
    location: "Северна зона",
    status: "upcoming",
    statusLabel: "Предстоящ",
    targetPath: "/students/4",
  },
];

const overduePayments: PaymentAlertItem[] = [
  { student: "Елена Димитрова", amount: "450 лв.", daysOverdue: 18, targetPath: "/students/2" },
  { student: "Мартин Иванов", amount: "380 лв.", daysOverdue: 15, targetPath: "/students/3" },
  { student: "София Николова", amount: "410 лв.", daysOverdue: 14, targetPath: "/students/4" },
];

const expiringDocuments: DocumentAlertItem[] = [
  { student: "Мартин Иванов", document: "Свидетелство за управление", daysLeft: 0, targetPath: "/students/3" },
  { student: "Петър Георгиев", document: "Свидетелство за управление", daysLeft: 0, targetPath: "/students/1" },
  { student: "София Николова", document: "Медицинско свидетелство", daysLeft: 3, targetPath: "/students/4" },
  { student: "Елена Димитрова", document: "Лична карта", daysLeft: 5, targetPath: "/students/2" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionKey | null>(null);

  const quickActionMeta = useMemo<Record<QuickActionKey, QuickActionDialogMeta>>(
    () => ({
      newStudent: {
        title: "Нов курсист",
        description: "Бърз старт за регистрация на нов курсист с най-важните полета преди отваряне на пълната форма.",
        confirmLabel: "Отвори форма",
        fields: [
          { label: "Име и фамилия", value: "Например: Иван Петров", kind: "input" },
          { label: "Категория", value: "B", kind: "select" },
          { label: "Телефон", value: "+359 888 123 456", kind: "input" },
        ],
        onConfirm: () => navigate("/students/new"),
      },
      newLesson: {
        title: "Запиши час",
        description: "Бърза проверка на основните данни преди да се отвори графикът за нов час.",
        confirmLabel: "Към графика",
        fields: [
          { label: "Тип час", value: "Практика", kind: "select" },
          { label: "Инструктор", value: "Георги Петров", kind: "input" },
          { label: "Час", value: "Днес, 16:30", kind: "input" },
        ],
        onConfirm: () => navigate("/schedule"),
      },
      newDocument: {
        title: "Нов документ",
        description: "Подготовка за нов документ или OCR качване, без да се губи контекст от таблото.",
        confirmLabel: "Към документи",
        fields: [
          { label: "Тип документ", value: "Декларация", kind: "select" },
          { label: "Курсист", value: "Изберете курсист", kind: "input" },
          { label: "Начин", value: "OCR сканиране", kind: "select" },
        ],
        onConfirm: () => navigate("/documents"),
      },
      registerPayment: {
        title: "Регистрирай плащане",
        description: "Бърз достъп до запис на плащане с най-често използваните полета за администрацията.",
        confirmLabel: "Към плащания",
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
        title="Административно табло"
        subtitle="Преглед на ключова информация и задачи за днес"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => setActiveQuickAction("newLesson")}>
              Нов час
            </Button>
          </>
        }
      />

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

      <FinanceOverviewCard />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Calendar size={20} />} label="Днешни часове" value="18" trend="15 практика, 3 теория" color="var(--primary-accent)" />
        <StatCard icon={<Users size={20} />} label="Активни курсисти" value="124" trend="+8 нови този месец" color="var(--ai-accent)" />
        <StatCard icon={<DollarSign size={20} />} label="Просрочени плащания" value="3" trend="Общо 1,240 лв." color="var(--status-warning)" />
        <StatCard icon={<FileText size={20} />} label="Изтичащи документи" value="5" trend="В следващите 7 дни" color="var(--status-error)" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Днешен график"
            subtitle="Събота, 28 март 2026"
            action={<Button variant="ghost" size="sm" onClick={() => navigate("/schedule")}>Виж всички</Button>}
          />
          <div className="space-y-3">
            {todayLessons.map((lesson) => (
              <LessonRow key={`${lesson.time}-${lesson.student}`} lesson={lesson} onClick={() => navigate(lesson.targetPath)} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Изтичащи документи"
            subtitle="Приоритетни проверки за днес и утре"
            action={<Button variant="ghost" size="sm" onClick={() => navigate("/documents")}>Виж всички</Button>}
          />
          <div className="space-y-3">
            {expiringDocuments.map((item) => (
              <DocumentAlertRow key={`${item.student}-${item.document}`} item={item} onClick={() => navigate(item.targetPath)} />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Просрочени плащания" subtitle="Курсисти с най-спешни задължения" />
          <div className="space-y-3">
            {overduePayments.map((item) => (
              <PaymentAlertRow key={`${item.student}-${item.amount}`} item={item} onClick={() => navigate(item.targetPath)} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Бързи действия" subtitle="Кратки guided стъпки за най-честите операции" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuickActionButton icon={<Plus size={20} />} label="Нов курсист" onClick={() => setActiveQuickAction("newStudent")} />
            <QuickActionButton icon={<Calendar size={20} />} label="Запиши час" onClick={() => setActiveQuickAction("newLesson")} />
            <QuickActionButton icon={<FileText size={20} />} label="Нов документ" onClick={() => setActiveQuickAction("newDocument")} />
            <QuickActionButton icon={<DollarSign size={20} />} label="Регистрирай плащане" onClick={() => setActiveQuickAction("registerPayment")} />
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
