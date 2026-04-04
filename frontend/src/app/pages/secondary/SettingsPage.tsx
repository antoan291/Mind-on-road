import { useEffect, useMemo, useState } from 'react';
import { Settings2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui-system/Button';
import { Modal } from '../../components/ui-system/Modal';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { Switch } from '../../components/ui/switch';
import { useAuthSession } from '../../services/authSession';
import type {
  TenantFeatureKey,
  TenantFeatureSetting,
} from '../../services/featureSettings';
import { useFeatureSettings } from '../../services/featureSettings';
import { ChecklistItem, InfoStack, PageSection, Panel, TwoColumnGrid } from './secondaryShared';

function FeatureRow({
  feature,
  onToggle,
}: {
  feature: TenantFeatureSetting;
  onToggle: (key: TenantFeatureKey, enabled: boolean) => void;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: feature.enabled ? 'var(--bg-card-elevated)' : 'rgba(15, 23, 42, 0.65)', border: '1px solid var(--ghost-border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-3"><h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{feature.label}</h3><span className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]" style={{ color: feature.enabled ? 'var(--status-success)' : 'var(--text-tertiary)', background: feature.enabled ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.04)' }}>{feature.enabled ? 'Активно' : 'Изключено'}</span></div><p className="mt-3 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p></div>
        <Switch checked={feature.enabled} onCheckedChange={(checked) => onToggle(feature.key, checked)} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--ghost-border)' }}><p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Пакет</p><p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{feature.tier}</p></div><div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--ghost-border)' }}><p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-tertiary)' }}>Скрити екрани при изключване</p><p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{feature.pages}</p></div></div>
    </div>
  );
}

export function SettingsPage() {
  const { session } = useAuthSession();
  const {
    featureSettingsState,
    settings,
    settingsError,
    saveFeatureSettings,
  } = useFeatureSettings();
  const [features, setFeatures] = useState<TenantFeatureSetting[]>(settings);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const disabledFeatures = useMemo(() => features.filter((feature) => !feature.enabled), [features]);
  const activeCount = features.length - disabledFeatures.length;
  const toggleFeature = (key: TenantFeatureKey, enabled: boolean) =>
    setFeatures((current) =>
      current.map((feature) =>
        feature.key === key ? { ...feature, enabled } : feature,
      ),
    );

  useEffect(() => {
    setFeatures(settings);
  }, [settings]);

  const handleSaveFeatures = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const savedSettings = await saveFeatureSettings(
        features.map((feature) => ({
          key: feature.key,
          enabled: feature.enabled,
        })),
      );

      setFeatures(savedSettings);
      setIsSaveModalOpen(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Неуспешен запис на пакетите.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Настройки"
        description="Централен licensing контрол за главния админ на платформата. Оттук определяш кои модули са платени и кои страници да се скриват за конкретната школа."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Настройки' }]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<ShieldCheck size={18} />}
              onClick={() => setIsAuditModalOpen(true)}
            >
              Одит на лицензите
            </Button>
            <Button
              variant="primary"
              icon={<Settings2 size={18} />}
              onClick={() => void handleSaveFeatures()}
              disabled={featureSettingsState === 'loading' || isSaving}
            >
              {isSaving ? 'Записване...' : 'Запази пакетите'}
            </Button>
          </>
        }
      />
      <PageSection>
        <TwoColumnGrid>
          <Panel title="Профил на школата" subtitle="Това не е страница за собственика. Това е административен екран за теб като главен админ на SaaS платформата.">
            <InfoStack items={[['Школа', 'Mind on Road · София'], ['Текущ пакет', 'Professional + AI Suite'], ['Активни модули', String(activeCount) + ' от ' + String(features.length)], ['Изключени модули', String(disabledFeatures.length)], ['Логика при изключване', 'Скриване на страници и действия по tenant']]} />
          </Panel>
          <Panel title="Какво става при изключване" subtitle="Когато изключиш модул, свързаните страници и функционалности трябва да изчезват за конкретния бизнес.">
            {disabledFeatures.length === 0 ? <ChecklistItem title="Всички платени функционалности са активни" description="В момента няма изключени модули. Не трябва да има скрити страници за тази школа." tone="success" /> : disabledFeatures.map((feature) => <ChecklistItem key={feature.key} title={feature.label} description={'При изключване се скриват: ' + feature.pages + '. Освен страниците се спират и свързаните действия в системата.'} tone="warning" />)}
          </Panel>
        </TwoColumnGrid>
        <Panel title="Функционалности по абонамент" subtitle="Под профила на школата включваш и изключваш модулите, за които конкретният бизнес е платил.">
          {(settingsError || saveError) && (
            <div className="mb-4">
              <ChecklistItem
                title="Проблем при синхронизацията"
                description={settingsError ?? saveError ?? 'Неуспешна заявка.'}
                tone="error"
              />
            </div>
          )}
          {!session?.user.roleKeys.includes('owner') && (
            <div className="mb-4">
              <ChecklistItem
                title="Само owner може да записва пакети"
                description="Този екран е read-only за текущия потребител."
                tone="warning"
              />
            </div>
          )}
          <div className="space-y-4">{features.map((feature) => <FeatureRow key={feature.key} feature={feature} onToggle={toggleFeature} />)}</div>
        </Panel>
        <Panel title="Техническа логика" subtitle="Как трябва да се държи системата, когато даден модул е изключен за школа.">
          <div className="grid gap-4 lg:grid-cols-3"><ChecklistItem title="Скриване от менюто" description="Изключеният модул не трябва да се вижда в sidebar и mobile навигацията." tone="warning" /><ChecklistItem title="Route guard" description="Ако някой отвори директен URL към изключена страница, трябва да получи защитен fallback екран." tone="warning" /><ChecklistItem title="Action guard" description="Вътрешните бутони, автоматизации и AI действия на изключения модул също трябва да са спрени." tone="info" /></div>
        </Panel>
      </PageSection>

      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Одит на лицензите"
        size="medium"
      >
        <div className="space-y-4">
          <InfoStack
            items={[
              ['Активни модули', `${activeCount} от ${features.length}`],
              ['Изключени модули', String(disabledFeatures.length)],
              [
                'Последен резултат',
                disabledFeatures.length === 0
                  ? 'Всички модули са активни и достъпни за tenant-а.'
                  : `Има ${disabledFeatures.length} изключени модула, които трябва да се скрият от менюта и директни route заявки.`,
              ],
            ]}
          />

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setIsAuditModalOpen(false)}>
              Затвори
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Запази пакетите"
        size="medium"
      >
        <div className="space-y-4">
          <ChecklistItem
            title="UI конфигурацията е приложена"
            description={`Активни модули: ${features
              .filter((feature) => feature.enabled)
              .map((feature) => feature.label)
              .join(', ')}.`}
            tone="success"
          />

          {disabledFeatures.length > 0 && (
            <ChecklistItem
              title="Изключени модули"
              description={disabledFeatures
                .map((feature) => feature.label)
                .join(', ')}
              tone="warning"
            />
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setIsSaveModalOpen(false)}>
              Готово
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
