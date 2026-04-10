import { ChevronDown } from 'lucide-react';
import { DatePickerInput } from '../date/DatePickerInput';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
}

export function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  required,
  helpText,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--status-error)' }}>*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
            {icon}
          </div>
        )}
        {type === 'date' ? (
          <DatePickerInput
            value={value ?? ''}
            onChange={(nextValue) => onChange?.(nextValue)}
            placeholder={placeholder}
            icon={icon}
            className={`
              w-full h-12 rounded-lg px-4 border transition-all
              focus:outline-none focus:shadow-[var(--glow-indigo)]
              ${error ? 'border-[var(--status-error)]' : ''}
            `}
            style={{
              background: 'var(--bg-panel)',
              borderColor: error ? 'var(--status-error)' : 'var(--ghost-border-medium)',
              color: 'var(--text-primary)',
            }}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={`
              w-full h-12 rounded-lg px-4 border transition-all
              focus:outline-none focus:shadow-[var(--glow-indigo)]
              ${icon ? 'pl-12' : ''}
              ${error ? 'border-[var(--status-error)]' : ''}
            `}
            style={{
              background: 'var(--bg-panel)',
              borderColor: error ? 'var(--status-error)' : 'var(--ghost-border-medium)',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </div>

      {error && (
        <p className="text-xs" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps extends BaseFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Изберете...',
  error,
  required,
  helpText,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--status-error)' }}>*</span>}
      </label>
      
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`
            w-full h-12 rounded-lg px-4 pr-10 border transition-all appearance-none
            focus:outline-none focus:shadow-[var(--glow-indigo)]
            ${error ? 'border-[var(--status-error)]' : ''}
          `}
          style={{
            background: 'var(--bg-panel)',
            borderColor: error ? 'var(--status-error)' : 'var(--ghost-border-medium)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-tertiary)' }}
        />
      </div>

      {error && (
        <p className="text-xs" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}

export function TextareaField({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  required,
  helpText,
}: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--status-error)' }}>*</span>}
      </label>
      
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        className={`
          w-full rounded-lg px-4 py-3 border transition-all resize-none
          focus:outline-none focus:shadow-[var(--glow-indigo)]
          ${error ? 'border-[var(--status-error)]' : ''}
        `}
        style={{
          background: 'var(--bg-panel)',
          borderColor: error ? 'var(--status-error)' : 'var(--ghost-border-medium)',
          color: 'var(--text-primary)',
        }}
      />

      {error && (
        <p className="text-xs" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {helpText}
        </p>
      )}
    </div>
  );
}
