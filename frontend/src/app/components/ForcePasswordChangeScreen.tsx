import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAuthSession } from '../services/authSession';

export function ForcePasswordChangeScreen() {
  const { changePassword, session } = useAuthSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (newPassword.length < 15) {
      setSubmitError('Новата парола трябва да е поне 15 символа.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Новата парола и потвърждението не съвпадат.');
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Неуспешна смяна на паролата.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-10"
      style={{ background: 'var(--bg-page)' }}
    >
      <div
        className="w-full max-w-xl rounded-[32px] p-8"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--ghost-border)',
        }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(34, 197, 94, 0.12)',
            color: 'var(--status-success)',
          }}
        >
          <ShieldCheck size={26} />
        </div>

        <h1
          className="mt-6 text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Смени временната парола
        </h1>
        <p
          className="mt-3 text-sm leading-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          Потребителят {session?.user.displayName} е маркиран за задължителна
          смяна на паролата преди достъп до системата.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <PasswordField
            label="Текуща парола"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordField
            label="Нова парола"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Потвърди новата парола"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {submitError ? (
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--status-error)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              {submitError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              currentPassword.length === 0 ||
              newPassword.length === 0 ||
              confirmPassword.length === 0
            }
            className="h-14 w-full rounded-2xl font-semibold transition-all disabled:opacity-60"
            style={{
              background:
                'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            {isSubmitting ? 'Записвам...' : 'Смени паролата и влез отново'}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <div
        className="flex items-center gap-3 rounded-2xl px-4"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--ghost-border)',
        }}
      >
        <span style={{ color: 'var(--text-tertiary)' }}>
          <Lock size={18} />
        </span>
        <input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 w-full bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
          autoComplete="off"
        />
      </div>
    </label>
  );
}
