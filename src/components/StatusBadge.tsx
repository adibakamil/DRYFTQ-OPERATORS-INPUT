import { STATUS_META } from '../data/reference';
import type { SubmissionStatus } from '../types';

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.submitted;
  return <span className={`badge badge--${meta.tone}`}>{meta.label}</span>;
}
