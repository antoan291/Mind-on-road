import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { FilterBar } from '../components/ui-system/FilterBar';
import { DataTable } from '../components/ui-system/DataTable';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { Button } from '../components/ui-system/Button';
import { Plus, Download, Eye, Edit, Filter } from 'lucide-react';
import { mockStudents } from '../content/mockDb';

export function StudentsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const students = mockStudents;

  const columns = [
    {
      key: 'name',
      label: 'Курсист',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            {value.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {row.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Категория',
      render: (value: string) => (
        <span 
          className="px-2.5 py-1 rounded-md text-sm font-medium"
          style={{
            background: 'var(--bg-panel)',
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'instructor',
      label: 'Инструктор',
    },
    {
      key: 'remaining',
      label: 'Остават',
      render: (value: number, row: any) => (
        <div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {value} часа
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {row.used} / {row.paid} проведени
          </div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Напредък',
      render: (value: number) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${value}%`,
                background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              }}
            />
          </div>
          <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--text-secondary)' }}>
            {value}%
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (value: string, row: any) => (
        <StatusBadge status={value as any}>
          {row.statusLabel}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.id}`);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/students/${row.id}/edit`);
            }}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
            style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
          >
            <Edit size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Курсисти"
        description="Управление на курсисти и техния напредък"
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Курсисти' },
        ]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/students/new')}>
              Добави курсист
            </Button>
          </>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по име, телефон или email..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={true}
        activeFiltersCount={selectedCategory !== 'all' || selectedStatus !== 'all' ? 1 : 0}
        onFilterClick={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <div className="px-6 lg:px-8 pt-6">
          <div 
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Категория
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Всички категории</option>
                  <option value="A">Категория A</option>
                  <option value="B">Категория B</option>
                  <option value="C">Категория C</option>
                  <option value="D">Категория D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Статус
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-10 rounded-lg px-3 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">Всички статуси</option>
                  <option value="beginner">Начинаещ</option>
                  <option value="in-progress">В процес</option>
                  <option value="advanced">Напреднал</option>
                  <option value="ready">Готов за изпит</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                >
                  Изчисти филтри
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Показани {students.length} курсисти
          </p>
        </div>

        <DataTable
          columns={columns}
          data={students}
          onRowClick={(row) => navigate(`/students/${row.id}`)}
        />
      </div>
    </div>
  );
}
