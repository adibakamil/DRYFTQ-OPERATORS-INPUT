import type { SelectOption } from '../types';

export const PLANTS: SelectOption[] = [
  { value: 'plant-north', label: 'Plant North — Sector A', hint: 'Main refining & processing' },
  { value: 'plant-south', label: 'Plant South — Sector B', hint: 'Packaging & dispatch' },
  { value: 'plant-central', label: 'Plant Central — Sector C', hint: 'Utilities & maintenance' },
];

export const MACHINES: SelectOption[] = [
  { value: 'hsm-1', label: 'HSM 1 — Hydraulic Stamping Module' },
  { value: 'hsm-2', label: 'HSM 2 — Hydraulic Stamping Module' },
  { value: 'cnc-04', label: 'CNC 04 — Precision Milling Line' },
  { value: 'line-a', label: 'Line A — Assembly Conveyor' },
  { value: 'line-b', label: 'Line B — Assembly Conveyor' },
  { value: 'boiler-3', label: 'Boiler 3 — Steam Generation' },
  { value: 'pack-07', label: 'PACK 07 — Wrapping & Palletising' },
];

export const SHIFTS: SelectOption[] = [
  { value: 'morning', label: 'Morning Shift — 06:00 to 14:00' },
  { value: 'afternoon', label: 'Afternoon Shift — 14:00 to 22:00' },
  { value: 'night', label: 'Night Shift — 22:00 to 06:00' },
];

export const OBSERVATION_CATEGORIES: SelectOption[] = [
  { value: 'machine-issue', label: 'Machine Issue', hint: 'Fault, vibration, leak or malfunction' },
  { value: 'safety-risk', label: 'Safety Risk', hint: 'Hazard or unsafe condition' },
  { value: 'machine-observation', label: 'Machine Observation', hint: 'General operational note' },
  { value: 'maintenance', label: 'Maintenance Required', hint: 'Service or inspection due' },
  { value: 'environment', label: 'Environmental', hint: 'Emissions, spill or housekeeping' },
];

export const QUALITY_CATEGORIES: SelectOption[] = [
  { value: 'dimensional', label: 'Dimensional Deviation', hint: 'Tolerance or measurement issue' },
  { value: 'surface', label: 'Surface Defect', hint: 'Scratch, dent, corrosion or finish' },
  { value: 'material', label: 'Material Non-conformance', hint: 'Wrong grade or contaminated batch' },
  { value: 'assembly', label: 'Assembly Error', hint: 'Missing or incorrect component' },
  { value: 'packaging', label: 'Packaging Defect', hint: 'Label, seal or carton damage' },
  { value: 'routine-check', label: 'Routine Quality Check', hint: 'Scheduled sampling inspection' },
];

export const DEFECT_TYPES: SelectOption[] = [
  { value: 'scratch', label: 'Surface scratch' },
  { value: 'dent', label: 'Dent / deformation' },
  { value: 'misalignment', label: 'Misalignment' },
  { value: 'contamination', label: 'Contamination' },
  { value: 'missing-part', label: 'Missing component' },
  { value: 'none', label: 'No defect found' },
];

export const SEVERITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low — informational' },
  { value: 'medium', label: 'Medium — monitor closely' },
  { value: 'high', label: 'High — action required' },
  { value: 'critical', label: 'Critical — stop and escalate' },
];

export const STATUS_META: Record<
  string,
  { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' }
> = {
  submitted: { label: 'Submitted', tone: 'info' },
  'under-review': { label: 'Under Review', tone: 'neutral' },
  accepted: { label: 'Accepted', tone: 'success' },
  flagged: { label: 'Flagged', tone: 'danger' },
};

export const EVIDENCE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4,audio/wav,audio/webm,audio/ogg';
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILES = 8;

export const labelFor = (options: SelectOption[], value: string): string =>
  (options.find((option) => option.value === value)?.label ?? value) || '—';

export const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateTime(iso);
};
