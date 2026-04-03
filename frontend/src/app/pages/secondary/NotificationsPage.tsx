import { Bell, CalendarClock, TriangleAlert } from 'lucide-react';
import { earlyEnrollmentReminders, inactivePracticeAlerts } from '../../content/studentOperations';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import { notifications } from './secondaryData';
import { DataTableLayout, InfoStack, MetricCard, MetricGrid, PageSection, Panel, statusLabel } from './secondaryShared';

export function NotificationsPage() {
  const operationalNotifications = [
    ...inactivePracticeAlerts.map((alert) => ({
      time: `Преди ${alert.daysWithoutPractice - 30} дни`,
      title: `Над 30 дни без практика · ${alert.studentName}`,
      audience: alert.studentName,
      channel: 'Система + админ',
      type: 'Практика',
      status: 'warning' as const,
    })),
    ...earlyEnrollmentReminders.map((reminder) => ({
      time: `${reminder.daysUntilArrival} дни до идване`,
      title: `Ранно записване · ${reminder.studentName}`,
      audience: 'Администратор',
      channel: 'Система',
      type: `Идва на ${reminder.expectedArrivalDate}`,
      status: 'info' as const,
    })),
    ...notifications,
  ];

  return (
    <div>
      <PageHeader
        title={'Известия'}
        description={'Автоматични съобщения и сигнали.'}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Известия' }]}
      />
      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Bell size={18} />} label={'Всички'} value={String(operationalNotifications.length)} detail={'Последни сигнали'} tone='info' />
          <MetricCard icon={<TriangleAlert size={18} />} label={'30+ дни без практика'} value={String(inactivePracticeAlerts.length)} detail={'Курсисти за контакт'} tone={inactivePracticeAlerts.length > 0 ? 'warning' : 'success'} />
          <MetricCard icon={<CalendarClock size={18} />} label={'Ранно записване'} value={String(earlyEnrollmentReminders.length)} detail={'Напомняния към админ'} tone='info' />
          <MetricCard icon={<Bell size={18} />} label={'Viber'} value={String(operationalNotifications.filter((item) => item.channel.includes('Viber')).length)} detail={'Съобщения'} tone='warning' />
        </MetricGrid>
        <Panel title={'Поток'} subtitle={'Последни известия.'}>
          <InfoStack items={[[ 'Автоматични', String(operationalNotifications.length) ], [ 'За админ намеса', String(inactivePracticeAlerts.length + earlyEnrollmentReminders.length) ]]} />
        </Panel>
        <Panel title={'Списък'} subtitle={'По канал и статус.'}>
          <DataTableLayout
            columns={['Време', 'Заглавие', 'Аудитория', 'Канал', 'Тип', 'Статус']}
            rows={operationalNotifications.map((item) => [
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
