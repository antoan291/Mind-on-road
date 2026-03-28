import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Button, Input, Modal, Select, Textarea } from "../../components/shared";

type QuickActionKey = "newStudent" | "newLesson" | "newDocument" | "registerPayment";

type DialogFormState = {
  fullName: string;
  phone: string;
  email: string;
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
  onClose: () => void;
  onConfirm: (action: QuickActionKey) => void;
};

const selectOptions = {
  category: [
    { value: "B", label: "Категория B" },
    { value: "A", label: "Категория A" },
    { value: "C", label: "Категория C" },
  ],
  theoryGroup: [
    { value: "group-monday", label: "Група понеделник 18:00" },
    { value: "group-wednesday", label: "Група сряда 18:30" },
    { value: "group-saturday", label: "Група събота 10:00" },
  ],
  lessonType: [
    { value: "practice", label: "Практика" },
    { value: "theory", label: "Теория" },
    { value: "exam-prep", label: "Подготовка за изпит" },
  ],
  instructor: [
    { value: "georgi-petrov", label: "Георги Петров" },
    { value: "ivan-dimitrov", label: "Иван Димитров" },
    { value: "maria-nikolova", label: "Мария Николова" },
  ],
  vehicle: [
    { value: "toyota-yaris", label: "Toyota Yaris CA1234AB" },
    { value: "skoda-fabia", label: "Skoda Fabia B9876CD" },
    { value: "vw-golf", label: "VW Golf CB4567EF" },
  ],
  duration: [
    { value: "60", label: "60 минути" },
    { value: "90", label: "90 минути" },
    { value: "120", label: "120 минути" },
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

function createDefaultFormState(): DialogFormState {
  return {
    fullName: "",
    phone: "",
    email: "",
    category: "",
    theoryGroup: "",
    notes: "",
    lessonType: "",
    student: "",
    instructor: "",
    vehicle: "",
    lessonDate: "",
    lessonTime: "",
    duration: "",
    documentType: "",
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    uploadedFileName: "",
    amount: "",
    paymentMethod: "",
    paymentDate: "",
    reference: "",
    paymentNote: "",
  };
}

export function DashboardQuickActionDialog({ activeAction, onClose, onConfirm }: Props) {
  const [formState, setFormState] = useState<DialogFormState>(createDefaultFormState);

  useEffect(() => {
    if (activeAction) {
      setFormState(createDefaultFormState());
    }
  }, [activeAction]);

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

  function updateField<K extends keyof DialogFormState>(field: K, value: DialogFormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function renderFields() {
    if (activeAction === "newStudent") {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Име и фамилия" value={formState.fullName} onChange={(value) => updateField("fullName", value)} placeholder="Например: Иван Петров" required />
          <Input label="Телефон" value={formState.phone} onChange={(value) => updateField("phone", value)} placeholder="+359 888 123 456" type="tel" required />
          <Input label="Имейл" value={formState.email} onChange={(value) => updateField("email", value)} placeholder="kursist@example.com" type="email" />
          <Select label="Категория" value={formState.category} onChange={(value) => updateField("category", value)} options={selectOptions.category} placeholder="Изберете категория" required />
          <Select label="Група по теория" value={formState.theoryGroup} onChange={(value) => updateField("theoryGroup", value)} options={selectOptions.theoryGroup} placeholder="Изберете група" />
          <div className="md:col-span-2">
            <Textarea label="Бележка" value={formState.notes} onChange={(value) => updateField("notes", value)} placeholder="Допълнителна информация за администрацията" rows={4} />
          </div>
        </div>
      );
    }

    if (activeAction === "newLesson") {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select label="Тип час" value={formState.lessonType} onChange={(value) => updateField("lessonType", value)} options={selectOptions.lessonType} placeholder="Изберете тип час" required />
          <Input label="Курсист" value={formState.student} onChange={(value) => updateField("student", value)} placeholder="Име на курсиста" required />
          <Select label="Инструктор" value={formState.instructor} onChange={(value) => updateField("instructor", value)} options={selectOptions.instructor} placeholder="Изберете инструктор" required />
          <Select label="Автомобил" value={formState.vehicle} onChange={(value) => updateField("vehicle", value)} options={selectOptions.vehicle} placeholder="Изберете автомобил" required />
          <Input label="Дата" value={formState.lessonDate} onChange={(value) => updateField("lessonDate", value)} type="date" required />
          <Input label="Час" value={formState.lessonTime} onChange={(value) => updateField("lessonTime", value)} type="time" required />
          <Select label="Продължителност" value={formState.duration} onChange={(value) => updateField("duration", value)} options={selectOptions.duration} placeholder="Изберете продължителност" />
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
          <Input label="Курсист" value={formState.student} onChange={(value) => updateField("student", value)} placeholder="Име на курсиста" required />
          <Input label="Номер на документа" value={formState.documentNumber} onChange={(value) => updateField("documentNumber", value)} placeholder="Ако има номер" />
          <Input label="Дата на издаване" value={formState.issueDate} onChange={(value) => updateField("issueDate", value)} type="date" />
          <Input label="Валиден до" value={formState.expiryDate} onChange={(value) => updateField("expiryDate", value)} type="date" />
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
        <Input label="Курсист" value={formState.student} onChange={(value) => updateField("student", value)} placeholder="Име на курсиста" required />
        <Input label="Сума" value={formState.amount} onChange={(value) => updateField("amount", value)} placeholder="Например: 250" type="number" required />
        <Select label="Метод на плащане" value={formState.paymentMethod} onChange={(value) => updateField("paymentMethod", value)} options={selectOptions.paymentMethod} placeholder="Изберете метод" required />
        <Input label="Дата на плащане" value={formState.paymentDate} onChange={(value) => updateField("paymentDate", value)} type="date" required />
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
          <Button variant="primary" onClick={() => onConfirm(activeAction)}>
            {dialogMeta.confirmLabel}
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
        {renderFields()}
      </div>
    </Modal>
  );
}
