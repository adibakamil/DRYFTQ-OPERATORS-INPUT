/**
 * Local development persistence layer.
 *
 * The application currently has no backend attached. Every read/write in the
 * app goes through the service modules in this folder, so replacing this
 * adapter with `fetch()` calls is the only change needed to connect a real API.
 * Nothing in the UI claims that data is stored on a server.
 */

const PREFIX = 'dryftq.collect.v1.';

export const STORAGE_KEYS = {
  session: `${PREFIX}session`,
  role: `${PREFIX}selected-role`,
  rememberedId: `${PREFIX}remembered-id`,
  submissions: `${PREFIX}submissions`,
  draftObservation: `${PREFIX}draft.observation`,
  draftInspection: `${PREFIX}draft.inspection`,
  seeded: `${PREFIX}seeded`,
} as const;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable — nothing to clean up */
  }
}

export const uid = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
