import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  PageHeader, Badge, Button, Modal, Input, Select, Textarea
} from '../components/shared';
import { 
  Plus, Download, AlertTriangle, DollarSign, CheckCircle, 
  AlertCircle, Clock, Users, FileText, Search, X,
  CreditCard, Receipt, Filter, Calendar,
  TrendingUp, Wallet, User, MoreVertical, Check,
  Mail, Edit2, FileCheck, ChevronRight
} from 'lucide-react';
import { mockPayments } from '../content/mockDb';

type Payment = {
  id: number;
  paymentNumber: string;
  date: string;
  student: string;
  studentId: number;
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
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  const payments: Payment[] = mockPayments as Payment[];

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
    filterOverdueOnly,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterCategory('all');
    setFilterPeriod('all');
    setFilterStatus('all');
    setFilterMethod('all');
    setFilterOverdueOnly(false);
    setSearchValue('');
  };

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setOpenMenuId(null);
  };

  const handleMarkAsPaid = (paymentId: number) => {
    console.log('Mark as paid:', paymentId);
    setOpenMenuId(null);
  };

  const handleSendReminder = (paymentId: number) => {
    console.log('Send reminder:', paymentId);
    setOpenMenuId(null);
  };

  const handleAddCorrection = (paymentId: number) => {
    console.log('Add correction:', paymentId);
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'var(--bg-base)' }}>
      {/* Page Header */}
      <PageHeader
        title="Плащания"
        subtitle="Финансов контролен център на автошколата"
        actions={
          <>
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
            >
              Експорт
            </Button>
            <Button 
              variant="primary" 
              icon={<Plus size={18} />}
            >
              Ново плащане
            </Button>
          </>
        }
      />

      <div className="px-6 lg:px-8 space-y-6">
        {/* Summary Telemetry Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <TelemetryCard
            icon={<Wallet size={18} />}
            label="Обща дължима сума"
            value={`${formatCurrency(totalDue)} лв`}
            iconColor="var(--primary-accent)"
          />
          <TelemetryCard
            icon={<CheckCircle size={18} />}
            label="Платено"
            value={`${formatCurrency(totalPaid)} лв`}
            subtitle={`${((totalPaid / totalDue) * 100).toFixed(0)}%`}
            iconColor="var(--status-success)"
          />
          <TelemetryCard
            icon={<Clock size={18} />}
            label="Остават за плащане"
            value={`${formatCurrency(totalRemaining)} лв`}
            subtitle={`${((totalRemaining / totalDue) * 100).toFixed(0)}%`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    { value: 'cash', label: 'В брой' },
                    { value: 'card', label: 'Карта' },
                    { value: 'transfer', label: 'Банков превод' },
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
                  Показани {payments.length} от {payments.length} записа
                </p>
              </div>
            </div>

            {/* Table */}
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
                  {payments.map((payment, idx) => (
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
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>лв</p>
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
                            {((payment.paidAmount / payment.dueAmount) * 100).toFixed(0)}%
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
                                  onClick={() => handleMarkAsPaid(payment.id)}
                                  className="w-full px-4 py-3 flex items-center gap-3 transition-all hover:bg-opacity-50 text-left"
                                  style={{ background: 'transparent' }}
                                >
                                  <Check size={16} style={{ color: 'var(--status-success)' }} />
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                    Маркирай като платено
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleSendReminder(payment.id)}
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

            {/* Table Footer */}
            <div 
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--ghost-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Общо {payments.length} {payments.length === 1 ? 'плащане' : 'плащания'}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Обща дължима сума:
                  </span>
                  <span className="text-lg font-bold font-mono" style={{ color: 'var(--primary-accent)' }}>
                    {formatCurrency(totalDue)} лв
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
            <Button variant="primary" icon={<Plus size={18} />}>
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
              <Button variant="secondary" onClick={() => setIsEditPaymentOpen(false)}>Отказ</Button>
              <Button variant="primary" onClick={() => setIsEditPaymentOpen(false)}>Запази промените</Button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="rounded-2xl border p-4" style={{ background: 'rgba(15, 23, 42, 0.72)', borderColor: 'var(--ghost-border)' }}>
              <p className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Какво трябва да попълните</p>
              <p className="text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>Редактирайте основните данни по плащането. Формата е подготвена за бъдещо свързване с backend и може да се използва директно като основа за update заявка.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Курсист</label><input defaultValue={selectedPayment.student} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Дата на плащане</label><input defaultValue={selectedPayment.date} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Дължима сума</label><input type="number" defaultValue={selectedPayment.dueAmount} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Платена сума</label><input type="number" defaultValue={selectedPayment.paidAmount} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Метод на плащане</label><select defaultValue={selectedPayment.paymentMethod} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}><option value={selectedPayment.paymentMethod}>{selectedPayment.paymentMethod}</option><option value="В брой">В брой</option><option value="Банков превод">Банков превод</option><option value="Карта">Карта</option></select></div>
              <div><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Статус</label><select defaultValue={selectedPayment.paymentStatus} className="h-11 w-full rounded-xl px-4 text-sm outline-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }}><option value="paid">Платено</option><option value="partial">Частично</option><option value="overdue">Просрочено</option><option value="pending">Очаква</option><option value="canceled">Отказано</option></select></div>
              <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Бележки</label><textarea defaultValue={selectedPayment.notes || ''} rows={4} className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)' }} /></div>
            </div>
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
                  {formatCurrency(payment.dueAmount)} лв
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--ghost-border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Платена сума</span>
                <span className="text-xl font-bold font-mono" style={{ color: 'var(--status-success)' }}>
                  {formatCurrency(payment.paidAmount)} лв
                </span>
              </div>

              {payment.remainingAmount > 0 && (
                <div 
                  className="flex items-center justify-between py-4 px-4 rounded-lg"
                  style={{ background: 'var(--status-error-bg)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--status-error)' }}>Остават за плащане</span>
                  <span className="text-2xl font-bold font-mono" style={{ color: 'var(--status-error)' }}>
                    {formatCurrency(payment.remainingAmount)} лв
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










