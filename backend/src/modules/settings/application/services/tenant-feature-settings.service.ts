import type {
  TenantFeatureKey,
  TenantFeatureSettingsRepository,
  TenantFeatureSettingRecord
} from '../../domain/repositories/tenant-feature-settings.repository';
import { TENANT_FEATURE_KEYS } from '../../domain/repositories/tenant-feature-settings.repository';

const FEATURE_DEFINITIONS: Record<
  TenantFeatureKey,
  {
    label: string;
    description: string;
    pages: string;
    tier: string;
  }
> = {
  payments: {
    label: 'Плащания',
    description:
      'Таблица за плащания, статуси и контрол на дължимите суми.',
    pages: 'Плащания, практика, профили',
    tier: 'Core Finance'
  },
  invoices: {
    label: 'Фактури',
    description: 'Издаване и преглед на фактури и OCR на разходи.',
    pages: 'Фактури, отчети',
    tier: 'Core Finance'
  },
  documents: {
    label: 'Документи',
    description:
      'Документен модул, подписи, лични карти и контрол на достъпа.',
    pages: 'Документи, OCR',
    tier: 'Compliance'
  },
  theory: {
    label: 'Теория',
    description: 'Групи, присъствие, отсъствия и автоматични съобщения.',
    pages: 'Теория, групи по теория',
    tier: 'Operations'
  },
  practical: {
    label: 'Практика',
    description: 'Практически часове, график, оценки и закъснения.',
    pages: 'Практика, график',
    tier: 'Operations'
  },
  reports: {
    label: 'Отчети',
    description: 'Приходи, разходи, печалба и ръчно добавяне на записи.',
    pages: 'Отчети',
    tier: 'Finance Plus'
  },
  ai: {
    label: 'AI пакет',
    description: 'AI център, OCR и AI чат за собственика.',
    pages: 'AI център, OCR, AI чат',
    tier: 'AI Suite'
  }
};

export class TenantFeatureSettingsService {
  public constructor(
    private readonly settingsRepository: TenantFeatureSettingsRepository
  ) {}

  public async listSettings(params: { tenantId: string }) {
    const settings = await this.settingsRepository.listByTenant({
      tenantId: params.tenantId
    });

    return mapSettings(settings);
  }

  public async saveSettings(params: {
    tenantId: string;
    updatedBy: string;
    settings: Array<{
      featureKey: TenantFeatureKey;
      enabled: boolean;
    }>;
  }) {
    const settings = await this.settingsRepository.replaceForTenant({
      tenantId: params.tenantId,
      updatedBy: params.updatedBy,
      settings: params.settings
    });

    return mapSettings(settings);
  }
}

function mapSettings(settings: TenantFeatureSettingRecord[]) {
  const statusByKey = new Map(
    settings.map((setting) => [setting.featureKey, setting.enabled])
  );

  return TENANT_FEATURE_KEYS.map((featureKey) => ({
    key: featureKey,
    label: FEATURE_DEFINITIONS[featureKey].label,
    description: FEATURE_DEFINITIONS[featureKey].description,
    pages: FEATURE_DEFINITIONS[featureKey].pages,
    tier: FEATURE_DEFINITIONS[featureKey].tier,
    enabled: statusByKey.get(featureKey) ?? true
  }));
}
