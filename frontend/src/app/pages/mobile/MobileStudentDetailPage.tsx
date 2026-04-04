import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { ActionSheet } from '../../components/mobile/BottomSheet';
import { 
  Phone, Mail, User, Calendar, MapPin, 
  CheckCircle, Clock, MoreVertical, Edit, 
  MessageSquare, DollarSign 
} from 'lucide-react';

export function MobileStudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const student = {
    id: 1,
    name: 'Антоан Тест',
    email: 'antoan.test@example.com',
    phone: '0886612503',
    category: 'B',
    instructor: 'Георги Петров',
    startDate: '15.01.2024',
    completed: 12,
    total: 20,
    progress: 60,
    status: 'success',
    statusLabel: 'Напреднал',
  };

  const lessons = [
    {
      id: 1,
      date: '24.03.2024',
      time: '10:00',
      type: 'Градско шофиране',
      status: 'success',
      statusLabel: 'Завършен',
    },
    {
      id: 2,
      date: '22.03.2024',
      time: '14:00',
      type: 'Паркиране',
      status: 'success',
      statusLabel: 'Завършен',
    },
    {
      id: 3,
      date: '20.03.2024',
      time: '11:00',
      type: 'Магистрала',
      status: 'success',
      statusLabel: 'Завършен',
    },
  ];

  return (
    <div>
      <MobilePageHeader 
        title={student.name}
        showBack
        actions={
          <button
            onClick={() => setActionSheetOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            <MoreVertical size={18} />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-semibold text-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                color: '#ffffff',
              }}
            >
              ПГ
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg truncate" style={{ color: 'var(--text-primary)' }}>
                {student.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={student.status as any} size="small">
                  {student.statusLabel}
                </StatusBadge>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  •
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Категория {student.category}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
            <InfoRow icon={<Mail size={16} />} label="Email" value={student.email} />
            <InfoRow icon={<Phone size={16} />} label="Телефон" value={student.phone} />
            <InfoRow icon={<User size={16} />} label="Инструктор" value={student.instructor} />
            <InfoRow icon={<Calendar size={16} />} label="Начало" value={student.startDate} />
          </div>
        </div>

        {/* Progress Card */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-base mb-4" style={{ color: 'var(--text-primary)' }}>
            Напредък
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Проведени часове
              </span>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {student.completed} / {student.total}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${student.progress}%`,
                  background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ProgressItem
              icon={<CheckCircle size={16} style={{ color: 'var(--status-success)' }} />}
              label="Теория"
              value="Завършена"
            />
            <ProgressItem
              icon={<Clock size={16} style={{ color: 'var(--status-warning)' }} />}
              label="Практика"
              value="В процес"
            />
          </div>
        </div>

        {/* Recent Lessons */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base" style={{ color: 'var(--text-primary)' }}>
              Скорошни часове
            </h3>
            <button 
              className="text-sm font-medium"
              style={{ color: 'var(--primary-accent)' }}
            >
              Виж всички
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div 
        className="fixed bottom-16 left-0 right-0 p-4 border-t"
        style={{ 
          background: 'var(--bg-panel)',
          borderColor: 'var(--ghost-border)'
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {/* Call action */}}
            className="h-12 rounded-xl font-medium flex items-center justify-center gap-2"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--ghost-border-medium)',
            }}
          >
            <Phone size={18} />
            <span>Обади се</span>
          </button>
          <button
            onClick={() => navigate(`/students/${id}/edit`)}
            className="h-12 rounded-xl font-medium flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            <Edit size={18} />
            <span>Редактирай</span>
          </button>
        </div>
      </div>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        title="Действия"
        actions={[
          {
            label: 'Редактирай профил',
            icon: <Edit size={20} />,
            onClick: () => navigate(`/students/${id}/edit`),
            variant: 'primary',
          },
          {
            label: 'Изпрати съобщение',
            icon: <MessageSquare size={20} />,
            onClick: () => {},
          },
          {
            label: 'Плащания',
            icon: <DollarSign size={20} />,
            onClick: () => {},
          },
        ]}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </p>
        <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ProgressItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div 
      className="p-3 rounded-lg"
      style={{ background: 'var(--bg-panel)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function LessonCard({ lesson }: { lesson: any }) {
  return (
    <div 
      className="p-3 rounded-lg"
      style={{ background: 'var(--bg-panel)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {lesson.type}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {lesson.date} • {lesson.time}
          </p>
        </div>
        <StatusBadge status={lesson.status as any} size="small">
          {lesson.statusLabel}
        </StatusBadge>
      </div>
    </div>
  );
}
