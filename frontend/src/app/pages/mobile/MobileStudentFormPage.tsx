import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MobilePageHeader } from '../../components/mobile/MobilePageHeader';
import { InputField, SelectField, TextareaField } from '../../components/ui-system/FormField';
import { Alert } from '../../components/ui-system/Alert';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export function MobileStudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    category: '',
    instructor: '',
    startDate: '',
    address: '',
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
              placeholder="+359 888 123 456"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              icon={<Phone size={18} />}
              required
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
              label="Адрес"
              placeholder="гр. София, ул. ..."
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              icon={<MapPin size={18} />}
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
