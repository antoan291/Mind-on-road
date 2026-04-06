import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { FilterBar } from '../components/ui-system/FilterBar';
import { DataTable } from '../components/ui-system/DataTable';
import { StatusBadge } from '../components/ui-system/StatusBadge';
import { Button } from '../components/ui-system/Button';
import { 
  Plus, Download, Upload, X, FileText, AlertCircle,
  CheckCircle, Calendar, User, Car, Building, Eye,
  Image as ImageIcon, Play, RefreshCcw, XCircle
} from 'lucide-react';
import {
  createDocumentRecord,
  deleteDocumentRecord,
  fetchDocumentOcrExtractions,
  fetchDocumentOcrSourceFiles,
  fetchDocumentRecords,
  runDocumentOcrExtraction,
  type DocumentOcrExtractionView,
  type DocumentRecordView,
  updateDocumentRecord,
} from '../services/documentsApi';
import { useAuthSession } from '../services/authSession';
import {
  type StudentOperationalRecord,
} from '../content/studentOperations';
import { fetchStudentOperations } from '../services/studentsApi';

type DocumentType = 'student' | 'instructor' | 'vehicle' | 'school';
type DocumentStatus = 'valid' | 'expiring-soon' | 'expired' | 'missing';

type Document = DocumentRecordView & {
  id: string | number;
  name: string;
  type: DocumentType;
  category: string;
  owner: string;
  ownerId: string | number;
  issueDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: DocumentStatus;
  statusLabel: string;
  fileUrl?: string;
  notes?: string;
};

export function DocumentsPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<DocumentType>('student');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetDocument, setUploadTargetDocument] = useState<Document | null>(
    null,
  );
  const [allDocuments, setAllDocuments] = useState<Document[]>(
    [],
  );
  const [ocrExtractions, setOcrExtractions] = useState<
    DocumentOcrExtractionView[]
  >([]);
  const [ocrSourceFiles, setOcrSourceFiles] = useState<string[]>([]);
  const [selectedOcrSourceFile, setSelectedOcrSourceFile] = useState('');
  const [selectedOcrExtraction, setSelectedOcrExtraction] =
    useState<DocumentOcrExtractionView | null>(null);
  const [ocrRunStatus, setOcrRunStatus] = useState<
    'idle' | 'running' | 'success' | 'error'
  >('idle');
  const [ocrRunMessage, setOcrRunMessage] = useState('');
  const [students, setStudents] = useState<StudentOperationalRecord[]>([]);
  const [sourceStatus, setSourceStatus] = useState<
    'loading' | 'backend' | 'fallback'
  >('loading');
  const canDeleteDocuments = Boolean(
    session?.user.roleKeys.includes('owner') ||
      session?.user.roleKeys.includes('admin'),
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchDocumentRecords(),
      fetchStudentOperations(),
      fetchDocumentOcrExtractions(),
      fetchDocumentOcrSourceFiles(),
    ])
      .then(([records, studentRows, extractionRows, sourceFiles]) => {
        if (!isMounted) return;
        setAllDocuments(records as Document[]);
        setStudents(studentRows);
        setOcrExtractions(extractionRows);
        setOcrSourceFiles(sourceFiles);
        setSelectedOcrSourceFile((current) => current || sourceFiles[0] || '');
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) return;
        setAllDocuments([]);
        setOcrSourceFiles([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDocuments = allDocuments.filter(doc => doc.type === activeTab);
  const exportedDocuments = filteredDocuments.filter((document) =>
    [document.name, document.owner, document.category]
      .join(' ')
      .toLowerCase()
      .includes(searchValue.trim().toLowerCase()),
  );

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

  const handleDeleteDocument = async (documentId: string | number) => {
    if (!canDeleteDocuments) {
      return;
    }

    const document = allDocuments.find(
      (currentDocument) => currentDocument.id === documentId,
    );

    if (!document) {
      return;
    }

    const shouldDelete = globalThis.confirm(
      `Сигурен ли си, че искаш да изтриеш документа ${document.name} на ${document.owner}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDocumentRecord(String(documentId), session?.csrfToken ?? '');
      setAllDocuments((currentDocuments) =>
        currentDocuments.filter((currentDocument) => currentDocument.id !== documentId),
      );
      setSelectedDocument((currentDocument) =>
        currentDocument?.id === documentId ? null : currentDocument,
      );
      setSourceStatus('backend');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Документът не можа да бъде изтрит.';
      globalThis.alert(message);
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
                setUploadTargetDocument(row);
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
                  downloadDocumentFile(row);
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
                title="Изтегли"
              >
                <Download size={16} />
              </button>
              {canDeleteDocuments && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDeleteDocument(row.id);
                  }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                  style={{ background: 'var(--bg-panel)', color: 'var(--status-error)' }}
                  title="Изтрий"
                >
                  <XCircle size={16} />
                </button>
              )}
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
        description={`Управление на документи и валидност • ${
          sourceStatus === 'backend'
            ? 'Данни от PostgreSQL'
            : sourceStatus === 'fallback'
              ? 'Fallback към локални тестови данни'
              : 'Зареждане...'
        }`}
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Документи' },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Download size={18} />}
              onClick={() => exportDocumentsCsv(exportedDocuments, activeTab)}
            >
              Експорт
            </Button>
            <Button
              variant="primary"
              icon={<Upload size={18} />}
              onClick={() => {
                setUploadTargetDocument(null);
                setShowUploadModal(true);
              }}
            >
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

        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div
                className="text-sm font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--text-tertiary)' }}
              >
                OCR резултати за преглед
              </div>
              <h2
                className="mt-2 text-xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Human review преди официално записване
              </h2>
              <p
                className="mt-2 text-sm max-w-3xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                OCR pipeline-ът в `automation/` генерира предложения за
                документни данни. След ръчен преглед можеш да приложиш
                извлеченото като реален документен запис.
              </p>
            </div>

            <div
              className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{
                background: 'var(--bg-panel)',
                color: 'var(--text-primary)',
              }}
            >
              {ocrExtractions.length} резултата
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto_auto]">
            <select
              value={selectedOcrSourceFile}
              onChange={(event) => {
                setSelectedOcrSourceFile(event.target.value);
                setOcrRunStatus('idle');
                setOcrRunMessage('');
              }}
              disabled={ocrSourceFiles.length === 0}
              className="h-12 rounded-xl px-4 text-sm outline-none"
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {ocrSourceFiles.length === 0 ? (
                <option value="">Няма PDF файлове в automation/samples</option>
              ) : (
                ocrSourceFiles.map((fileName) => (
                  <option key={fileName} value={fileName}>
                    {fileName}
                  </option>
                ))
              )}
            </select>

            <Button
              variant="secondary"
              icon={<RefreshCcw size={16} />}
              onClick={async () => {
                const [freshExtractions, freshSourceFiles] = await Promise.all([
                  fetchDocumentOcrExtractions(),
                  fetchDocumentOcrSourceFiles(),
                ]);

                setOcrExtractions(freshExtractions);
                setOcrSourceFiles(freshSourceFiles);
                setSelectedOcrSourceFile((current) =>
                  freshSourceFiles.includes(current)
                    ? current
                    : freshSourceFiles[0] || '',
                );
                setOcrRunStatus('idle');
                setOcrRunMessage('OCR списъкът е обновен.');
              }}
            >
              Обнови
            </Button>

            <Button
              variant="primary"
              icon={<Play size={16} />}
              disabled={!selectedOcrSourceFile || ocrRunStatus === 'running'}
              onClick={async () => {
                if (!selectedOcrSourceFile) return;

                setOcrRunStatus('running');
                setOcrRunMessage(
                  `Стартира OCR анализ за ${selectedOcrSourceFile}...`,
                );

                try {
                  const extractedDocument = await runDocumentOcrExtraction(
                    selectedOcrSourceFile,
                    session?.csrfToken ?? '',
                  );
                  const refreshedExtractions =
                    await fetchDocumentOcrExtractions();

                  setOcrExtractions(refreshedExtractions);
                  setOcrRunStatus('success');
                  setOcrRunMessage(
                    `OCR анализът завърши успешно: ${extractedDocument.fileName}`,
                  );
                  setSourceStatus('backend');
                } catch (error) {
                  setOcrRunStatus('error');
                  setOcrRunMessage(
                    error instanceof Error
                      ? error.message
                      : 'OCR анализът не успя.',
                  );
                }
              }}
            >
              Стартирай OCR
            </Button>
          </div>

          {ocrRunMessage && (
            <p
              className="mt-3 text-sm"
              style={{
                color:
                  ocrRunStatus === 'error'
                    ? 'var(--status-error)'
                    : ocrRunStatus === 'success'
                      ? 'var(--status-success)'
                      : 'var(--text-secondary)',
              }}
            >
              {ocrRunMessage}
            </p>
          )}

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {ocrExtractions.length === 0 ? (
              <div
                className="rounded-xl p-4 text-sm"
                style={{
                  background: 'var(--bg-panel)',
                  color: 'var(--text-secondary)',
                }}
              >
                Няма OCR JSON файлове за преглед в `automation/output`.
              </div>
            ) : (
              ocrExtractions.map((extraction) => (
                <div
                  key={extraction.fileName}
                  className="rounded-xl p-4"
                  style={{
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--bg-card)' }}
                    >
                      <ImageIcon
                        size={18}
                        style={{ color: 'var(--primary-accent)' }}
                      />
                    </div>
                    <StatusBadge
                      status={
                        extraction.manualReviewRequired ? 'warning' : 'success'
                      }
                      size="small"
                    >
                      {extraction.manualReviewRequired
                        ? 'Ръчен преглед'
                        : 'Проверен'}
                    </StatusBadge>
                  </div>

                  <div
                    className="mt-3 font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {extraction.extractedName}
                  </div>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {extraction.documentName} · {extraction.documentNumber}
                  </div>
                  <div
                    className="mt-3 text-xs break-all"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {extraction.fileName}
                  </div>

                  {extraction.warnings.length > 0 && (
                    <div
                      className="mt-3 rounded-lg px-3 py-2 text-xs"
                      style={{
                        background: 'var(--status-warning-bg)',
                        color: 'var(--status-warning)',
                      }}
                    >
                      {extraction.warnings[0]}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="secondary"
                      icon={<FileText size={16} />}
                      onClick={() => setSelectedOcrExtraction(extraction)}
                    >
                      Приложи към документ
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
          Показани {exportedDocuments.length} документа
          </p>
        </div>

        <DataTable
          columns={columns}
          data={exportedDocuments}
          onRowClick={(row) => row.status !== 'missing' && setSelectedDocument(row)}
        />
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onUpdate={() => {
            setUploadTargetDocument(selectedDocument);
            setShowUploadModal(true);
            setSelectedDocument(null);
          }}
          onDelete={
            canDeleteDocuments
              ? () => void handleDeleteDocument(selectedDocument.id)
              : undefined
          }
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          documentType={activeTab}
          students={students}
          targetDocument={uploadTargetDocument}
          onSubmit={async (payload) => {
            const savedDocument = uploadTargetDocument
              ? await updateDocumentRecord(
                  String(uploadTargetDocument.id),
                  payload,
                  session?.csrfToken ?? '',
                )
              : await createDocumentRecord(payload, session?.csrfToken ?? '');

            setAllDocuments((current) =>
              uploadTargetDocument
                ? current.map((document) =>
                    document.id === savedDocument.id
                      ? (savedDocument as Document)
                      : document,
                  )
                : [savedDocument as Document, ...current],
            );
            setShowUploadModal(false);
            setUploadTargetDocument(null);
            setSourceStatus('backend');
          }}
        />
      )}

      {selectedOcrExtraction && (
        <OcrApplyModal
          extraction={selectedOcrExtraction}
          students={students}
          onClose={() => setSelectedOcrExtraction(null)}
          onSubmit={async (payload) => {
            const savedDocument = await createDocumentRecord(
              payload,
              session?.csrfToken ?? '',
            );

            setAllDocuments((current) => [savedDocument as Document, ...current]);
            setSelectedOcrExtraction(null);
            setSourceStatus('backend');
          }}
        />
      )}
    </div>
  );
}

function downloadDocumentFile(document: Document) {
  const blob = new Blob(
    [
      [
        `Документ: ${document.name}`,
        `Собственик: ${document.owner}`,
        `Категория: ${document.category}`,
        `Издаден: ${document.issueDate}`,
        `Валиден до: ${document.expiryDate}`,
        `Статус: ${document.statusLabel}`,
        `Бележки: ${document.notes ?? 'Няма'}`,
      ].join('\n'),
    ],
    { type: 'text/plain;charset=utf-8' },
  );
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `${document.name.replace(/\s+/g, '_')}.txt`;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
}

function exportDocumentsCsv(documents: Document[], activeTab: DocumentType) {
  const csvRows = [
    'name,owner,category,issueDate,expiryDate,status',
    ...documents.map((document) =>
      [
        document.name,
        document.owner,
        document.category,
        document.issueDate,
        document.expiryDate,
        document.statusLabel,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `documents_${activeTab}.csv`;
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
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
  onUpdate,
  onDelete,
}: {
  document: Document;
  onClose: () => void;
  onUpdate: () => void;
  onDelete?: () => void;
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
              <Button
                variant="primary"
                icon={<Download size={18} />}
                onClick={() => downloadDocumentFile(document)}
              >
                Изтегли документ
              </Button>
              <Button
                variant="secondary"
                icon={<Upload size={18} />}
                onClick={onUpdate}
              >
                Актуализирай
              </Button>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center justify-end gap-3 border-t p-6"
            style={{ borderColor: 'var(--ghost-border)' }}
          >
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                Изтрий
              </Button>
            )}
            <Button variant="secondary" onClick={onUpdate}>
              Редактирай
            </Button>
            <Button variant="primary" onClick={onClose}>
              Затвори
            </Button>
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
  students,
  targetDocument,
  onSubmit,
}: {
  onClose: () => void;
  documentType: DocumentType;
  students: StudentOperationalRecord[];
  targetDocument: Document | null;
  onSubmit: (payload: {
    studentId?: string | null;
    name: string;
    ownerType: 'STUDENT' | 'INSTRUCTOR' | 'VEHICLE' | 'SCHOOL';
    ownerName: string;
    ownerRef?: string | null;
    category: string;
    documentNo?: string | null;
    issueDate: string;
    expiryDate?: string | null;
    status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
    fileUrl?: string | null;
    notes?: string | null;
  }) => Promise<void>;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(
    normalizeDocumentFileName(targetDocument?.fileUrl ?? ''),
  );
  const [documentName, setDocumentName] = useState(
    targetDocument?.name ?? 'Лична карта',
  );
  const [ownerValue, setOwnerValue] = useState(
    targetDocument?.ownerId ? String(targetDocument.ownerId) : '',
  );
  const [ownerName, setOwnerName] = useState(targetDocument?.owner ?? '');
  const [issueDate, setIssueDate] = useState(
    toIsoDateInputValue(targetDocument?.issueDate) ||
      new Date().toISOString().slice(0, 10),
  );
  const [expiryDate, setExpiryDate] = useState(
    targetDocument?.expiryDate && targetDocument.expiryDate !== 'Без срок'
      ? toIsoDateInputValue(targetDocument.expiryDate)
      : '',
  );
  const [notes, setNotes] = useState(targetDocument?.notes ?? '');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resolvedOwnerType = mapDocumentTypeToOwnerType(documentType);

  const handleSaveDocument = async () => {
    if (isSaving) {
      return;
    }

    if (documentType === 'student' && !ownerValue) {
      setSaveError('Избери курсист собственик на документа.');
      return;
    }

    const effectiveOwnerName =
      documentType === 'student'
        ? students.find((student) => String(student.id) === ownerValue)?.name ||
          ownerName ||
          targetDocument?.owner ||
          'Курсист'
        : ownerName.trim() || targetDocument?.owner || 'Mind on Road';

    setSaveError(null);
    setIsSaving(true);

    try {
      await onSubmit({
        studentId: documentType === 'student' ? ownerValue : null,
        name: documentName.trim() || targetDocument?.name || 'Документ',
        ownerType: resolvedOwnerType,
        ownerName: effectiveOwnerName,
        ownerRef: documentType === 'student' ? ownerValue : effectiveOwnerName,
        category: targetDocument?.category ?? (documentName.trim() || 'Общи'),
        documentNo:
          targetDocument?.id !== undefined
            ? `DOC-${String(targetDocument.id).slice(0, 8)}`
            : `DOC-${Date.now().toString().slice(-6)}`,
        issueDate,
        expiryDate: expiryDate || null,
        status: expiryDate ? resolveDocumentStatus(expiryDate) : 'VALID',
        fileUrl: toDocumentStorageUrl(selectedFileName),
        notes: notes.trim() || null,
      });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Документът не беше записан в базата.',
      );
    } finally {
      setIsSaving(false);
    }
  };

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
    setSelectedFileName(e.dataTransfer.files[0]?.name ?? '');
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
              <input
                id="documents-upload-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(event) =>
                  setSelectedFileName(event.target.files?.[0]?.name ?? '')
                }
              />
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
                <Button
                  variant="secondary"
                  icon={<Upload size={18} />}
                  onClick={() =>
                    document.getElementById('documents-upload-input')?.click()
                  }
                >
                  Избери файл
                </Button>
                {selectedFileName && (
                  <p className="mt-3 text-sm" style={{ color: 'var(--status-success)' }}>
                    Избран файл: {selectedFileName}
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Тип документ
                </label>
                <select
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  className="w-full h-12 rounded-lg px-4 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Избери тип документ...</option>
                  <option>Лична карта</option>
                  <option>Медицинско свидетелство</option>
                  <option>Психологическо изследване</option>
                  <option>Свидетелство за управление</option>
                  <option>Други</option>
                </select>
              </div>

              {documentType === 'student' ? (
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Курсист
                  </label>
                  <select
                    value={ownerValue}
                    onChange={(event) => setOwnerValue(event.target.value)}
                    className="w-full h-12 rounded-lg px-4 border-none outline-none"
                    style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">Избери курсист...</option>
                    {students.map((student) => (
                      <option key={student.id} value={String(student.id)}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Собственик
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(event) => setOwnerName(event.target.value)}
                    placeholder="Име на инструктор, автомобил или организация"
                    className="w-full h-12 rounded-lg px-4 border-none outline-none"
                    style={{
                      background: 'var(--bg-panel)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Дата на издаване
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(event) => setIssueDate(event.target.value)}
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
                    type="date"
                    value={expiryDate}
                    onChange={(event) => setExpiryDate(event.target.value)}
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
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
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

            {saveError && (
              <p className="text-sm" style={{ color: 'var(--status-error)' }}>
                {saveError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                icon={<Upload size={18} />}
                onClick={() => void handleSaveDocument()}
                disabled={isSaving}
              >
                {isSaving ? 'Записване...' : 'Качи документ'}
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

function OcrApplyModal({
  extraction,
  students,
  onClose,
  onSubmit,
}: {
  extraction: DocumentOcrExtractionView;
  students: StudentOperationalRecord[];
  onClose: () => void;
  onSubmit: (payload: {
    studentId?: string | null;
    name: string;
    ownerType: 'STUDENT' | 'INSTRUCTOR' | 'VEHICLE' | 'SCHOOL';
    ownerName: string;
    ownerRef?: string | null;
    category: string;
    documentNo?: string | null;
    issueDate: string;
    expiryDate?: string | null;
    status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
    fileUrl?: string | null;
    notes?: string | null;
  }) => Promise<void>;
}) {
  const matchedStudentId = findMatchingStudentId(students, extraction.extractedName);
  const [studentId, setStudentId] = useState(matchedStudentId);
  const [documentName, setDocumentName] = useState(
    mapOcrDocumentName(extraction.documentName),
  );
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState(buildOcrNotes(extraction));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedStudent =
    students.find((student) => String(student.id) === studentId) ?? null;

  const handleApply = async () => {
    if (isSaving) {
      return;
    }

    if (!studentId || !selectedStudent) {
      setSaveError('Избери курсист, към когото да се приложи OCR документът.');
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      await onSubmit({
        studentId,
        name: documentName,
        ownerType: 'STUDENT',
        ownerName: selectedStudent.name,
        ownerRef: String(selectedStudent.id),
        category: documentName,
        documentNo:
          extraction.documentNumber !== 'Без номер'
            ? extraction.documentNumber
            : null,
        issueDate,
        expiryDate: expiryDate || null,
        status: expiryDate ? resolveDocumentStatus(expiryDate) : 'VALID',
        fileUrl: toDocumentStorageUrl(extraction.sourceFileName),
        notes: notes.trim() || null,
      });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'OCR документът не беше приложен.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        style={{ backdropFilter: 'blur(4px)' }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-3xl rounded-xl"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="p-6 border-b" style={{ borderColor: 'var(--ghost-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl" style={{ color: 'var(--text-primary)' }}>
                  Приложи OCR към документ
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Потвърди разпознатите данни преди запис в системата.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:shadow-[var(--glow-indigo)]"
                style={{ background: 'var(--bg-panel)', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div
              className="rounded-xl p-4"
              style={{
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {extraction.extractedName}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {extraction.documentName} · {extraction.documentNumber}
                  </div>
                  <div className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    OCR файл: {extraction.fileName}
                    {extraction.confidence !== null
                      ? ` · Увереност ${(extraction.confidence * 100).toFixed(1)}%`
                      : ''}
                  </div>
                </div>
                <StatusBadge
                  status={extraction.manualReviewRequired ? 'warning' : 'success'}
                  size="small"
                >
                  {extraction.manualReviewRequired ? 'Ръчен преглед' : 'Готово'}
                </StatusBadge>
              </div>

              {extraction.warnings.length > 0 && (
                <ul
                  className="mt-4 list-disc space-y-1 pl-5 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {extraction.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Курсист
                </label>
                <select
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  className="w-full h-12 rounded-lg px-4 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Избери курсист...</option>
                  {students.map((student) => (
                    <option key={student.id} value={String(student.id)}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Тип документ
                </label>
                <select
                  value={documentName}
                  onChange={(event) => setDocumentName(event.target.value)}
                  className="w-full h-12 rounded-lg px-4 border-none outline-none"
                  style={{
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option>Лична карта</option>
                  <option>Свидетелство за управление</option>
                  <option>OCR документ</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Дата на издаване
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
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
                  type="date"
                  value={expiryDate}
                  onChange={(event) => setExpiryDate(event.target.value)}
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
                Бележки
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={5}
                className="w-full rounded-lg px-4 py-3 border-none outline-none resize-none"
                style={{
                  background: 'var(--bg-panel)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {saveError && (
              <p className="text-sm" style={{ color: 'var(--status-error)' }}>
                {saveError}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                icon={<FileText size={18} />}
                onClick={() => void handleApply()}
                disabled={isSaving}
              >
                {isSaving ? 'Записване...' : 'Създай документ от OCR'}
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

function mapDocumentTypeToOwnerType(documentType: DocumentType) {
  if (documentType === 'instructor') {
    return 'INSTRUCTOR' as const;
  }

  if (documentType === 'vehicle') {
    return 'VEHICLE' as const;
  }

  if (documentType === 'school') {
    return 'SCHOOL' as const;
  }

  return 'STUDENT' as const;
}

function toIsoDateInputValue(dateValue?: string) {
  if (!dateValue) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const [day = '', month = '', year = ''] = dateValue.split('.');

  if (!day || !month || !year) {
    return '';
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function resolveDocumentStatus(expiryDate: string) {
  const dayMs = 24 * 60 * 60 * 1000;
  const remainingDays = Math.ceil(
    (new Date(`${expiryDate}T00:00:00.000Z`).getTime() -
      new Date().setHours(0, 0, 0, 0)) /
      dayMs,
  );

  if (remainingDays < 0) {
    return 'EXPIRED' as const;
  }

  if (remainingDays <= 60) {
    return 'EXPIRING_SOON' as const;
  }

  return 'VALID' as const;
}

function normalizeDocumentFileName(fileUrl: string) {
  return fileUrl.replace(/^mindonroad-local-upload:\/\//, '');
}

function toDocumentStorageUrl(fileName: string) {
  const normalizedFileName = normalizeDocumentFileName(fileName).trim();

  if (!normalizedFileName) {
    return null;
  }

  return `mindonroad-local-upload://${normalizedFileName}`;
}

function mapOcrDocumentName(documentName: string) {
  const normalized = documentName.toLowerCase();

  if (normalized.includes('лична карта')) {
    return 'Лична карта';
  }

  if (normalized.includes('шофьорска книжка')) {
    return 'Свидетелство за управление';
  }

  return 'OCR документ';
}

function findMatchingStudentId(
  students: StudentOperationalRecord[],
  extractedName: string,
) {
  const normalizedExtraction = normalizeComparableName(extractedName);

  if (!normalizedExtraction) {
    return '';
  }

  const exactMatch = students.find(
    (student) =>
      normalizeComparableName(student.name) === normalizedExtraction,
  );

  if (exactMatch) {
    return String(exactMatch.id);
  }

  const partialMatch = students.find((student) =>
    normalizeComparableName(student.name).includes(normalizedExtraction) ||
    normalizedExtraction.includes(normalizeComparableName(student.name)),
  );

  return partialMatch ? String(partialMatch.id) : '';
}

function normalizeComparableName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function buildOcrNotes(extraction: DocumentOcrExtractionView) {
  const warningText =
    extraction.warnings.length > 0
      ? `Предупреждения: ${extraction.warnings.join(' | ')}`
      : 'Няма OCR предупреждения.';
  const confidenceText =
    extraction.confidence !== null
      ? `Увереност: ${(extraction.confidence * 100).toFixed(1)}%`
      : 'Увереност: няма данни';

  return [
    `OCR източник: ${extraction.fileName}`,
    confidenceText,
    warningText,
  ].join('\n');
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
