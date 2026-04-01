import { useState } from "react";
import {
  Plus,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Car,
} from "lucide-react";

export function DesignSystemShowcase() {
  const [selectedTab, setSelectedTab] = useState("colors");
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 style={{ color: "var(--text-primary)" }}>The Obsidian Navigator</h1>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Премиум дизайн система за MindOnRoad
        </p>
      </div>

      {/* Color System */}
      <section className="space-y-4">
        <div>
          <h2 style={{ color: "var(--text-primary)" }}>Цветова Система</h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            Тонално наслояване и смокинг гласови повърхности
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorSwatch
            name="Page Background"
            value="#060e20"
            description="Основен фон"
          />
          <ColorSwatch
            name="Panel Background"
            value="#091328"
            description="Панели"
          />
          <ColorSwatch name="Card Level" value="#192540" description="Карти" />
          <ColorSwatch
            name="Modal Level"
            value="#1f2b49"
            description="Модали"
          />
          <ColorSwatch
            name="Primary Accent"
            value="#6366F1"
            description="Основен акцент"
            gradient
          />
          <ColorSwatch
            name="AI Accent"
            value="#A78BFA"
            description="AI модули"
          />
        </div>
      </section>

      {/* Status Colors */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Статусни Цветове</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatusExample status="success" label="Успешно" />
          <StatusExample status="warning" label="Внимание" />
          <StatusExample status="error" label="Грешка" />
          <StatusExample status="overdue" label="Просрочено" />
          <StatusExample status="info" label="Информация" />
          <StatusExample status="neutral" label="Неутрално" />
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Типография</h2>

        <div
          className="p-6 rounded-lg space-y-6"
          style={{ background: "var(--bg-card)" }}
        >
          <div>
            <h1>Heading 1 - Заглавие 1 (2rem)</h1>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Font: Inter Semibold, Letter-spacing: -0.02em
            </p>
          </div>
          <div>
            <h2>Heading 2 - Заглавие 2 (1.25rem)</h2>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Font: Inter Semibold, Letter-spacing: -0.01em
            </p>
          </div>
          <div>
            <h3>Heading 3 - Заглавие 3 (1.125rem)</h3>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Font: Inter Medium
            </p>
          </div>
          <div>
            <p className="text-base">
              Body Text - Основен текст с генерозна междуредие разстояние за
              отлична четимост на български кирилица.
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Font: Inter Regular, Line-height: 1.6
            </p>
          </div>
          <div>
            <p className="label-utility">UTILITY LABEL - ЕТИКЕТ</p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              Font: Inter Semibold, Uppercase, Letter-spacing: 0.08em
            </p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Бутони</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Buttons */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Primary Buttons
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={<Plus size={18} />}>
                Добави Курсист
              </Button>
              <Button variant="primary" size="large">
                Запази Промени
              </Button>
              <Button variant="primary" size="small">
                Приложи
              </Button>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Secondary Buttons
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" icon={<Filter size={18} />}>
                Филтри
              </Button>
              <Button variant="secondary">Отказ</Button>
              <Button
                variant="secondary"
                size="small"
                icon={<Download size={16} />}
              >
                Изтегли
              </Button>
            </div>
          </div>

          {/* Ghost Buttons */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Ghost Buttons
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" icon={<Edit size={18} />}>
                Редактирай
              </Button>
              <Button variant="ghost" icon={<Eye size={18} />}>
                Преглед
              </Button>
            </div>
          </div>

          {/* Destructive Buttons */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Destructive Buttons
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="destructive" icon={<Trash2 size={18} />}>
                Изтрий
              </Button>
              <Button variant="destructive" icon={<X size={18} />}>
                Откажи
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Форми</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Inputs */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Text Inputs
            </h3>
            <div className="space-y-4">
              <InputField
                label="Име на курсист"
                placeholder="Въведете име..."
                value={inputValue}
                onChange={setInputValue}
              />
              <InputField
                label="Email адрес"
                placeholder="email@example.com"
                type="email"
                icon={<Mail size={18} />}
              />
              <InputField
                label="Телефон"
                placeholder="+359 ..."
                icon={<Phone size={18} />}
              />
            </div>
          </div>

          {/* Select Dropdowns */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Dropdowns
            </h3>
            <div className="space-y-4">
              <SelectField
                label="Категория книжка"
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { value: "b", label: "Категория B" },
                  { value: "a", label: "Категория A" },
                  { value: "c", label: "Категория C" },
                ]}
              />
              <SelectField
                label="Инструктор"
                options={[
                  { value: "1", label: "Георги Петров" },
                  { value: "2", label: "Иван Димитров" },
                ]}
              />
            </div>
          </div>

          {/* Textarea */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Textarea
            </h3>
            <TextareaField
              label="Бележки"
              placeholder="Добавете бележки..."
              rows={4}
            />
          </div>

          {/* Checkbox & Radio */}
          <div
            className="p-6 rounded-lg space-y-4"
            style={{ background: "var(--bg-card)" }}
          >
            <h3 className="text-sm" style={{ color: "var(--text-primary)" }}>
              Checkbox & Radio
            </h3>
            <div className="space-y-3">
              <CheckboxField
                label="Приемам условията"
                checked={checkboxChecked}
                onChange={setCheckboxChecked}
              />
              <CheckboxField label="Изпрати известие по email" />
              <CheckboxField label="SMS напомняне" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Tabs</h2>

        <Tabs
          tabs={[
            { id: "overview", label: "Общ преглед" },
            { id: "students", label: "Курсисти" },
            { id: "schedule", label: "График" },
            { id: "reports", label: "Отчети" },
          ]}
          activeTab={selectedTab}
          onChange={setSelectedTab}
        />
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Карти</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TelemetryCard
            title="Активни курсисти"
            value="124"
            change="+12%"
            trend="up"
          />
          <TelemetryCard
            title="Записани часове"
            value="48"
            subtitle="тази седмица"
          />
          <TelemetryCard
            title="Успеваемост"
            value="87%"
            change="+3%"
            trend="up"
          />
        </div>
      </section>

      {/* Tables */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Таблици</h2>

        <DataTable />
      </section>

      {/* Status Badges */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Статусни Етикети</h2>

        <div
          className="p-6 rounded-lg"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="flex flex-wrap gap-3">
            <Badge status="success">Завършен</Badge>
            <Badge status="warning">В процес</Badge>
            <Badge status="error">Отменен</Badge>
            <Badge status="overdue">Просрочен</Badge>
            <Badge status="info">Планиран</Badge>
            <Badge status="neutral">Чернова</Badge>
          </div>
        </div>
      </section>

      {/* Modal Example */}
      <section className="space-y-4">
        <h2 style={{ color: "var(--text-primary)" }}>Модални Прозорци</h2>

        <div
          className="p-6 rounded-lg"
          style={{ background: "var(--bg-card)" }}
        >
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Отвори Модал
          </Button>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <Modal title="Добави нов курсист" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <InputField label="Име" placeholder="Въведете име..." />
            <InputField label="Фамилия" placeholder="Въведете фамилия..." />
            <InputField
              label="Телефон"
              placeholder="+359 ..."
              icon={<Phone size={18} />}
            />
            <SelectField
              label="Категория"
              options={[
                { value: "b", label: "Категория B" },
                { value: "a", label: "Категория A" },
              ]}
            />

            <div className="flex gap-3 pt-4">
              <Button variant="primary" icon={<Save size={18} />}>
                Запази
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Отказ
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Component Implementations

function ColorSwatch({
  name,
  value,
  description,
  gradient,
}: {
  name: string;
  value: string;
  description: string;
  gradient?: boolean;
}) {
  return (
    <div className="p-4 rounded-lg" style={{ background: "var(--bg-card)" }}>
      <div
        className="w-full h-20 rounded-lg mb-3"
        style={{
          background: gradient
            ? `linear-gradient(135deg, ${value}, var(--primary-accent-dim))`
            : value,
        }}
      />
      <div className="space-y-1">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {name}
        </p>
        <p
          className="text-xs font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          {value}
        </p>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusExample({ status, label }: { status: string; label: string }) {
  const colors =
    {
      success: {
        bg: "var(--status-success-bg)",
        border: "var(--status-success-border)",
        text: "var(--status-success)",
      },
      warning: {
        bg: "var(--status-warning-bg)",
        border: "var(--status-warning-border)",
        text: "var(--status-warning)",
      },
      error: {
        bg: "var(--status-error-bg)",
        border: "var(--status-error-border)",
        text: "var(--status-error)",
      },
      overdue: {
        bg: "var(--status-overdue-bg)",
        border: "var(--status-overdue-border)",
        text: "var(--status-overdue)",
      },
      info: {
        bg: "var(--status-info-bg)",
        border: "var(--status-info-border)",
        text: "var(--status-info)",
      },
      neutral: {
        bg: "var(--status-neutral-bg)",
        border: "var(--status-neutral-border)",
        text: "var(--status-neutral)",
      },
    }[status] || colors.neutral;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: colors.text }}
        />
        <span className="text-sm font-medium" style={{ color: colors.text }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  size = "medium",
  icon,
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  const sizeClasses = {
    small: "h-9 px-4 text-sm",
    medium: "h-11 px-6 text-base",
    large: "h-12 px-8 text-base",
  }[size];

  const variantStyles = {
    primary: {
      background:
        "linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))",
      color: "#ffffff",
      hover: "shadow-[var(--glow-indigo)]",
    },
    secondary: {
      background: "var(--bg-card)",
      color: "var(--text-primary)",
      border: "1px solid var(--ghost-border-medium)",
      hover: "shadow-[var(--glow-indigo)]",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      hover: "shadow-[var(--glow-indigo)]",
    },
    destructive: {
      background: "var(--status-error)",
      color: "#ffffff",
      hover: "opacity-90",
    },
  }[variant];

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses}
        rounded-lg font-medium
        flex items-center gap-2
        transition-all duration-200
        hover:${variantStyles.hover}
      `}
      style={{
        background: variantStyles.background,
        color: variantStyles.color,
        border: variantStyles.border,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)" }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`
            w-full h-12 rounded-lg px-4
            ${icon ? "pl-12" : ""}
            border transition-all
            focus:outline-none focus:shadow-[var(--glow-indigo)]
          `}
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--ghost-border-medium)",
            color: "var(--text-primary)",
          }}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-12 rounded-lg px-4 pr-10 border transition-all appearance-none focus:outline-none focus:shadow-[var(--glow-indigo)]"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--ghost-border-medium)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Изберете...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-tertiary)" }}
        />
      </div>
    </div>
  );
}

function TextareaField({
  label,
  placeholder,
  rows = 4,
}: {
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg px-4 py-3 border transition-all focus:outline-none focus:shadow-[var(--glow-indigo)] resize-none"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--ghost-border-medium)",
          color: "var(--text-primary)",
        }}
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className="w-5 h-5 rounded border-2 transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)] flex items-center justify-center"
          style={{
            borderColor: checked
              ? "var(--primary-accent)"
              : "var(--ghost-border-strong)",
          }}
        >
          {checked && <Check size={14} color="#ffffff" />}
        </div>
      </div>
      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
        {label}
      </span>
    </label>
  );
}

function Tabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b" style={{ borderColor: "var(--ghost-border)" }}>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-6 h-12 font-medium text-sm
              border-b-2 transition-all
              ${activeTab === tab.id ? "" : "hover:shadow-[var(--glow-indigo)]"}
            `}
            style={{
              borderColor:
                activeTab === tab.id ? "var(--primary-accent)" : "transparent",
              color:
                activeTab === tab.id
                  ? "var(--primary-accent)"
                  : "var(--text-secondary)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TelemetryCard({
  title,
  value,
  subtitle,
  change,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="p-6 rounded-lg" style={{ background: "var(--bg-card)" }}>
      <div className="space-y-3">
        <p className="label-utility">{title}</p>
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-3xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {value}
            </p>
            {subtitle && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {change && (
            <div
              className="text-sm font-medium"
              style={{
                color:
                  trend === "up"
                    ? "var(--status-success)"
                    : "var(--status-error)",
              }}
            >
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataTable() {
  const students = [
    {
      id: 1,
      name: "Петър Георгиев",
      category: "B",
      instructor: "Георги Петров",
      lessons: 12,
      status: "success",
    },
    {
      id: 2,
      name: "Елена Димитрова",
      category: "B",
      instructor: "Иван Димитров",
      lessons: 8,
      status: "warning",
    },
    {
      id: 3,
      name: "Мартин Иванов",
      category: "A",
      instructor: "Георги Петров",
      lessons: 15,
      status: "success",
    },
    {
      id: 4,
      name: "София Николова",
      category: "B",
      instructor: "Иван Димитров",
      lessons: 5,
      status: "info",
    },
  ];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--bg-card)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--bg-panel)" }}>
              <th className="px-6 py-4 text-left">
                <span className="label-utility">Име</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="label-utility">Категория</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="label-utility">Инструктор</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="label-utility">Часове</span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="label-utility">Статус</span>
              </th>
              <th className="px-6 py-4 text-right">
                <span className="label-utility">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                key={student.id}
                className="border-t transition-colors hover:bg-[var(--bg-panel)]"
                style={{ borderColor: "var(--ghost-border)" }}
              >
                <td className="px-6 py-4">
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {student.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {student.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {student.instructor}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {student.lessons}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge status={student.status}>
                    {student.status === "success"
                      ? "Активен"
                      : student.status === "warning"
                        ? "В процес"
                        : "Планиран"}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                      style={{
                        background: "var(--bg-panel)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                      style={{
                        background: "var(--bg-panel)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Badge({
  status,
  children,
}: {
  status: string;
  children: React.ReactNode;
}) {
  const colors = {
    success: {
      bg: "var(--status-success-bg)",
      border: "var(--status-success-border)",
      text: "var(--status-success)",
    },
    warning: {
      bg: "var(--status-warning-bg)",
      border: "var(--status-warning-border)",
      text: "var(--status-warning)",
    },
    error: {
      bg: "var(--status-error-bg)",
      border: "var(--status-error-border)",
      text: "var(--status-error)",
    },
    overdue: {
      bg: "var(--status-overdue-bg)",
      border: "var(--status-overdue-border)",
      text: "var(--status-overdue)",
    },
    info: {
      bg: "var(--status-info-bg)",
      border: "var(--status-info-border)",
      text: "var(--status-info)",
    },
    neutral: {
      bg: "var(--status-neutral-bg)",
      border: "var(--status-neutral-border)",
      text: "var(--status-neutral)",
    },
  }[status] || {
    bg: "var(--status-neutral-bg)",
    border: "var(--status-neutral-border)",
    text: "var(--status-neutral)",
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: colors.text }}
      />
      {children}
    </span>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: "blur(12px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-xl p-6 shadow-[var(--shadow-xl)]"
        style={{ background: "var(--bg-modal)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
