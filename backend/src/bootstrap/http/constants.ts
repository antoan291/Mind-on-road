import { personnelRoleKeys } from "../../modules/identity/presentation/rest/requests/personnel.request";

export const staffRoleKeys = personnelRoleKeys;
export const fullAccessRoleKeys = ["owner", "developer"] as const;
export const tenantWideAccessRoleKeys = [
  ...fullAccessRoleKeys,
  "administration",
  "accountant",
] as const;
