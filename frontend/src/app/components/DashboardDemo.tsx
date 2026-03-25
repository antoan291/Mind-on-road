import { Calendar, Clock, User, Car, MapPin, TrendingUp, AlertCircle, CheckCircle, Plus, Filter, Download } from 'lucide-react';

export function DashboardDemo() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }}>Табло</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Преглед на дейността за днес
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="h-11 px-6 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-[var(--glow-indigo)]"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--ghost-border-medium)',
            }}
          >
            <Filter size={18} />
            <span className="hidden md:inline">Филтри</span>
          </button>
          <button
            className="h-11 px-6 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-[var(--glow-indigo)]"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            <Plus size={18} />
            <span className="hidden md:inline">Нов час</span>
          </button>
        </div>
      </div>

      {/* Key Metrics - Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<User size={20} />}
          label="Активни курсисти"
          value="124"
          change="+12"
          trend="up"
          subtitle="спрямо миналия месец"
        />
        <MetricCard
          icon={<Calendar size={20} />}
          label="Днес"
          value="18"
          subtitle="записани часа"
        />
        <MetricCard
          icon={<Car size={20} />}
          label="Успеваемост"
          value="87%"
          change="+3%"
          trend="up"
          subtitle="от изпити"
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Общо часове"
          value="342"
          subtitle="този месец"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ color: 'var(--text-primary)' }}>Днешен график</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                18 записани часа
              </p>
            </div>
            <button
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: 'var(--primary-accent)' }}
            >
              Виж всички
            </button>
          </div>

          <div className="space-y-3">
            <ScheduleItem
              time="09:00"
              student="Петър Георгиев"
              instructor="Георги Петров"
              location="Централна зона"
              status="active"
            />
            <ScheduleItem
              time="10:30"
              student="Елена Димитрова"
              instructor="Иван Димитров"
              location="Южна зона"
              status="upcoming"
            />
            <ScheduleItem
              time="12:00"
              student="Мартин Иванов"
              instructor="Георги Петров"
              location="Централна зона"
              status="upcoming"
            />
            <ScheduleItem
              time="14:00"
              student="София Николова"
              instructor="Иван Димитров"
              location="Северна зона"
              status="upcoming"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)' }}>
          <h3 className="mb-6" style={{ color: 'var(--text-primary)' }}>Скорошна дейност</h3>
          
          <div className="space-y-4">
            <ActivityItem
              icon={<CheckCircle size={18} style={{ color: 'var(--status-success)' }} />}
              title="Успешен изпит"
              description="Петър Георгиев - Категория B"
              time="Преди 2 часа"
            />
            <ActivityItem
              icon={<User size={18} style={{ color: 'var(--primary-accent)' }} />}
              title="Нова регистрация"
              description="Мария Стоянова"
              time="Преди 3 часа"
            />
            <ActivityItem
              icon={<Calendar size={18} style={{ color: 'var(--status-info)' }} />}
              title="Записан час"
              description="Иван Петков - 15:00"
              time="Преди 5 часа"
            />
            <ActivityItem
              icon={<AlertCircle size={18} style={{ color: 'var(--status-warning)' }} />}
              title="Отменен час"
              description="Георги Димитров"
              time="Преди 1 ден"
            />
          </div>
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--ghost-border)' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Прогрес на курсисти</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Активни курсисти и техния напредък
            </p>
          </div>
          <button
            className="h-10 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all hover:shadow-[var(--glow-indigo)]"
            style={{
              background: 'var(--bg-panel)',
              color: 'var(--text-secondary)',
            }}
          >
            <Download size={16} />
            Експорт
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-panel)' }}>
                <th className="px-6 py-4 text-left">
                  <span className="label-utility">Курсист</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="label-utility">Категория</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="label-utility">Инструктор</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="label-utility">Проведени</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="label-utility">Напредък</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="label-utility">Следващ час</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="label-utility">Статус</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <StudentRow
                name="Петър Георгиев"
                category="B"
                instructor="Георги Петров"
                completed={12}
                total={20}
                nextLesson="Утре 10:00"
                status="success"
                statusLabel="Напреднал"
              />
              <StudentRow
                name="Елена Димитрова"
                category="B"
                instructor="Иван Димитров"
                completed={8}
                total={20}
                nextLesson="Днес 14:00"
                status="warning"
                statusLabel="В процес"
              />
              <StudentRow
                name="Мартин Иванов"
                category="A"
                instructor="Георги Петров"
                completed={15}
                total={18}
                nextLesson="Петък 09:00"
                status="success"
                statusLabel="Напреднал"
              />
              <StudentRow
                name="София Николова"
                category="B"
                instructor="Иван Димитров"
                completed={5}
                total={20}
                nextLesson="Днес 16:00"
                status="info"
                statusLabel="Начинаещ"
              />
              <StudentRow
                name="Георги Тодоров"
                category="C"
                instructor="Стоян Василев"
                completed={18}
                total={25}
                nextLesson="Понеделник 11:00"
                status="success"
                statusLabel="Напреднал"
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid - AI Insights + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights Card */}
        <div 
          className="lg:col-span-2 rounded-xl p-6 border"
          style={{ 
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05), rgba(99, 102, 241, 0.05))',
            borderColor: 'rgba(167, 139, 250, 0.2)',
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--ai-accent), var(--ai-accent-dim))' }}
            >
              <TrendingUp size={24} color="#ffffff" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 style={{ color: 'var(--text-primary)' }}>AI Анализ</h3>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    background: 'rgba(167, 139, 250, 0.15)',
                    color: 'var(--ai-accent)',
                  }}
                >
                  Beta
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Препоръки базирани на данните за последния месец:
              </p>
              <div className="space-y-3">
                <InsightItem
                  text="12 курсисти са готови за записване на изпит"
                  type="success"
                />
                <InsightItem
                  text="Пиков период: Вторник и Четвъртък, 14:00-18:00"
                  type="info"
                />
                <InsightItem
                  text="Препоръчваме допълнителен инструктор за категория B"
                  type="warning"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <QuickStat
            label="Средна успеваемост"
            value="87%"
            color="var(--status-success)"
          />
          <QuickStat
            label="Отменени часове"
            value="3"
            color="var(--status-warning)"
          />
          <QuickStat
            label="Изчакващи заявки"
            value="7"
            color="var(--status-info)"
          />
        </div>
      </div>
    </div>
  );
}

// Component Implementations

function MetricCard({
  icon,
  label,
  value,
  subtitle,
  change,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-panel)', color: 'var(--primary-accent)' }}
        >
          {icon}
        </div>
        {change && (
          <span
            className="text-sm font-medium"
            style={{
              color: trend === 'up' ? 'var(--status-success)' : 'var(--status-error)',
            }}
          >
            {change}
          </span>
        )}
      </div>
      <p className="label-utility mb-2">{label}</p>
      <p className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ScheduleItem({
  time,
  student,
  instructor,
  location,
  status,
}: {
  time: string;
  student: string;
  instructor: string;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
}) {
  const statusColors = {
    active: 'var(--primary-accent)',
    upcoming: 'var(--text-dim)',
    completed: 'var(--status-success)',
  };

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-[var(--bg-panel)]"
      style={{ 
        background: status === 'active' ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
      }}
    >
      <div className="flex flex-col items-center justify-center w-16 flex-shrink-0">
        <div
          className="text-lg font-semibold"
          style={{ color: statusColors[status] }}
        >
          {time.split(':')[0]}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {time.split(':')[1]}
        </div>
      </div>
      
      <div className="w-px h-12" style={{ background: 'var(--ghost-border)' }} />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          {student}
        </p>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1">
            <User size={12} />
            {instructor}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-panel)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {time}
        </p>
      </div>
    </div>
  );
}

function StudentRow({
  name,
  category,
  instructor,
  completed,
  total,
  nextLesson,
  status,
  statusLabel,
}: {
  name: string;
  category: string;
  instructor: string;
  completed: number;
  total: number;
  nextLesson: string;
  status: string;
  statusLabel: string;
}) {
  const progress = (completed / total) * 100;

  return (
    <tr
      className="border-t transition-colors hover:bg-[var(--bg-panel)]"
      style={{ borderColor: 'var(--ghost-border)' }}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span style={{ color: 'var(--text-secondary)' }}>{category}</span>
      </td>
      <td className="px-6 py-4">
        <span style={{ color: 'var(--text-secondary)' }}>{instructor}</span>
      </td>
      <td className="px-6 py-4">
        <span style={{ color: 'var(--text-secondary)' }}>
          {completed} / {total}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                }}
              />
            </div>
            <span className="text-xs font-medium w-12 text-right" style={{ color: 'var(--text-secondary)' }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{nextLesson}</span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={status}>{statusLabel}</StatusBadge>
      </td>
    </tr>
  );
}

function StatusBadge({ status, children }: { status: string; children: React.ReactNode }) {
  const colors = {
    success: { bg: 'var(--status-success-bg)', border: 'var(--status-success-border)', text: 'var(--status-success)' },
    warning: { bg: 'var(--status-warning-bg)', border: 'var(--status-warning-border)', text: 'var(--status-warning)' },
    error: { bg: 'var(--status-error-bg)', border: 'var(--status-error-border)', text: 'var(--status-error)' },
    info: { bg: 'var(--status-info-bg)', border: 'var(--status-info-border)', text: 'var(--status-info)' },
  }[status] || {
    bg: 'var(--status-neutral-bg)',
    border: 'var(--status-neutral-border)',
    text: 'var(--status-neutral)',
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
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.text }} />
      {children}
    </span>
  );
}

function InsightItem({ text, type }: { text: string; type: 'success' | 'info' | 'warning' }) {
  const colors = {
    success: 'var(--status-success)',
    info: 'var(--status-info)',
    warning: 'var(--status-warning)',
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: colors[type] }} />
      <p className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
        {text}
      </p>
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-lg" style={{ background: 'var(--bg-card)' }}>
      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
