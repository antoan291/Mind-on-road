import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { Button } from '../components/ui-system/Button';
import { InputField, SelectField, TextareaField } from '../components/ui-system/FormField';
import { Alert } from '../components/ui-system/Alert';
import { User, Mail, Phone, MapPin, Calendar, Car, BookOpen, FileText } from 'lucide-react';
import { useAuthSession } from '../services/authSession';
import {
  createStudentRecord,
  fetchStudentOperationalDetail,
  StudentMutationPayload,
  updateStudentRecord,
} from '../services/studentsApi';

export function StudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const isBackendStudentId = Boolean(
    id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
  );
  const { session } = useAuthSession();

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    idNumber: '',
    educationLevel: '',
    
    // Training Information
    category: '',
    studentType: '',
    previousLicenseCategory: '',
    instructor: '',
    theoryGroup: '',
    startDate: '',
    expectedArrivalDate: '',
    groupNumber: '',
    recordMode: '',
    insuranceStatus: '',
    extraHours: '',
    failedExamAttempts: '',
    courseOutcome: '',
    
    // Parent/Guardian
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    parentFeedbackEnabled: '',
    
    // Lessons & Payments
    paidLessons: '',
    completedHours: '0',
    lessonPackage: '',
    
    // Notes
    notes: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    if (!isBackendStudentId) {
      setSubmitError(
        'Този курсист е със стар локален идентификатор. Отвори курсиста от обновения списък, за да заредиш реалния PostgreSQL запис.',
      );
      return;
    }

    let isMounted = true;

    fetchStudentOperationalDetail(id)
      .then((record) => {
        if (!isMounted) {
          return;
        }

        setFormData((current) => ({
          ...current,
          firstName: record.firstName ?? record.name.split(' ')[0] ?? '',
          lastName: record.lastName ?? record.name.split(' ').slice(1).join(' '),
          email: record.email,
          phone: record.phone,
          address: record.address ?? '',
          birthDate: record.birthDate ?? '',
          idNumber: record.nationalId,
          educationLevel: mapEducationLevelToFormValue(record.educationLevel),
          category: record.category,
          studentType:
            record.trainingMode === 'licensed-manual-hours'
              ? 'licensed-manual-hours'
              : 'standard',
          previousLicenseCategory: record.previousLicenseCategory,
          instructor: record.instructor,
          theoryGroup: record.groupNumber,
          startDate: record.trainingStartDate || record.startDate,
          expectedArrivalDate: record.expectedArrivalDate,
          groupNumber: record.groupNumber,
          recordMode: record.recordMode || 'electronic',
          extraHours: String(record.extraHours ?? 0),
          failedExamAttempts: String(record.failedExamAttempts ?? 0),
          courseOutcome: mapCourseOutcomeToFormValue(record.courseOutcome),
          parentName: record.parentName ?? '',
          parentPhone: record.parentPhone ?? '',
          parentEmail: record.parentEmail ?? '',
          parentFeedbackEnabled: record.parentFeedbackEnabled ? 'enabled' : 'disabled',
          paidLessons: String(record.maxTrainingHours - (record.extraHours ?? 0)),
          completedHours: String(record.used ?? 0),
          lessonPackage: String(record.maxTrainingHours - (record.extraHours ?? 0)),
          notes: '',
        }));
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Неуспешно зареждане на курсиста.',
        );
      });

    return () => {
      isMounted = false;
    };
  }, [id, isBackendStudentId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = toStudentMutationPayload(formData);

      if (isEdit && isBackendStudentId && id && session?.csrfToken) {
        const updatedStudent = await updateStudentRecord(
          id,
          payload,
          session.csrfToken,
        );

        setSuccessMessage(buildStudentSaveMessage(true, updatedStudent.portalAccess));
      } else if (!isEdit && session?.csrfToken) {
        const createdStudent = await createStudentRecord(
          payload,
          session.csrfToken,
        );

        setSuccessMessage(
          buildStudentSaveMessage(false, createdStudent.portalAccess),
        );
      }

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/students');
      }, 1200);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Неуспешно запазване на курсиста.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Редактиране на курсист' : 'Нов курсист'}
        description={isEdit ? 'Актуализация на информацията за курсиста' : 'Добавяне на нов курсист в системата'}
        breadcrumbs={[
          { label: 'Начало', onClick: () => navigate('/') },
          { label: 'Курсисти', onClick: () => navigate('/students') },
          { label: isEdit ? 'Редактиране' : 'Нов курсист' },
        ]}
      />

      <form onSubmit={handleSubmit} className="p-6 lg:p-8 max-w-5xl">
        {/* Success Alert */}
        {showSuccess && (
          <div className="mb-6">
            <Alert
              type="success"
              title={isEdit ? 'Промените са запазени' : 'Курсистът е добавен'}
              message={successMessage}
            />
          </div>
        )}

        {submitError && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Неуспешно запазване"
              message={submitError}
            />
          </div>
        )}

        {/* Personal Information */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)' }}>
          <h3 className="mb-6" style={{ color: 'var(--text-primary)' }}>
            Лична информация
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              label="Дата на раждане"
              type="text"
              placeholder="ДД.ММ.ГГГГ"
              value={formData.birthDate}
              onChange={(value) => setFormData({ ...formData, birthDate: value })}
              icon={<Calendar size={18} />}
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

            <div className="md:col-span-2">
              <InputField
                label="Адрес"
                placeholder="гр. София, ул. ..."
                value={formData.address}
                onChange={(value) => setFormData({ ...formData, address: value })}
                icon={<MapPin size={18} />}
                required
              />
            </div>
          </div>
        </div>

        {/* Training Information */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)' }}>
          <h3 className="mb-6" style={{ color: 'var(--text-primary)' }}>
            Информация за обучението
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Категория книжка"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              options={[
                { value: '', label: 'Изберете категория...' },
                { value: 'A', label: 'Категория A' },
                { value: 'A1', label: 'Категория A1' },
                { value: 'A2', label: 'Категория A2' },
                { value: 'B', label: 'Категория B' },
                { value: 'C', label: 'Категория C' },
                { value: 'D', label: 'Категория D' },
              ]}
              icon={<Car size={18} />}
              required
            />

            <SelectField
              label="Тип курсист"
              value={formData.studentType}
              onChange={(value) => setFormData({ ...formData, studentType: value })}
              options={[
                { value: '', label: 'Изберете тип курсист...' },
                { value: 'standard', label: 'Стандартен курсист' },
                { value: 'licensed-manual-hours', label: 'Курсист с книжка · ръчно добавяне на часове' },
              ]}
              icon={<User size={18} />}
              required
            />

            <SelectField
              label="Инструктор"
              value={formData.instructor}
              onChange={(value) => setFormData({ ...formData, instructor: value })}
              options={[
                { value: '', label: 'Изберете инструктор...' },
                { value: 'Георги Петров', label: 'Георги Петров' },
                { value: 'Иван Димитров', label: 'Иван Димитров' },
                { value: 'Стоян Василев', label: 'Стоян Василев' },
                { value: 'Мария Петкова', label: 'Мария Петкова' },
              ]}
              icon={<User size={18} />}
              required
            />

            <SelectField
              label="Група за теория"
              value={formData.theoryGroup}
              onChange={(value) => setFormData({ ...formData, theoryGroup: value })}
              options={[
                { value: '', label: 'Изберете група...' },
                { value: '315003', label: 'Група 315003 - Понеделник и Сряда 18:00' },
                { value: '315004', label: 'Група 315004 - Вторник и Четвъртък 18:00' },
                { value: '224110', label: 'Група 224110 - Събота 10:00' },
                { value: '315010', label: 'Група 315010 - Неделя 10:00' },
              ]}
              icon={<BookOpen size={18} />}
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
              helpText="10 дни преди тази дата системата трябва да напомни на админ."
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
              placeholder="Например B, A1..."
              value={formData.previousLicenseCategory}
              onChange={(value) => setFormData({ ...formData, previousLicenseCategory: value })}
              icon={<Car size={18} />}
              helpText="Ползва се при курсисти, които вече имат книжка."
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
              helpText="Извън стандартния пакет по регистър"
            />

            <InputField
              label="Брой скъсвания на изпит"
              type="number"
              placeholder="0"
              value={formData.failedExamAttempts}
              onChange={(value) => setFormData({ ...formData, failedExamAttempts: value })}
              helpText="Ако курсистът е скъсан, отбележете броя опити и задайте допълнителни часове."
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
          </div>
        </div>

        {/* Lessons & Payments */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)' }}>
          <h3 className="mb-6" style={{ color: 'var(--text-primary)' }}>
            Часове и плащания
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              label="Пакет часове"
              value={formData.lessonPackage}
              onChange={(value) => setFormData({ ...formData, lessonPackage: value })}
              options={[
                { value: '', label: 'Изберете пакет...' },
                { value: '10', label: 'Пакет 10 часа - 600 €' },
                { value: '15', label: 'Пакет 15 часа - 850 €' },
                { value: '20', label: 'Пакет 20 часа - 1,100 €' },
                { value: '25', label: 'Пакет 25 часа - 1,350 €' },
                { value: 'custom', label: 'Персонализиран пакет' },
              ]}
              required
            />

            <InputField
              label="Платени часове"
              type="number"
              placeholder="20"
              value={formData.paidLessons}
              onChange={(value) => setFormData({ ...formData, paidLessons: value })}
              helpText="Брой платени часове практика"
              required
            />
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)' }}>
          <h3 className="mb-6" style={{ color: 'var(--text-primary)' }}>
            Родител / Настойник
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="md:col-span-2">
              <InputField
                label="Email на родител"
                type="email"
                placeholder="email@example.com"
                value={formData.parentEmail}
                onChange={(value) => setFormData({ ...formData, parentEmail: value })}
                icon={<Mail size={18} />}
              />
            </div>

            <div className="md:col-span-2">
              <SelectField
                label="Изпращане на отчет към родител"
                value={formData.parentFeedbackEnabled}
                onChange={(value) => setFormData({ ...formData, parentFeedbackEnabled: value })}
                options={[
                  { value: '', label: 'Изберете настройка...' },
                  { value: 'enabled', label: 'Разрешено след урок по избор на инструктор/админ' },
                  { value: 'disabled', label: 'Забранено' },
                ]}
                icon={<Mail size={18} />}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)' }}>
          <h3 className="mb-6" style={{ color: 'var(--text-primary)' }}>
            Бележки
          </h3>
          
          <TextareaField
            label="Допълнителна информация"
            placeholder="Добавете бележки или специфични изисквания..."
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            rows={4}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Запазване...'
              : isEdit
                ? 'Запази промени'
                : 'Добави курсист'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/students')}
          >
            Отказ
          </Button>
        </div>
      </form>
    </div>
  );
}

function buildStudentSaveMessage(
  isEdit: boolean,
  portalAccess:
    | {
        loginIdentifier: string;
        temporaryPassword: string | null;
        mustChangePassword: boolean;
        status:
          | 'created'
          | 'linked_existing'
          | 'already_linked'
          | 'updated_existing';
      }
    | null
    | undefined,
) {
  const baseMessage = isEdit
    ? 'Информацията беше успешно актуализирана.'
    : 'Новият курсист е добавен в системата.';

  if (!portalAccess) {
    return baseMessage;
  }

  if (portalAccess.status === 'created' && portalAccess.temporaryPassword) {
    return `${baseMessage} Portal вход: ${portalAccess.loginIdentifier}. Временна парола: ${portalAccess.temporaryPassword}. Смяната на паролата е задължителна при първи вход.`;
  }

  if (portalAccess.status === 'linked_existing') {
    return `${baseMessage} Курсистът беше свързан с вече съществуващ portal акаунт. Вход: ${portalAccess.loginIdentifier}.`;
  }

  if (portalAccess.status === 'updated_existing') {
    return `${baseMessage} Свързаният portal акаунт беше синхронизиран. Вход: ${portalAccess.loginIdentifier}.`;
  }

  return `${baseMessage} Portal достъпът вече е наличен. Вход: ${portalAccess.loginIdentifier}.`;
}

function toStudentMutationPayload(
  formData: ReturnType<typeof useStudentFormInitialState>,
): StudentMutationPayload {
  const studentStatus = mapFormCourseOutcomeToStudentStatus(formData.courseOutcome);
  const enrollmentStatus = mapFormCourseOutcomeToEnrollmentStatus(
    formData.courseOutcome,
    Number(formData.failedExamAttempts || 0),
  );
  const packageHours = Number(
    formData.paidLessons || formData.lessonPackage || 0,
  );
  const additionalHours = Number(formData.extraHours || 0);
  const completedHours = Math.min(
    Number(formData.completedHours || 0),
    packageHours + additionalHours,
  );

  return {
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    email: formData.email || null,
    nationalId: formData.idNumber || null,
    birthDate: normalizeFormDate(formData.birthDate),
    address: formData.address || null,
    educationLevel: mapEducationLevelToBackendLabel(formData.educationLevel),
    parentName: formData.parentName || null,
    parentPhone: formData.parentPhone || null,
    parentEmail: formData.parentEmail || null,
    parentContactStatus:
      formData.parentFeedbackEnabled === 'enabled' ? 'ENABLED' : 'DISABLED',
    status: studentStatus,
    enrollment: {
      categoryCode: (formData.category || 'B').toUpperCase(),
      status: enrollmentStatus,
      trainingMode:
        formData.studentType === 'licensed-manual-hours'
          ? 'LICENSED_MANUAL_HOURS'
          : 'STANDARD_PACKAGE',
      registerMode:
        formData.recordMode === 'paper'
          ? 'PAPER'
          : formData.recordMode === 'hybrid'
            ? 'HYBRID'
            : 'ELECTRONIC',
      theoryGroupNumber: formData.groupNumber || formData.theoryGroup || null,
      assignedInstructorName: formData.instructor || null,
      enrollmentDate:
        normalizeFormDate(formData.startDate) ??
        new Date().toISOString().slice(0, 10),
      expectedArrivalDate: normalizeFormDate(formData.expectedArrivalDate),
      previousLicenseCategory: formData.previousLicenseCategory || null,
      packageHours,
      additionalHours,
      completedHours,
      failedExamAttempts: Number(formData.failedExamAttempts || 0),
      lastPracticeAt:
        completedHours > 0 ? new Date().toISOString() : null,
      notes: formData.notes || null,
    },
  };
}

function useStudentFormInitialState() {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    idNumber: '',
    educationLevel: '',
    category: '',
    studentType: '',
    previousLicenseCategory: '',
    instructor: '',
    theoryGroup: '',
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
    paidLessons: '',
    completedHours: '0',
    lessonPackage: '',
    notes: '',
  };
}

function normalizeFormDate(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const dateMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmedValue);

  if (!dateMatch) {
    return null;
  }

  return `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
}

function mapEducationLevelToBackendLabel(value: string) {
  if (value === 'basic') {
    return 'Основно';
  }

  if (value === 'secondary') {
    return 'Средно';
  }

  if (value === 'college') {
    return 'Полувисше / колеж';
  }

  if (value === 'higher') {
    return 'Висше';
  }

  return value || null;
}

function mapEducationLevelToFormValue(value?: string | null) {
  if (value === 'Основно') {
    return 'basic';
  }

  if (value === 'Средно') {
    return 'secondary';
  }

  if (value === 'Полувисше / колеж') {
    return 'college';
  }

  if (value === 'Висше') {
    return 'higher';
  }

  return value ?? '';
}

function mapCourseOutcomeToFormValue(value?: string) {
  if (value === 'withdrawn') {
    return 'withdrawn';
  }

  if (value === 'completed' || value === 'passed') {
    return 'completed';
  }

  return 'active';
}

function mapFormCourseOutcomeToStudentStatus(value: string) {
  if (value === 'completed') {
    return 'COMPLETED';
  }

  if (value === 'withdrawn' || value === 'transferred') {
    return 'WITHDRAWN';
  }

  return 'ACTIVE';
}

function mapFormCourseOutcomeToEnrollmentStatus(
  value: string,
  failedExamAttempts: number,
) {
  if (value === 'completed') {
    return 'PASSED';
  }

  if (value === 'withdrawn' || value === 'transferred') {
    return 'WITHDRAWN';
  }

  if (failedExamAttempts > 0) {
    return 'FAILED_EXAM';
  }

  return 'ACTIVE';
}
