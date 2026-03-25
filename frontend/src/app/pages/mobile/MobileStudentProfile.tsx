import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft, Phone, Mail, MapPin, Calendar,
  CheckCircle, Clock, AlertCircle, CreditCard,
  FileText, User, ChevronRight, Plus
} from 'lucide-react';

export function MobileStudentProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'payments' | 'documents'>('overview');

  // Mock data
  const student = {
    id: 1,
    name: 'Петър Георгиев',
    email: 'petar.georgiev@email.com',
    phone: '+359 88 123 4567',
    address: 'София, ул. Витоша 15',
    category: 'B',
    status: 'active',
    statusLabel: 'Активен',
    enrollmentDate: '15.01.2026',
    progress: 68,
  };

  const stats = [
    { label: 'Практика', value: '12/30', subtitle: '40% завършени', color: 'var(--primary-accent)' },
    { label: 'Теория', value: '18/20', subtitle: '90% посещения', color: 'var(--ai-accent)' },
    { label: 'Изпити', value: '1/2', subtitle: 'Теория - изд.', color: 'var(--status-success)' },
    { label: 'Остатък', value: '450 лв', subtitle: 'От 1200 лв', color: 'var(--status-warning)' },
  ];

  const recentLessons = [
    { id: 1, date: '22.03.2026', time: '14:00', instructor: 'Георги Петров', type: 'Градско шофиране', status: 'completed', statusLabel: 'Завършен', duration: '90 мин' },
    { id: 2, date: '20.03.2026', time: '16:00', instructor: 'Георги Петров', type: 'Паркиране', status: 'completed', statusLabel: 'Завършен', duration: '90 мин' },
    { id: 3, date: '18.03.2026', time: '10:00', instructor: 'Иван Димитров', type: 'Магистрала', status: 'completed', statusLabel: 'Завършен', duration: '120 мин' },
  ];

  const upcomingLessons = [
    { id: 4, date: '25.03.2026', time: '14:00', instructor: 'Георги Петров', type: 'Сложни маневри', status: 'scheduled', statusLabel: 'Записан' },
    { id: 5, date: '27.03.2026', time: '10:00', instructor: 'Георги Петров', type: 'Градско шофиране', status: 'scheduled', statusLabel: 'Записан' },
  ];

  const payments = [
    { id: 1, date: '15.03.2026', amount: '500 лв', type: 'Практически часове', status: 'paid', statusLabel: 'Платено' },
    { id: 2, date: '01.03.2026', amount: '250 лв', type: 'Теория', status: 'paid', statusLabel: 'Платено' },
  ];

  const documents = [
    { id: 1, name: 'Медицинско свидетелство', date: '10.01.2026', status: 'approved', statusLabel: 'Одобрен' },
    { id: 2, name: 'Лична карта - копие', date: '10.01.2026', status: 'approved', statusLabel: 'Одобрен' },
    { id: 3, name: 'Снимка', date: '10.01.2026', status: 'approved', statusLabel: 'Одобрен' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ 
          background: 'var(--bg-panel)',
          borderColor: 'var(--ghost-border)'
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/students')}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {student.name}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Категория {student.category}
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary-accent)',
            }}
          >
            {student.statusLabel}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div 
        className="sticky top-[57px] z-10 flex border-b overflow-x-auto"
        style={{ 
          background: 'var(--bg-panel)',
          borderColor: 'var(--ghost-border)'
        }}
      >
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          label="Преглед"
        />
        <TabButton
          active={activeTab === 'lessons'}
          onClick={() => setActiveTab('lessons')}
          label="Часове"
        />
        <TabButton
          active={activeTab === 'payments'}
          onClick={() => setActiveTab('payments')}
          label="Плащания"
        />
        <TabButton
          active={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
          label="Документи"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-card)' }}>
              <ContactRow icon={<Phone size={16} />} label="Телефон" value={student.phone} href={`tel:${student.phone}`} />
              <ContactRow icon={<Mail size={16} />} label="Имейл" value={student.email} href={`mailto:${student.email}`} />
              <ContactRow icon={<MapPin size={16} />} label="Адрес" value={student.address} />
              <ContactRow icon={<Calendar size={16} />} label="Записан на" value={student.enrollmentDate} />
            </div>

            {/* Progress */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Обща прогрес
                </span>
                <span className="text-lg font-semibold" style={{ color: 'var(--primary-accent)' }}>
                  {student.progress}%
                </span>
              </div>
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-panel)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${student.progress}%`,
                    background: 'linear-gradient(90deg, var(--primary-accent), var(--ai-accent))',
                  }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                  <div className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                  <div className="text-xs font-medium" style={{ color: stat.color }}>
                    {stat.subtitle}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/schedule')}
                className="h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
                style={{
                  background: 'var(--primary-accent)',
                  color: '#ffffff',
                }}
              >
                <Plus size={18} />
                Нов час
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                }}
              >
                <CreditCard size={18} />
                Плащане
              </button>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {/* Upcoming */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Предстоящи часове
              </h3>
              <div className="space-y-2">
                {upcomingLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>

            {/* Recent */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                Последни часове
              </h3>
              <div className="space-y-2">
                {recentLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4">
            {/* Balance Card */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Остатък за плащане
              </div>
              <div className="text-3xl font-semibold mb-3" style={{ color: 'var(--status-warning)' }}>
                450 лв
              </div>
              <button
                className="w-full h-12 rounded-xl font-medium transition-all active:scale-95"
                style={{
                  background: 'var(--primary-accent)',
                  color: '#ffffff',
                }}
              >
                Добави плащане
              </button>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                История на плащанията
              </h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          {payment.type}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {payment.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {payment.amount}
                        </div>
                        <div
                          className="text-xs px-2 py-0.5 rounded inline-block"
                          style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: 'var(--status-success)',
                          }}
                        >
                          {payment.statusLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl flex items-center gap-3"
                style={{ background: 'var(--bg-card)' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                >
                  <CheckCircle size={18} style={{ color: 'var(--status-success)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                    {doc.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Качен на {doc.date}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            ))}

            <button
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all active:scale-95"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--primary-accent)',
                border: '1px dashed rgba(99, 102, 241, 0.3)',
              }}
            >
              <Plus size={18} />
              Качи документ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all"
      style={{
        color: active ? 'var(--primary-accent)' : 'var(--text-secondary)',
        borderBottom: active ? '2px solid var(--primary-accent)' : '2px solid transparent',
      }}
    >
      {label}
    </button>
  );
}

function ContactRow({ 
  icon, 
  label, 
  value, 
  href 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  href?: string; 
}) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex items-center justify-between">
        {content}
      </a>
    );
  }

  return <div className="flex items-center justify-between">{content}</div>;
}

function LessonCard({ lesson }: { lesson: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--status-success)';
      case 'scheduled': return 'var(--status-info)';
      case 'confirmed': return 'var(--primary-accent)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {lesson.type}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {lesson.instructor}
          </div>
        </div>
        <div
          className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
          style={{
            background: `${getStatusColor(lesson.status)}20`,
            color: getStatusColor(lesson.status),
          }}
        >
          {lesson.statusLabel}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          {lesson.date}
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {lesson.time}
        </div>
        {lesson.duration && (
          <div className="flex items-center gap-1">
            {lesson.duration}
          </div>
        )}
      </div>
    </div>
  );
}
