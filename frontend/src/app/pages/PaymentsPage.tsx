import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  PageHeader, Badge, Button, Modal, Input, Select, Textarea
} from '../components/shared';
import { 
  Plus, Download, AlertTriangle, DollarSign, CheckCircle, 
  AlertCircle, Clock, Users, FileText, Search, X,
  CreditCard, Receipt, Filter, Calendar,
  TrendingUp, Wallet, User, MoreVertical, Check,
  Mail, Edit2, FileCheck, ChevronRight, Trash2
} from 'lucide-react';
import {
  createPaymentRecord,
  deletePaymentRecord,
  fetchPaymentRecords,
  type PaymentRecordView,
  updatePaymentRecord,
} from '../services/paymentsApi';
import {
  fetchStudentOperations,
} from '../services/studentsApi';
import type { StudentOperationalRecord } from '../content/studentOperations';
import { useAuthSession } from '../services/authSession';
import { useIsMobile } from '../components/ui/use-mobile';

type Payment = PaymentRecordView & {
  id: string | number;
  paymentNumber: string;
  date: string;
  student: string;
  studentId: string | number;
  category: string;
  packageType: string;
  dueAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'partial' | 'overdue' | 'pending' | 'canceled';
  invoiceStatus: 'issued' | 'pending' | 'none';
  invoiceNumber?: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  wasCorrected: boolean;
  correctedBy?: string;
  instructor?: string;
  theoryGroup?: string;
  paymentReason?: string;
  notes?: string;
  createdBy?: string;
  createdDate?: string;
  activity?: ActivityItem[];
};

type ActivityItem = {
  type: 'created' | 'edited' | 'invoice_linked' | 'reminder_sent' | 'status_changed';
  description: string;
  timestamp: string;
  user: string;
};

// Helper functions
const getPaymentStatusLabel = (status: Payment['paymentStatus']) => {
  switch (status) {
    case 'paid': return 'Платено';
    case 'partial': return 'Частично';
    case 'overdue': return 'Просрочено';
    case 'pending': return 'Очаква';
    case 'canceled': return 'Отказано';
    default: return status;
  }
};

const getPaymentStatusVariant = (status: Payment['paymentStatus']): 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'overdue': return 'error';
    case 'pending': return 'info';
    case 'canceled': return 'error';
    default: return 'info';
  }
};

const getInvoiceStatusLabel = (status: Payment['invoiceStatus']) => {
  switch (status) {
    case 'issued': return 'Издадена';
    case 'pending': return 'Обработва се';
    case 'none': return 'Липсва';
    default: return status;
  }
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function PaymentsPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [payments, setPayments] = useState<Payment[]>(
    [],
  );
  const [students, setStudents] = useState<StudentOperationalRecord[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'backend' | 'fallback'>(
    'loading',
  );
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterInvoiceStatus, setFilterInvoiceStatus] = useState('all');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const canDeletePayments = Boolean(
    session?.user.roleKeys.includes('owner') ||
      session?.user.roleKeys.includes('admin'),
  );

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const query = searchValue.trim().toLowerCase();
        const searchMatch =
          !query ||
          [
            payment.student,
            payment.paymentNumber,
            payment.packageType,
            payment.paymentMethod,
            payment.invoiceNumber ?? '',
          ].some((field) => field.toLowerCase().includes(query));

        const categoryMatch =
          filterCategory === 'all' ||
          payment.category.toLowerCase() === filterCategory;

        const statusMatch =
          filterStatus === 'all' || payment.paymentStatus === filterStatus;

        const invoiceMatch =
          filterInvoiceStatus === 'all' ||
          payment.invoiceStatus === filterInvoiceStatus;

        const methodMatch =
          filterMethod === 'all' ||
          payment.paymentMethod.toLowerCase().includes(filterMethod);

        const overdueMatch =
          !filterOverdueOnly || payment.paymentStatus === 'overdue';

        const periodMatch =
          filterPeriod === 'all' ||
          (filterPeriod === 'today' && payment.date === new Date().toISOString().slice(0, 10)) ||
          (filterPeriod === 'week' && isWithinLastDays(payment.date, 7)) ||
          (filterPeriod === 'month' && payment.date.startsWith(new Date().toISOString().slice(0, 7)));

        return (
          searchMatch &&
          categoryMatch &&
          statusMatch &&
          invoiceMatch &&
          methodMatch &&
          overdueMatch &&
          periodMatch
        );
      }),
    [
      payments,
      searchValue,
      filterCategory,
      filterStatus,
      filterMethod,
      filterInvoiceStatus,
      filterOverdueOnly,
      filterPeriod,
    ],
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchPaymentRecords(), fetchStudentOperations()])
      .then(([records, studentRows]) => {
        if (!isMounted) return;
        setPayments(records as Payment[]);
        setStudents(studentRows);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) return;
        setPayments([]);
        setStudents([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate summary metrics
  const totalDue = payments.reduce((sum, p) => sum + p.dueAmount, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalRemaining = payments.reduce((sum, p) => sum + p.remainingAmount, 0);
  const overdueCount = payments.filter(p => p.paymentStatus === 'overdue').length;
  const partialCount = payments.filter(p => p.paymentStatus === 'partial').length;
  const noInvoiceCount = payments.filter(p => p.invoiceStatus === 'none' || p.invoiceStatus === 'pending').length;

  const activeFiltersCount = [
    filterCategory !== 'all',
    filterPeriod !== 'all',
    filterStatus !== 'all',
    filterMethod !== 'all',
    filterInvoiceStatus !== 'all',
    filterOverdueOnly,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterCategory('all');
    setFilterPeriod('all');
    setFilterStatus('all');
    setFilterMethod('all');
    setFilterInvoiceStatus('all');
    setFilterOverdueOnly(false);
    setSearchValue('');
  };

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setOpenMenuId(null);
  };

  const handleEditPayment = (payment: Payment) => {
    handleRowClick(payment);
    setIsEditPaymentOpen(true);
  };

  const handleMarkAsPaid = async (paymentId: string | number) => {
    const paymentToUpdate = payments.find((payment) => payment.id === paymentId);

    if (!paymentToUpdate) {
      return;
    }

    const savedPayment = await updatePaymentRecord(
      String(paymentId),
      {
        amount: paymentToUpdate.dueAmount,
        paidAmount: paymentToUpdate.dueAmount,
        status: 'PAID',
        paidAt: normalizePaymentDate(paymentToUpdate.date),
        method: paymentToUpdate.paymentMethod,
        note: `${paymentToUpdate.notes ?? ''}\nМаркирано като платено от UI action.`.trim(),
      },
      session?.csrfToken ?? '',
    );

    setPayments((currentPayments) =>
      currentPayments.map((payment) =>
        payment.id === paymentId ? (savedPayment as Payment) : payment,
      ),
    );
    setSelectedPayment((current) =>
      current?.id === paymentId ? (savedPayment as Payment) : current,
    );
    setOpenMenuId(null);
  };

  const handleSendReminder = async (paymentId: string | number) => {
    const paymentToUpdate = payments.find((payment) => payment.id === paymentId);

    if (!paymentToUpdate) {
      return;
    }

    const savedPayment = await updatePaymentRecord(
      String(paymentId),
      {
        note: `${paymentToUpdate.notes ?? ''}\nИзпратено е напомняне към родител/курсист.`.trim(),
      },
      session?.csrfToken ?? '',
    );

    setPayments((currentPayments) =>
      currentPayments.map((payment) =>
        payment.id === paymentId
          ? ({
              ...(savedPayment as Payment),
              activity: [
                {
                  type: 'reminder_sent',
                  description: 'Изпратено е напомняне за плащане от action менюто.',
                  timestamp: new Date().toLocaleString('bg-BG'),
                  user: 'Система',
                },
                ...((savedPayment as Payment).activity ?? []),
              ],
            } as Payment)
          : payment,
      ),
    );
    setSelectedPayment((current) =>
      current?.id === paymentId
        ? ({
            ...(savedPayment as Payment),
            activity: [
              {
                type: 'reminder_sent',
                description: 'Изпратено е напомняне за плащане от action менюто.',
                timestamp: new Date().toLocaleString('bg-BG'),
                user: 'Система',
              },
              ...((savedPayment as Payment).activity ?? []),
            ],
          } as Payment)
        : current,
    );
    setOpenMenuId(null);
  };

  const handleAddCorrection = (paymentId: string | number) => {
    const paymentToEdit = payments.find((payment) => payment.id === paymentId);
    if (paymentToEdit) {
      setSelectedPayment(paymentToEdit);
      setIsEditPaymentOpen(true);
    }
    setOpenMenuId(null);
  };

  const handleCreateNewPayment = () => {
    const targetStudent = students[0];

    if (!targetStudent) {
      setSaveError('Няма наличен курсист от базата за създаване на плащане.');
      return;
    }

    const nowIso = new Date().toISOString().slice(0, 10);
    const nextPayment: Payment = {
      id: `draft-${Date.now()}`,
      paymentNumber: `PAY-DRAFT-${Date.now()}`,
      date: nowIso,
      student: targetStudent.name,
      studentId: targetStudent.id,
      category: targetStudent.category,
      packageType: 'Такса обучение',
      dueAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      paymentMethod: 'Банков превод',
      paymentStatus: 'pending',
      invoiceStatus: 'none',
      invoiceNumber: undefined,
      lastUpdatedBy: 'Администратор',
      lastUpdatedDate: nowIso,
      wasCorrected: false,
      notes: 'Нов ръчно подготвен payment draft.',
      activity: [
        {
          type: 'created',
          description: 'Създаден е нов payment draft от бутона "Ново плащане".',
          timestamp: new Date().toLocaleString('bg-BG'),
          user: 'Администратор',
        },
      ],
    };

    setPayments((current) => [nextPayment, ...current]);
    setSelectedPayment(nextPayment);
    setIsEditPaymentOpen(true);
  };

  const handleUpdateSelectedPayment = (updates: Partial<Payment>) => {
    setSelectedPayment((current) =>
      current
        ? {
            ...current,
            ...updates,
            lastUpdatedBy: 'Администратор',
            lastUpdatedDate: new Date().toISOString().slice(0, 10),
            wasCorrected: true,
            correctedBy: 'Администратор',
          }
        : current,
    );
  };

  const handleSaveSelectedPayment = () => {
    if (!selectedPayment) {
      return;
    }

    const normalizedPayment: Payment = {
      ...selectedPayment,
      remainingAmount: Math.max(
        Number(selectedPayment.dueAmount) - Number(selectedPayment.paidAmount),
        0,
      ),
      paymentStatus:
        Number(selectedPayment.paidAmount) >= Number(selectedPayment.dueAmount)
          ? 'paid'
          : Number(selectedPayment.paidAmount) > 0
            ? 'partial'
            : selectedPayment.paymentStatus,
      activity: [
        {
          type: 'edited',
          description: 'Плащането е редактирано и запазено от UI модала.',
          timestamp: new Date().toLocaleString('bg-BG'),
          user: 'Администратор',
        },
        ...(selectedPayment.activity ?? []),
      ],
    };

    const persistPayment = async () => {
      const isDraftPayment = String(normalizedPayment.id).startsWith('draft-');
      const payload = {
        studentId: String(normalizedPayment.studentId),
        amount: Math.round(Number(normalizedPayment.dueAmount)),
        paidAmount: Math.round(Number(normalizedPayment.paidAmount)),
        method: normalizedPayment.paymentMethod,
        status: mapPaymentStatusToApi(normalizedPayment.paymentStatus),
        paidAt: normalizePaymentDate(normalizedPayment.date),
        note: normalizedPayment.notes ?? null,
      };

      setSaveError(null);

      try {
        const savedPayment = isDraftPayment
          ? await createPaymentRecord(payload, session?.csrfToken ?? '')
          : await updatePaymentRecord(
              String(normalizedPayment.id),
              payload,
              session?.csrfToken ?? '',
            );

        setPayments((current) =>
          isDraftPayment
            ? [
                savedPayment as Payment,
                ...current.filter(
                  (payment) => payment.id !== normalizedPayment.id,
                ),
              ]
            : current.map((payment) =>
                payment.id === normalizedPayment.id
                  ? (savedPayment as Payment)
                  : payment,
              ),
        );
        setSelectedPayment(savedPayment as Payment);
        setIsEditPaymentOpen(false);
        setSourceStatus('backend');
      } catch (error) {
        setSaveError(
          error instanceof Error
            ? error.message
            : 'Плащането не беше записано в базата.',
        );
      }
    };

    void persistPayment();
  };

  const handleDeletePayment = async (paymentId: string | number) => {
    if (!canDeletePayments) {
      return;
    }

    const payment = payments.find(
      (currentPayment) => currentPayment.id === paymentId,
    );

    if (!payment) {
      return;
    }

    const shouldDelete = globalThis.confirm(
      `Сигурен ли си, че искаш да изтриеш плащане ${payment.paymentNumber} за ${payment.student}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deletePaymentRecord(String(paymentId), session?.csrfToken ?? '');
      setPayments((currentPayments) =>
        currentPayments.filter((currentPayment) => currentPayment.id !== paymentId),
      );
      setSelectedPayment((currentPayment) =>
        currentPayment?.id === paymentId ? null : currentPayment,
      );
      setIsEditPaymentOpen(false);
      setOpenMenuId(null);
      setSourceStatus('backend');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Плащането не можа да бъде изтрито.';
      globalThis.alert(message);
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg-base)' }}>
      {/* Page Header */}
      <PageHeader
        title="Плащания"
        subtitle={`Финансов контролен център на автошколата • ${
          sourceStatus === 'backend'
            ? 'Данни от PostgreSQL'
            : sourceStatus === 'fallback'
              ? 'Fallback към локални тестови данни'
              : 'Зареждане...'
        }`}
        actions={
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-wrap justify-end'} gap-2`}>
            <Button 
              variant="secondary" 
              icon={<AlertTriangle size={18} />}
              onClick={() => setFilterOverdueOnly(!filterOverdueOnly)}
            >
              Просрочени
            </Button>
            <Button 
              variant="secondary" 
              icon={<Download size={18} />}
              onClick={() => exportPaymentsCsv(filteredPayments)}
            >
              Експорт
            </Button>
            <Button 
              variant="primary" 
              icon={<Plus size={18} />}
              onClick={handleCreateNewPayment}
            >
              Ново плащане
            </Button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Summary Telemetry Strip */}
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
          <TelemetryCard
            icon={<Wallet size={18} />}
            label="Обща дължима сума"
            value={`${formatCurrency(totalDue)} €`}
            iconColor="var(--primary-accent)"
          />
          <TelemetryCard
            icon={<CheckCircle size={18} />}
            label="Платено"
            value={`${formatCurrency(totalPaid)} €`}
            subtitle={`${calculateSafePercent(totalPaid, totalDue)}%`}
            iconColor="var(--status-success)"
          />
          <TelemetryCard
            icon={<Clock size={18} />}
            label="Остават за плащане"
            value={`${formatCurrency(totalRemaining)} €`}
            subtitle={`${calculateSafePercent(totalRemaining, totalDue)}%`}
            iconColor="var(--status-warning)"
            alert={totalRemaining > 0}
          />
          <TelemetryCard
            icon={<AlertCircle size={18} />}
            label="Просрочени плащания"
            value={`${overdueCount}`}
            subtitle={overdueCount === 1 ? 'плащане' : 'плащания'}
            iconColor="var(--status-error)"
            alert={overdueCount > 0}
          />
          <TelemetryCard
            icon={<Users size={18} />}
            label="Частично платили"
            value={`${partialCount}`}
            subtitle={partialCount === 1 ? 'курсист' : 'курсисти'}
            iconColor="var(--ai-accent)"
          />
          <TelemetryCard
            icon={<Receipt size={18} />}
            label="Без фактура"
            value={`${noInvoiceCount}`}
            subtitle={noInvoiceCount === 1 ? 'плащане' : 'плащания'}
            iconColor="var(--text-secondary)"
            alert={noInvoiceCount > 0}
          />
        </div>

        {/* Search and Filter Control Bar */}
        <div 
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  type="text"
                  placeholder="Търсене по курсист, номер на плащане..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border-none outline-none text-base"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                background: showFilters ? 'var(--primary-accent)' : 'var(--bg-panel)',
                color: showFilters ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              <Filter size={18} />
              Филтри
              {activeFiltersCount > 0 && (
                <span 
                  className="ml-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: showFilters ? 'rgba(255,255,255,0.2)' : 'var(--primary-accent)',
                    color: '#ffffff'
                  }}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <FilterSelect
                  label="Категория"
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={[
                    { value: 'all', label: 'Всички категории' },
                    { value: 'b', label: 'Категория B' },
                  ]}
                />

                <FilterSelect
                  label="Период"
                  value={filterPeriod}
                  onChange={setFilterPeriod}
                  options={[
                    { value: 'all', label: 'Всички периоди' },
                    { value: 'today', label: 'Днес' },
                    { value: 'week', label: 'Тази седмица' },
                    { value: 'month', label: 'Този месец' },
                  ]}
                />

                <FilterSelect
                  label="Статус на плащане"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'all', label: 'Всички статуси' },
                    { value: 'paid', label: 'Платено' },
                    { value: 'partial', label: 'Частично платено' },
                    { value: 'overdue', label: 'Просрочено' },
                    { value: 'pending', label: 'Очаква плащане' },
                  ]}
                />

                <FilterSelect
                  label="Метод на плащане"
                  value={filterMethod}
                  onChange={setFilterMethod}
                  options={[
                    { value: 'all', label: 'Всички методи' },
                    { value: 'брой', label: 'В брой' },
                    { value: 'карта', label: 'Карта' },
                    { value: 'банков', label: 'Банков превод' },
                  ]}
                />

                <FilterSelect
                  label="Фактура"
                  value={filterInvoiceStatus}
                  onChange={setFilterInvoiceStatus}
                  options={[
                    { value: 'all', label: 'Всички фактури' },
                    { value: 'issued', label: 'С издадена фактура' },
                    { value: 'pending', label: 'Очаква обработка' },
                    { value: 'none', label: 'Без фактура' },
                  ]}
                />
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Активни {activeFiltersCount} {activeFiltersCount === 1 ? 'филтър' : 'филтри'}
                  </p>
                  <Button 
                    variant="ghost" 
                    icon={<X size={16} />}
                    onClick={clearAllFilters}
                  >
                    Изчисти всички
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Payments Table */}
        {payments.length > 0 ? (
          <div 
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Table Header Info */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--ghost-border)' }}>
              <div>
                <h3 className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  Всички плащания
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Показани {filteredPayments.length} от {payments.length} записа
                </p>
              </div>
            </div>

            {isMobile ? (
              <div className="space-y-3 p-4">
                {filteredPayments.length === 0 ? (
                  <div
                    className="rounded-2xl p-5 text-sm text-center"
                    style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
                  >
                    Няма плащания по активните филтри.
                  </div>
                ) : (
                  filteredPayments.map((payment) => (
                    <PaymentMobileCard
                      key={payment.id}
                      payment={payment}
                      formatCurrency={formatCurrency}
                      onOpen={() => handleRowClick(payment)}
                      onEdit={() => handleEditPayment(payment)}
                      onMarkAsPaid={() => void handleMarkAsPaid(payment.id)}
                      onOpenStudent={() => navigate(`/students/${payment.studentId}`)}
                      onDelete={() => void handleDeletePayment(payment.id)}
                      canDelete={canDeletePayments}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--bg-panel)' }}>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Курсист
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Пакет / Услуга
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Дължима сума
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Платена сума
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Остават
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Статус
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Фактура
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment, idx) => (
                      <tr
                        key={payment.id}
                        onClick={() => handleRowClick(payment)}
                        className="transition-all hover:bg-opacity-50 cursor-pointer group"
                        style={{
                          background: idx % 2 === 0 ? 'transparent' : 'var(--bg-panel-ghost)',
                        }}
                      >
                      {/* Student */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                              color: '#ffffff'
                            }}
                          >
                            {payment.student.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                              {payment.student}
                            </p>
                            <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                              {payment.paymentNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Package Type */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                            {payment.packageType}
                          </p>
                          <div className="flex items-center gap-2">
                            <span 
                              className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                              style={{
                                background: 'var(--bg-panel)',
                                color: 'var(--primary-accent)'
                              }}
                            >
                              {payment.category}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {payment.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Due Amount */}
                      <td className="px-6 py-5 text-right">
                        <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(payment.dueAmount)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>€</p>
                      </td>

                      {/* Paid Amount */}
                      <td className="px-6 py-5 text-right">
                        <p 
                          className="text-lg font-bold font-mono" 
                          style={{ 
                            color: payment.paidAmount > 0 ? 'var(--status-success)' : 'var(--text-tertiary)' 
                          }}
                        >
                          {formatCurrency(payment.paidAmount)}
                        </p>
                        {payment.paidAmount > 0 && payment.remainingAmount > 0 && (
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {calculateSafePercent(payment.paidAmount, payment.dueAmount)}%
                          </p>
                        )}
                      </td>

                      {/* Remaining Amount */}
                      <td className="px-6 py-5 text-right">
                        {payment.remainingAmount > 0 ? (
                          <>
                            <p 
                              className="text-lg font-bold font-mono" 
                              style={{ color: 'var(--status-error)' }}
                            >
                              {formatCurrency(payment.remainingAmount)}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>остават</p>
                          </>
                        ) : (
                          <p className="text-lg font-mono" style={{ color: 'var(--text-tertiary)' }}>—</p>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-5">
                        <Badge 
                          variant={getPaymentStatusVariant(payment.paymentStatus)}
                          size="sm"
                        >
                          {getPaymentStatusLabel(payment.paymentStatus)}
                        </Badge>
                        {payment.wasCorrected && (
                          <div className="flex items-center gap-1 mt-1">
                            <div 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ background: 'var(--ai-accent)' }}
                            />
                            <span className="text-xs" style={{ color: 'var(--ai-accent)' }}>
                              Коригирано
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Invoice Status */}
                      <td className="px-6 py-5">
                        {payment.invoiceStatus === 'issued' && payment.invoiceNumber ? (
                          <div className="flex items-center gap-2">
                            <Receipt size={14} style={{ color: 'var(--status-success)' }} />
                            <span className="text-sm font-medium font-mono" style={{ color: 'var(--text-primary)' }}>
                              {payment.invoiceNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            {getInvoiceStatusLabel(payment.invoiceStatus)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(payment);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium"
                            style={{
                              background: 'var(--primary-accent)',
                              color: '#ffffff'
                            }}
                          >
                            Детайли
                            <ChevronRight size={14} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === payment.id ? null : payment.id);
                              }}
                              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                              style={{
                                background: 'var(--bg-panel)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Actions Menu */}
                            {openMenuId === payment.id && (
                              <div 
                                className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-2xl z-50 overflow-hidden"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => void handleMarkAsPaid(payment.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <Check size={16} style={{ color: 'var(--status-success)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Маркирай като платено
                                  </span>
                                </button>
                                <button
                                  onClick={() => void handleSendReminder(payment.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <Mail size={16} style={{ color: 'var(--primary-accent)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Изпрати напомняне
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleAddCorrection(payment.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <Edit2 size={16} style={{ color: 'var(--ai-accent)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Добави корекция
                                  </span>
                                </button>
                                <div className="h-px" style={{ background: 'var(--ghost-border)' }} />
                                <button
                                  onClick={() => navigate(`/students/${payment.studentId}`)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <User size={16} style={{ color: 'var(--text-secondary)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Профил на курсиста
                                  </span>
                                </button>
                                {canDeletePayments && (
                                  <>
                                    <div className="h-px" style={{ background: 'var(--ghost-border)' }} />
                                    <button
                                      onClick={() => void handleDeletePayment(payment.id)}
                                      className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                      style={{ background: 'transparent' }}
                                    >
                                      <Trash2 size={16} style={{ color: 'var(--status-error)' }} />
                                      <span className="text-sm" style={{ color: 'var(--status-error)' }}>
                                        Изтрий плащането
                                      </span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div 
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--ghost-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Общо {filteredPayments.length} {filteredPayments.length === 1 ? 'плащане' : 'плащания'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Обща дължима сума:
                  </span>
                  <span className="text-lg font-bold font-mono" style={{ color: 'var(--primary-accent)' }}>
                    {formatCurrency(totalDue)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div 
            className="rounded-xl p-12 text-center"
            style={{ background: 'var(--bg-card)' }}
          >
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--bg-panel)' }}
            >
              <FileText size={32} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Няма плащания
            </h3>
            <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
              Все още няма записани плащания в системата
            </p>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={handleCreateNewPayment}
            >
              Създай първото плащане
            </Button>
          </div>
        )}
      </div>


      {selectedPayment && (
        <Modal
          isOpen={isEditPaymentOpen}
          onClose={() => setIsEditPaymentOpen(false)}
          title="Редакция на плащане"
          footer={
            <>
              {canDeletePayments && (
                <Button
                  variant="danger"
                  onClick={() =>
                    selectedPayment
                      ? void handleDeletePayment(selectedPayment.id)
                      : undefined
                  }
                >
                  Изтрий
                </Button>
              )}
              <Button variant="secondary" onClick={() => setIsEditPaymentOpen(false)}>Отказ</Button>
              <Button variant="primary" onClick={handleSaveSelectedPayment}>Запази промените</Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl border p-4" style={{ background: 'rgba(15, 23, 42, 0.72)', borderColor: 'var(--ghost-border)' }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Какво трябва да попълните</p>
              <p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Редактирайте основните данни по плащането. Промените се записват директно в PostgreSQL.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Курсист</label><select value={String(selectedPayment.studentId)} onChange={(event) => { const selectedStudent = students.find((student) => String(student.id) === event.target.value); if (selectedStudent) { handleUpdateSelectedPayment({ studentId: selectedStudent.id, student: selectedStudent.name, category: selectedStudent.category }); } }} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}>{students.length === 0 ? <option value={String(selectedPayment.studentId)}>{selectedPayment.student}</option> : students.map((student) => (<option key={student.id} value={String(student.id)}>{student.name} · Кат. {student.category}</option>))}</select></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Дата на плащане</label><input type="date" value={selectedPayment.date} onChange={(event) => handleUpdateSelectedPayment({ date: event.target.value })} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Дължима сума</label><input type="number" value={selectedPayment.dueAmount} onChange={(event) => handleUpdateSelectedPayment({ dueAmount: Number(event.target.value) })} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Платена сума</label><input type="number" value={selectedPayment.paidAmount} onChange={(event) => handleUpdateSelectedPayment({ paidAmount: Number(event.target.value) })} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Метод на плащане</label><select value={selectedPayment.paymentMethod} onChange={(event) => handleUpdateSelectedPayment({ paymentMethod: event.target.value })} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}><option value="В брой">В брой</option><option value="Банков превод">Банков превод</option><option value="Карта">Карта</option></select></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Статус</label><select value={selectedPayment.paymentStatus} onChange={(event) => handleUpdateSelectedPayment({ paymentStatus: event.target.value as Payment['paymentStatus'] })} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}><option value="paid">Платено</option><option value="partial">Частично</option><option value="overdue">Просрочено</option><option value="pending">Очаква</option><option value="canceled">Отказано</option></select></div>
              <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Бележки</label><textarea value={selectedPayment.notes || ''} onChange={(event) => handleUpdateSelectedPayment({ notes: event.target.value })} rows={4} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
            </div>
            {saveError && (
              <p className="text-sm" style={{ color: 'var(--status-error)' }}>
                {saveError}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Payment Detail Drawer */}
      {selectedPayment && (
        <PaymentDetailDrawer
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onEdit={() => setIsEditPaymentOpen(true)}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Click outside menu to close */}
      {openMenuId !== null && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
}

function exportPaymentsCsv(payments: Payment[]) {
  const csvRows = [
    'Номер на плащане;Курсист;Дата;Дължима сума;Платена сума;Оставаща сума;Статус;Метод;История',
    ...payments.map((payment) =>
      [
        payment.paymentNumber,
        payment.student,
        payment.date,
        payment.dueAmount,
        payment.paidAmount,
        payment.remainingAmount,
        getPaymentStatusLabel(payment.paymentStatus),
        payment.paymentMethod,
        (payment.activity ?? [])
          .map(
            (entry) =>
              `${entry.timestamp} · ${entry.user} · ${entry.description}`,
          )
          .join(' | '),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(';'),
    ),
  ];
  const blob = new Blob([`\uFEFF${csvRows.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'plashtania_export.csv';
  globalThis.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
}

function PaymentMobileCard({
  payment,
  formatCurrency,
  onOpen,
  onEdit,
  onMarkAsPaid,
  onOpenStudent,
  onDelete,
  canDelete,
}: {
  payment: Payment;
  formatCurrency: (amount: number) => string;
  onOpen: () => void;
  onEdit: () => void;
  onMarkAsPaid: () => void;
  onOpenStudent: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{ background: 'var(--bg-panel)', border: '1px solid var(--ghost-border)' }}
    >
      <button onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {payment.student}
            </p>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {payment.paymentNumber} · {payment.date}
            </p>
          </div>
          <Badge variant={getPaymentStatusVariant(payment.paymentStatus)} size="sm">
            {getPaymentStatusLabel(payment.paymentStatus)}
          </Badge>
        </div>
      </button>

      <div className="grid grid-cols-3 gap-3">
        <MoneyInfo label="Дължи" value={`${formatCurrency(payment.dueAmount)} €`} tone="default" />
        <MoneyInfo label="Платено" value={`${formatCurrency(payment.paidAmount)} €`} tone="success" />
        <MoneyInfo
          label="Остават"
          value={payment.remainingAmount > 0 ? `${formatCurrency(payment.remainingAmount)} €` : '0.00 €'}
          tone={payment.remainingAmount > 0 ? 'error' : 'muted'}
        />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: 'var(--text-secondary)' }}>Пакет</span>
          <span className="text-right" style={{ color: 'var(--text-primary)' }}>
            {payment.packageType}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: 'var(--text-secondary)' }}>Метод</span>
          <span style={{ color: 'var(--text-primary)' }}>{payment.paymentMethod}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: 'var(--text-secondary)' }}>Фактура</span>
          <span style={{ color: 'var(--text-primary)' }}>
            {payment.invoiceNumber ?? getInvoiceStatusLabel(payment.invoiceStatus)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onEdit}>
          Редакция
        </Button>
        <Button variant="secondary" onClick={onOpenStudent}>
          Профил
        </Button>
        <Button variant="primary" onClick={onOpen}>
          Детайли
        </Button>
        <Button
          variant={payment.paymentStatus === 'paid' ? 'success' : 'secondary'}
          onClick={onMarkAsPaid}
          disabled={payment.paymentStatus === 'paid'}
        >
          {payment.paymentStatus === 'paid' ? 'Платено' : 'Маркирай платено'}
        </Button>
        {canDelete && (
          <Button variant="danger" onClick={onDelete}>
            Изтрий
          </Button>
        )}
      </div>
    </div>
  );
}

function MoneyInfo({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'default' | 'success' | 'error' | 'muted';
}) {
  const color =
    tone === 'success'
      ? 'var(--status-success)'
      : tone === 'error'
        ? 'var(--status-error)'
        : tone === 'muted'
          ? 'var(--text-tertiary)'
          : 'var(--text-primary)';

  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)' }}>
      <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold font-mono" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function calculateSafePercent(value: number, total: number) {
  if (total <= 0) {
    return '0';
  }

  return ((value / total) * 100).toFixed(0);
}

function isWithinLastDays(dateValue: string, days: number) {
  const recordTime = new Date(`${dateValue}T00:00:00.000Z`).getTime();

  if (Number.isNaN(recordTime)) {
    return false;
  }

  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  return recordTime >= cutoffTime;
}

function mapPaymentStatusToApi(status: Payment['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'PAID' as const;
    case 'partial':
      return 'PARTIAL' as const;
    case 'overdue':
      return 'OVERDUE' as const;
    case 'canceled':
      return 'CANCELED' as const;
    default:
      return 'PENDING' as const;
  }
}

function normalizePaymentDate(dateValue: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const [day = '', month = '', year = ''] = dateValue.split('.');

  if (!day || !month || !year) {
    return new Date().toISOString().slice(0, 10);
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Telemetry Card Component
function TelemetryCard({
  icon,
  label,
  value,
  subtitle,
  iconColor,
  alert = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  iconColor: string;
  alert?: boolean;
}) {
  return (
    <div 
      className="rounded-xl p-4 relative overflow-hidden transition-all hover:shadow-[var(--glow-indigo)]"
      style={{ background: 'var(--bg-card)' }}
    >
      {alert && (
        <div 
          className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
          style={{ background: 'var(--status-error)' }}
        />
      )}
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-panel)' }}
        >
          <div style={{ color: iconColor }}>
            {icon}
          </div>
        </div>
      </div>
      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Filter Select Component
function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-lg px-3 border-none outline-none text-sm transition-all focus:shadow-[var(--glow-indigo)]"
        style={{
          background: 'var(--bg-panel)',
          color: 'var(--text-primary)',
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Payment Detail Drawer Component
function PaymentDetailDrawer({
  payment,
  onClose,
  onEdit,
  formatCurrency
}: {
  payment: Payment;
  onClose: () => void;
  onEdit: () => void;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      />

      <div
        onClick={(event) => event.stopPropagation()}
        className="relative h-full w-full max-w-2xl overflow-y-auto shadow-2xl"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div 
          className="sticky top-0 px-6 py-5 border-b flex items-center justify-between"
          style={{ 
            borderColor: 'var(--ghost-border)',
            background: 'var(--bg-card)'
          }}
        >
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Детайли на плащането
            </h2>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              {payment.paymentNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{
              background: 'var(--bg-panel)',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Информация за курсиста
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-semibold"
                style={{
                  background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                  color: '#ffffff'
                }}
              >
                {payment.student.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {payment.student}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Категория {payment.category} • {payment.instructor}
                </p>
              </div>
            </div>
            {payment.theoryGroup && payment.theoryGroup !== '-' && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Теория: {payment.theoryGroup}
              </p>
            )}
          </div>

          {/* Payment Summary */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Финансова информация
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--ghost-border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Дължима сума</span>
                <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(payment.dueAmount)} €
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--ghost-border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Платена сума</span>
                <span className="text-xl font-bold font-mono" style={{ color: 'var(--status-success)' }}>
                  {formatCurrency(payment.paidAmount)} €
                </span>
              </div>

              {payment.remainingAmount > 0 && (
                <div 
                  className="flex items-center justify-between py-4 px-4 rounded-lg"
                  style={{ background: 'var(--status-error-bg)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--status-error)' }}>Остават за плащане</span>
                  <span className="text-2xl font-bold font-mono" style={{ color: 'var(--status-error)' }}>
                    {formatCurrency(payment.remainingAmount)} €
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Детайли на плащането
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Дата на плащане</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{payment.date}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Метод на плащане</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Статус</p>
                <Badge variant={getPaymentStatusVariant(payment.paymentStatus)} size="sm">
                  {getPaymentStatusLabel(payment.paymentStatus)}
                </Badge>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Фактура</p>
                {payment.invoiceNumber ? (
                  <div className="flex items-center gap-2">
                    <Receipt size={14} style={{ color: 'var(--status-success)' }} />
                    <p className="text-base font-medium font-mono" style={{ color: 'var(--text-primary)' }}>
                      {payment.invoiceNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-base" style={{ color: 'var(--text-tertiary)' }}>Липсва</p>
                )}
              </div>
              <div className="col-span-2">
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Причина за плащане</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {payment.paymentReason || 'Не е посочена'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Пакет / Услуга</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {payment.packageType}
                </p>
              </div>
            </div>

            {payment.notes && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Бележки</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{payment.notes}</p>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
              История на промените
            </p>
            
            <div className="space-y-4">
              {payment.activity?.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: item.type === 'created' ? 'var(--primary-accent)' :
                                   item.type === 'status_changed' ? 'var(--status-success)' :
                                   item.type === 'invoice_linked' ? 'var(--ai-accent)' :
                                   item.type === 'reminder_sent' ? 'var(--status-warning)' :
                                   'var(--bg-base)'
                      }}
                    >
                      {item.type === 'created' && <Plus size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'edited' && <Edit2 size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'status_changed' && <Check size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'invoice_linked' && <FileCheck size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'reminder_sent' && <Mail size={14} style={{ color: '#ffffff' }} />}
                    </div>
                    {idx < (payment.activity?.length || 0) - 1 && (
                      <div 
                        className="w-px flex-1 mt-2"
                        style={{ background: 'var(--ghost-border)', minHeight: '20px' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {item.description}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {item.user} • {item.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Record Info */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Информация за записа
            </p>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Създадено от <span style={{ color: 'var(--text-primary)' }}>{payment.createdBy}</span> на {payment.createdDate}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Последна промяна от <span style={{ color: 'var(--text-primary)' }}>{payment.lastUpdatedBy}</span> на {payment.lastUpdatedDate}
              </p>
              {payment.wasCorrected && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ai-accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--ai-accent)' }}>
                    Плащането е било коригирано от {payment.correctedBy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className="sticky bottom-0 px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ 
            borderColor: 'var(--ghost-border)',
            background: 'var(--bg-card)'
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Затвори
          </Button>
          <Button variant="primary" icon={<Edit2 size={18} />} onClick={onEdit}>
            Редактирай
          </Button>
        </div>
      </div>
    </div>
  );
}
