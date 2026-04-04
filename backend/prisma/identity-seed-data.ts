export interface PermissionSeedDefinition {
  key: string;
  displayName: string;
  description: string;
}

export interface RoleTemplateSeedDefinition {
  key: string;
  displayName: string;
  description: string;
  permissionKeys: string[];
}

export const permissionSeeds: PermissionSeedDefinition[] = [
  {
    key: 'students.read',
    displayName: 'Read students',
    description: 'View student records and training state.'
  },
  {
    key: 'students.create',
    displayName: 'Create students',
    description: 'Create new student records and enrollments.'
  },
  {
    key: 'students.update',
    displayName: 'Update students',
    description: 'Edit student identity, enrollment, and compliance data.'
  },
  {
    key: 'students.manage_register',
    displayName: 'Manage student register',
    description: 'Update register milestones, protocol records, and certificates.'
  },
  {
    key: 'payments.read',
    displayName: 'Read payments',
    description: 'View payments, installments, and finance rows.'
  },
  {
    key: 'payments.record',
    displayName: 'Record payments',
    description: 'Create and adjust payment and installment records.'
  },
  {
    key: 'reports.read',
    displayName: 'Read reports',
    description: 'Access operational and financial reports.'
  },
  {
    key: 'documents.read',
    displayName: 'Read documents',
    description: 'View document metadata and related student documents.'
  },
  {
    key: 'documents.manage',
    displayName: 'Manage documents',
    description: 'Upload and update operational document records.'
  },
  {
    key: 'invoices.read',
    displayName: 'Read invoices',
    description: 'View issued invoices, draft invoices, and payment linkage state.'
  },
  {
    key: 'vehicles.read',
    displayName: 'Read vehicles',
    description: 'View vehicles, assigned instructors, and operational readiness.'
  },
  {
    key: 'scheduling.read',
    displayName: 'Read scheduling',
    description: 'View theory groups, lectures, and practical lesson schedules.'
  },
  {
    key: 'scheduling.manage',
    displayName: 'Manage scheduling',
    description: 'Manage lessons, calendars, and instructor schedules.'
  },
  {
    key: 'users.manage',
    displayName: 'Manage users',
    description: 'Invite, suspend, and manage tenant users.'
  },
  {
    key: 'roles.manage',
    displayName: 'Manage roles',
    description: 'Manage tenant roles and permission assignments.'
  },
  {
    key: 'tenant.manage',
    displayName: 'Manage tenant settings',
    description: 'Manage tenant-level settings and operational configuration.'
  },
  {
    key: 'audit.read',
    displayName: 'Read audit logs',
    description: 'Access audit and traceability records.'
  }
];

export const roleTemplateSeeds: RoleTemplateSeedDefinition[] = [
  {
    key: 'owner',
    displayName: 'Owner',
    description: 'Full tenant access including identity, finance, and audit.',
    permissionKeys: permissionSeeds.map((permission) => permission.key)
  },
  {
    key: 'admin',
    displayName: 'Administrator',
    description: 'Manage operations, staff, and student data for the tenant.',
    permissionKeys: [
      'students.read',
      'students.create',
      'students.update',
      'students.manage_register',
      'payments.read',
      'payments.record',
      'invoices.read',
      'vehicles.read',
      'reports.read',
      'documents.read',
      'documents.manage',
      'scheduling.read',
      'scheduling.manage',
      'users.manage'
    ]
  },
  {
    key: 'instructor',
    displayName: 'Instructor',
    description: 'Manage training progress and operational student records.',
    permissionKeys: [
      'students.read',
      'students.update',
      'students.manage_register',
      'documents.read',
      'vehicles.read',
      'scheduling.read',
      'scheduling.manage'
    ]
  },
  {
    key: 'student',
    displayName: 'Student',
    description: 'Student portal access limited to own records.',
    permissionKeys: [
      'students.read',
      'payments.read',
      'invoices.read',
      'documents.read',
      'scheduling.read'
    ]
  },
  {
    key: 'parent',
    displayName: 'Parent',
    description: 'Parent portal access limited to own child lesson history and allowed documents.',
    permissionKeys: [
      'students.read',
      'documents.read',
      'scheduling.read'
    ]
  },
  {
    key: 'accountant',
    displayName: 'Accountant',
    description: 'Handle tuition, installments, and reporting visibility.',
    permissionKeys: [
      'students.read',
      'payments.read',
      'payments.record',
      'invoices.read',
      'vehicles.read',
      'reports.read',
      'documents.read',
      'scheduling.read'
    ]
  }
];
