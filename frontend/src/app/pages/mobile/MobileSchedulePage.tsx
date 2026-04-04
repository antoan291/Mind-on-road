import { useState } from 'react';
import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { Calendar, ChevronLeft, ChevronRight, User, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

export function MobileSchedulePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('24.03.2024');

  const schedule = [
    {
      id: 1,
      time: '09:00',
      duration: '90 мин',
      student: 'Антоан Тест',
      instructor: 'Георги Петров',
      location: 'Централна зона',
      type: 'Практика',
      status: 'active',
      statusLabel: 'В процес',
    },
    {
      id: 2,
      time: '10:30',
      duration: '90 мин',
      student: 'Антоан Тест',
      instructor: 'Иван Димитров',
      location: 'Южна зона',
      type: 'Практика',
      status: 'upcoming',
      statusLabel: 'Предстоящ',
    },
    {
      id: 3,
      time: '12:00',
      duration: '90 мин',
      student: 'Антоан Тест',
      instructor: 'Георги Петров',
      location: 'Централна зона',
      type: 'Практика',
      status: 'upcoming',
      statusLabel: 'Предстоящ',
    },
    {
      id: 4,
      time: '14:00',
      duration: '90 мин',
      student: 'Антоан Тест',
      instructor: 'Иван Димитров',
      location: 'Северна зона',
      type: 'Практика',
      status: 'upcoming',
      statusLabel: 'Предстоящ',
    },
  ];

  return (
    <div>
      <MobilePageHeader 
        title="График" 
        subtitle="18 записани часа"
      />

      {/* Date Selector */}
      <div className="p-4 border-b" style={{ background: 'var(--bg-panel)', borderColor: 'var(--ghost-border)' }}>
        <div className="flex items-center justify-between">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
            <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar size={18} style={{ color: 'var(--primary-accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Днес, {selectedDate}
            </span>
          </div>

          <button className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
            <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="p-4 space-y-4">
        {schedule.map((item) => (
          <ScheduleCard
            key={item.id}
            item={item}
            onClick={() => navigate(`/students/${item.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function ScheduleCard({ item, onClick }: { item: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl p-4 transition-all text-left"
      style={{
        background: item.status === 'active' 
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))'
          : 'var(--bg-card)',
        border: item.status === 'active' 
          ? '1px solid rgba(99, 102, 241, 0.3)'
          : '1px solid transparent',
      }}
    >
      <div className="flex gap-3">
        {/* Time */}
        <div className="flex flex-col items-center justify-start flex-shrink-0 pt-1">
          <div 
            className="text-lg font-semibold leading-none"
            style={{ color: item.status === 'active' ? 'var(--primary-accent)' : 'var(--text-primary)' }}
          >
            {item.time.split(':')[0]}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {item.time.split(':')[1]}
          </div>
          <div className="w-px h-8 mt-2" style={{ background: 'var(--ghost-border)' }} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {item.student}
            </h4>
            <StatusBadge status={item.status === 'active' ? 'warning' : 'info'} size="small">
              {item.statusLabel}
            </StatusBadge>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <User size={12} />
              <span>{item.instructor}</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <MapPin size={12} />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={12} />
              <span>{item.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
