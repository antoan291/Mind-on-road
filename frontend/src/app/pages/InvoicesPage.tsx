import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  PageHeader, Badge, Button, Modal
} from '../components/shared';
import { 
  Plus, Download, AlertTriangle, FileText, CheckCircle, 
  AlertCircle, Clock, Users, Receipt, Search, X,
  Filter, Calendar, MoreVertical, Eye,
  Mail, Edit2, FileCheck, ChevronRight, Printer,
  XCircle, Link as LinkIcon, FileX, User, CreditCard,
  Check, FilePlus, Trash2
} from 'lucide-react';
import { mockInvoicePackages } from '../content/mockDb';
import {
  createInvoiceRecord,
  deleteInvoiceRecord,
  fetchInvoiceRecords,
  type InvoiceRecordView,
  updateInvoiceRecord,
} from '../services/invoicesApi';
import type { StudentOperationalRecord } from '../content/studentOperations';
import { fetchStudentOperations } from '../services/studentsApi';
import {
  fetchPaymentRecords,
  type PaymentRecordView,
} from '../services/paymentsApi';
import { useAuthSession } from '../services/authSession';
import { useIsMobile } from '../components/ui/use-mobile';

type Invoice = InvoiceRecordView & {
  id: string | number;
  invoiceNumber: string;
  invoiceDate: string;
  student: string;
  studentId: string | number;
  category: string;
  invoiceReason: string;
  packageType: string;
  totalAmount: number;
  invoiceStatus: 'draft' | 'issued' | 'canceled' | 'corrected' | 'overdue';
  paymentLinkStatus: 'linked' | 'not_linked' | 'partial';
  paymentNumber?: string;
  paymentStatus?: 'paid' | 'partial' | 'overdue' | 'pending';
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
  wasCorrected: boolean;
  correctedBy?: string;
  correctionReason?: string;
  notes?: string;
  issuedDate?: string;
  dueDate?: string;
  vat?: number;
  subtotal?: number;
  activity?: ActivityItem[];
};

type ActivityItem = {
  type: 'created' | 'edited' | 'issued' | 'payment_linked' | 'corrected' | 'canceled' | 'printed';
  description: string;
  timestamp: string;
  user: string;
};

// Helper functions
const getInvoiceStatusLabel = (status: Invoice['invoiceStatus']) => {
  switch (status) {
    case 'draft': return 'Чернова';
    case 'issued': return 'Издадена';
    case 'canceled': return 'Анулирана';
    case 'corrected': return 'Коригирана';
    case 'overdue': return 'Просрочена';
    default: return status;
  }
};

const getInvoiceStatusVariant = (status: Invoice['invoiceStatus']): 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'draft': return 'info';
    case 'issued': return 'success';
    case 'canceled': return 'error';
    case 'corrected': return 'warning';
    case 'overdue': return 'error';
    default: return 'info';
  }
};

const getPaymentLinkStatusLabel = (status: Invoice['paymentLinkStatus']) => {
  switch (status) {
    case 'linked': return 'Свързано';
    case 'not_linked': return 'Без връзка';
    case 'partial': return 'Частично';
    default: return status;
  }
};

const getPaymentLinkStatusVariant = (status: Invoice['paymentLinkStatus']): 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'linked': return 'success';
    case 'not_linked': return 'error';
    case 'partial': return 'warning';
    default: return 'info';
  }
};

const getPaymentStatusLabel = (status?: Invoice['paymentStatus']) => {
  if (!status) return '-';
  switch (status) {
    case 'paid': return 'Платено';
    case 'partial': return 'Частично';
    case 'overdue': return 'Просрочено';
    case 'pending': return 'Очаква';
    default: return status;
  }
};

const getPaymentStatusVariant = (status?: Invoice['paymentStatus']): 'success' | 'warning' | 'error' | 'info' => {
  if (!status) return 'info';
  switch (status) {
    case 'paid': return 'success';
    case 'partial': return 'warning';
    case 'overdue': return 'error';
    case 'pending': return 'info';
    default: return 'info';
  }
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function InvoicesPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [studentSearchValue, setStudentSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<StudentOperationalRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecordView[]>([]);
  const [invoiceEditDraft, setInvoiceEditDraft] = useState({
    invoiceDate: '',
    student: '',
    totalAmount: '',
    invoiceStatus: 'draft' as Invoice['invoiceStatus'],
    paymentLinkStatus: 'not_linked' as Invoice['paymentLinkStatus'],
    notes: '',
  });
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterInvoiceStatus, setFilterInvoiceStatus] = useState('all');
  const [filterPaymentLink, setFilterPaymentLink] = useState('all');
  const [filterCreator, setFilterCreator] = useState('all');
  const [filterDraftsOnly, setFilterDraftsOnly] = useState(false);
  const [filterNoPaymentLink, setFilterNoPaymentLink] = useState(false);
  const [filterCorrectedOnly, setFilterCorrectedOnly] = useState(false);
  const canDeleteInvoices = Boolean(
    session?.user.roleKeys.includes('owner') ||
      session?.user.roleKeys.includes('admin'),
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchInvoiceRecords(),
      fetchStudentOperations(),
      fetchPaymentRecords(),
    ])
      .then(([records, studentRows, paymentRows]) => {
        if (!isMounted) return;
        setInvoices(records as Invoice[]);
        setStudents(studentRows);
        setPayments(paymentRows);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) return;
        setInvoices([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const filteredInvoices = invoices.filter((invoice) => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const invoiceDateIso = toIsoInvoiceDate(invoice.invoiceDate);
    const normalizedStudentSearch = studentSearchValue.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      [invoice.invoiceNumber, invoice.category, invoice.packageType, invoice.invoiceReason, invoice.paymentNumber ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch);
    const matchesStudentSearch =
      !normalizedStudentSearch ||
      invoice.student.toLowerCase().includes(normalizedStudentSearch);
    const matchesCategory =
      filterCategory === 'all' ||
      invoice.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesPeriod =
      filterPeriod === 'all' ||
      isInvoiceInPeriod(invoiceDateIso, filterPeriod, todayIsoDate);
    const matchesInvoiceStatus =
      filterInvoiceStatus === 'all' ||
      invoice.invoiceStatus === filterInvoiceStatus;
    const matchesPaymentLink =
      filterPaymentLink === 'all' ||
      invoice.paymentLinkStatus === filterPaymentLink;
    const matchesDrafts = !filterDraftsOnly || invoice.invoiceStatus === 'draft';
    const matchesNoPayment =
      !filterNoPaymentLink || invoice.paymentLinkStatus === 'not_linked';
    const matchesCorrected =
      !filterCorrectedOnly ||
      invoice.invoiceStatus === 'canceled' ||
      invoice.wasCorrected;

    return (
      matchesSearch &&
      matchesStudentSearch &&
      matchesCategory &&
      matchesPeriod &&
      matchesInvoiceStatus &&
      matchesPaymentLink &&
      matchesDrafts &&
      matchesNoPayment &&
      matchesCorrected
    );
  });

  // Calculate summary metrics
  const totalInvoices = invoices.length;
  const issuedToday = invoices.filter(
    (invoice) =>
      toIsoInvoiceDate(invoice.invoiceDate) === todayIsoDate &&
      invoice.invoiceStatus === 'issued',
  ).length;
  const draftsCount = invoices.filter(i => i.invoiceStatus === 'draft').length;
  const linkedCount = invoices.filter(i => i.paymentLinkStatus === 'linked').length;
  const notLinkedCount = invoices.filter(i => i.paymentLinkStatus === 'not_linked').length;
  const overdueCount = invoices.filter(i => i.invoiceStatus === 'overdue').length;
  const correctedOrCanceledCount = invoices.filter(i => 
    i.invoiceStatus === 'canceled' || i.wasCorrected
  ).length;

  const activeFiltersCount = [
    filterCategory !== 'all',
    filterPeriod !== 'all',
    filterInvoiceStatus !== 'all',
    filterPaymentLink !== 'all',
    filterCreator !== 'all',
    filterDraftsOnly,
    filterNoPaymentLink,
    filterCorrectedOnly,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterCategory('all');
    setFilterPeriod('all');
    setFilterInvoiceStatus('all');
    setFilterPaymentLink('all');
    setFilterCreator('all');
    setFilterDraftsOnly(false);
    setFilterNoPaymentLink(false);
    setFilterCorrectedOnly(false);
    setSearchValue('');
    setStudentSearchValue('');
  };

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenMenuId(null);
  };

  const handlePreview = (invoiceId: string | number) => {
    const invoiceToPreview = invoices.find((invoice) => invoice.id === invoiceId);
    if (invoiceToPreview) {
      setSelectedInvoice(invoiceToPreview);
    }
    setOpenMenuId(null);
  };

  const handleDownload = (invoiceId: string | number) => {
    const invoiceToDownload = invoices.find((invoice) => invoice.id === invoiceId);
    if (invoiceToDownload) {
      downloadInvoiceText(invoiceToDownload);
    }
    setOpenMenuId(null);
  };

  const handlePrint = (invoiceId: string | number) => {
    const invoiceToPrint = invoices.find((invoice) => invoice.id === invoiceId);
    if (invoiceToPrint) {
      downloadInvoiceText(invoiceToPrint);
    }
    setOpenMenuId(null);
  };

  const handleCreateCorrection = (invoiceId: string | number) => {
    const invoiceToEdit = invoices.find((invoice) => invoice.id === invoiceId);
    if (invoiceToEdit) {
      setSelectedInvoice(invoiceToEdit);
      setInvoiceEditDraft({
        invoiceDate: toIsoInvoiceDate(invoiceToEdit.invoiceDate),
        student: invoiceToEdit.student,
        totalAmount: String(invoiceToEdit.totalAmount),
        invoiceStatus: invoiceToEdit.invoiceStatus,
        paymentLinkStatus: invoiceToEdit.paymentLinkStatus,
        notes: invoiceToEdit.notes || '',
      });
      setIsEditInvoiceOpen(true);
    }
    setOpenMenuId(null);
  };

  const handleCancelInvoice = async (invoiceId: string | number) => {
    const updatedInvoice = await updateInvoiceRecord(
      String(invoiceId),
      {
        status: 'CANCELED',
        wasCorrected: true,
        correctionReason: 'Фактурата е анулирана през UI action.',
      },
      session?.csrfToken ?? '',
    );

    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === invoiceId ? (updatedInvoice as Invoice) : invoice,
      ),
    );
    setSelectedInvoice((current) =>
      current?.id === invoiceId ? (updatedInvoice as Invoice) : current,
    );
    setOpenMenuId(null);
  };

  const handleIssueInvoice = async (invoiceId: string | number) => {
    const invoiceToIssue = invoices.find((invoice) => invoice.id === invoiceId);

    if (!invoiceToIssue) {
      return;
    }

    const updatedInvoice = await updateInvoiceRecord(
      String(invoiceId),
      {
        status: 'ISSUED',
        paymentLinkStatus: invoiceToIssue.paymentNumber
          ? 'LINKED'
          : 'NOT_LINKED',
        issuedDate: new Date().toISOString().slice(0, 10),
      },
      session?.csrfToken ?? '',
    );

    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === invoiceId ? (updatedInvoice as Invoice) : invoice,
      ),
    );
    setSelectedInvoice((current) =>
      current?.id === invoiceId ? (updatedInvoice as Invoice) : current,
    );
    setOpenMenuId(null);
  };

  const handleSaveInvoiceEdit = async () => {
    if (!selectedInvoice) {
      return;
    }

    const updatedInvoice = await updateInvoiceRecord(
      String(selectedInvoice.id),
      {
        invoiceDate: invoiceEditDraft.invoiceDate,
        recipientName: invoiceEditDraft.student,
        totalAmount: Math.round(Number(invoiceEditDraft.totalAmount || '0')),
        status: mapUiInvoiceStatusToApi(invoiceEditDraft.invoiceStatus),
        paymentLinkStatus: mapUiPaymentLinkStatusToApi(
          invoiceEditDraft.paymentLinkStatus,
        ),
        notes: invoiceEditDraft.notes.trim() || null,
        wasCorrected: true,
        correctionReason: 'Фактурата е редактирана през UI.',
      },
      session?.csrfToken ?? '',
    );

    setInvoices((currentInvoices) =>
      currentInvoices.map((invoice) =>
        invoice.id === selectedInvoice.id
          ? (updatedInvoice as Invoice)
          : invoice,
      ),
    );
    setSelectedInvoice(updatedInvoice as Invoice);
    setIsEditInvoiceOpen(false);
  };

  const handleDeleteInvoice = async (invoiceId: string | number) => {
    if (!canDeleteInvoices) {
      return;
    }

    const invoice = invoices.find((currentInvoice) => currentInvoice.id === invoiceId);

    if (!invoice) {
      return;
    }

    const shouldDelete = globalThis.confirm(
      `Сигурен ли си, че искаш да изтриеш фактура ${invoice.invoiceNumber}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteInvoiceRecord(String(invoiceId), session?.csrfToken ?? '');
      setInvoices((currentInvoices) =>
        currentInvoices.filter((currentInvoice) => currentInvoice.id !== invoiceId),
      );
      setSelectedInvoice((currentInvoice) =>
        currentInvoice?.id === invoiceId ? null : currentInvoice,
      );
      setIsEditInvoiceOpen(false);
      setOpenMenuId(null);
      setSourceStatus('backend');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Фактурата не можа да бъде изтрита.';
      globalThis.alert(message);
    }
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg-base)' }}>
      {/* Page Header */}
      <PageHeader
        title="Фактури"
        subtitle={`Документен контролен център на автошколата • ${
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
              onClick={() => setFilterNoPaymentLink(!filterNoPaymentLink)}
            >
              Нужна е промяна
            </Button>
            <Button 
              variant="secondary" 
              icon={<Download size={18} />}
              onClick={() => exportInvoicesCsv(invoices)}
            >
              Експорт
            </Button>
            <Button 
              variant="primary" 
              icon={<Plus size={18} />}
              onClick={() => setShowCreateInvoice(true)}
            >
              Нова фактура
            </Button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Summary Telemetry Strip */}
        <div className="grid grid-cols-2 xl:grid-cols-7 gap-4">
          <TelemetryCard
            icon={<FileText size={18} />}
            label="Всички фактури"
            value={`${totalInvoices}`}
            subtitle="записа"
            iconColor="var(--primary-accent)"
          />
          <TelemetryCard
            icon={<CheckCircle size={18} />}
            label="Издадени днес"
            value={`${issuedToday}`}
            subtitle="фактури"
            iconColor="var(--status-success)"
            alert={issuedToday > 0}
          />
          <TelemetryCard
            icon={<FilePlus size={18} />}
            label="Чернови"
            value={`${draftsCount}`}
            subtitle={draftsCount === 1 ? 'чернова' : 'чернови'}
            iconColor="var(--ai-accent)"
            alert={draftsCount > 0}
          />
          <TelemetryCard
            icon={<LinkIcon size={18} />}
            label="Свързани с плащане"
            value={`${linkedCount}`}
            subtitle="фактури"
            iconColor="var(--status-success)"
          />
          <TelemetryCard
            icon={<FileX size={18} />}
            label="Без плащане"
            value={`${notLinkedCount}`}
            subtitle="фактури"
            iconColor="var(--status-error)"
            alert={notLinkedCount > 0}
          />
          <TelemetryCard
            icon={<AlertCircle size={18} />}
            label="Просрочени"
            value={`${overdueCount}`}
            subtitle="фактури"
            iconColor="var(--status-warning)"
            alert={overdueCount > 0}
          />
          <TelemetryCard
            icon={<Edit2 size={18} />}
            label="Коригирани/Анулирани"
            value={`${correctedOrCanceledCount}`}
            subtitle="фактури"
            iconColor="var(--text-secondary)"
          />
        </div>

        {/* Search and Filter Control Bar */}
        <div 
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="relative">
                <Search 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  type="text"
                  placeholder="Търсене по номер на фактура..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border-none outline-none text-base"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="relative">
                <User 
                  size={18} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  type="text"
                  placeholder="Търсене по курсист..."
                  value={studentSearchValue}
                  onChange={(e) => setStudentSearchValue(e.target.value)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <FilterSelect
                  label="Категория"
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={[
                    { value: 'all', label: 'Всички категории' },
                    { value: 'a', label: 'Категория A' },
                    { value: 'b', label: 'Категория B' },
                    { value: 'c', label: 'Категория C' },
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
                  label="Статус на фактура"
                  value={filterInvoiceStatus}
                  onChange={setFilterInvoiceStatus}
                  options={[
                    { value: 'all', label: 'Всички статуси' },
                    { value: 'draft', label: 'Чернова' },
                    { value: 'issued', label: 'Издадена' },
                    { value: 'corrected', label: 'Коригирана' },
                    { value: 'canceled', label: 'Анулирана' },
                  ]}
                />

                <FilterSelect
                  label="Връзка с плащане"
                  value={filterPaymentLink}
                  onChange={setFilterPaymentLink}
                  options={[
                    { value: 'all', label: 'Всички връзки' },
                    { value: 'linked', label: 'Свързани' },
                    { value: 'not_linked', label: 'Без връзка' },
                    { value: 'partial', label: 'Частично' },
                  ]}
                />
              </div>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap gap-2">
                <FilterChip
                  label="Само чернови"
                  active={filterDraftsOnly}
                  onClick={() => setFilterDraftsOnly(!filterDraftsOnly)}
                />
                <FilterChip
                  label="Без връзка с плащане"
                  active={filterNoPaymentLink}
                  onClick={() => setFilterNoPaymentLink(!filterNoPaymentLink)}
                />
                <FilterChip
                  label="Коригирани/Анулирани"
                  active={filterCorrectedOnly}
                  onClick={() => setFilterCorrectedOnly(!filterCorrectedOnly)}
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

        {/* Main Invoices Table */}
        {filteredInvoices.length > 0 ? (
          <div 
            className="rounded-xl overflow-hidden"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Table Header Info */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--ghost-border)' }}>
              <div>
                <h3 className="font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  Всички фактури
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Показани {filteredInvoices.length} от {invoices.length} записа
                </p>
              </div>
            </div>

            {isMobile ? (
              <div className="space-y-3 p-4">
                {filteredInvoices.length === 0 ? (
                  <div
                    className="rounded-2xl p-5 text-sm text-center"
                    style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
                  >
                    Няма фактури по активните филтри.
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <InvoiceMobileCard
                      key={invoice.id}
                      invoice={invoice}
                      formatCurrency={formatCurrency}
                      onOpen={() => handleRowClick(invoice)}
                      onEdit={() => handleCreateCorrection(invoice.id)}
                      onIssue={() => void handleIssueInvoice(invoice.id)}
                      onDownload={() => handleDownload(invoice.id)}
                      onDelete={() => void handleDeleteInvoice(invoice.id)}
                      canDelete={canDeleteInvoices}
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
                        Фактура
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Курсист
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Причина / Пакет
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Обща сума
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Статус
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Плащане
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Създадена от
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, idx) => (
                      <tr
                        key={invoice.id}
                        onClick={() => handleRowClick(invoice)}
                        className="transition-all hover:bg-opacity-50 cursor-pointer group"
                        style={{
                          background: idx % 2 === 0 ? 'transparent' : 'var(--bg-panel-ghost)',
                        }}
                      >
                      {/* Invoice Number & Date */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: invoice.invoiceStatus === 'draft' ? 'var(--ai-accent)' :
                                         invoice.invoiceStatus === 'issued' ? 'var(--status-success)' :
                                         invoice.invoiceStatus === 'canceled' ? 'var(--status-error)' :
                                         invoice.invoiceStatus === 'corrected' ? 'var(--status-warning)' :
                                         'var(--bg-panel)',
                              opacity: invoice.invoiceStatus === 'canceled' ? 0.5 : 1
                            }}
                          >
                            <Receipt size={18} style={{ color: '#ffffff' }} />
                          </div>
                          <div>
                            <p className="text-base font-bold font-mono mb-0.5" style={{ color: 'var(--text-primary)' }}>
                              {invoice.invoiceNumber}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {invoice.invoiceDate}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-base font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                            {invoice.student}
                          </p>
                          <span 
                            className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                            style={{
                              background: 'var(--bg-panel)',
                              color: 'var(--primary-accent)'
                            }}
                          >
                            {invoice.category}
                          </span>
                        </div>
                      </td>

                      {/* Invoice Reason / Package */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                            {invoice.packageType}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {invoice.invoiceReason}
                          </p>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-5 text-right">
                        <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          € {invoice.vat && `(ДДС: ${formatCurrency(invoice.vat)} €)`}
                        </p>
                      </td>

                      {/* Invoice Status */}
                      <td className="px-6 py-5">
                        <Badge 
                          variant={getInvoiceStatusVariant(invoice.invoiceStatus)}
                          size="sm"
                        >
                          {getInvoiceStatusLabel(invoice.invoiceStatus)}
                        </Badge>
                        {invoice.wasCorrected && (
                          <div className="flex items-center gap-1 mt-1">
                            <div 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ background: 'var(--ai-accent)' }}
                            />
                            <span className="text-xs" style={{ color: 'var(--ai-accent)' }}>
                              Коригирана
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Payment Link */}
                      <td className="px-6 py-5">
                        <div>
                          <Badge 
                            variant={getPaymentLinkStatusVariant(invoice.paymentLinkStatus)}
                            size="sm"
                          >
                            {getPaymentLinkStatusLabel(invoice.paymentLinkStatus)}
                          </Badge>
                          {invoice.paymentNumber && (
                            <div className="flex items-center gap-1 mt-1">
                              <CreditCard size={12} style={{ color: 'var(--text-tertiary)' }} />
                              <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                                {invoice.paymentNumber}
                              </span>
                            </div>
                          )}
                          {invoice.paymentStatus && (
                            <div className="mt-1">
                              <Badge 
                                variant={getPaymentStatusVariant(invoice.paymentStatus)}
                                size="sm"
                              >
                                {getPaymentStatusLabel(invoice.paymentStatus)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Created By */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
                            {invoice.createdBy}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {invoice.createdDate.split(' ')[0]}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(invoice);
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
                                setOpenMenuId(openMenuId === invoice.id ? null : invoice.id);
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
                            {openMenuId === invoice.id && (
                              <div 
                                className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-2xl z-50 overflow-hidden"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--ghost-border)' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {invoice.invoiceStatus === 'draft' && (
                                  <button
                                    onClick={() =>
                                      void handleIssueInvoice(invoice.id)
                                    }
                                    className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                    style={{ background: 'transparent' }}
                                  >
                                    <FileCheck size={16} style={{ color: 'var(--status-success)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                      Издай фактура
                                    </span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handlePreview(invoice.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <Eye size={16} style={{ color: 'var(--primary-accent)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Преглед на документа
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDownload(invoice.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <Download size={16} style={{ color: 'var(--text-secondary)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Изтегли PDF
                                  </span>
                                </button>
                                <button
                                  onClick={() => handlePrint(invoice.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <Printer size={16} style={{ color: 'var(--text-secondary)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Принтирай
                                  </span>
                                </button>
                                <div className="h-px" style={{ background: 'var(--ghost-border)' }} />
                                {invoice.invoiceStatus === 'issued' && (
                                  <button
                                    onClick={() => handleCreateCorrection(invoice.id)}
                                    className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                    style={{ background: 'transparent' }}
                                  >
                                    <Edit2 size={16} style={{ color: 'var(--ai-accent)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                      Създай корекция
                                    </span>
                                  </button>
                                )}
                                {(invoice.invoiceStatus === 'draft' || invoice.invoiceStatus === 'issued') && (
                                  <button
                                    onClick={() =>
                                      void handleCancelInvoice(invoice.id)
                                    }
                                    className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                    style={{ background: 'transparent' }}
                                  >
                                    <XCircle size={16} style={{ color: 'var(--status-error)' }} />
                                    <span className="text-sm" style={{ color: 'var(--status-error)' }}>
                                      Анулирай фактура
                                    </span>
                                  </button>
                                )}
                                <div className="h-px" style={{ background: 'var(--ghost-border)' }} />
                                <button
                                  onClick={() => navigate(`/students/${invoice.studentId}`)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <User size={16} style={{ color: 'var(--text-secondary)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Профил на курсиста
                                  </span>
                                </button>
                                {invoice.paymentNumber && (
                                  <button
                                    onClick={() => navigate('/payments')}
                                    className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                    style={{ background: 'transparent' }}
                                  >
                                    <CreditCard size={16} style={{ color: 'var(--text-secondary)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                      Свързано плащане
                                    </span>
                                  </button>
                                )}
                                {canDeleteInvoices && (
                                  <>
                                    <div className="h-px" style={{ background: 'var(--ghost-border)' }} />
                                    <button
                                      onClick={() => void handleDeleteInvoice(invoice.id)}
                                      className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                      style={{ background: 'transparent' }}
                                    >
                                      <Trash2 size={16} style={{ color: 'var(--status-error)' }} />
                                      <span className="text-sm" style={{ color: 'var(--status-error)' }}>
                                        Изтрий фактурата
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
                Общо {filteredInvoices.length}{' '}
                {filteredInvoices.length === 1 ? 'фактура' : 'фактури'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Обща стойност:
                  </span>
                  <span className="text-lg font-bold font-mono" style={{ color: 'var(--primary-accent)' }}>
                    {formatCurrency(
                      filteredInvoices.reduce(
                        (sum, invoice) => sum + invoice.totalAmount,
                        0,
                      ),
                    )}{' '}
                    €
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
              Няма фактури
            </h3>
            <p className="text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
              Все още няма създадени фактури в системата
            </p>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={() => setShowCreateInvoice(true)}
            >
              Създай първата фактура
            </Button>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <Modal
          isOpen={isEditInvoiceOpen}
          onClose={() => setIsEditInvoiceOpen(false)}
          title="Редакция на фактура"
          footer={
            <>
              {canDeleteInvoices && (
                <Button
                  variant="danger"
                  onClick={() =>
                    selectedInvoice
                      ? void handleDeleteInvoice(selectedInvoice.id)
                      : undefined
                  }
                >
                  Изтрий
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setIsEditInvoiceOpen(false)}
              >
                Отказ
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleSaveInvoiceEdit()}
              >
                Запази промените
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl border p-4" style={{ background: 'rgba(15, 23, 42, 0.72)', borderColor: 'var(--ghost-border)' }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Какво трябва да попълните</p>
              <p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Актуализирайте основните данни по фактурата. Промените се записват директно в PostgreSQL.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Номер на фактура</label><input value={selectedInvoice.invoiceNumber} readOnly className="h-11 w-full rounded-xl px-4 text-sm outline-none opacity-80" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Дата на фактура</label><input type="date" value={invoiceEditDraft.invoiceDate} onChange={(event) => setInvoiceEditDraft((current) => ({ ...current, invoiceDate: event.target.value }))} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Курсист</label><input value={invoiceEditDraft.student} onChange={(event) => setInvoiceEditDraft((current) => ({ ...current, student: event.target.value }))} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Сума</label><input type="number" value={invoiceEditDraft.totalAmount} onChange={(event) => setInvoiceEditDraft((current) => ({ ...current, totalAmount: event.target.value }))} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Статус</label><select value={invoiceEditDraft.invoiceStatus} onChange={(event) => setInvoiceEditDraft((current) => ({ ...current, invoiceStatus: event.target.value as Invoice['invoiceStatus'] }))} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}><option value="draft">Чернова</option><option value="issued">Издадена</option><option value="corrected">Коригирана</option><option value="canceled">Анулирана</option><option value="overdue">Просрочена</option></select></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Връзка с плащане</label><select value={invoiceEditDraft.paymentLinkStatus} onChange={(event) => setInvoiceEditDraft((current) => ({ ...current, paymentLinkStatus: event.target.value as Invoice['paymentLinkStatus'] }))} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}><option value="linked">Свързано</option><option value="partial">Частично</option><option value="not_linked">Без връзка</option></select></div>
              <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Бележки</label><textarea value={invoiceEditDraft.notes} onChange={(event) => setInvoiceEditDraft((current) => ({ ...current, notes: event.target.value }))} rows={4} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Detail Drawer */}
      {selectedInvoice && (
        <InvoiceDetailDrawer
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onEdit={() => setIsEditInvoiceOpen(true)}
          formatCurrency={formatCurrency}
          onDownload={handleDownload}
          onPrint={handlePrint}
        />
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoice && (
        <CreateInvoiceModal
          onClose={() => setShowCreateInvoice(false)}
          formatCurrency={formatCurrency}
          students={students}
          payments={payments}
          onSave={async (payload) => {
            const createdInvoice = await createInvoiceRecord(
              payload,
              session?.csrfToken ?? '',
            );
            setInvoices((current) => [createdInvoice as Invoice, ...current]);
            setShowCreateInvoice(false);
            setSourceStatus('backend');
          }}
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

function InvoiceMobileCard({
  invoice,
  formatCurrency,
  onOpen,
  onEdit,
  onIssue,
  onDownload,
  onDelete,
  canDelete,
}: {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
  onOpen: () => void;
  onEdit: () => void;
  onIssue: () => void;
  onDownload: () => void;
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
              {invoice.invoiceNumber}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {invoice.student} · {invoice.invoiceDate}
            </p>
          </div>
          <Badge variant={getInvoiceStatusVariant(invoice.invoiceStatus)} size="sm">
            {getInvoiceStatusLabel(invoice.invoiceStatus)}
          </Badge>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <MobileInfoCard label="Сума" value={`${formatCurrency(invoice.totalAmount)} €`} tone="default" />
        <MobileInfoCard
          label="Плащане"
          value={getPaymentLinkStatusLabel(invoice.paymentLinkStatus)}
          tone={invoice.paymentLinkStatus === 'linked' ? 'success' : invoice.paymentLinkStatus === 'not_linked' ? 'error' : 'warning'}
        />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: 'var(--text-secondary)' }}>Пакет</span>
          <span className="text-right" style={{ color: 'var(--text-primary)' }}>
            {invoice.packageType}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: 'var(--text-secondary)' }}>Причина</span>
          <span className="text-right" style={{ color: 'var(--text-primary)' }}>
            {invoice.invoiceReason}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: 'var(--text-secondary)' }}>Създадена от</span>
          <span className="text-right" style={{ color: 'var(--text-primary)' }}>
            {invoice.createdBy}
          </span>
        </div>
        {invoice.paymentNumber && (
          <div className="flex items-center justify-between gap-3">
            <span style={{ color: 'var(--text-secondary)' }}>Плащане №</span>
            <span className="font-mono text-right" style={{ color: 'var(--text-primary)' }}>
              {invoice.paymentNumber}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" onClick={onOpen}>
          Детайли
        </Button>
        <Button variant="secondary" onClick={onEdit}>
          Редакция
        </Button>
        <Button variant="secondary" onClick={onDownload}>
          PDF
        </Button>
        <Button
          variant={invoice.invoiceStatus === 'draft' ? 'success' : 'secondary'}
          onClick={onIssue}
          disabled={invoice.invoiceStatus !== 'draft'}
        >
          {invoice.invoiceStatus === 'draft' ? 'Издай' : 'Издадена'}
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

function MobileInfoCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'default' | 'success' | 'warning' | 'error';
}) {
  const color =
    tone === 'success'
      ? 'var(--status-success)'
      : tone === 'warning'
        ? 'var(--status-warning)'
        : tone === 'error'
          ? 'var(--status-error)'
          : 'var(--text-primary)';

  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)' }}>
      <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function downloadInvoiceText(invoice: Invoice) {
  const blob = new Blob(
    [
      [
        `Фактура: ${invoice.invoiceNumber}`,
        `Получател: ${invoice.student}`,
        `Дата: ${invoice.invoiceDate}`,
        `Пакет: ${invoice.packageType}`,
        `Основание: ${invoice.invoiceReason}`,
        `Общо: ${invoice.totalAmount} €`,
        `ДДС: ${invoice.vat ?? 0} €`,
        `Статус: ${getInvoiceStatusLabel(invoice.invoiceStatus)}`,
        `Плащане: ${invoice.paymentNumber ?? 'Няма'}`,
      ].join('\n'),
    ],
    { type: 'text/plain;charset=utf-8' },
  );
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `${invoice.invoiceNumber}.txt`;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}

function exportInvoicesCsv(invoices: Invoice[]) {
  const csvRows = [
    'invoiceNumber,student,invoiceDate,totalAmount,status,paymentLinkStatus,paymentNumber',
    ...invoices.map((invoice) =>
      [
        invoice.invoiceNumber,
        invoice.student,
        invoice.invoiceDate,
        invoice.totalAmount,
        getInvoiceStatusLabel(invoice.invoiceStatus),
        getPaymentLinkStatusLabel(invoice.paymentLinkStatus),
        invoice.paymentNumber ?? '',
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = 'invoices_export.csv';
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}

function toIsoInvoiceDate(dateValue?: string) {
  if (!dateValue) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const [day = '', month = '', year = ''] = dateValue.split('.');

  if (!day || !month || !year) {
    return '';
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function isInvoiceInPeriod(
  invoiceDateIso: string,
  filterPeriod: string,
  todayIsoDate: string,
) {
  if (!invoiceDateIso) {
    return false;
  }

  const invoiceDate = new Date(`${invoiceDateIso}T00:00:00.000Z`);
  const today = new Date(`${todayIsoDate}T00:00:00.000Z`);

  if (Number.isNaN(invoiceDate.getTime()) || Number.isNaN(today.getTime())) {
    return false;
  }

  if (filterPeriod === 'today') {
    return invoiceDateIso === todayIsoDate;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(
    (today.getTime() - invoiceDate.getTime()) / dayMs,
  );

  if (filterPeriod === 'week') {
    return diffDays >= 0 && diffDays <= 7;
  }

  if (filterPeriod === 'month') {
    return diffDays >= 0 && diffDays <= 31;
  }

  return true;
}

function mapUiInvoiceStatusToApi(status: Invoice['invoiceStatus']) {
  switch (status) {
    case 'draft':
      return 'DRAFT' as const;
    case 'issued':
      return 'ISSUED' as const;
    case 'canceled':
      return 'CANCELED' as const;
    case 'corrected':
      return 'CORRECTED' as const;
    case 'overdue':
      return 'OVERDUE' as const;
    default:
      return 'DRAFT' as const;
  }
}

function mapUiPaymentLinkStatusToApi(
  status: Invoice['paymentLinkStatus'],
) {
  switch (status) {
    case 'linked':
      return 'LINKED' as const;
    case 'partial':
      return 'PARTIAL' as const;
    case 'not_linked':
      return 'NOT_LINKED' as const;
    default:
      return 'NOT_LINKED' as const;
  }
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

// Filter Chip Component
function FilterChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
      style={{
        background: active ? 'var(--primary-accent)' : 'var(--bg-panel)',
        color: active ? '#ffffff' : 'var(--text-primary)',
      }}
    >
      {label}
    </button>
  );
}

// Invoice Detail Drawer Component
function InvoiceDetailDrawer({
  invoice,
  onClose,
  onEdit,
  formatCurrency,
  onDownload,
  onPrint
}: {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
  formatCurrency: (amount: number) => string;
  onDownload: (id: string | number) => void;
  onPrint: (id: string | number) => void;
}) {
  const navigate = useNavigate();

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
              Детайли на фактурата
            </h2>
            <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              {invoice.invoiceNumber}
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
          {/* Status Banner */}
          <div 
            className="rounded-xl p-5 flex items-center justify-between"
            style={{ 
              background: invoice.invoiceStatus === 'draft' ? 'var(--ai-accent-bg)' :
                         invoice.invoiceStatus === 'issued' ? 'var(--status-success-bg)' :
                         invoice.invoiceStatus === 'canceled' ? 'var(--status-error-bg)' :
                         'var(--bg-panel)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: invoice.invoiceStatus === 'draft' ? 'var(--ai-accent)' :
                             invoice.invoiceStatus === 'issued' ? 'var(--status-success)' :
                             invoice.invoiceStatus === 'canceled' ? 'var(--status-error)' :
                             'var(--bg-panel)',
                }}
              >
                <Receipt size={24} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <Badge 
                  variant={getInvoiceStatusVariant(invoice.invoiceStatus)}
                  size="sm"
                >
                  {getInvoiceStatusLabel(invoice.invoiceStatus)}
                </Badge>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {invoice.issuedDate ? `Издадена на ${invoice.issuedDate}` : 'Все още не е издадена'}
                </p>
              </div>
            </div>
          </div>

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
                {invoice.student.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {invoice.student}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Категория {invoice.category}
                </p>
              </div>
              <button
                onClick={() => navigate(`/students/${invoice.studentId}`)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'var(--bg-base)',
                  color: 'var(--primary-accent)'
                }}
              >
                Профил
              </button>
            </div>
          </div>

          {/* Financial Summary */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Финансова информация
            </p>
            
            <div className="space-y-4">
              {invoice.subtotal && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Стойност без ДДС</span>
                  <span className="text-lg font-mono" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(invoice.subtotal)} €
                  </span>
                </div>
              )}

              {invoice.vat && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>ДДС (20%)</span>
                  <span className="text-lg font-mono" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(invoice.vat)} €
                  </span>
                </div>
              )}

              <div 
                className="flex items-center justify-between py-4 px-4 rounded-lg border-t"
                style={{ 
                  background: 'var(--bg-base)',
                  borderColor: 'var(--ghost-border)'
                }}
              >
                <span className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>Обща сума</span>
                <span className="text-2xl font-bold font-mono" style={{ color: 'var(--primary-accent)' }}>
                  {formatCurrency(invoice.totalAmount)} €
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Детайли на фактурата
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Дата на фактура</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{invoice.invoiceDate}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Категория</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{invoice.category}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Причина за издаване</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {invoice.invoiceReason}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Пакет / Услуга</p>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                  {invoice.packageType}
                </p>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          {invoice.invoiceStatus === 'issued' && (
            <div 
              className="rounded-xl p-5"
              style={{ background: 'var(--bg-panel)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                  Преглед на документа
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDownload(invoice.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                    style={{
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <Download size={14} />
                    PDF
                  </button>
                  <button
                    onClick={() => onPrint(invoice.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                    style={{
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <Printer size={14} />
                    Принтирай
                  </button>
                </div>
              </div>
              
              {/* Invoice Document Preview */}
              <div 
                className="rounded-lg p-6 border"
                style={{ 
                  background: '#ffffff',
                  borderColor: 'var(--ghost-border)',
                  minHeight: '400px'
                }}
              >
                {/* Company Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#6366F1' }}>
                    КурсантAI / MindOnRoad
                  </h3>
                  <p className="text-xs text-gray-600">
                    Автошкола за обучение на водачи
                  </p>
                  <p className="text-xs text-gray-600">
                    гр. София, ул. Примерна 123 | ЕИК: 123456789 | ДДС №: BG123456789
                  </p>
                </div>

                {/* Invoice Title */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">ФАКТУРА</h2>
                  <p className="text-sm font-mono text-gray-700">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">Дата: {invoice.invoiceDate}</p>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Получател</p>
                  <p className="text-base font-semibold text-gray-900">{invoice.student}</p>
                  <p className="text-sm text-gray-600">Категория {invoice.category}</p>
                </div>

                {/* Services Table */}
                <table className="w-full mb-6">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 text-xs uppercase tracking-wide text-gray-600">Описание</th>
                      <th className="text-right py-2 text-xs uppercase tracking-wide text-gray-600">Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-sm text-gray-900">
                        {invoice.packageType} - {invoice.invoiceReason}
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-gray-900">
                        {invoice.subtotal && formatCurrency(invoice.subtotal)} €
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    {invoice.subtotal && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Без ДДС:</span>
                        <span className="font-mono text-gray-900">{formatCurrency(invoice.subtotal)} €</span>
                      </div>
                    )}
                    {invoice.vat && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ДДС (20%):</span>
                        <span className="font-mono text-gray-900">{formatCurrency(invoice.vat)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                      <span className="text-gray-900">Общо:</span>
                      <span className="font-mono" style={{ color: '#6366F1' }}>{formatCurrency(invoice.totalAmount)} €</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Издадена от: {invoice.createdBy} | {invoice.issuedDate}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Link */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Връзка с плащане
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <Badge 
                  variant={getPaymentLinkStatusVariant(invoice.paymentLinkStatus)}
                  size="sm"
                >
                  {getPaymentLinkStatusLabel(invoice.paymentLinkStatus)}
                </Badge>
                {invoice.paymentNumber && (
                  <div className="flex items-center gap-2 mt-2">
                    <CreditCard size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                      {invoice.paymentNumber}
                    </span>
                  </div>
                )}
                {invoice.paymentStatus && (
                  <div className="mt-2">
                    <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Статус на плащане</p>
                    <Badge 
                      variant={getPaymentStatusVariant(invoice.paymentStatus)}
                      size="sm"
                    >
                      {getPaymentStatusLabel(invoice.paymentStatus)}
                    </Badge>
                  </div>
                )}
              </div>
              {invoice.paymentNumber && (
                <button
                  onClick={() => navigate('/payments')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: 'var(--bg-base)',
                    color: 'var(--primary-accent)'
                  }}
                >
                  Към плащането
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div 
              className="rounded-xl p-5"
              style={{ background: 'var(--bg-panel)' }}
            >
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>
                Бележки
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{invoice.notes}</p>
            </div>
          )}

          {/* Activity Timeline */}
          <div 
            className="rounded-xl p-5"
            style={{ background: 'var(--bg-panel)' }}
          >
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
              История на промените
            </p>
            
            <div className="space-y-4">
              {invoice.activity?.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: item.type === 'created' ? 'var(--primary-accent)' :
                                   item.type === 'issued' ? 'var(--status-success)' :
                                   item.type === 'payment_linked' ? 'var(--ai-accent)' :
                                   item.type === 'corrected' ? 'var(--status-warning)' :
                                   item.type === 'canceled' ? 'var(--status-error)' :
                                   'var(--bg-base)'
                      }}
                    >
                      {item.type === 'created' && <Plus size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'edited' && <Edit2 size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'issued' && <FileCheck size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'payment_linked' && <LinkIcon size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'corrected' && <Edit2 size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'canceled' && <XCircle size={14} style={{ color: '#ffffff' }} />}
                      {item.type === 'printed' && <Printer size={14} style={{ color: '#ffffff' }} />}
                    </div>
                    {idx < (invoice.activity?.length || 0) - 1 && (
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
                Създадена от <span style={{ color: 'var(--text-primary)' }}>{invoice.createdBy}</span> на {invoice.createdDate}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Последна промяна от <span style={{ color: 'var(--text-primary)' }}>{invoice.lastUpdatedBy}</span> на {invoice.lastUpdatedDate}
              </p>
              {invoice.wasCorrected && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ai-accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--ai-accent)' }}>
                    Фактурата е била коригирана от {invoice.correctedBy}
                    {invoice.correctionReason && ` - ${invoice.correctionReason}`}
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
          <Button variant="secondary" icon={<Edit2 size={18} />} onClick={onEdit}>
            Редактирай
          </Button>
          <Button 
            variant="secondary" 
            icon={<Download size={18} />}
            onClick={() => onDownload(invoice.id)}
          >
            Изтегли
          </Button>
          <Button 
            variant="primary" 
            icon={<Printer size={18} />}
            onClick={() => onPrint(invoice.id)}
          >
            Принтирай
          </Button>
        </div>
      </div>
    </div>
  );
}

// Create Invoice Modal Component
function CreateInvoiceModal({
  onClose,
  formatCurrency,
  students,
  payments,
  onSave
}: {
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  students: StudentOperationalRecord[];
  payments: PaymentRecordView[];
  onSave: (payload: {
    studentId: string;
    invoiceDate: string;
    recipientName: string;
    categoryCode: string;
    invoiceReason: string;
    packageType: string;
    totalAmount: number;
    status: 'DRAFT' | 'ISSUED';
    paymentLinkStatus: 'LINKED' | 'NOT_LINKED';
    paymentNumber?: string | null;
    paymentStatus?: string | null;
    notes?: string | null;
    issuedDate?: string | null;
    dueDate?: string | null;
  }) => Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [amount, setAmount] = useState('1200.00');
  const [linkedPayment, setLinkedPayment] = useState('');
  const [notes, setNotes] = useState('');

  const studentOptions = students;
  const packages = mockInvoicePackages;
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    const student = studentOptions.find(s => s.id.toString() === studentId);
    if (student) {
      setSelectedCategory(student.category);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    const pkg = packages.find(p => p.id.toString() === packageId);
    if (pkg) {
      setAmount(pkg.price.toFixed(2));
    }
  };

  const submitInvoice = async (status: 'DRAFT' | 'ISSUED') => {
    const student = studentOptions.find(
      (item) => item.id.toString() === selectedStudent,
    );
    const selectedPackageRecord = packages.find(
      (pkg) => pkg.id.toString() === selectedPackage,
    );

    if (!student || !selectedPackageRecord || isSaving) {
      setSaveError('Избери курсист и пакет преди запис на фактура.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await onSave({
        studentId: String(student.id),
        invoiceDate: new Date().toISOString().slice(0, 10),
        recipientName: student.name,
        categoryCode: student.category,
        invoiceReason: 'Такса обучение',
        packageType: selectedPackageRecord.name,
        totalAmount: Math.round(Number(amount || '0')),
        status,
        paymentLinkStatus: linkedPayment ? 'LINKED' : 'NOT_LINKED',
        paymentNumber: linkedPayment || null,
        paymentStatus: linkedPayment ? 'PAID' : 'PENDING',
        notes: notes.trim() || null,
        issuedDate:
          status === 'ISSUED'
            ? new Date().toISOString().slice(0, 10)
            : null,
        dueDate: null,
      });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Фактурата не беше записана в базата.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleIssueInvoice = () => {
    void submitInvoice('ISSUED');
  };

  const handleCreateDraft = () => {
    void submitInvoice('DRAFT');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div 
          className="rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          style={{ background: 'var(--bg-card)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="px-6 py-5 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--ghost-border)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--primary-accent)' }}
              >
                <FilePlus size={24} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Създаване на фактура
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Попълнете данните лесно и бързо
                </p>
              </div>
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

          {/* Progress Steps */}
          <div 
            className="px-6 py-4 border-b"
            style={{ borderColor: 'var(--ghost-border)', background: 'var(--bg-panel)' }}
          >
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                  style={{
                    background: step >= 1 ? 'var(--primary-accent)' : 'var(--bg-base)',
                    color: step >= 1 ? '#ffffff' : 'var(--text-tertiary)'
                  }}
                >
                  1
                </div>
                <p className="text-xs" style={{ color: step >= 1 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  Курсист
                </p>
              </div>
              <div 
                className="flex-1 h-0.5 mx-2"
                style={{ background: step >= 2 ? 'var(--primary-accent)' : 'var(--bg-base)' }}
              />
              <div className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                  style={{
                    background: step >= 2 ? 'var(--primary-accent)' : 'var(--bg-base)',
                    color: step >= 2 ? '#ffffff' : 'var(--text-tertiary)'
                  }}
                >
                  2
                </div>
                <p className="text-xs" style={{ color: step >= 2 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  Пакет
                </p>
              </div>
              <div 
                className="flex-1 h-0.5 mx-2"
                style={{ background: step >= 3 ? 'var(--primary-accent)' : 'var(--bg-base)' }}
              />
              <div className="flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                  style={{
                    background: step >= 3 ? 'var(--primary-accent)' : 'var(--bg-base)',
                    color: step >= 3 ? '#ffffff' : 'var(--text-tertiary)'
                  }}
                >
                  3
                </div>
                <p className="text-xs" style={{ color: step >= 3 ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                  Преглед
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Select Student */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Системата автоматично попълва данните за избрания курсист
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Изберете курсист
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {studentOptions.map(student => (
                      <button
                        key={student.id}
                        onClick={() => handleStudentSelect(student.id.toString())}
                        className="p-4 rounded-lg border-2 transition-all text-left"
                        style={{
                          borderColor: selectedStudent === student.id.toString() ? 'var(--primary-accent)' : 'var(--ghost-border)',
                          background: selectedStudent === student.id.toString() ? 'var(--primary-accent-bg)' : 'var(--bg-panel)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{
                              background: selectedStudent === student.id.toString() ? 'var(--primary-accent)' : 'var(--bg-base)',
                              color: '#ffffff'
                            }}
                          >
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                              {student.name}
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              Категория {student.category}
                            </p>
                          </div>
                          {selectedStudent === student.id.toString() && (
                            <CheckCircle size={24} style={{ color: 'var(--primary-accent)' }} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedStudent && (
                  <div 
                    className="rounded-lg p-4"
                    style={{ background: 'var(--status-success-bg)' }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} style={{ color: 'var(--status-success)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--status-success)' }}>
                        Данните на курсиста са автоматично попълнени
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Package */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Изберете пакет или услуга за фактурирането
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Изберете пакет
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {packages
                      .filter(pkg => !selectedCategory || pkg.category === selectedCategory)
                      .map(pkg => (
                        <button
                          key={pkg.id}
                          onClick={() => handlePackageSelect(pkg.id.toString())}
                          className="p-4 rounded-lg border-2 transition-all text-left"
                          style={{
                            borderColor: selectedPackage === pkg.id.toString() ? 'var(--primary-accent)' : 'var(--ghost-border)',
                            background: selectedPackage === pkg.id.toString() ? 'var(--primary-accent-bg)' : 'var(--bg-panel)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                {pkg.name}
                              </p>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Категория {pkg.category}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold font-mono" style={{ color: 'var(--primary-accent)' }}>
                                {formatCurrency(pkg.price)}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>€</p>
                            </div>
                            {selectedPackage === pkg.id.toString() && (
                              <CheckCircle size={24} style={{ color: 'var(--primary-accent)' }} className="ml-3" />
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Свързване с плащане (опционално)
                  </label>
                  <select
                    value={linkedPayment}
                    onChange={(e) => setLinkedPayment(e.target.value)}
                    className="w-full h-12 rounded-lg px-4 border-none outline-none text-base transition-all focus:shadow-[var(--glow-indigo)]"
                    style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">Без връзка с плащане</option>
                    {payments.map((payment) => (
                      <option key={payment.id} value={payment.number}>
                        {payment.number} - {getPaymentStatusLabel(payment.status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Бележки (опционално)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Добавете бележки към фактурата..."
                    className="w-full rounded-lg px-4 py-3 border-none outline-none text-base transition-all focus:shadow-[var(--glow-indigo)] resize-none"
                    style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <div className="space-y-6">
                <div 
                  className="rounded-lg p-4"
                  style={{ background: 'var(--ai-accent-bg)' }}
                >
                  <div className="flex items-start gap-3">
                    <Eye size={20} style={{ color: 'var(--ai-accent)' }} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ai-accent)' }}>
                        Прегледайте преди издаване
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Можете да създадете чернова или да издадете фактурата директно
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview Summary */}
                <div 
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-panel)' }}
                >
                  <p className="text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--text-tertiary)' }}>
                    Информация за фактурата
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Курсист</p>
                        <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {studentOptions.find(s => s.id.toString() === selectedStudent)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Категория</p>
                        <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {selectedCategory}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Пакет / Услуга</p>
                        <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {packages.find(p => p.id.toString() === selectedPackage)?.name}
                        </p>
                      </div>
                    </div>

                    <div 
                      className="flex items-center justify-between py-4 px-4 rounded-lg border-t"
                      style={{ 
                        background: 'var(--bg-base)',
                        borderColor: 'var(--ghost-border)'
                      }}
                    >
                      <span className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>Обща сума</span>
                      <span className="text-2xl font-bold font-mono" style={{ color: 'var(--primary-accent)' }}>
                        {amount} €
                      </span>
                    </div>

                    {linkedPayment && (
                      <div className="flex items-center gap-2 pt-2">
                        <LinkIcon size={14} style={{ color: 'var(--status-success)' }} />
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Свързана с плащане: <span style={{ color: 'var(--text-primary)' }} className="font-mono">{linkedPayment}</span>
                        </p>
                      </div>
                    )}

                    {notes && (
                      <div className="pt-2 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Бележки</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div 
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--ghost-border)' }}
          >
            {saveError && (
              <p
                className="max-w-xs text-sm"
                style={{ color: 'var(--status-error)' }}
              >
                {saveError}
              </p>
            )}
            <div>
              {step > 1 && (
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(step - 1)}
                >
                  Назад
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={onClose}>
                Отказ
              </Button>
              {step < 3 ? (
                <Button 
                  variant="primary" 
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && !selectedStudent) ||
                    (step === 2 && !selectedPackage)
                  }
                >
                  Напред
                </Button>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    icon={<FilePlus size={18} />}
                    onClick={handleCreateDraft}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Записване...' : 'Запази като чернова'}
                  </Button>
                  <Button 
                    variant="primary" 
                    icon={<FileCheck size={18} />}
                    onClick={handleIssueInvoice}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Записване...' : 'Издай фактура'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
