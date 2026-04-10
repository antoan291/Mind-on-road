const fullAccessRoleKeys = new Set(['owner', 'developer']);
const determinatorAccessRoleKeys = new Set(['owner', 'developer', 'administration']);
const personnelAccessRoleKeys = new Set(['owner', 'developer']);
const instructorsAccessRoleKeys = new Set(['owner', 'developer', 'administration']);
const aiCenterAccessRoleKeys = new Set(['owner', 'developer']);

export function hasFullAccessRole(roleKeys: string[]) {
  return roleKeys.some((roleKey) => fullAccessRoleKeys.has(roleKey));
}

export function hasDeveloperRole(roleKeys: string[]) {
  return roleKeys.includes('developer');
}

export function hasDeterminatorAccessRole(roleKeys: string[]) {
  return roleKeys.some((roleKey) => determinatorAccessRoleKeys.has(roleKey));
}

export function hasPersonnelAccessRole(roleKeys: string[]) {
  return roleKeys.some((roleKey) => personnelAccessRoleKeys.has(roleKey));
}

export function hasInstructorsAccessRole(roleKeys: string[]) {
  return roleKeys.some((roleKey) => instructorsAccessRoleKeys.has(roleKey));
}

export function hasAiCenterAccessRole(roleKeys: string[]) {
  return roleKeys.some((roleKey) => aiCenterAccessRoleKeys.has(roleKey));
}

export function getRoleLabel(roleKey: string) {
  switch (roleKey) {
    case 'owner':
      return 'Собственик';
    case 'developer':
      return 'Разработчик';
    case 'administration':
      return 'Администрация';
    case 'instructor':
      return 'Инструктор';
    case 'simulator_instructor':
      return 'Инструктор симулатор';
    case 'student':
      return 'Курсист';
    case 'parent':
      return 'Родител';
    case 'accountant':
      return 'Счетоводство';
    default:
      return roleKey;
  }
}

export function getPrimaryRoleLabel(roleKeys: string[]) {
  if (roleKeys.length === 0) {
    return 'Потребител';
  }

  const preferredOrder = [
    'developer',
    'owner',
    'administration',
    'instructor',
    'simulator_instructor',
    'accountant',
    'student',
    'parent',
  ];

  const prioritizedRole =
    preferredOrder.find((roleKey) => roleKeys.includes(roleKey)) ??
    roleKeys[0];

  return getRoleLabel(prioritizedRole);
}
