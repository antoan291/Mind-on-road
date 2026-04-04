import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuthSession } from './authSession';
import { apiClient, ApiClientError } from './apiClient';

export const TENANT_FEATURE_KEYS = [
  'payments',
  'invoices',
  'documents',
  'theory',
  'practical',
  'reports',
  'ai',
] as const;

export type TenantFeatureKey = (typeof TENANT_FEATURE_KEYS)[number];

export type TenantFeatureSetting = {
  key: TenantFeatureKey;
  label: string;
  description: string;
  pages: string;
  tier: string;
  enabled: boolean;
};

type FeatureSettingsState = 'loading' | 'ready';

type FeatureSettingsContextValue = {
  featureSettingsState: FeatureSettingsState;
  settings: TenantFeatureSetting[];
  settingsError: string | null;
  isFeatureEnabled: (featureKey: TenantFeatureKey) => boolean;
  refreshFeatureSettings: () => Promise<void>;
  saveFeatureSettings: (
    nextSettings: Pick<TenantFeatureSetting, 'key' | 'enabled'>[],
  ) => Promise<TenantFeatureSetting[]>;
};

const DEFAULT_FEATURE_SETTINGS: TenantFeatureSetting[] = [
  {
    key: 'payments',
    label: 'Плащания',
    description: 'Таблица за плащания, статуси и контрол на дължимите суми.',
    pages: 'Плащания, практика, профили',
    tier: 'Core Finance',
    enabled: true,
  },
  {
    key: 'invoices',
    label: 'Фактури',
    description: 'Издаване и преглед на фактури и OCR на разходи.',
    pages: 'Фактури, отчети',
    tier: 'Core Finance',
    enabled: true,
  },
  {
    key: 'documents',
    label: 'Документи',
    description:
      'Документен модул, подписи, лични карти и контрол на достъпа.',
    pages: 'Документи, OCR',
    tier: 'Compliance',
    enabled: true,
  },
  {
    key: 'theory',
    label: 'Теория',
    description: 'Групи, присъствие, отсъствия и автоматични съобщения.',
    pages: 'Теория, групи по теория',
    tier: 'Operations',
    enabled: true,
  },
  {
    key: 'practical',
    label: 'Практика',
    description: 'Практически часове, график, оценки и закъснения.',
    pages: 'Практика, график',
    tier: 'Operations',
    enabled: true,
  },
  {
    key: 'reports',
    label: 'Отчети',
    description: 'Приходи, разходи, печалба и ръчно добавяне на записи.',
    pages: 'Отчети',
    tier: 'Finance Plus',
    enabled: true,
  },
  {
    key: 'ai',
    label: 'AI пакет',
    description: 'AI център, OCR и AI чат за собственика.',
    pages: 'AI център, OCR, AI чат',
    tier: 'AI Suite',
    enabled: true,
  },
];

const FeatureSettingsContext = createContext<
  FeatureSettingsContextValue | undefined
>(undefined);

export function FeatureSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authState, session } = useAuthSession();
  const [featureSettingsState, setFeatureSettingsState] =
    useState<FeatureSettingsState>('loading');
  const [settings, setSettings] = useState<TenantFeatureSetting[]>(
    DEFAULT_FEATURE_SETTINGS,
  );
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const refreshFeatureSettings = useCallback(async () => {
    if (authState !== 'authenticated') {
      setSettings(DEFAULT_FEATURE_SETTINGS);
      setFeatureSettingsState('ready');
      setSettingsError(null);
      return;
    }

    setFeatureSettingsState('loading');

    try {
      const response = await apiClient.get<{ items: TenantFeatureSetting[] }>(
        '/settings/features',
      );

      setSettings(normalizeFeatureSettings(response.items));
      setSettingsError(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 403) {
        setSettings(DEFAULT_FEATURE_SETTINGS);
        setSettingsError(null);
      } else {
        setSettings(DEFAULT_FEATURE_SETTINGS);
        setSettingsError(
          error instanceof Error
            ? error.message
            : 'Неуспешно зареждане на лицензните настройки.',
        );
      }
    } finally {
      setFeatureSettingsState('ready');
    }
  }, [authState]);

  useEffect(() => {
    void refreshFeatureSettings();
  }, [refreshFeatureSettings]);

  const isFeatureEnabled = useCallback(
    (featureKey: TenantFeatureKey) =>
      settings.find((setting) => setting.key === featureKey)?.enabled ?? true,
    [settings],
  );

  const saveFeatureSettings = useCallback(
    async (nextSettings: Pick<TenantFeatureSetting, 'key' | 'enabled'>[]) => {
      if (!session?.csrfToken) {
        throw new Error('Липсва активна сесия за запис на настройки.');
      }

      const response = await apiClient.put<{ items: TenantFeatureSetting[] }>(
        '/settings/features',
        {
          settings: nextSettings.map((setting) => ({
            featureKey: setting.key,
            enabled: setting.enabled,
          })),
        },
        session.csrfToken,
      );

      const normalizedSettings = normalizeFeatureSettings(response.items);
      setSettings(normalizedSettings);
      setSettingsError(null);

      return normalizedSettings;
    },
    [session?.csrfToken],
  );

  const value = useMemo<FeatureSettingsContextValue>(
    () => ({
      featureSettingsState,
      settings,
      settingsError,
      isFeatureEnabled,
      refreshFeatureSettings,
      saveFeatureSettings,
    }),
    [
      featureSettingsState,
      isFeatureEnabled,
      refreshFeatureSettings,
      saveFeatureSettings,
      settings,
      settingsError,
    ],
  );

  return (
    <FeatureSettingsContext.Provider value={value}>
      {children}
    </FeatureSettingsContext.Provider>
  );
}

export function useFeatureSettings() {
  const context = useContext(FeatureSettingsContext);

  if (!context) {
    throw new Error(
      'useFeatureSettings must be used inside FeatureSettingsProvider.',
    );
  }

  return context;
}

function normalizeFeatureSettings(items: TenantFeatureSetting[]) {
  const settingsByKey = new Map(items.map((item) => [item.key, item]));

  return DEFAULT_FEATURE_SETTINGS.map((fallbackSetting) => ({
    ...fallbackSetting,
    ...settingsByKey.get(fallbackSetting.key),
  }));
}
