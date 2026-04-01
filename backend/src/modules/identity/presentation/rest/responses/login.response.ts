export interface LoginResponse {
  sessionId: string;
  expiresAt: string;
  tenantSlug: string;
  mustChangePassword: boolean;
  user: {
    email: string;
    displayName: string;
    roleKeys: string[];
  };
}
