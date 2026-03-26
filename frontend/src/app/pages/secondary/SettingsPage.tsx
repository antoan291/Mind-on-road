import { useMemo, useState } from 'react';
import { Settings2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { Button } from '../../components/ui-system/Button';
import { Switch } from '../../components/ui/switch';
import { ChecklistItem, InfoStack, PageSection, Panel, TwoColumnGrid } from './secondaryShared';

type FeatureKey = 'payments' | 'invoices' | 'documents' | 'theory' | 'practical' | 'reports' | 'ai';
type FeatureItem = { key: FeatureKey; label: string; description: string; pages: string; enabled: boolean; tier: string };
const initialFeatures: FeatureItem[] = [
  { key: 'payments', label: 'Плащания', description: 'Таблица за плащания, статуси и контрол на дължимите суми.', pages: 'Плащания, практика, профили', enabled: true, tier: 'Core Finance' },
  { key: 'invoices', label: 'Фактури', description: 'Издаване и преглед на фактури и OCR на разходи.', pages: 'Фактури, отчети', enabled: true, tier: 'Core Finance' },
  { key: 'documents', label: 'Документи', description: 'Документен модул, подписи, лични карти и контрол на достъпа.', pages: 'Документи, OCR', enabled: true, tier: 'Compliance' },
  { key: 'theory', label: 'Теория', description: 'Групи, присъствие, отсъствия и автоматични съобщения.', pages: 'Теория, групи по теория', enabled: true, tier: 'Operations' },
  { key: 'practical', label: 'Практика', description: 'Практически часове, график, оценки и закъснения.', pages: 'Практика, график', enabled: true, tier: 'Operations' },
  { key: 'reports', label: 'Отчети', description: 'Приходи, разходи, печалба и ръчно добавяне на записи.', pages: 'Отчети', enabled: true, tier: 'Finance Plus' },
  { key: 'ai', label: 'AI пакет', description: 'AI център, OCR и AI чат за собственика.', pages: 'AI център, OCR, AI чат', enabled: true, tier: 'AI Suite' },
];

function FeatureRow({ feature, onToggle }: { feature: FeatureItem; onToggle: (key: FeatureKey, enabled: boolean) => void }) {
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
  const [features, setFeatures] = useState<FeatureItem[]>(initialFeatures);
  const disabledFeatures = useMemo(() => features.filter((feature) => !feature.enabled), [features]);
  const activeCount = features.length - disabledFeatures.length;
  const toggleFeature = (key: FeatureKey, enabled: boolean) => setFeatures((current) => current.map((feature) => feature.key === key ? { ...feature, enabled } : feature));
  return (
    <div>
      <PageHeader title="Настройки" description="Централен licensing контрол за главния админ на платформата. Оттук определяш кои модули са платени и кои страници да се скриват за конкретната школа." breadcrumbs={[{ label: 'Начало' }, { label: 'Настройки' }]} actions={<><Button variant="secondary" icon={<ShieldCheck size={18} />}>Одит на лицензите</Button><Button variant="primary" icon={<Settings2 size={18} />}>Запази пакетите</Button></>} />
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
          <div className="space-y-4">{features.map((feature) => <FeatureRow key={feature.key} feature={feature} onToggle={toggleFeature} />)}</div>
        </Panel>
        <Panel title="Техническа логика" subtitle="Как трябва да се държи системата, когато даден модул е изключен за школа.">
          <div className="grid gap-4 lg:grid-cols-3"><ChecklistItem title="Скриване от менюто" description="Изключеният модул не трябва да се вижда в sidebar и mobile навигацията." tone="warning" /><ChecklistItem title="Route guard" description="Ако някой отвори директен URL към изключена страница, трябва да получи защитен fallback екран." tone="warning" /><ChecklistItem title="Action guard" description="Вътрешните бутони, автоматизации и AI действия на изключения модул също трябва да са спрени." tone="info" /></div>
        </Panel>
      </PageSection>
    </div>
  );
}
