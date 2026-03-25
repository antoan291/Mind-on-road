import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { Search, Plus, ChevronRight, Filter } from 'lucide-react';

export function MobileStudentsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const students = [
    {
      id: 1,
      name: 'Петър Георгиев',
      category: 'B',
      progress: 60,
      nextLesson: 'Утре 10:00',
      status: 'success',
      statusLabel: 'Напреднал',
    },
    {
      id: 2,
      name: 'Елена Димитрова',
      category: 'B',
      progress: 40,
      nextLesson: 'Днес 14:00',
      status: 'warning',
      statusLabel: 'В процес',
    },
    {
      id: 3,
      name: 'Мартин Иванов',
      category: 'A',
      progress: 83,
      nextLesson: 'Петък 09:00',
      status: 'success',
      statusLabel: 'Напреднал',
    },
    {
      id: 4,
      name: 'София Николова',
      category: 'B',
      progress: 25,
      nextLesson: 'Днес 16:00',
      status: 'info',
      statusLabel: 'Начинаещ',
    },
    {
      id: 5,
      name: 'Георги Тодоров',
      category: 'C',
      progress: 72,
      nextLesson: 'Понеделник 11:00',
      status: 'success',
      statusLabel: 'Напреднал',
    },
  ];

  return (
    <div>
      <MobilePageHeader 
        title="Курсисти" 
        subtitle="124 активни курсисти"
        actions={
          <button
            onClick={() => navigate('/students/new')}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff'
            }}
          >
            <Plus size={18} />
          </button>
        }
      />

      {/* Search Bar */}
      <div className="p-4 border-b" style={{ background: 'var(--bg-panel)', borderColor: 'var(--ghost-border)' }}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 -translate-y-1/2" 
              style={{ color: 'var(--text-tertiary)' }} 
            />
            <input
              type="text"
              placeholder="Търсене по име..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-11 rounded-lg pl-10 pr-4 border-none outline-none"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="p-4 space-y-3">
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onClick={() => navigate(`/students/${student.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function StudentCard({ 
  student, 
  onClick 
}: { 
  student: any; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl p-4 transition-all text-left"
      style={{ background: 'var(--bg-card)' }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
            color: '#ffffff',
          }}
        >
          {student.name.split(' ').map((n: string) => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {student.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Категория {student.category}
              </p>
            </div>
            <StatusBadge status={student.status as any} size="small">
              {student.statusLabel}
            </StatusBadge>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Напредък
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {student.progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${student.progress}%`,
                  background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                }}
              />
            </div>
          </div>

          {/* Next Lesson */}
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Следващ час: {student.nextLesson}
            </p>
            <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
          </div>
        </div>
      </div>
    </button>
  );
}
