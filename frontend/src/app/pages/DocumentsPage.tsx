import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { FilterBar } from '../components/ui-system/FilterBar';
import { DataTable } from '../components/ui-system/DataTable';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { Button } from '../components/ui-system/Button';
import { 
  Plus, Download, Upload, X, FileText, AlertCircle,
  CheckCircle, Calendar, User, Car, Building, Eye,
  Image as ImageIcon, XCircle
} from 'lucide-react';

type DocumentType = 'student' | 'instructor' | 'vehicle' | 'school';
type DocumentStatus = 'valid' | 'expiring-soon' | 'expired' | 'missing';

type Document = {
  id: number;
  name: string;
  type: DocumentType;
  category: string;
  owner: string;
  ownerId: number;
  issueDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: DocumentStatus;
  statusLabel: string;
  fileUrl?: string;
  notes?: string;
};

export function DocumentsPage() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentType>('student');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock data
  const allDocuments: Document[] = [
    // Student documents
    {
      id: 1,
      name: 'Лична карта',
      type: 'student',
      category: 'Документ за самоличност',
      owner: 'Петър Георгиев',
      ownerId: 1,
      issueDate: '10.01.2020',
      expiryDate: '10.01.2030',
      daysUntilExpiry: 2190,
      status: 'valid',
      statusLabel: 'Валиден',
      fileUrl: '/documents/id-123.pdf',
    },
    {
      id: 2,
      name: 'Медицинско свидетелство',
      type: 'student',
      category: 'Здравно състояние',
      owner: 'Петър Георгиев',
      ownerId: 1,
      issueDate: '15.03.2024',
      expiryDate: '15.04.2024',
      daysUntilExpiry: 22,
      status: 'expiring-soon',
      statusLabel: '22 дни',
      fileUrl: '/documents/medical-456.pdf',
    },
    {
      id: 3,
      name: 'Свидетелство за управление',
      type: 'student',
      category: 'Предходна категория',
      owner: 'Мартин Иванов',
      ownerId: 3,
      issueDate: '10.01.2024',
      expiryDate: '10.03.2024',
      daysUntilExpiry: -14,
      status: 'expired',
      statusLabel: 'Изтекъл',
      fileUrl: '/documents/license-789.pdf',
    },
    {
      id: 4,
      name: 'Психологическо изследване',
      type: 'student',
      category: 'Здравно състояние',
      owner: 'София Николова',
      ownerId: 4,
      issueDate: '—',
      expiryDate: '—',
      daysUntilExpiry: 0,
      status: 'missing',
      statusLabel: 'Липсва',
    },

    // Instructor documents
    {
      id: 5,
      name: 'Удостоверение за инструктор',
      type: 'instructor',
      category: 'Правоспособност',
      owner: 'Георги Петров',
      ownerId: 1,
      issueDate: '01.06.2022',
      expiryDate: '01.06.2027',
      daysUntilExpiry: 1190,
      status: 'valid',
      statusLabel: 'Валиден',
      fileUrl: '/documents/instructor-cert-001.pdf',
    },
    {
      id: 6,
      name: 'Медицинско свидетелство',
      type: 'instructor',
      category: 'Здравно състояние',
      owner: 'Георги Петров',
      ownerId: 1,
      issueDate: '10.02.2024',
      expiryDate: '10.08.2024',
      daysUntilExpiry: 138,
      status: 'valid',
      statusLabel: 'Валиден',
      fileUrl: '/documents/medical-instructor-001.pdf',
    },
    {
      id: 7,
      name: 'Свидетелство за управление Кат. B',
      type: 'instructor',
      category: 'Правоспособност',
      owner: 'Иван Димитров',
      ownerId: 2,
      issueDate: '15.01.2020',
      expiryDate: '15.01.2025',
      daysUntilExpiry: 296,
      status: 'valid',
      statusLabel: 'Валиден',
      fileUrl: '/documents/license-instructor-002.pdf',
    },

    // Vehicle documents
    {
      id: 8,
      name: 'Регистрация на МПС',
      type: 'vehicle',
      category: 'Документ за автомобил',
      owner: 'Toyota Corolla - СА 1234 АВ',
      ownerId: 1,
      issueDate: '10.03.2023',
      expiryDate: '10.03.2025',
      daysUntilExpiry: 351,
      status: 'valid',
      statusLabel: 'Валиден',
      fileUrl: '/documents/vehicle-reg-001.pdf',
    },
    {
      id: 9,
      name: 'Застраховка Гражданска отговорност',
      type: 'vehicle',
      category: 'Застраховка',
      owner: 'Toyota Corolla - СА 1234 АВ',
      ownerId: 1,
      issueDate: '01.01.2024',
      expiryDate: '01.05.2024',
      daysUntilExpiry: 38,
      status: 'expiring-soon',
      statusLabel: '38 дни',
      fileUrl: '/documents/insurance-001.pdf',
    },
    {
      id: 10,
      name: 'Годишен технически преглед',
      type: 'vehicle',
      category: 'Технически преглед',
      owner: 'Skoda Octavia - СА 5678 ВС',
      ownerId: 2,
      issueDate: '15.02.2023',
      expiryDate: '15.02.2024',
      daysUntilExpiry: -38,
      status: 'expired',
      statusLabel: 'Изтекъл',
      fileUrl: '/documents/inspection-002.pdf',
    },

    // School documents
    {
      id: 11,
      name: 'Лиценз на автошкола',
      type: 'school',
      category: 'Правоспособност',
      owner: 'Автошкола DriveAdmin',
      ownerId: 1,
      issueDate: '01.01.2020',
      expiryDate: '01.01.2030',
      daysUntilExpiry: 2103,
      status: 'valid',
      statusLabel: 'Валиден',
      fileUrl: '/documents/school-license.pdf',
    },
    {
      id: 12,
      name: 'Застраховка на автошкола',
      type: 'school',
      category: 'Застраховка',
      owner: 'Автошкола DriveAdmin',
      ownerId: 1,
      issueDate: '01.01.2024',
      expiryDate: '01.01.2025',
      daysUntilExpiry: 282,
      status: 'valid',
      statusLabel: 'Валиден',
      fileUrl: '/documents/school-insurance.pdf',
    },
  ];

  const filteredDocuments = allDocuments.filter(doc => doc.type === activeTab);

  // Calculate stats for active tab
  const validCount = filteredDocuments.filter(d => d.status === 'valid').length;
  const expiringSoonCount = filteredDocuments.filter(d => d.status === 'expiring-soon').length;
  const expiredCount = filteredDocuments.filter(d => d.status === 'expired').length;
  const missingCount = filteredDocuments.filter(d => d.status === 'missing').length;

  const tabs = [
    { id: 'student' as DocumentType, label: 'Курсисти', icon: <User size={18} /> },
    { id: 'instructor' as DocumentType, label: 'Инструктори', icon: <User size={18} /> },
    { id: 'vehicle' as DocumentType, label: 'Автомобили', icon: <Car size={18} /> },
    { id: 'school' as DocumentType, label: 'Автошкола', icon: <Building size={18} /> },
  ];

  const getStatusColor = (status: DocumentStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'expiring-soon':
        return 'warning';
      case 'expired':
      case 'missing':
        return 'error';
      default:
        return 'info';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Документ',
      render: (value: string, row: Document) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ 
              background: row.status === 'missing' 
                ? 'var(--status-error-bg)' 
                : 'var(--bg-panel)',
            }}
          >
            <FileText 
              size={20} 
              style={{ 
                color: row.status === 'missing' 
                  ? 'var(--status-error)' 
                  : 'var(--text-secondary)' 
              }} 
            />
          </div>
          <div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {row.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: activeTab === 'vehicle' ? 'Автомобил' : activeTab === 'school' ? 'Организация' : 'Име',
      render: (value: string, row: Document) => (
        <div>
          <div style={{ color: 'var(--text-primary)' }}>{value}</div>
          {(activeTab === 'student' || activeTab === 'instructor') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const route = activeTab === 'student' ? 'students' : 'instructors';
                navigate(`/${route}/${row.ownerId}`);
              }}
              className="text-xs hover:underline"
              style={{ color: 'var(--primary-accent)' }}
            >
              Виж профил
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'issueDate',
      label: 'Издаден',
      render: (value: string) => (
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {value}
        </span>
      ),
    },
    {
      key: 'expiryDate',
      label: 'Валиден до',
      render: (value: string, row: Document) => (
        <div>
          <div 
            className="font-medium" 
            style={{ 
              color: row.status === 'expired' || row.status === 'expiring-soon'
                ? 'var(--status-error)' 
                : 'var(--text-primary)' 
            }}
          >
            {value}
          </div>
          {row.status === 'expiring-soon' && row.daysUntilExpiry > 0 && (
            <div className="text-xs" style={{ color: 'var(--status-warning)' }}>
              Остават {row.daysUntilExpiry} дни
            </div>
          )}
          {row.status === 'expired' && row.daysUntilExpiry < 0 && (
            <div className="text-xs" style={{ color: 'var(--status-error)' }}>
              Изтекъл преди {Math.abs(row.daysUntilExpiry)} дни
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (_: string, row: Document) => (
        <StatusBadge status={getStatusColor(row.status)} size="small">
          {row.statusLabel}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (_: any, row: Document) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === 'missing' ? (
            <Button
              variant="secondary"
              icon={<Upload size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                setShowUploadModal(true);
              }}
            >
              Качи
            </Button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDocument(row);
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
                title="Преглед"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Download', row.fileUrl);
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
                title="Изтегли"
              >
                <Download size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Документи"
        description="Управление на документи и валидност"
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Документи' },
        ]}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />}>
              Експорт
            </Button>
            <Button variant="primary" icon={<Upload size={18} />} onClick={() => setShowUploadModal(true)}>
              Качи документ
            </Button>
          </>
        }
      />

      {/* Alert Cards */}
      <div className="p-6 lg:p-8 pb-0">
        {expiringSoonCount > 0 && (
          <div 
            className="rounded-xl p-4 mb-4 flex items-center gap-3"
            style={{ 
              background: 'var(--status-warning-bg)',
              border: '1px solid var(--status-warning-border)'
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--status-warning)' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--status-warning)' }}>
                {expiringSoonCount} {expiringSoonCount === 1 ? 'документ изтича' : 'документа изтичат'} скоро
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Прегледайте документите, които изтичат в следващите 60 дни
              </p>
            </div>
          </div>
        )}

        {expiredCount > 0 && (
          <div 
            className="rounded-xl p-4 mb-4 flex items-center gap-3"
            style={{ 
              background: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)'
            }}
          >
            <XCircle size={20} style={{ color: 'var(--status-error)' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--status-error)' }}>
                {expiredCount} {expiredCount === 1 ? 'документ е изтекъл' : 'документа са изтекли'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Моля актуализирайте изтеклите документи
              </p>
            </div>
          </div>
        )}

        {missingCount > 0 && (
          <div 
            className="rounded-xl p-4 mb-4 flex items-center gap-3"
            style={{ 
              background: 'var(--status-error-bg)',
              border: '1px solid var(--status-error-border)'
            }}
          >
            <FileText size={20} style={{ color: 'var(--status-error)' }} />
            <div className="flex-1">
              <p className="font-medium" style={{ color: 'var(--status-error)' }}>
                {missingCount} {missingCount === 1 ? 'липсващ документ' : 'липсващи документа'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Качете необходимите документи
              </p>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<CheckCircle size={20} style={{ color: 'var(--status-success)' }} />}
            label="Валидни"
            value={validCount.toString()}
            color="success"
          />
          <StatCard
            icon={<AlertCircle size={20} style={{ color: 'var(--status-warning)' }} />}
            label="Изтичат скоро"
            value={expiringSoonCount.toString()}
            color="warning"
            alert={expiringSoonCount > 0}
          />
          <StatCard
            icon={<XCircle size={20} style={{ color: 'var(--status-error)' }} />}
            label="Изтекли"
            value={expiredCount.toString()}
            color="error"
            alert={expiredCount > 0}
          />
          <StatCard
            icon={<FileText size={20} style={{ color: 'var(--status-error)' }} />}
            label="Липсващи"
            value={missingCount.toString()}
            color="error"
            alert={missingCount > 0}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 lg:px-8 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2"
              style={{
                background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Търсене по име на документ или собственик..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={false}
      />

      {/* Table */}
      <div className="p-6 lg:p-8">
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Показани {filteredDocuments.length} документа
          </p>
        </div>

        <DataTable
          columns={columns}
          data={filteredDocuments}
          onRowClick={(row) => row.status !== 'missing' && setSelectedDocument(row)}
        />
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          documentType={activeTab}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value,
  color,
  alert = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  color: 'success' | 'warning' | 'error';
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: `var(--status-${color}-bg)` }}
        >
          {icon}
        </div>
        {alert && (
          <div 
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--status-error)' }}
          />
        )}
      </div>
      <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="text-3xl" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

// Document Detail Modal
function DocumentDetailModal({
  document,
  onClose,
}: {
  document: Document;
  onClose: () => void;
}) {
  const getStatusColor = (status: DocumentStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'expiring-soon':
        return 'warning';
      case 'expired':
      case 'missing':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div 
            className="sticky top-0 z-10 p-6 border-b"
            style={{ 
              background: 'var(--bg-card)',
              borderColor: 'var(--ghost-border)' 
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-panel)' }}
                >
                  <FileText size={24} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div>
                  <h2 className="text-xl mb-1" style={{ color: 'var(--text-primary)' }}>
                    {document.name}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {document.category}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <StatusBadge status={getStatusColor(document.status)} size="medium">
              {document.statusLabel}
            </StatusBadge>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="rounded-xl p-6" style={{ background: 'var(--bg-panel)' }}>
              <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Информация за документа
              </h3>
              <div className="space-y-3">
                <InfoRow
                  icon={<User size={16} />}
                  label="Собственик"
                  value={document.owner}
                />
                <InfoRow
                  icon={<Calendar size={16} />}
                  label="Дата на издаване"
                  value={document.issueDate}
                />
                <InfoRow
                  icon={<Calendar size={16} />}
                  label="Валиден до"
                  value={document.expiryDate}
                />
              </div>
            </div>

            {/* Status Alert */}
            {document.status === 'expiring-soon' && (
              <div 
                className="rounded-xl p-6"
                style={{ 
                  background: 'var(--status-warning-bg)',
                  border: '1px solid var(--status-warning-border)'
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--status-warning)' }}>
                      Документът изтича след {document.daysUntilExpiry} дни
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Моля подгответе нов документ преди изтичане на срока
                    </p>
                  </div>
                </div>
              </div>
            )}

            {document.status === 'expired' && (
              <div 
                className="rounded-xl p-6"
                style={{ 
                  background: 'var(--status-error-bg)',
                  border: '1px solid var(--status-error-border)'
                }}
              >
                <div className="flex items-start gap-3">
                  <XCircle size={20} style={{ color: 'var(--status-error)', flexShrink: 0 }} />
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--status-error)' }}>
                      Документът е изтекъл
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Изтекъл преди {Math.abs(document.daysUntilExpiry)} дни. Моля качете актуализиран документ.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {document.notes && (
              <div className="rounded-xl p-6" style={{ background: 'var(--bg-panel)' }}>
                <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>
                  Бележки
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {document.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="primary" icon={<Download size={18} />}>
                Изтегли документ
              </Button>
              <Button variant="secondary" icon={<Upload size={18} />}>
                Актуализирай
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Upload Modal
function UploadModal({
  onClose,
  documentType,
}: {
  onClose: () => void;
  documentType: DocumentType;
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload
    console.log('Files dropped:', e.dataTransfer.files);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-xl"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: 'var(--ghost-border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl" style={{ color: 'var(--text-primary)' }}>
                Качи документ
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* File Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="rounded-xl border-2 border-dashed p-12 transition-all"
              style={{
                borderColor: dragActive ? 'var(--primary-accent)' : 'var(--ghost-border-medium)',
                background: dragActive ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-panel)',
              }}
            >
              <div className="flex flex-col items-center text-center">
                <Upload 
                  size={48} 
                  className="mb-4"
                  style={{ color: dragActive ? 'var(--primary-accent)' : 'var(--text-dim)' }} 
                />
                <p className="mb-2" style={{ color: 'var(--text-primary)' }}>
                  Провлачете файл или кликнете за избор
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                  Поддържани формати: PDF, JPG, PNG (макс. 10MB)
                </p>
                <Button variant="secondary" icon={<Upload size={18} />}>
                  Избери файл
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Тип документ
                </label>
                <select
                  className="w-full h-12 rounded-lg px-4 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option>Избери тип документ...</option>
                  <option>Лична карта</option>
                  <option>Медицинско свидетелство</option>
                  <option>Психологическо изследване</option>
                  <option>Свидетелство за управление</option>
                  <option>Други</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Дата на издаване
                  </label>
                  <input
                    type="text"
                    placeholder="ДД.ММ.ГГГГ"
                    className="w-full h-12 rounded-lg px-4 border-none outline-none"
                    style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Валиден до
                  </label>
                  <input
                    type="text"
                    placeholder="ДД.ММ.ГГГГ"
                    className="w-full h-12 rounded-lg px-4 border-none outline-none"
                    style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Бележки (по избор)
                </label>
                <textarea
                  placeholder="Добавете допълнителна информация..."
                  rows={3}
                  className="w-full rounded-lg px-4 py-3 border-none outline-none resize-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="primary" icon={<Upload size={18} />}>
                Качи документ
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Отказ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Info Row Component
function InfoRow({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}