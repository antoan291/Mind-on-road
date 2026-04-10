import { Link, Navigate } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import type { TenantFeatureKey } from '../services/featureSettings';
import { useFeatureSettings } from '../services/featureSettings';
import { useAuthSession } from '../services/authSession';
import { hasDeveloperRole, hasFullAccessRole } from '../services/roleUtils';
import { Button } from './ui-system/Button';

export function FeatureRouteGuard({
  featureKey,
  permissionKey,
  ownerOnly = false,
  developerOnly = false,
  allowedRoleKeys,
  children,
}: {
  featureKey?: TenantFeatureKey;
  permissionKey?: string;
  ownerOnly?: boolean;
  developerOnly?: boolean;
  allowedRoleKeys?: string[];
  children: React.ReactNode;
}) {
  const { authState, session } = useAuthSession();
  const { featureSettingsState, isFeatureEnabled } = useFeatureSettings();

  if (authState === 'loading' || featureSettingsState === 'loading') {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{ color: 'var(--text-secondary)' }}
      >
        Зареждане на настройките...
      </div>
    );
  }

  if (ownerOnly && !hasFullAccessRole(session?.user.roleKeys ?? [])) {
    return <Navigate to="/" replace />;
  }

  if (developerOnly && !hasDeveloperRole(session?.user.roleKeys ?? [])) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoleKeys &&
    !allowedRoleKeys.some((roleKey) => session?.user.roleKeys.includes(roleKey))
  ) {
    return <Navigate to="/" replace />;
  }

  if (
    permissionKey &&
    !session?.user.permissionKeys.includes(permissionKey) &&
    !hasFullAccessRole(session?.user.roleKeys ?? [])
  ) {
    return <Navigate to="/" replace />;
  }

  if (featureKey && !isFeatureEnabled(featureKey)) {
    return (
      <div className="p-6 lg:p-8">
        <div
          className="mx-auto max-w-2xl rounded-3xl p-8 text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--ghost-border)',
          }}
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--status-error)',
            }}
          >
            <ShieldAlert size={24} />
          </div>
          <h1
            className="mt-5 text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Модулът е изключен за тази школа
          </h1>
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            Достъпът до този екран е спрян от лицензионните настройки на
            tenant-а. Ако трябва да се вижда отново, активирай модула от
            “Настройки”.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/">
              <Button variant="primary">Обратно към таблото</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
