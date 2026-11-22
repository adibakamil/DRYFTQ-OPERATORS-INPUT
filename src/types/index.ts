export type Role = 'operator' | 'quality-inspector';

export type SubmissionStatus = 'submitted' | 'under-review' | 'accepted' | 'flagged';

export type EvidenceKind = 'image' | 'video' | 'audio';

export interface EvidenceItem {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: EvidenceKind;
  /** Small data URL used for a persistent thumbnail. Binary files are never uploaded to a server. */
  thumbnail?: string;
  durationLabel?: string;
}

export interface SessionUser {
  employeeId: string;
  name: string;
  role: Role;
  department: string;
  initials: string;
  /** False between login and role selection. */
  roleConfirmed: boolean;
}

export interface FormValues {
  plant: string;
  machine: string;
  shift: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lotNumber: string;
  inspectedQuantity: string;
  defectQuantity: string;
  verdict: 'pass' | 'hold' | 'reject';
  notes: string;
}

export type SubmissionKind = 'observation' | 'inspection';

export interface SubmissionRecord {
  id: string;
  kind: SubmissionKind;
  role: Role;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  status: SubmissionStatus;
  reviewNote?: string;
  reviewedAt?: string;
  values: FormValues;
  evidence: EvidenceItem[];
}

export interface WizardDraft {
  step: number;
  values: FormValues;
  evidence: EvidenceItem[];
  updatedAt: string;
}

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}
