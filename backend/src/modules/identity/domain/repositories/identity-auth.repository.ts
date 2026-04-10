export interface LoginIdentityRecord {
  userId: string;
  userEmail: string;
  passwordHash: string;
  displayName: string;
  membershipId: string;
  tenantId: string;
  tenantSlug: string;
  roleKeys: string[];
  permissionKeys: string[];
  mustChangePassword: boolean;
}

export interface CreateSessionInput {
  userId: string;
  tenantMembershipId: string;
  sessionTokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreatedSessionRecord {
  sessionId: string;
  expiresAt: Date;
}

export interface AuthenticatedSessionRecord {
  sessionId: string;
  userId: string;
  userEmail: string;
  displayName: string;
  membershipId: string;
  tenantId: string;
  tenantSlug: string;
  roleKeys: string[];
  permissionKeys: string[];
  expiresAt: Date;
  mustChangePassword: boolean;
}

export interface UpdatePasswordInput {
  userId: string;
  passwordHash: string;
}

export interface ProvisionTenantPortalIdentityInput {
  tenantId: string;
  roleKey: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  email: string | null;
  password?: string | null;
  requirePasswordChangeOnFirstLogin?: boolean;
  existingMembershipId?: string | null;
}

export interface ProvisionTenantPortalIdentityResult {
  userId: string;
  membershipId: string;
  loginIdentifier: string;
  temporaryPassword: string | null;
  status:
    | 'created'
    | 'linked_existing'
    | 'already_linked'
    | 'updated_existing';
}

export interface IdentityAuthRepository {
  findLoginIdentity(params: {
    tenantSlug: string;
    email: string;
  }): Promise<LoginIdentityRecord | null>;
  findAuthenticatedSessionByTokenHash(
    sessionTokenHash: string
  ): Promise<AuthenticatedSessionRecord | null>;
  createSession(input: CreateSessionInput): Promise<CreatedSessionRecord>;
  revokeSession(sessionId: string): Promise<void>;
  revokeUserSessions(userId: string): Promise<void>;
  updateSessionActivity(sessionId: string): Promise<void>;
  updatePassword(input: UpdatePasswordInput): Promise<void>;
  provisionTenantPortalIdentity(
    input: ProvisionTenantPortalIdentityInput
  ): Promise<ProvisionTenantPortalIdentityResult>;
}
