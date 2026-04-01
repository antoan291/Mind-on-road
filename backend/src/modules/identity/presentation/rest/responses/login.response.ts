export interface LoginResponse {
  csrfToken: string;
  sessionId: string;
  expiresAt: string;
  tenantSlug: string;
  mustChangePassword: boolean;
  user: {
    email: string;
    displayName: string;
    roleKeys: string[];
    permissionKeys: string[];
  };
}
