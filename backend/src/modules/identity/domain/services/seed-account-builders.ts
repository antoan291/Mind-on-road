export interface ParentAccountSeedInput {
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
}

export interface ParentAccountSeedData {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
}

export function buildParentAccountSeedData(
  input: ParentAccountSeedInput
): ParentAccountSeedData | null {
  const displayName = input.parentName?.trim() ?? '';
  const email = input.parentEmail?.trim() ?? '';
  const phone = input.parentPhone?.trim() ?? '';

  if (!displayName || !email || !phone) {
    return null;
  }

  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? displayName;
  const lastName = nameParts.slice(1).join(' ');

  return {
    firstName,
    lastName,
    displayName,
    email,
    phone
  };
}
