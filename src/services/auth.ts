import type { SessionUser } from '../types';
import { readJson, removeKey, STORAGE_KEYS, writeJson } from './storage';

export interface Credentials {
  employeeId: string;
  password: string;
}

export interface DemoAccount {
  employeeId: string;
  password: string;
  name: string;
  department: string;
  initials: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    employeeId: 'OP-1001',
    password: 'operator123',
    name: 'Alex Morgan',
    department: 'Plant Operations',
    initials: 'AM',
  },
  {
    employeeId: 'QI-2001',
    password: 'inspector123',
    name: 'Dana Vance',
    department: 'Quality Assurance',
    initials: 'DV',
  },
];

export interface ValidationErrors {
  employeeId?: string;
  password?: string;
}

export function validateCredentials({ employeeId, password }: Credentials): ValidationErrors {
  const errors: ValidationErrors = {};
  const id = employeeId.trim();

  if (!id) errors.employeeId = 'Employee ID is required.';
  else if (!/^[A-Za-z0-9-]{4,20}$/.test(id))
    errors.employeeId = 'Use 4–20 letters, numbers or hyphens.';

  if (!password) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';

  return errors;
}

/** Demo authentication. Replace with a real API call when a backend is available. */
export async function signIn(credentials: Credentials): Promise<SessionUser> {
  await new Promise((resolve) => setTimeout(resolve, 650));

  const errors = validateCredentials(credentials);
  if (Object.keys(errors).length > 0) {
    throw new Error('Please correct the highlighted fields.');
  }

  const employeeId = credentials.employeeId.trim().toUpperCase();
  const account = DEMO_ACCOUNTS.find(
    (item) => item.employeeId === employeeId && item.password === credentials.password,
  );

  // For the local demo, any well-formed ID with a valid password is accepted.
  // Known demo accounts simply get a realistic name and department.
  return {
    employeeId,
    name: account?.name ?? derivingName(employeeId),
    department: account?.department ?? 'Plant Operations',
    initials: account?.initials ?? employeeId.slice(0, 2),
    role: 'operator',
    roleConfirmed: false,
  };
}

const derivingName = (employeeId: string): string =>
  employeeId.startsWith('QI') ? 'Quality Inspector' : 'Plant Operator';

export function getSession(): SessionUser | null {
  return readJson<SessionUser | null>(STORAGE_KEYS.session, null);
}

export function saveSession(user: SessionUser): void {
  writeJson(STORAGE_KEYS.session, user);
}

export function applyRole(role: SessionUser['role']): SessionUser | null {
  const current = getSession();
  if (!current) return null;
  const updated: SessionUser = {
    ...current,
    role,
    roleConfirmed: true,
    department: role === 'quality-inspector' ? 'Quality Assurance' : 'Plant Operations',
  };
  saveSession(updated);
  writeJson(STORAGE_KEYS.role, role);
  return updated;
}

export function resetRoleConfirmation(): SessionUser | null {
  const current = getSession();
  if (!current) return null;
  const updated: SessionUser = { ...current, roleConfirmed: false };
  saveSession(updated);
  return updated;
}

export function signOut(): void {
  removeKey(STORAGE_KEYS.session);
  removeKey(STORAGE_KEYS.role);
}
