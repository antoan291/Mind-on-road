import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageHeader } from '../components/ui-system/PageHeader';
import { Button } from '../components/ui-system/Button';
import { InputField, SelectField, TextareaField } from '../components/ui-system/FormField';
import { Alert } from '../components/ui-system/Alert';
import { User, Mail, Phone, MapPin, Calendar, Car, BookOpen, FileText } from 'lucide-react';

export function StudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    idNumber: '',
    
    // Training Information
    category: '',
    instructor: '',
    theoryGroup: '',
    startDate: '',
    
    // Parent/Guardian
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    
    // Lessons & Payments
    paidLessons: '',
    lessonPackage: '',
    
    // Notes
    notes: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/students');
    }, 2000);
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
              message={isEdit ? 'Информацията беше успешно актуализирана.' : 'Новият курсист е добавен в системата.'}
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
              placeholder="+359 888 123 456"
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
                { value: 'a', label: 'Категория A' },
                { value: 'a1', label: 'Категория A1' },
                { value: 'a2', label: 'Категория A2' },
                { value: 'b', label: 'Категория B' },
                { value: 'c', label: 'Категория C' },
                { value: 'd', label: 'Категория D' },
              ]}
              icon={<Car size={18} />}
              required
            />

            <SelectField
              label="Инструктор"
              value={formData.instructor}
              onChange={(value) => setFormData({ ...formData, instructor: value })}
              options={[
                { value: '', label: 'Изберете инструктор...' },
                { value: '1', label: 'Георги Петров' },
                { value: '2', label: 'Иван Димитров' },
                { value: '3', label: 'Стоян Василев' },
                { value: '4', label: 'Мария Петкова' },
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
                { value: '1', label: 'Група 1 - Понеделник и Сряда 18:00' },
                { value: '2', label: 'Група 2 - Вторник и Четвъртък 18:00' },
                { value: '3', label: 'Група 3 - Събота 10:00' },
                { value: '4', label: 'Група 4 - Неделя 10:00' },
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
                { value: '10', label: 'Пакет 10 часа - 600 лв' },
                { value: '15', label: 'Пакет 15 часа - 850 лв' },
                { value: '20', label: 'Пакет 20 часа - 1,100 лв' },
                { value: '25', label: 'Пакет 25 часа - 1,350 лв' },
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
              placeholder="+359 888 123 456"
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
          >
            {isEdit ? 'Запази промени' : 'Добави курсист'}
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
