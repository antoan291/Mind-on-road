import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { Button } from '../../components/ui-system/Button';
import { InputField, SelectField, TextareaField } from '../../components/ui-system/FormField';
import { Alert } from '../../components/ui-system/Alert';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, FileText, Car, ScanSearch, Upload } from 'lucide-react';
import { useAuthSession } from '../../services/authSession';
import { extractStudentAutofillFromDocument, StudentOcrAutofill } from '../../services/studentsApi';

export function MobileStudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { session } = useAuthSession();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    educationLevel: '',
    category: '',
    studentType: '',
    previousLicenseCategory: '',
    instructor: '',
    startDate: '',
    expectedArrivalDate: '',
    groupNumber: '',
    recordMode: '',
    insuranceStatus: '',
    extraHours: '',
    failedExamAttempts: '',
    courseOutcome: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentFeedbackEnabled: '',
    address: '',
    notes: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [ocrMessage, setOcrMessage] = useState('');
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);
  const [ocrUploadedFileName, setOcrUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOcrDocumentSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!session?.csrfToken) {
      setOcrStatus('error');
      setOcrMessage('Липсва активна сесия за сканиране на документа.');
      event.target.value = '';
      return;
    }

    setOcrStatus('running');
    setOcrUploadedFileName(selectedFile.name);
    setOcrWarnings([]);
    setOcrMessage(`Сканиране на документа ${selectedFile.name}...`);

    try {
      const extraction = await extractStudentAutofillFromDocument(
        selectedFile,
        session.csrfToken,
      );

      setFormData((current) => applyMobileOcrAutofill(current, extraction));
      setOcrWarnings(extraction.warnings);
      setOcrStatus('success');
      setOcrMessage(buildMobileOcrSuccessMessage(extraction));
    } catch (error) {
      setOcrStatus('error');
      setOcrWarnings([]);
      setOcrMessage(
        error instanceof Error
          ? error.message
          : 'Сканирането е неуспешно.',
      );
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/students');
    }, 2000);
  };

  return (
    <div className="pb-24">
      <MobilePageHeader 
        title={isEdit ? 'Редактиране' : 'Нов курсист'}
        showBack
      />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Success Alert */}
        {showSuccess && (
          <Alert
            type="success"
            title="Успешно запазване"
            message={isEdit ? 'Промените са записани.' : 'Курсистът е добавен.'}
          />
        )}

        {/* Basic Information */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Основна информация
          </h3>

          <div
            className="rounded-xl border p-4 mb-4"
            style={{
              background: 'var(--bg-panel)',
              borderColor: 'var(--ghost-border-medium)',
            }}
          >
            <div className="flex items-start gap-3">
              <ScanSearch size={18} style={{ color: 'var(--text-primary)', flexShrink: 0, marginTop: 2 }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Сканиране на документ
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Качи PDF или снимка и попълни автоматично данните на курсиста.
                </p>
                {ocrUploadedFileName ? (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                    Последен файл: {ocrUploadedFileName}
                  </p>
                ) : null}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleOcrDocumentSelected}
            />

            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                size="small"
                icon={<Upload size={16} />}
                disabled={ocrStatus === 'running'}
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                {ocrStatus === 'running' ? 'Сканиране...' : 'Качи документ'}
              </Button>
            </div>

            {ocrMessage ? (
              <div className="mt-4">
                <Alert
                  type={
                    ocrStatus === 'error'
                      ? 'error'
                      : ocrStatus === 'success'
                        ? 'success'
                        : 'info'
                  }
                  title={
                    ocrStatus === 'error'
                      ? 'Сканирането е неуспешно'
                      : ocrStatus === 'success'
                        ? 'Сканирането е готово'
                        : 'Сканиране на документа'
                  }
                  message={ocrMessage}
                />
              </div>
            ) : null}

            {ocrWarnings.length > 0 ? (
              <div
                className="mt-3 rounded-lg px-4 py-3"
                style={{ background: 'rgba(245, 158, 11, 0.12)' }}
              >
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Провери попълнените данни
                </p>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {ocrWarnings.map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <InputField
              label="Име"
              placeholder="Въведете име..."
              value={formData.firstName}
              onChange={(value) => setFormData({ ...formData, firstName: value })}
              icon={<User size={18} />}
              required
            />

            <InputField
              label="Фамилия"
              placeholder="Въведете фамилия..."
              value={formData.lastName}
              onChange={(value) => setFormData({ ...formData, lastName: value })}
              icon={<User size={18} />}
              required
            />

            <InputField
              label="Email адрес"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              icon={<Mail size={18} />}
              required
            />

            <InputField
              label="Телефон"
              type="tel"
              placeholder="0886612503"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              icon={<Phone size={18} />}
              required
            />

            <InputField
              label="ЕГН"
              type="text"
              placeholder="1234567890"
              value={formData.idNumber}
              onChange={(value) => setFormData({ ...formData, idNumber: value })}
              icon={<FileText size={18} />}
              required
            />

            <SelectField
              label="Образование"
              value={formData.educationLevel}
              onChange={(value) => setFormData({ ...formData, educationLevel: value })}
              options={[
                { value: '', label: 'Изберете образование...' },
                { value: 'basic', label: 'Основно' },
                { value: 'secondary', label: 'Средно' },
                { value: 'college', label: 'Полувисше / колеж' },
                { value: 'higher', label: 'Висше' },
              ]}
              icon={<BookOpen size={18} />}
            />
          </div>
        </div>

        {/* Course Information */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Информация за курса
          </h3>

          <div className="space-y-4">
            <SelectField
              label="Категория книжка"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              options={[
                { value: 'b', label: 'Категория B' },
                { value: 'a', label: 'Категория A' },
                { value: 'c', label: 'Категория C' },
                { value: 'd', label: 'Категория D' },
              ]}
              required
            />

            <SelectField
              label="Тип курсист"
              value={formData.studentType}
              onChange={(value) => setFormData({ ...formData, studentType: value })}
              options={[
                { value: '', label: 'Изберете тип курсист...' },
                { value: 'standard', label: 'Стандартен курсист' },
                { value: 'licensed-manual-hours', label: 'С книжка · ръчни часове' },
              ]}
              required
            />

            <SelectField
              label="Инструктор"
              value={formData.instructor}
              onChange={(value) => setFormData({ ...formData, instructor: value })}
              options={[
                { value: '1', label: 'Георги Петров' },
                { value: '2', label: 'Иван Димитров' },
                { value: '3', label: 'Стоян Василев' },
                { value: '4', label: 'Мария Петкова' },
              ]}
              required
            />

            <InputField
              label="Дата на начало"
              type="text"
              placeholder="ДД.ММ.ГГГГ"
              value={formData.startDate}
              onChange={(value) => setFormData({ ...formData, startDate: value })}
              icon={<Calendar size={18} />}
              required
            />

            <InputField
              label="Дата на идване при ранно записване"
              type="text"
              placeholder="ДД.ММ.ГГГГ"
              value={formData.expectedArrivalDate}
              onChange={(value) => setFormData({ ...formData, expectedArrivalDate: value })}
              icon={<Calendar size={18} />}
            />

            <InputField
              label="Номер на група"
              placeholder="B-2024-03"
              value={formData.groupNumber}
              onChange={(value) => setFormData({ ...formData, groupNumber: value })}
              icon={<FileText size={18} />}
            />

            <SelectField
              label="Режим на регистъра"
              value={formData.recordMode}
              onChange={(value) => setFormData({ ...formData, recordMode: value })}
              options={[
                { value: '', label: 'Изберете режим...' },
                { value: 'paper', label: 'Хартиен' },
                { value: 'electronic', label: 'Електронен' },
                { value: 'hybrid', label: 'Хартиен и електронен' },
              ]}
              icon={<FileText size={18} />}
            />

            <InputField
              label="Предходна категория книжка"
              placeholder="Например B или A1"
              value={formData.previousLicenseCategory}
              onChange={(value) => setFormData({ ...formData, previousLicenseCategory: value })}
              icon={<Car size={18} />}
            />

            <SelectField
              label="Застраховка"
              value={formData.insuranceStatus}
              onChange={(value) => setFormData({ ...formData, insuranceStatus: value })}
              options={[
                { value: '', label: 'Изберете статус...' },
                { value: 'active', label: 'Активна' },
                { value: 'pending', label: 'Очаква се' },
                { value: 'expired', label: 'Изтекла' },
              ]}
              icon={<FileText size={18} />}
            />

            <InputField
              label="Допълнителни часове"
              type="number"
              placeholder="0"
              value={formData.extraHours}
              onChange={(value) => setFormData({ ...formData, extraHours: value })}
              icon={<Calendar size={18} />}
            />

            <InputField
              label="Брой скъсвания на изпит"
              type="number"
              placeholder="0"
              value={formData.failedExamAttempts}
              onChange={(value) => setFormData({ ...formData, failedExamAttempts: value })}
              icon={<FileText size={18} />}
            />

            <SelectField
              label="Изход на курса"
              value={formData.courseOutcome}
              onChange={(value) => setFormData({ ...formData, courseOutcome: value })}
              options={[
                { value: '', label: 'Изберете изход...' },
                { value: 'active', label: 'Активен' },
                { value: 'completed', label: 'Завършен' },
                { value: 'withdrawn', label: 'Прекратен' },
                { value: 'transferred', label: 'Преместен' },
              ]}
              icon={<Car size={18} />}
            />

            <InputField
              label="Адрес"
              placeholder="гр. София, ул. ..."
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              icon={<MapPin size={18} />}
            />

            <InputField
              label="Име на родител"
              placeholder="Въведете име..."
              value={formData.parentName}
              onChange={(value) => setFormData({ ...formData, parentName: value })}
              icon={<User size={18} />}
            />

            <InputField
              label="Телефон на родител"
              type="tel"
              placeholder="0886612503"
              value={formData.parentPhone}
              onChange={(value) => setFormData({ ...formData, parentPhone: value })}
              icon={<Phone size={18} />}
            />

            <InputField
              label="Email на родител"
              type="email"
              placeholder="email@example.com"
              value={formData.parentEmail}
              onChange={(value) => setFormData({ ...formData, parentEmail: value })}
              icon={<Mail size={18} />}
            />

            <SelectField
              label="Отчет към родител"
              value={formData.parentFeedbackEnabled}
              onChange={(value) => setFormData({ ...formData, parentFeedbackEnabled: value })}
              options={[
                { value: '', label: 'Изберете...' },
                { value: 'enabled', label: 'Разрешено по избор' },
                { value: 'disabled', label: 'Забранено' },
              ]}
              icon={<Mail size={18} />}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Допълнително
          </h3>

          <TextareaField
            label="Бележки"
            placeholder="Добавете бележки..."
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            rows={3}
          />
        </div>
      </form>

      {/* Sticky Bottom Actions */}
      <div 
        className="fixed bottom-16 left-0 right-0 p-4 border-t"
        style={{ 
          background: 'var(--bg-panel)',
          borderColor: 'var(--ghost-border)'
        }}
      >
        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl font-semibold text-base"
          style={{
            background: 'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
            color: '#ffffff',
          }}
        >
          {isEdit ? 'Запази промени' : 'Добави курсист'}
        </button>
      </div>
    </div>
  );
}

function applyMobileOcrAutofill(
  current: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idNumber: string;
    educationLevel: string;
    category: string;
    studentType: string;
    previousLicenseCategory: string;
    instructor: string;
    startDate: string;
    expectedArrivalDate: string;
    groupNumber: string;
    recordMode: string;
    insuranceStatus: string;
    extraHours: string;
    failedExamAttempts: string;
    courseOutcome: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    parentFeedbackEnabled: string;
    address: string;
    notes: string;
  },
  extraction: StudentOcrAutofill,
) {
  return {
    ...current,
    firstName: extraction.firstName ?? current.firstName,
    lastName: extraction.lastName ?? current.lastName,
    idNumber: extraction.nationalId ?? current.idNumber,
    address: extraction.address ?? current.address,
    previousLicenseCategory:
      extraction.previousLicenseCategory ?? current.previousLicenseCategory,
    studentType:
      extraction.previousLicenseCategory && !current.studentType
        ? 'licensed-manual-hours'
        : current.studentType,
  };
}

function buildMobileOcrSuccessMessage(extraction: StudentOcrAutofill) {
  const filledFields = [
    extraction.firstName ? 'име' : null,
    extraction.lastName ? 'фамилия' : null,
    extraction.nationalId ? 'ЕГН' : null,
    extraction.address ? 'адрес' : null,
    extraction.previousLicenseCategory ? 'предходна категория' : null,
  ].filter(Boolean);

  const fieldsLabel =
    filledFields.length > 0 ? filledFields.join(', ') : 'няма сигурно разпознати полета';

  return `Разпознат документ: ${extraction.documentType}. Попълнени: ${fieldsLabel}.`;
}
