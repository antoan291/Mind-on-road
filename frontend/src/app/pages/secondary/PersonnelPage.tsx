import { Plus, Shield, UserCircle, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui-system/Button';
import { FilterBar } from '../../components/ui-system/FilterBar';
import { InputField } from '../../components/ui-system/FormField';
import { Modal } from '../../components/ui-system/Modal';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { useAuthSession } from '../../services/authSession';
import {
  createPersonnel,
  deletePersonnel,
  fetchPersonnelRows,
  updatePersonnel,
  type PersonnelRoleKey,
  type PersonnelRow,
} from '../../services/personnelApi';
import { getRoleLabel } from '../../services/roleUtils';
import { MetricCard, MetricGrid, PageSection, Panel } from './secondaryShared';

type PersonnelFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleKeys: PersonnelRoleKey[];
};

const emptyFormState: PersonnelFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  roleKeys: ['instructor'],
};

export function PersonnelPage() {
  const { session } = useAuthSession();
  const [searchValue, setSearchValue] = useState('');
  const [rows, setRows] = useState<PersonnelRow[]>([]);
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formState, setFormState] = useState<PersonnelFormState>(emptyFormState);
  const [editingRow, setEditingRow] = useState<PersonnelRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const passwordError =
    !editingRow && formState.password.trim().length > 0 && formState.password.trim().length < 8
      ? 'Паролата трябва да е поне 8 символа.'
      : null;
  const confirmPasswordError =
    !editingRow &&
    formState.confirmPassword.trim().length > 0 &&
    formState.password !== formState.confirmPassword
      ? 'Паролите не съвпадат.'
      : null;

  useEffect(() => {
    void loadPersonnel();
  }, []);

  async function loadPersonnel() {
    try {
      setSourceStatus('loading');
      const items = await fetchPersonnelRows();
      setRows(items);
      setSourceStatus('ready');
    } catch {
      setRows([]);
      setSourceStatus('error');
    }
  }

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((item) =>
      [
        item.displayName,
        item.email,
        item.phone ?? '',
        item.roleLabels.join(' '),
      ].some((field) => field.toLowerCase().includes(query)),
    );
  }, [rows, searchValue]);

  const instructorCount = rows.filter((item) => item.roleKeys.includes('instructor')).length;
  const administrationCount = rows.filter((item) => item.roleKeys.includes('administration')).length;
  const simulatorInstructorCount = rows.filter((item) =>
    item.roleKeys.includes('simulator_instructor'),
  ).length;
  const dualRoleCount = rows.filter((item) => item.roleKeys.length > 1).length;

  function openCreateModal() {
    setEditingRow(null);
    setFormState(emptyFormState);
    setFormError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function openEditModal(row: PersonnelRow) {
    setEditingRow(row);
    setFormState({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone ?? '',
      password: '',
      confirmPassword: '',
      roleKeys: row.roleKeys,
    });
    setFormError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingRow(null);
    setFormState(emptyFormState);
    setFormError(null);
  }

  async function handleDelete() {
    if (!session?.csrfToken || !editingRow) {
      setFormError('Липсва активна сесия.');
      return;
    }

    const confirmed = window.confirm(
      `Сигурен ли си, че искаш да изтриеш ${editingRow.displayName}? Login достъпът за този служител също ще бъде премахнат.`,
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      await deletePersonnel(editingRow.membershipId, session.csrfToken);
      await loadPersonnel();
      closeModal();
      setSuccessMessage('Служителят е изтрит и login достъпът му е премахнат.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Служителят не можа да бъде изтрит.');
    } finally {
      setIsSaving(false);
    }
  }

  function toggleRole(roleKey: PersonnelRoleKey) {
    setFormState((current) => {
      const hasRole = current.roleKeys.includes(roleKey);
      if (hasRole) {
        if (current.roleKeys.length === 1) {
          return current;
        }

        return {
          ...current,
          roleKeys: current.roleKeys.filter((item) => item !== roleKey),
        };
      }

      return {
        ...current,
        roleKeys: [...current.roleKeys, roleKey],
      };
    });
  }

  async function handleSubmit() {
    if (!session?.csrfToken) {
      setFormError('Липсва активна сесия.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    if (!editingRow && formState.password.trim().length < 8) {
      setFormError('Паролата трябва да е поне 8 символа.');
      setIsSaving(false);
      return;
    }

    if (
      !editingRow &&
      formState.password.trim() &&
      formState.password !== formState.confirmPassword
    ) {
      setFormError('Паролите не съвпадат.');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        ...(!editingRow && formState.password.trim()
          ? { password: formState.password.trim() }
          : {}),
        roleKeys: formState.roleKeys,
      };

      if (editingRow) {
        await updatePersonnel(editingRow.membershipId, payload, session.csrfToken);
        setSuccessMessage('Служителят е обновен.');
      } else {
        const result = await createPersonnel(payload, session.csrfToken);
        setSuccessMessage(
          result.portalAccess
            ? `Служителят е създаден. Login: ${result.portalAccess.loginIdentifier}`
            : 'Служителят е създаден.',
        );
      }

      await loadPersonnel();
      if (editingRow) {
        closeModal();
      } else {
        setFormState(emptyFormState);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Служителят не можа да бъде записан.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Персонал"
        description={`Управление на служителите и техните специалности. ${
          sourceStatus === 'ready'
            ? 'Създаването на служители с роли Администрация, Инструктор и Инструктор симулатор минава само през тази страница.'
            : sourceStatus === 'error'
              ? 'Данните за персонала не са достъпни в момента.'
              : 'Зареждане на персонала...'
        }`}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Персонал' }]}
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={openCreateModal}>
            Добави служител
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Търсене по име, имейл, телефон или специалност..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showFilterButton={false}
      />

      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Users size={18} />} label="Общо служители" value={String(rows.length)} detail="Активни служители в школата" />
          <MetricCard icon={<UserCircle size={18} />} label="Инструктори" value={String(instructorCount)} detail="С включена специалност инструктор" />
          <MetricCard icon={<Shield size={18} />} label="Администрация" value={String(administrationCount)} detail="С включена административна специалност" />
          <MetricCard icon={<Shield size={18} />} label="Инструктор симулатор" value={String(simulatorInstructorCount)} detail="С включена симулаторна специалност" />
          <MetricCard icon={<Shield size={18} />} label="Комбинирани роли" value={String(dualRoleCount)} detail="Служители с повече от една специалност" />
        </MetricGrid>

        {successMessage ? (
          <div
            className="rounded-2xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(34, 197, 94, 0.12)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(34, 197, 94, 0.22)',
            }}
          >
            {successMessage}
          </div>
        ) : null}

        <Panel
          title="Екип"
          subtitle="Добави служител и избери една или повече специалности. Ако служителят има две специалности, получава достъп до правата и на двете."
        >
          <div className="grid gap-4">
            {filteredRows.map((item) => (
              <button
                key={item.membershipId}
                type="button"
                onClick={() => openEditModal(item)}
                className="rounded-[24px] border px-5 py-5 text-left transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--bg-card-elevated)',
                  borderColor: 'var(--ghost-border)',
                }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {item.displayName}
                      </h3>
                      <StatusBadge status={item.roleKeys.length > 1 ? 'info' : 'success'}>
                        {item.roleLabels.join(' + ')}
                      </StatusBadge>
                      {item.mustChangePassword ? (
                        <StatusBadge status="warning">Чака смяна на парола</StatusBadge>
                      ) : null}
                    </div>
                    <div className="mt-2 grid gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <p>{item.email}</p>
                      <p>{item.phone ?? 'Няма телефон'}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <InfoChip label="Специалности" value={String(item.roleKeys.length)} />
                    <InfoChip label="Курсисти" value={String(item.assignedStudentsCount)} />
                    <InfoChip label="От" value={formatDate(item.joinedAt)} />
                  </div>
                </div>
              </button>
            ))}

            {!filteredRows.length ? (
              <div
                className="rounded-3xl p-6 text-sm"
                style={{
                  background: 'var(--bg-card-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--ghost-border)',
                }}
              >
                Няма служители по текущите филтри.
              </div>
            ) : null}
          </div>
        </Panel>
      </PageSection>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRow ? 'Редакция на служител' : 'Добави служител'}
        footer={
          <>
            {editingRow ? (
              <Button
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={isSaving}
              >
                {isSaving ? 'Изтриване...' : 'Изтрий служител'}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={closeModal}>
              Отказ
            </Button>
            <Button variant="primary" onClick={() => void handleSubmit()} disabled={isSaving}>
              {isSaving ? 'Записване...' : editingRow ? 'Запази' : 'Създай'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Име"
            value={formState.firstName}
            onChange={(value) => setFormState((current) => ({ ...current, firstName: value }))}
            required
          />
          <InputField
            label="Фамилия"
            value={formState.lastName}
            onChange={(value) => setFormState((current) => ({ ...current, lastName: value }))}
            required
          />
          <InputField
            label="Имейл"
            type="email"
            value={formState.email}
            onChange={(value) => setFormState((current) => ({ ...current, email: value }))}
            required
          />
          <InputField
            label="Телефон"
            type="tel"
            value={formState.phone}
            onChange={(value) => setFormState((current) => ({ ...current, phone: value }))}
            required
            helpText="Телефонът служи и като login идентификатор."
          />
          {!editingRow ? (
            <>
              <InputField
                label="Парола"
                type="password"
                value={formState.password}
                onChange={(value) => setFormState((current) => ({ ...current, password: value }))}
                error={passwordError ?? undefined}
                required
                helpText="Минимум 8 символа. Служителят ще може да влиза веднага с този имейл и тази парола."
              />
              <InputField
                label="Повтори парола"
                type="password"
                value={formState.confirmPassword}
                onChange={(value) =>
                  setFormState((current) => ({ ...current, confirmPassword: value }))
                }
                error={confirmPasswordError ?? undefined}
                required={Boolean(formState.password)}
                helpText="Трябва да съвпада с паролата по-горе."
              />
            </>
          ) : null}
        </div>

        {editingRow ? (
          <div
            className="mt-4 rounded-2xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(59, 130, 246, 0.18)',
            }}
          >
            Паролата не се редактира оттук. Служителят я сменя сам след вход в профила си.
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Специалности
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <RoleToggleCard
              title="Инструктор"
              description="Достъп до практиката, графика и курсистите в инструкторски обхват."
              isSelected={formState.roleKeys.includes('instructor')}
              onClick={() => toggleRole('instructor')}
            />
            <RoleToggleCard
              title="Администрация"
              description="Оперативен административен достъп в рамките на школата."
              isSelected={formState.roleKeys.includes('administration')}
              onClick={() => toggleRole('administration')}
            />
            <RoleToggleCard
              title="Инструктор симулатор"
              description="Достъп до симулаторните обучения и свързаните графици."
              isSelected={formState.roleKeys.includes('simulator_instructor')}
              onClick={() => toggleRole('simulator_instructor')}
            />
          </div>
        </div>

        {formError ? (
          <div
            className="mt-4 rounded-2xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(239, 68, 68, 0.22)',
            }}
          >
            {formError}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function RoleToggleCard(props: {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="rounded-2xl border p-4 text-left transition-all"
      style={{
        background: props.isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card-elevated)',
        borderColor: props.isSelected ? 'rgba(59, 130, 246, 0.32)' : 'var(--ghost-border)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {props.title}
        </span>
        <StatusBadge status={props.isSelected ? 'info' : 'neutral'}>
          {props.isSelected ? 'Включена' : 'Изключена'}
        </StatusBadge>
      </div>
      <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
        {props.description}
      </p>
    </button>
  );
}

function InfoChip(props: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid var(--ghost-border)',
      }}
    >
      <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
        {props.label}
      </p>
      <p className="mt-2 text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
        {props.value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
