import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { CalendarDays } from 'lucide-react';

import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type DatePickerInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: ReactNode;
  className: string;
  style?: CSSProperties;
};

const bgDateFormatter = new Intl.DateTimeFormat('bg-BG', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'Изберете дата',
  disabled = false,
  icon,
  className,
  style,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`relative ${className}`}
          style={style}
        >
          {icon ? (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }}>
              {icon}
            </span>
          ) : null}
          <span
            className={`block truncate text-left ${icon ? 'pl-8' : ''} pr-8`}
            style={{
              color: selectedDate ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            {selectedDate ? bgDateFormatter.format(selectedDate) : placeholder}
          </span>
          <CalendarDays
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onChange(date ? formatIsoDate(date) : '');
            setIsOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function parseDateValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    const [year, month, day] = trimmedValue.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const dateMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmedValue);

  if (!dateMatch) {
    return undefined;
  }

  return new Date(
    Date.UTC(Number(dateMatch[3]), Number(dateMatch[2]) - 1, Number(dateMatch[1])),
  );
}

function formatIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
