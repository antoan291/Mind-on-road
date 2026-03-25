import { ReactNode } from 'react';

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'time';
  icon?: ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  error,
  required,
  disabled,
  fullWidth = true,
}: InputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
          {required && <span style={{ color: 'var(--status-error)' }}> *</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full h-11 rounded-xl px-4
            ${icon ? 'pl-10' : ''}
            text-sm transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none
          `}
          style={{
            background: 'var(--bg-panel)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--status-error)' : '1px solid transparent',
          }}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  required,
  disabled,
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
          {required && <span style={{ color: 'var(--status-error)' }}> *</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full rounded-xl px-4 py-3 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none resize-none"
        style={{
          background: 'var(--bg-panel)',
          color: 'var(--text-primary)',
          border: error ? '1px solid var(--status-error)' : '1px solid transparent',
        }}
      />
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  disabled,
  fullWidth = true,
}: SelectProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
          {required && <span style={{ color: 'var(--status-error)' }}> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-11 rounded-xl px-4 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none appearance-none bg-no-repeat bg-right pr-10"
        style={{
          background: 'var(--bg-panel)',
          color: 'var(--text-primary)',
          border: error ? '1px solid var(--status-error)' : '1px solid transparent',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 1rem center',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: 'var(--status-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
