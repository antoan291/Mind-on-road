import { Bell, CalendarClock, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../components/ui-system/PageHeader';
import { StatusBadge } from '../../components/ui-system/StatusBadge';
import {
  fetchNotificationRecords,
  type NotificationRecordView,
} from '../../services/notificationsApi';
import { DataTableLayout, InfoStack, MetricCard, MetricGrid, PageSection, Panel, statusLabel } from './secondaryShared';

export function NotificationsPage() {
  const [notificationRecords, setNotificationRecords] = useState<
    NotificationRecordView[]
  >([]);
  const [sourceStatus, setSourceStatus] = useState<'loading' | 'backend' | 'fallback'>('loading');

  useEffect(() => {
    let isMounted = true;

    fetchNotificationRecords()
      .then((records) => {
        if (!isMounted) {
          return;
        }

        setNotificationRecords(records);
        setSourceStatus('backend');
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setNotificationRecords([]);
        setSourceStatus('fallback');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentInactiveAlerts = useMemo(
    () =>
      notificationRecords.filter(
        (notification) => notification.kind === 'PRACTICE_INACTIVITY',
      ),
    [notificationRecords],
  );

  const currentEarlyReminders = useMemo(
    () =>
      notificationRecords.filter(
        (notification) => notification.kind === 'ARRIVAL_REMINDER',
      ),
    [notificationRecords],
  );

  return (
    <div>
      <PageHeader
        title={'Известия'}
        description={`Автоматични съобщения и сигнали. ${
          sourceStatus === 'backend'
            ? 'Оперативните сигнали са от PostgreSQL.'
            : sourceStatus === 'fallback'
              ? 'Backend данните не са достъпни в момента.'
              : 'Зареждане...'
        }`}
        breadcrumbs={[{ label: 'Начало' }, { label: 'Известия' }]}
      />
      <PageSection>
        <MetricGrid>
          <MetricCard icon={<Bell size={18} />} label={'Всички'} value={String(notificationRecords.length)} detail={'Последни сигнали'} tone='info' />
          <MetricCard icon={<TriangleAlert size={18} />} label={'30+ дни без практика'} value={String(currentInactiveAlerts.length)} detail={'Курсисти за контакт'} tone={currentInactiveAlerts.length > 0 ? 'warning' : 'success'} />
          <MetricCard icon={<CalendarClock size={18} />} label={'Ранно записване'} value={String(currentEarlyReminders.length)} detail={'Напомняния към админ'} tone='info' />
          <MetricCard icon={<Bell size={18} />} label={'Viber'} value={String(notificationRecords.filter((item) => item.channelLabel.includes('Viber')).length)} detail={'Съобщения'} tone='warning' />
        </MetricGrid>
        <Panel title={'Поток'} subtitle={'Последни известия.'}>
          <InfoStack items={[[ 'Автоматични', String(notificationRecords.length) ], [ 'За админ намеса', String(currentInactiveAlerts.length + currentEarlyReminders.length) ]]} />
        </Panel>
        <Panel title={'Списък'} subtitle={'По канал и статус.'}>
          <DataTableLayout
            columns={['Време', 'Заглавие', 'Аудитория', 'Канал', 'Тип', 'Статус']}
            rows={notificationRecords.map((item) => [
              item.eventTimeLabel,
              item.title,
              item.audienceLabel,
              item.channelLabel,
              mapNotificationKind(item.kind),
              <StatusBadge key={item.id} status={item.severity}>{statusLabel(item.severity)}</StatusBadge>,
            ])}
          />
        </Panel>
      </PageSection>
    </div>
  );
}

function mapNotificationKind(kind: NotificationRecordView['kind']) {
  switch (kind) {
    case 'PRACTICE_INACTIVITY':
      return 'Практика';
    case 'ARRIVAL_REMINDER':
      return 'Ранно записване';
    case 'CATEGORY_B_HOUR_MILESTONE':
      return '10-ти час';
    case 'PAYMENT_REMINDER':
      return 'Плащане';
    case 'PARENT_LESSON_REPORT':
      return 'Родителски отчет';
    default:
      return kind;
  }
}
