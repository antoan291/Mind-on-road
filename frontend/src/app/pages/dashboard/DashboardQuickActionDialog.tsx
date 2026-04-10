import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Button, Input, Modal, Select, Textarea } from "../../components/shared";
import { DatePickerInput } from "../../components/date/DatePickerInput";

export type QuickActionKey =
  | "newStudent"
  | "newLesson"
  | "newDocument"
  | "registerPayment";

export type DashboardQuickActionFormState = {
  fullName: string;
  phone: string;
  email: string;
  parentPhone: string;
  category: string;
  theoryGroup: string;
  notes: string;
  lessonType: string;
  student: string;
  instructor: string;
  vehicle: string;
  lessonDate: string;
  lessonTime: string;
  duration: string;
  customDurationMinutes: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  uploadedFileName: string;
  amount: string;
  paymentMethod: string;
  paymentDate: string;
  reference: string;
  paymentNote: string;
};

type Props = {
  activeAction: QuickActionKey | null;
  studentOptions: Array<{ value: string; label: string; category: string }>;
  instructorOptions: Array<{ value: string; label: string }>;
  vehicleOptions: Array<{ value: string; label: string }>;
  theoryGroupOptions: Array<{ value: string; label: string }>;
  isSubmitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onConfirm: (
    action: QuickActionKey,
    formState: DashboardQuickActionFormState,
  ) => Promise<void> | void;
};

const selectOptions = {
  category: [
    { value: "B", label: "Категория B" },
    { value: "A", label: "Категория A" },
    { value: "C", label: "Категория C" },
  ],
  lessonType: [
    { value: "practice", label: "Практика" },
    { value: "theory", label: "Теория" },
    { value: "exam-prep", label: "Подготовка за изпит" },
  ],
  duration: [
    { value: "50", label: "50 минути" },
    { value: "90", label: "90 минути" },
    { value: "custom", label: "Ръчно" },
  ],
  documentType: [
    { value: "medical", label: "Медицинско свидетелство" },
    { value: "declaration", label: "Декларация" },
    { value: "contract", label: "Договор" },
    { value: "receipt", label: "Квитанция" },
  ],
  paymentMethod: [
    { value: "cash", label: "В брой" },
    { value: "bank", label: "Банков превод" },
    { value: "pos", label: "POS терминал" },
  ],
} as const;

function createDefaultFormState(
  studentOptions: Props["studentOptions"],
  instructorOptions: Props["instructorOptions"],
  vehicleOptions: Props["vehicleOptions"],
  theoryGroupOptions: Props["theoryGroupOptions"],
): DashboardQuickActionFormState {
  const defaultStudent = studentOptions[0];

  return {
    fullName: "",
    phone: "",
    email: "",
    parentPhone: "",
    category: defaultStudent?.category ?? "B",
    theoryGroup: theoryGroupOptions[0]?.value ?? "",
    notes: "",
    lessonType: "practice",
    student: defaultStudent?.value ?? "",
    instructor: instructorOptions[0]?.value ?? "",
    vehicle: vehicleOptions[0]?.value ?? "",
    lessonDate: new Date().toISOString().slice(0, 10),
    lessonTime: "09:00",
    duration: "90",
    customDurationMinutes: "50",
    documentType: "medical",
    documentNumber: "",
    issueDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    uploadedFileName: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().slice(0, 10),
    reference: "",
    paymentNote: "",
  };
}

export function DashboardQuickActionDialog({
  activeAction,
  studentOptions,
  instructorOptions,
  vehicleOptions,
  theoryGroupOptions,
  isSubmitting,
  submitError,
  onClose,
  onConfirm,
}: Props) {
  const [formState, setFormState] = useState<DashboardQuickActionFormState>(
    createDefaultFormState(
      studentOptions,
      instructorOptions,
      vehicleOptions,
      theoryGroupOptions,
    ),
  );

  useEffect(() => {
    if (activeAction) {
      setFormState(
        createDefaultFormState(
          studentOptions,
          instructorOptions,
          vehicleOptions,
          theoryGroupOptions,
        ),
      );
    }
  }, [
    activeAction,
    instructorOptions,
    studentOptions,
    theoryGroupOptions,
    vehicleOptions,
  ]);

  const dialogMeta = useMemo(() => {
    if (!activeAction) {
      return null;
    }

    const map = {
      newStudent: {
        title: "Нов курсист",
        description: "Бързо създаване на нов курсист с основните данни, нужни на администрацията.",
        confirmLabel: "Създай курсист",
      },
      newLesson: {
        title: "Запиши час",
        description: "Планирай нов час директно от таблото с най-важните полета за графика.",
        confirmLabel: "Запиши часа",
      },
      newDocument: {
        title: "Нов документ",
        description: "Добави документ, номер и файл за качване, без да излизаш от dashboard-а.",
        confirmLabel: "Добави документ",
      },
      registerPayment: {
        title: "Регистрирай плащане",
        description: "Запиши ново плащане с метод, дата и референция за по-лесен контрол.",
        confirmLabel: "Регистрирай плащане",
      },
    } satisfies Record<QuickActionKey, { title: string; description: string; confirmLabel: string }>;

    return map[activeAction];
  }, [activeAction]);

  function updateField<K extends keyof DashboardQuickActionFormState>(
    field: K,
    value: DashboardQuickActionFormState[K],
  ) {
    setFormState((current) => {
      if (field === "student") {
        const student = studentOptions.find((item) => item.value === value);

        return {
          ...current,
          student: value,
          category: student?.category ?? current.category,
        };
      }

      return { ...current, [field]: value };
    });
  }

  function renderFields() {
    if (activeAction === "newStudent") {
      return (
        <div className="space-y-5">
          <section
            className="rounded-[24px] border p-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(15, 23, 42, 0.28) 0%, rgba(15, 23, 42, 0.16) 100%)",
              borderColor: "rgba(148, 163, 184, 0.28)",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
            }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Основни данни
                </p>
                <h3
                  className="mt-2 text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Попълни профила на курсиста
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div
                className="rounded-[20px] border p-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Input
                  label="Име и фамилия"
                  value={formState.fullName}
                  onChange={(value) => updateField("fullName", value)}
                  placeholder="Например: Иван Петров"
                  required
                />
              </div>
              <div
                className="rounded-[20px] border p-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Input
                  label="Телефон на курсист"
                  value={formState.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="0886612503"
                  type="tel"
                  required
                />
              </div>
              <div
                className="rounded-[20px] border p-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Input
                  label="Имейл"
                  value={formState.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="kursist@example.com"
                  type="email"
                />
              </div>
              <div
                className="rounded-[20px] border p-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Input
                  label="Телефон на родител"
                  value={formState.parentPhone}
                  onChange={(value) => updateField("parentPhone", value)}
                  placeholder="По желание"
                  type="tel"
                />
              </div>
            </div>
          </section>

          <section
            className="rounded-[24px] border p-5"
            style={{
              background: "rgba(15, 23, 42, 0.14)",
              borderColor: "rgba(148, 163, 184, 0.28)",
            }}
          >
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--text-secondary)" }}
            >
              Обучение
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div
                className="rounded-[20px] border p-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Select
                  label="Категория"
                  value={formState.category}
                  onChange={(value) => updateField("category", value)}
                  options={selectOptions.category}
                  placeholder="Изберете категория"
                  required
                />
              </div>
              <div
                className="rounded-[20px] border p-4"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Select
                  label="Инструктор"
                  value={formState.instructor}
                  onChange={(value) => updateField("instructor", value)}
                  options={instructorOptions}
                  placeholder="Изберете инструктор"
                />
              </div>
              <div
                className="rounded-[20px] border p-4 md:col-span-2"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Select
                  label="Група по теория"
                  value={formState.theoryGroup}
                  onChange={(value) => updateField("theoryGroup", value)}
                  options={theoryGroupOptions}
                  placeholder="Изберете група"
                />
              </div>
              <div
                className="rounded-[20px] border p-4 md:col-span-2"
                style={{ borderColor: "rgba(148, 163, 184, 0.22)" }}
              >
                <Textarea
                  label="Бележка"
                  value={formState.notes}
                  onChange={(value) => updateField("notes", value)}
                  placeholder="Допълнителна информация за администрацията"
                  rows={4}
                />
              </div>
            </div>
          </section>
          </div>
      );
    }

    if (activeAction === "newLesson") {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Тип час" value={formState.lessonType} onChange={(value) => updateField("lessonType", value)} options={selectOptions.lessonType} placeholder="Изберете тип час" required />
          <Select label="Курсист" value={formState.student} onChange={(value) => updateField("student", value)} options={studentOptions} placeholder="Изберете курсист" required />
          <Select label="Инструктор" value={formState.instructor} onChange={(value) => updateField("instructor", value)} options={instructorOptions} placeholder="Изберете инструктор" required />
          <Select label="Автомобил" value={formState.vehicle} onChange={(value) => updateField("vehicle", value)} options={vehicleOptions} placeholder="Изберете автомобил" required />
          <DateField label="Дата" value={formState.lessonDate} onChange={(value) => updateField("lessonDate", value)} required />
          <Input label="Час" value={formState.lessonTime} onChange={(value) => updateField("lessonTime", value)} type="time" required />
          <Select
            label="Продължителност"
            value={formState.duration}
            onChange={(value) => updateField("duration", value)}
            options={selectOptions.duration}
            placeholder="Изберете продължителност"
          />
          {formState.duration === "custom" && (
            <Input
              label="Ръчно минути"
              value={formState.customDurationMinutes}
              onChange={(value) =>
                updateField("customDurationMinutes", value.replace(/\D/g, ""))
              }
              placeholder="Например: 75"
              type="number"
              required
            />
          )}
          <div className="md:col-span-2">
            <Textarea label="Бележка към часа" value={formState.notes} onChange={(value) => updateField("notes", value)} placeholder="Например: начало от централна зона" rows={4} />
          </div>
        </div>
      );
    }

    if (activeAction === "newDocument") {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Тип документ" value={formState.documentType} onChange={(value) => updateField("documentType", value)} options={selectOptions.documentType} placeholder="Изберете тип документ" required />
          <Select label="Курсист" value={formState.student} onChange={(value) => updateField("student", value)} options={studentOptions} placeholder="Изберете курсист" required />
          <Input label="Номер на документа" value={formState.documentNumber} onChange={(value) => updateField("documentNumber", value)} placeholder="Ако има номер" />
          <DateField label="Дата на издаване" value={formState.issueDate} onChange={(value) => updateField("issueDate", value)} />
          <DateField label="Валиден до" value={formState.expiryDate} onChange={(value) => updateField("expiryDate", value)} />
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Качи файл
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all" style={{ background: "var(--bg-panel)", borderColor: "var(--ghost-border)", color: "var(--text-primary)" }}>
              <Upload size={18} />
              <span className="text-sm">{formState.uploadedFileName || "Избери PDF или изображение"}</span>
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={(event) => updateField("uploadedFileName", event.target.files?.[0]?.name ?? "")} />
            </label>
          </div>
          <div className="md:col-span-2">
            <Textarea label="Бележка" value={formState.notes} onChange={(value) => updateField("notes", value)} placeholder="Например: OCR проверка преди запис" rows={4} />
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select label="Курсист" value={formState.student} onChange={(value) => updateField("student", value)} options={studentOptions} placeholder="Изберете курсист" required />
        <Input label="Сума" value={formState.amount} onChange={(value) => updateField("amount", value)} placeholder="Например: 250" type="number" required />
        <Select label="Метод на плащане" value={formState.paymentMethod} onChange={(value) => updateField("paymentMethod", value)} options={selectOptions.paymentMethod} placeholder="Изберете метод" required />
        <DateField label="Дата на плащане" value={formState.paymentDate} onChange={(value) => updateField("paymentDate", value)} required />
        <Input label="Референция" value={formState.reference} onChange={(value) => updateField("reference", value)} placeholder="Квитанция, превод или фактура" />
        <div className="md:col-span-2">
          <Textarea label="Бележка" value={formState.paymentNote} onChange={(value) => updateField("paymentNote", value)} placeholder="Допълнителна информация за плащането" rows={4} />
        </div>
      </div>
    );
  }

  if (!activeAction || !dialogMeta) {
    return null;
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={dialogMeta.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отказ
          </Button>
          <Button
            variant="primary"
            onClick={() => void onConfirm(activeAction, formState)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Записване..." : dialogMeta.confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border p-4" style={{ background: "rgba(15, 23, 42, 0.72)", borderColor: "var(--ghost-border)" }}>
          <p className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Какво трябва да попълните</p>
          <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
            {dialogMeta.description}
          </p>
        </div>
        {submitError && (
          <div
            className="rounded-2xl border p-4 text-sm"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              borderColor: "rgba(239, 68, 68, 0.24)",
              color: "var(--status-error)",
            }}
          >
            {submitError}
          </div>
        )}
        {renderFields()}
      </div>
    </Modal>
  );
}

function DateField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--status-error)' }}> *</span>}
      </label>
      <DatePickerInput
        value={value}
        onChange={onChange}
        className="w-full h-11 rounded-xl px-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        style={{
          background: 'rgba(15, 23, 42, 0.22)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(148, 163, 184, 0.32)',
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 10px 24px rgba(15, 23, 42, 0.08)',
        }}
      />
    </div>
  );
}
