import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Upload, Download, Eye, Trash2, CheckCircle,
  Clock, XCircle, AlertCircle, Plus, Search, Filter,
  ChevronRight, File, Image
} from 'lucide-react';

export function MobileDocuments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchOpen, setSearchOpen] = useState(false);

  const documents = [
    {
      id: 1,
      name: 'Медицинско свидетелство',
      student: 'Антоан Тест',
      type: 'medical',
      typeLabel: 'Медицинско',
      status: 'approved',
      statusLabel: 'Одобрен',
      uploadDate: '15.01.2026',
      size: '2.3 MB',
      format: 'PDF',
    },
    {
      id: 2,
      name: 'Лична карта - копие',
      student: 'Антоан Тест',
      type: 'id',
      typeLabel: 'Лична карта',
      status: 'approved',
      statusLabel: 'Одобрен',
      uploadDate: '15.01.2026',
      size: '1.8 MB',
      format: 'PDF',
    },
    {
      id: 3,
      name: 'Снимка',
      student: 'Антоан Тест',
      type: 'photo',
      typeLabel: 'Снимка',
      status: 'pending',
      statusLabel: 'Изчаква',
      uploadDate: '23.03.2026',
      size: '450 KB',
      format: 'JPG',
    },
    {
      id: 4,
      name: 'Медицинско свидетелство',
      student: 'Антоан Тест',
      type: 'medical',
      typeLabel: 'Медицинско',
      status: 'pending',
      statusLabel: 'Изчаква',
      uploadDate: '23.03.2026',
      size: '1.9 MB',
      format: 'PDF',
    },
    {
      id: 5,
      name: 'Лична карта - копие',
      student: 'Антоан Тест',
      type: 'id',
      typeLabel: 'Лична карта',
      status: 'rejected',
      statusLabel: 'Отхвърлен',
      uploadDate: '20.03.2026',
      size: '2.1 MB',
      format: 'PDF',
      reason: 'Неясно изображение',
    },
    {
      id: 6,
      name: 'Свидетелство за завършено образование',
      student: 'Иван Колев',
      type: 'education',
      typeLabel: 'Образование',
      status: 'approved',
      statusLabel: 'Одобрен',
      uploadDate: '18.03.2026',
      size: '1.5 MB',
      format: 'PDF',
    },
    {
      id: 7,
      name: 'Декларация',
      student: 'Георги Тодоров',
      type: 'declaration',
      typeLabel: 'Декларация',
      status: 'approved',
      statusLabel: 'Одобрен',
      uploadDate: '16.03.2026',
      size: '890 KB',
      format: 'PDF',
    },
  ];

  const stats = [
    { label: 'Всички', value: documents.length.toString(), filter: 'all' },
    { label: 'Изчакващи', value: documents.filter(d => d.status === 'pending').length.toString(), filter: 'pending' },
    { label: 'Одобрени', value: documents.filter(d => d.status === 'approved').length.toString(), filter: 'approved' },
  ];

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return doc.status === 'pending';
    if (activeTab === 'approved') return doc.status === 'approved';
    return true;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Документи
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'документ' : 'документа'}
            </p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'var(--primary-accent)',
              color: '#ffffff',
            }}
          >
            <Upload size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {stats.map((stat) => (
            <button
              key={stat.filter}
              onClick={() => setActiveTab(stat.filter as any)}
              className="flex-1 min-w-[90px] p-3 rounded-xl transition-all"
              style={{
                background: activeTab === stat.filter 
                  ? 'rgba(99, 102, 241, 0.15)' 
                  : 'var(--bg-card)',
              }}
            >
              <div 
                className="text-2xl font-semibold mb-1" 
                style={{ 
                  color: activeTab === stat.filter 
                    ? 'var(--primary-accent)' 
                    : 'var(--text-primary)' 
                }}
              >
                {stat.value}
              </div>
              <div 
                className="text-xs whitespace-nowrap" 
                style={{ 
                  color: activeTab === stat.filter 
                    ? 'var(--primary-accent)' 
                    : 'var(--text-secondary)' 
                }}
              >
                {stat.label}
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        {activeTab === 'pending' && filteredDocuments.length > 0 && (
          <div 
            className="p-3 rounded-xl flex items-center gap-3 mb-4"
            style={{ 
              background: 'var(--status-warning-bg)',
              border: '1px solid var(--status-warning-border)'
            }}
          >
            <AlertCircle size={18} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--status-warning)' }}>
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'документ чака' : 'документа чакат'} преглед
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="px-4 pb-4">
        {filteredDocuments.length === 0 ? (
          <div className="py-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--bg-card)' }}
            >
              <FileText size={24} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Няма документи за показване
            </p>
            <button
              onClick={() => navigate('/documents')}
              className="text-sm font-medium"
              style={{ color: 'var(--primary-accent)' }}
            >
              Качи документ
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ document }: { document: any }) {
  const [showActions, setShowActions] = useState(false);

  const getStatusIcon = () => {
    switch (document.status) {
      case 'approved':
        return <CheckCircle size={18} style={{ color: 'var(--status-success)' }} />;
      case 'pending':
        return <Clock size={18} style={{ color: 'var(--status-warning)' }} />;
      case 'rejected':
        return <XCircle size={18} style={{ color: 'var(--status-error)' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'approved': return 'var(--status-success)';
      case 'pending': return 'var(--status-warning)';
      case 'rejected': return 'var(--status-error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getFileIcon = () => {
    if (document.format === 'JPG' || document.format === 'PNG') {
      return <Image size={20} style={{ color: 'var(--ai-accent)' }} />;
    }
    return <File size={20} style={{ color: 'var(--primary-accent)' }} />;
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
      <button
        onClick={() => setShowActions(!showActions)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ 
              background: document.format === 'JPG' || document.format === 'PNG'
                ? 'rgba(167, 139, 250, 0.15)'
                : 'rgba(99, 102, 241, 0.15)'
            }}
          >
            {getFileIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {document.name}
              </div>
              {getStatusIcon()}
            </div>

            <div className="text-sm mb-2 truncate" style={{ color: 'var(--text-secondary)' }}>
              {document.student}
            </div>

            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>{document.typeLabel}</span>
              <span>•</span>
              <span>{document.uploadDate}</span>
              <span>•</span>
              <span>{document.size}</span>
            </div>

            {document.status === 'rejected' && document.reason && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--ghost-border)' }}>
                <div className="flex items-start gap-1">
                  <AlertCircle size={12} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '2px' }} />
                  <span className="text-xs" style={{ color: 'var(--status-error)' }}>
                    {document.reason}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Actions */}
      {showActions && (
        <div
          className="grid grid-cols-3 border-t"
          style={{ borderColor: 'var(--ghost-border)' }}
        >
          <button
            className="h-11 flex items-center justify-center gap-2 text-xs font-medium transition-all active:bg-opacity-50"
            style={{ color: 'var(--primary-accent)' }}
          >
            <Eye size={14} />
            Преглед
          </button>
          <button
            className="h-11 flex items-center justify-center gap-2 text-xs font-medium transition-all active:bg-opacity-50 border-l border-r"
            style={{ 
              color: 'var(--text-secondary)',
              borderColor: 'var(--ghost-border)',
            }}
          >
            <Download size={14} />
            Изтегли
          </button>
          <button
            className="h-11 flex items-center justify-center gap-2 text-xs font-medium transition-all active:bg-opacity-50"
            style={{ color: 'var(--status-error)' }}
          >
            <Trash2 size={14} />
            Изтрий
          </button>
        </div>
      )}

      {/* Pending Actions */}
      {document.status === 'pending' && showActions && (
        <div
          className="grid grid-cols-2 border-t"
          style={{ borderColor: 'var(--ghost-border)' }}
        >
          <button
            className="h-11 flex items-center justify-center gap-2 text-sm font-medium transition-all active:bg-opacity-50"
            style={{ color: 'var(--status-success)' }}
          >
            <CheckCircle size={16} />
            Одобри
          </button>
          <button
            className="h-11 flex items-center justify-center gap-2 text-sm font-medium transition-all active:bg-opacity-50 border-l"
            style={{ 
              color: 'var(--status-error)',
              borderColor: 'var(--ghost-border)',
            }}
          >
            <XCircle size={16} />
            Отхвърли
          </button>
        </div>
      )}
    </div>
  );
}
