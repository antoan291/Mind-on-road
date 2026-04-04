import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { Calendar, Clock, User, TrendingUp, ChevronRight, MapPin, Bell } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MobileDashboardPage() {
  const navigate = useNavigate();

  return (
    <div>
      <MobilePageHeader 
        title="Табло" 
        subtitle="Днес, 24 Март 2024"
      />

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Calendar size={18} />}
            label="Днес"
            value="18"
            subtitle="часа"
          />
          <StatCard
            icon={<User size={18} />}
            label="Активни"
            value="124"
            subtitle="курсисти"
          />
        </div>

        {/* Today's Schedule */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base" style={{ color: 'var(--text-primary)' }}>
              Днешен график
            </h3>
            <button 
              onClick={() => navigate('/schedule')}
              className="text-sm font-medium"
              style={{ color: 'var(--primary-accent)' }}
            >
              Виж всички
            </button>
          </div>

          <div className="space-y-3">
            <ScheduleCard
              time="09:00"
              student="Антоан Тест"
              instructor="Георги Петров"
              location="Централна зона"
              status="active"
              onClick={() => navigate('/students/1')}
            />
            <ScheduleCard
              time="10:30"
              student="Антоан Тест"
              instructor="Иван Димитров"
              location="Южна зона"
              status="upcoming"
              onClick={() => navigate('/students/2')}
            />
            <ScheduleCard
              time="12:00"
              student="Антоан Тест"
              instructor="Георги Петров"
              location="Централна зона"
              status="upcoming"
              onClick={() => navigate('/students/3')}
            />
          </div>
        </div>

        {/* AI Insights */}
        <div
          className="rounded-xl p-4 border"
          style={{
            background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05), rgba(99, 102, 241, 0.05))',
            borderColor: 'rgba(167, 139, 250, 0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--ai-accent), var(--ai-accent-dim))' }}
            >
              <TrendingUp size={20} color="#ffffff" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  AI Анализ
                </h3>
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: 'rgba(167, 139, 250, 0.15)',
                    color: 'var(--ai-accent)',
                  }}
                >
                  Beta
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                12 курсисти са готови за записване на изпит
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            icon={<User size={20} />}
            label="Курсисти"
            onClick={() => navigate('/students')}
          />
          <QuickAction
            icon={<Bell size={20} />}
            label="Известия"
            badge="3"
            onClick={() => navigate('/notifications')}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtitle: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
      <div 
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
        style={{ background: 'var(--bg-panel)', color: 'var(--primary-accent)' }}
      >
        {icon}
      </div>
      <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
        {subtitle}
      </p>
    </div>
  );
}

function ScheduleCard({ 
  time, 
  student, 
  instructor, 
  location, 
  status,
  onClick 
}: { 
  time: string; 
  student: string; 
  instructor: string; 
  location: string; 
  status: 'active' | 'upcoming';
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg transition-all text-left"
      style={{
        background: status === 'active' ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-panel)',
        border: status === 'active' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <div 
            className="text-base font-semibold"
            style={{ color: status === 'active' ? 'var(--primary-accent)' : 'var(--text-secondary)' }}
          >
            {time}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
            {student}
          </p>
          <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-secondary)' }}>
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

        <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} className="flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

function QuickAction({ 
  icon, 
  label, 
  badge,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative h-20 rounded-xl p-4 flex flex-col items-start justify-between transition-all"
      style={{ background: 'var(--bg-card)' }}
    >
      {badge && (
        <span
          className="absolute top-2 right-2 w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center"
          style={{ background: 'var(--status-error)', color: '#ffffff' }}
        >
          {badge}
        </span>
      )}
      <div style={{ color: 'var(--primary-accent)' }}>
        {icon}
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
    </button>
  );
}
