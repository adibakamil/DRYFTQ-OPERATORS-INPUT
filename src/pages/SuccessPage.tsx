import {
  Check,
  Clipboard,
  Download,
  FilePlus2,
  History,
  LayoutDashboard,
  Paperclip,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSubmissions } from '../context/SubmissionsContext';
import { formatDateTime } from '../data/reference';
import type { SubmissionRecord } from '../types';

const WORKFLOW_STEPS = [
  'Timestamp',
  'Geo-Coords',
  'Sensor Stream',
  'Visual Data',
  'Classification',
  'Audit',
  'Receipt',
];

/** SUBMIT 7 — full website receipt page with breadcrumb and 7-step workflow. */
export function SuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { records } = useSubmissions();
  const [copied, setCopied] = useState(false);

  const passed = (location.state as { record?: SubmissionRecord } | null)?.record;
  const record = passed?.id === id
    ? passed
    : id
      ? records.find((item) => item.id === id)
      : records[0];

  const dashboard = user?.role === 'quality-inspector' ? '/app/quality' : '/app/operator';
  const displayId = record?.id ?? id ?? 'OBS-2025-1167';
  const kindLabel = record?.kind === 'inspection' ? 'Inspection' : 'Observation';

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(displayId);
      setCopied(true);
      toast.success('Reference copied', displayId);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed', 'Select the reference and copy it manually.');
    }
  };

  const exportReceipt = () => {
    if (!record) return;
    const content = [
      'DRYFTQ COLLECT — SUBMISSION RECEIPT',
      '====================================',
      `Reference:     ${record.id}`,
      `Type:          ${record.kind}`,
      `Submitted by:  ${record.authorName} (${record.authorId})`,
      `Submitted at:  ${formatDateTime(record.createdAt)}`,
      `Status:        ${record.status}`,
      `Machine:       ${record.values.machine}`,
      `Plant:         ${record.values.plant}`,
      `Shift:         ${record.values.shift}`,
      `Category:      ${record.values.category}`,
      `Priority:      ${record.values.severity}`,
      `Evidence:      ${record.evidence.length} file(s)`,
      '',
      'Description:',
      record.values.description,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.id}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt exported', `${record.id}-receipt.txt`);
  };

  return (
    <div className="submit7-page">
      <div className="submission-flow">
        <div className="submission-flow__inner">
          <nav className="submission-breadcrumb" aria-label="Breadcrumb">
            <span>Field Ops</span>
            <span className="submission-breadcrumb__sep">/</span>
            <span>Observations</span>
            <span className="submission-breadcrumb__sep">/</span>
            <span>Record Submission</span>
            <span className="submission-breadcrumb__sep">/</span>
            <strong>Step 7: Finished</strong>
          </nav>

          <div className="workflow-stepper" aria-label="Submission workflow">
            {WORKFLOW_STEPS.map((step, index) => {
              const isActive = index === WORKFLOW_STEPS.length - 1;
              const isDone = index < WORKFLOW_STEPS.length - 1;
              return (
                <div key={step} className="workflow-segment">
                  <div
                    className={`workflow-step ${isDone ? 'workflow-step--done' : ''} ${
                      isActive ? 'workflow-step--active' : ''
                    }`}
                  >
                    <span className="workflow-step__dot">
                      {isDone ? <Check size={12} strokeWidth={3} /> : index + 1}
                    </span>
                    <span className="workflow-step__label">{step}</span>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <span className={`workflow-line ${isDone ? '' : 'workflow-line--active'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="success-page">
        <div className="success-card fade-up">
          <div className="success-card__header">
            <span className="success-card__badge">7</span>
            <h2>Submitted successfully</h2>
          </div>

          <div className="success-ring">
            <Check size={42} strokeWidth={3} />
          </div>

          <h1>Submitted Successfully!</h1>

          <button className="id-pill" type="button" onClick={() => void copyId()} title="Copy reference">
            <span>
              {kindLabel} ID: <strong>{displayId}</strong>
            </span>
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
          </button>

          <p className="success-card__note">
            Your report has been recorded and will be reviewed.
          </p>

          <div className="success-card__actions">
            <Button block size="lg" icon={<History size={17} />} onClick={() => navigate('/app/history')}>
              View My Submissions
            </Button>
            <Button block variant="secondary" icon={<LayoutDashboard size={17} />} onClick={() => navigate(dashboard)}>
              Go to Dashboard
            </Button>
          </div>

          <div className="success-meta">
            <span>
              <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              EST. REVIEW: 2H 15M
            </span>
            <button
              className="link-btn"
              type="button"
              onClick={exportReceipt}
              disabled={!record}
              style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}
            >
              <Download size={12} style={{ display: 'inline', verticalAlign: '-2px' }} /> Export receipt
            </button>
          </div>
        </div>

        <div className="quick-actions">
          <button className="quick-action" type="button" onClick={() => navigate('/app/new')}>
            <FilePlus2 size={18} />
            <span>
              <strong>New entry</strong>
              <span>Submit another report from this workspace.</span>
            </span>
          </button>
          <button className="quick-action" type="button" onClick={() => navigate('/app/new', { state: { focusEvidence: true } })}>
            <Paperclip size={18} />
            <span>
              <strong>Append files</strong>
              <span>Start a new entry with photo or video evidence.</span>
            </span>
          </button>
          <button className="quick-action" type="button" onClick={() => navigate('/app/history')}>
            <History size={18} />
            <span>
              <strong>Audit trail</strong>
              <span>Review all locally stored submissions.</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
