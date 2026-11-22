import {
  DEFECT_TYPES,
  MACHINES,
  OBSERVATION_CATEGORIES,
  PLANTS,
  QUALITY_CATEGORIES,
  SHIFTS,
} from '../data/reference';
import type {
  FormValues,
  SessionUser,
  SubmissionKind,
  SubmissionRecord,
  SubmissionStatus,
  WizardDraft,
} from '../types';
import { readJson, removeKey, STORAGE_KEYS, writeJson } from './storage';

export const emptyValues = (kind: SubmissionKind): FormValues => ({
  plant: PLANTS[0]?.value ?? '',
  machine: '',
  shift: SHIFTS[0]?.value ?? '',
  category: kind === 'observation' ? OBSERVATION_CATEGORIES[0].value : QUALITY_CATEGORIES[0].value,
  description: '',
  severity: 'medium',
  lotNumber: '',
  inspectedQuantity: '',
  defectQuantity: '',
  verdict: 'pass',
  notes: '',
});

export const emptyDraft = (kind: SubmissionKind): WizardDraft => ({
  step: 1,
  values: emptyValues(kind),
  evidence: [],
  updatedAt: new Date().toISOString(),
});

export async function listSubmissions(): Promise<SubmissionRecord[]> {
  const records = readJson<SubmissionRecord[]>(STORAGE_KEYS.submissions, []);
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listSubmissionsSync(): SubmissionRecord[] {
  return readJson<SubmissionRecord[]>(STORAGE_KEYS.submissions, []);
}

function persist(records: SubmissionRecord[]): boolean {
  return writeJson(STORAGE_KEYS.submissions, records);
}

export function generateId(kind: SubmissionKind, records: SubmissionRecord[]): string {
  const prefix = kind === 'observation' ? 'OBS' : 'INSP';
  const year = new Date().getFullYear();
  const taken = new Set(records.map((record) => record.id));
  let sequence = 1;
  let candidate = '';
  do {
    candidate = `${prefix}-${year}-${String(sequence).padStart(4, '0')}`;
    sequence += 1;
  } while (taken.has(candidate));
  return candidate;
}

export interface CreateSubmissionInput {
  kind: SubmissionKind;
  user: SessionUser;
  values: FormValues;
  evidence: SubmissionRecord['evidence'];
}

export async function createSubmission(input: CreateSubmissionInput): Promise<SubmissionRecord> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const records = listSubmissionsSync();
  const now = new Date().toISOString();
  const record: SubmissionRecord = {
    id: generateId(input.kind, records),
    kind: input.kind,
    role: input.user.role,
    authorId: input.user.employeeId,
    authorName: input.user.name,
    createdAt: now,
    updatedAt: now,
    status: 'submitted',
    values: { ...input.values },
    evidence: input.evidence.map((item) => ({ ...item })),
  };

  if (!persist([record, ...records])) {
    throw new Error('Local storage is full. Remove some evidence and try again.');
  }
  return record;
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  reviewNote?: string,
): Promise<SubmissionRecord> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const records = listSubmissionsSync();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error('Record not found.');

  const updated: SubmissionRecord = {
    ...records[index],
    status,
    reviewNote,
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  records[index] = updated;
  persist(records);
  return updated;
}

export async function clearSubmissions(): Promise<void> {
  removeKey(STORAGE_KEYS.submissions);
  writeJson(STORAGE_KEYS.seeded, true);
}

export function saveDraft(kind: SubmissionKind, draft: WizardDraft): void {
  writeJson(kind === 'observation' ? STORAGE_KEYS.draftObservation : STORAGE_KEYS.draftInspection, draft);
}

export function loadDraft(kind: SubmissionKind): WizardDraft | null {
  const key = kind === 'observation' ? STORAGE_KEYS.draftObservation : STORAGE_KEYS.draftInspection;
  return readJson<WizardDraft | null>(key, null);
}

export function clearDraft(kind: SubmissionKind): void {
  removeKey(kind === 'observation' ? STORAGE_KEYS.draftObservation : STORAGE_KEYS.draftInspection);
}

const daysAgo = (days: number, hours = 0): string =>
  new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString();

const values = (partial: Partial<FormValues>): FormValues => ({
  ...emptyValues('observation'),
  ...partial,
});

/** Realistic local demo records so dashboards are useful on first launch. */
export function seedDemoData(): void {
  if (readJson<boolean>(STORAGE_KEYS.seeded, false)) return;

  const demoUser: SessionUser = {
    employeeId: 'OP-1001',
    name: 'Alex Morgan',
    role: 'operator',
    department: 'Plant Operations',
    initials: 'AM',
    roleConfirmed: true,
  };
  const qaUser: SessionUser = {
    employeeId: 'QI-2001',
    name: 'Dana Vance',
    role: 'quality-inspector',
    department: 'Quality Assurance',
    initials: 'DV',
    roleConfirmed: true,
  };

  const seeds: SubmissionRecord[] = [
    {
      id: 'OBS-2026-0001',
      kind: 'observation',
      role: 'operator',
      authorId: qaUser.employeeId,
      authorName: 'Maya Chen',
      createdAt: daysAgo(3, 2),
      updatedAt: daysAgo(2),
      status: 'accepted',
      reviewNote: 'Bearing replaced during scheduled maintenance window.',
      reviewedAt: daysAgo(2),
      values: values({
        machine: MACHINES[1].value,
        category: OBSERVATION_CATEGORIES[0].value,
        description: 'Intermittent vibration detected in the gearbox casing during the afternoon shift. Noise increases above 80% load.',
        severity: 'high',
      }),
      evidence: [],
    },
    {
      id: 'OBS-2026-0002',
      kind: 'observation',
      role: 'operator',
      authorId: demoUser.employeeId,
      authorName: demoUser.name,
      createdAt: daysAgo(1, 5),
      updatedAt: daysAgo(1, 5),
      status: 'under-review',
      values: values({
        machine: MACHINES[3].value,
        category: OBSERVATION_CATEGORIES[1].value,
        description: 'Loose guard rail near the conveyor transfer point. Reported to the shift supervisor.',
        severity: 'critical',
      }),
      evidence: [],
    },
    {
      id: 'OBS-2026-0003',
      kind: 'observation',
      role: 'operator',
      authorId: demoUser.employeeId,
      authorName: demoUser.name,
      createdAt: daysAgo(0, 7),
      updatedAt: daysAgo(0, 7),
      status: 'submitted',
      values: values({
        machine: MACHINES[5].value,
        category: OBSERVATION_CATEGORIES[2].value,
        description: 'Steam pressure fluctuating between 8.1 and 8.6 bar. Within tolerance but trending upward.',
        severity: 'low',
      }),
      evidence: [],
    },
    {
      id: 'INSP-2026-0001',
      kind: 'inspection',
      role: 'quality-inspector',
      authorId: qaUser.employeeId,
      authorName: qaUser.name,
      createdAt: daysAgo(2, 1),
      updatedAt: daysAgo(1),
      status: 'accepted',
      reviewNote: 'Sample batch cleared for dispatch.',
      reviewedAt: daysAgo(1),
      values: values({
        machine: MACHINES[4].value,
        category: QUALITY_CATEGORIES[5].value,
        description: 'Routine sampling inspection of 200 units from lot B-4417. All measured dimensions within tolerance.',
        lotNumber: 'B-4417',
        inspectedQuantity: '200',
        defectQuantity: '0',
        verdict: 'pass',
        severity: 'low',
        notes: DEFECT_TYPES[5].label,
      }),
      evidence: [],
    },
    {
      id: 'INSP-2026-0002',
      kind: 'inspection',
      role: 'quality-inspector',
      authorId: qaUser.employeeId,
      authorName: 'Maya Chen',
      createdAt: daysAgo(0, 4),
      updatedAt: daysAgo(0, 4),
      status: 'flagged',
      reviewNote: 'Escalated to production engineering for tool wear assessment.',
      reviewedAt: daysAgo(0, 3),
      values: values({
        machine: MACHINES[0].value,
        category: QUALITY_CATEGORIES[1].value,
        description: 'Surface scratching on 12 of 150 stamped housings. Likely tool wear on the upper die.',
        lotNumber: 'A-9204',
        inspectedQuantity: '150',
        defectQuantity: '12',
        verdict: 'hold',
        severity: 'high',
        notes: DEFECT_TYPES[0].label,
      }),
      evidence: [],
    },
  ];

  if (!writeJson(STORAGE_KEYS.submissions, seeds)) return;
  writeJson(STORAGE_KEYS.seeded, true);
}
