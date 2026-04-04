import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { BrainCircuit, Building2, Lock, UserRound } from 'lucide-react';
import { useAuthSession } from '../services/authSession';

export function LoginPage() {
  const navigate = useNavigate();
  const { authState, authError, login } = useAuthSession();
  const [tenantSlug, setTenantSlug] = useState('mindonroad-demo-school');
  const [email, setEmail] = useState('owner@mindonroad.local');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authState === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await login({
        tenantSlug,
        email,
        password,
      });
      navigate('/', { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Неуспешен вход. Провери данните и опитай отново.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <section className="flex-1">
          <div
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background:
                'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
              color: '#ffffff',
            }}
          >
            <BrainCircuit size={28} />
          </div>
          <h1
            className="mt-8 max-w-xl text-4xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            MindOnRoad оперативна платформа
          </h1>
          <p
            className="mt-4 max-w-xl text-base leading-7"
            style={{ color: 'var(--text-secondary)' }}
          >
            Влез в tenant акаунта на автошколата, за да управляваш курсисти,
            графици, плащания, документи и AI операции през реалния backend.
          </p>
        </section>

        <section
          className="w-full max-w-xl rounded-[32px] p-8"
          style={{
            background:
              'linear-gradient(180deg, rgba(18, 27, 50, 0.96), rgba(14, 22, 42, 0.98))',
            border: '1px solid var(--ghost-border)',
          }}
        >
          <div className="mb-8">
            <p
              className="text-sm uppercase tracking-[0.24em]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Сигурен вход
            </p>
            <h2
              className="mt-3 text-2xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Влез в системата
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AuthField
              label="Tenant"
              icon={<Building2 size={18} />}
              value={tenantSlug}
              onChange={setTenantSlug}
              placeholder="mindonroad-demo-school"
            />
            <AuthField
              label="Email или телефон"
              icon={<UserRound size={18} />}
              value={email}
              onChange={setEmail}
              placeholder="owner@mindonroad.local или 0886612503"
            />
            <AuthField
              label="Парола"
              icon={<Lock size={18} />}
              value={password}
              onChange={setPassword}
              placeholder="Въведи парола"
              type="password"
            />

            {(submitError || authError) && (
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--status-error)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                {submitError || authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || password.length === 0}
              className="h-14 w-full rounded-2xl font-semibold transition-all disabled:opacity-60"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary-accent), var(--primary-accent-dim))',
                color: '#ffffff',
              }}
            >
              {isSubmitting ? 'Влизане...' : 'Вход'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function AuthField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
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
          background: 'var(--bg-card)',
          border: '1px solid var(--ghost-border)',
        }}
      >
        <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-14 w-full bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
          autoComplete="off"
        />
      </div>
    </label>
  );
}
