import { Bot, Settings2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { Button } from '../../components/ui-system/Button';
import { ChecklistItem, InfoStack, PageSection, Panel, ThreeColumnGrid, ToggleLine, TwoColumnGrid } from './secondaryShared';

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Настройки"
        description="Конфигурация на школата, автоматизациите, сигурността, AI модула и документния контрол."
        breadcrumbs={[{ label: 'Начало' }, { label: 'Настройки' }]}
        actions={
          <>
            <Button variant="secondary" icon={<ShieldCheck size={18} />}>
              Политики
            </Button>
            <Button variant="primary" icon={<Settings2 size={18} />}>
              Запази промени
            </Button>
          </>
        }
      />

      <PageSection>
        <TwoColumnGrid>
          <Panel title="Профил на школата" subtitle="Базови настройки, които влияят на всички модули.">
            <InfoStack items={[
              ['Име на школа', 'Mind on Road · София'],
              ['Основна категория', 'B, A, AM'],
              ['Работно време', '08:00 – 24:00'],
              ['Основен канал за известия', 'Viber'],
              ['Формат на валута', 'BGN + EUR при теория отсъствие'],
            ]} />
          </Panel>

          <Panel title="AI и OCR" subtitle="Тук се контролира какво е автоматично и къде остава човешкият преглед.">
            <ChecklistItem title="OCR на лични карти и книжки" description="Имената и номерата се извличат автоматично, но попадането в официален документ минава през човешки преглед." tone="success" />
            <ChecklistItem title="AI прогнози" description="Включени са риск от забавено плащане, отпадане и нужда от допълнителни часове." tone="info" />
            <ChecklistItem title="Owner chat" description="Работи само с tenant-scoped данни и не вижда информация от други школи." tone="success" />
            <ChecklistItem title="Автоматично презаписване" description="Забранено е за чувствителни официални данни без потвърждение от администрация." tone="warning" />
          </Panel>
        </TwoColumnGrid>

        <ThreeColumnGrid>
          <Panel title="Известия и автоматика" subtitle="Кои тригери са активни.">
            <ToggleLine label="Липсва плащане за практически час" state="Активно" />
            <ToggleLine label="Отсъствие от теория" state="Активно" />
            <ToggleLine label="10-ти час категория B" state="Активно" />
            <ToggleLine label="Приветствено съобщение" state="Активно" />
          </Panel>

          <Panel title="Сигурност" subtitle="Минимални настройки за първа версия.">
            <ToggleLine label="MFA за администратори" state="Задължително" tone="success" />
            <ToggleLine label="Достъп до документи със signed URLs" state="Активно" tone="success" />
            <ToggleLine label="Audit log за критични действия" state="Активно" tone="success" />
            <ToggleLine label="Role-based достъп по tenant" state="Активно" tone="success" />
          </Panel>

          <Panel title="Backup и възстановяване" subtitle="Ключовите контроли според архитектурните документи.">
            <ToggleLine label="Hetzner daily backups" state="18:00" />
            <ToggleLine label="Object Lock за критични документи" state="Включено" tone="success" />
            <ToggleLine label="Offsite копие" state="Активно" tone="success" />
            <ToggleLine label="Локален emergency backup" state="Админ лаптоп" tone="info" />
          </Panel>
        </ThreeColumnGrid>
      </PageSection>
    </div>
  );
}
