import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApiClientError } from './apiClient';
import { useAuthSession } from './authSession';
import {
  fetchNotificationRecords,
  type NotificationRecordView,
} from './notificationsApi';

const NOTIFICATIONS_POLL_INTERVAL_MS = 60_000;

type NotificationsState = 'idle' | 'loading' | 'ready' | 'fallback';

type NotificationsStateContextValue = {
  notificationsState: NotificationsState;
  notifications: NotificationRecordView[];
  notificationsError: string | null;
  hasUnreadNotifications: boolean;
  refreshNotifications: () => Promise<void>;
};

const NotificationsStateContext = createContext<
  NotificationsStateContextValue | undefined
>(undefined);

export function NotificationsStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authState, session } = useAuthSession();
  const [notificationsState, setNotificationsState] =
    useState<NotificationsState>('idle');
  const [notifications, setNotifications] = useState<NotificationRecordView[]>(
    [],
  );
  const [notificationsError, setNotificationsError] = useState<string | null>(
    null,
  );

  const canReadNotifications = useMemo(
    () =>
      authState === 'authenticated' &&
      Boolean(
        session?.user.permissionKeys.includes('students.read') ||
          session?.user.roleKeys.includes('owner') ||
          session?.user.roleKeys.includes('developer'),
      ),
    [authState, session?.user.permissionKeys, session?.user.roleKeys],
  );

  const refreshNotifications = useCallback(async () => {
    if (!canReadNotifications) {
      setNotifications([]);
      setNotificationsState(authState === 'authenticated' ? 'ready' : 'idle');
      setNotificationsError(null);
      return;
    }

    setNotificationsState((current) =>
      current === 'ready' ? current : 'loading',
    );

    try {
      const records = await fetchNotificationRecords();
      setNotifications(records);
      setNotificationsState('ready');
      setNotificationsError(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 403) {
        setNotifications([]);
        setNotificationsState('ready');
        setNotificationsError(null);
        return;
      }

      setNotifications([]);
      setNotificationsState('fallback');
      setNotificationsError(
        error instanceof Error
          ? error.message
          : 'Неуспешно зареждане на известията.',
      );
    }
  }, [authState, canReadNotifications]);

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!canReadNotifications) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, NOTIFICATIONS_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canReadNotifications, refreshNotifications]);

  const value = useMemo<NotificationsStateContextValue>(
    () => ({
      notificationsState,
      notifications,
      notificationsError,
      hasUnreadNotifications: notifications.some(
        (notification) => notification.deliveryStatus === 'PENDING',
      ),
      refreshNotifications,
    }),
    [
      notifications,
      notificationsError,
      notificationsState,
      refreshNotifications,
    ],
  );

  return (
    <NotificationsStateContext.Provider value={value}>
      {children}
    </NotificationsStateContext.Provider>
  );
}

export function useNotificationsState() {
  const context = useContext(NotificationsStateContext);

  if (!context) {
    throw new Error(
      'useNotificationsState must be used inside NotificationsStateProvider.',
    );
  }

  return context;
}
