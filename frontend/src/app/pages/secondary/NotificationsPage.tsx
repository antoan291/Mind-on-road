import { Bell } from 'lucide-react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { notifications } from './secondaryData';
import { DataTableLayout, InfoStack, MetricCard, MetricGrid, PageSection, Panel, statusLabel } from './secondaryShared';

export function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title={'Известия'}
        description={'Автоматични съобщения и сигнали.'}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Известия' }]}
      />
      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Bell size={18} />} label={'Всички'} value={String(notifications.length)} detail={'Последни сигнали'} tone='info' />
          <MetricCard icon={<Bell size={18} />} label={'Viber'} value={String(notifications.filter((item) => item.channel.includes('Viber')).length)} detail={'Съобщения'} tone='warning' />
        </MetricGrid>
        <Panel title={'Поток'} subtitle={'Последни известия.'}>
          <InfoStack items={[[ 'Автоматични', String(notifications.length) ], [ 'Готови', String(notifications.filter((item) => item.status === 'success').length) ]]} />
        </Panel>
        <Panel title={'Списък'} subtitle={'По канал и статус.'}>
          <DataTableLayout
            columns={['Време', 'Заглавие', 'Аудитория', 'Канал', 'Тип', 'Статус']}
            rows={notifications.map((item) => [
              item.time,
              item.title,
              item.audience,
              item.channel,
              item.type,
              <StatusBadge key={item.time + item.title} status={item.status}>{statusLabel(item.status)}</StatusBadge>,
            ])}
          />
        </Panel>
      </PageSection>
    </div>
  );
}
