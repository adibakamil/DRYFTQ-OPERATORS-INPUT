import {
  Clipboard,
  ClipboardList,
  Eye,
  FileCheck2,
  Inbox,
  Paperclip,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSubmissions } from '../context/SubmissionsContext';
import {
  formatBytes,
  formatDateTime,
  labelFor,
  MACHINES,
  OBSERVATION_CATEGORIES,
  PLANTS,
  QUALITY_CATEGORIES,
  SEVERITY_OPTIONS,
  SHIFTS,
} from '../data/reference';
import type { SubmissionKind, SubmissionRecord, SubmissionStatus } from '../types';

type KindFilter = 'all' | SubmissionKind;
type StatusFilter = 'all' | SubmissionStatus;

export function HistoryPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { records, loading, refresh, clearAll } = useSubmissions();

  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<SubmissionRecord | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      if (kindFilter !== 'all' && record.kind !== kindFilter) return false;
      if (statusFilter !== 'all' && record.status !== statusFilter) return false;
      if (!needle) return true;
      return [
        record.id,
        record.authorName,
        record.values.machine,
        record.values.category,
        record.values.description,
        record.values.lotNumber,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [records, kindFilter, statusFilter, query]);

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Reference copied', id);
    } catch {
      toast.error('Copy failed', 'Select the reference and copy it manually.');
    }
  };

  const handleClear = async () => {
    await clearAll();
    setConfirmClear(false);
    setDetail(null);
    toast.success('Local data cleared', 'All submission records were removed from this browser.');
  };

  const categories = (record: SubmissionRecord) =>
    record.kind === 'observation' ? OBSERVATION_CATEGORIES : QUALITY_CATEGORIES;

  return (
    <div className="fade-up">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Audit trail · {records.length} records</span>
          <h1 style={{ marginTop: 8 }}>Submission History</h1>
          <p>
            Every observation and inspection recorded in this browser, with review status and
            evidence references.
          </p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Button
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={() => void refresh().then(() => toast.info('History refreshed'))}
          >
            Refresh
          </Button>
          <Button icon={<ClipboardList size={16} />} onClick={() => navigate('/app/new')}>
            New submission
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card__header" style={{ flexWrap: 'wrap' }}>
          <div className="filter-row">
            {(['all', 'observation', 'inspection'] as KindFilter[]).map((kind) => (
              <button
                className={`filter-chip ${kindFilter === kind ? 'filter-chip--active' : ''}`}
                key={kind}
                type="button"
                onClick={() => setKindFilter(kind)}
              >
                {kind === 'all' ? 'All records' : kind === 'observation' ? 'Observations' : 'Inspections'}
              </button>
            ))}
            <span style={{ width: 1, height: 22, background: 'var(--border-soft)', margin: '0 4px' }} />
            {(['all', 'submitted', 'under-review', 'accepted', 'flagged'] as StatusFilter[]).map((status) => (
              <button
                className={`filter-chip ${statusFilter === status ? 'filter-chip--active' : ''}`}
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'Any status' : status.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="input-affix" style={{ width: 230 }}>
            <Search size={16} />
            <input
              className="input"
              style={{ minHeight: 38 }}
              placeholder="Search records…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search records"
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <span className="spinner" />
            <p>Loading history…</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={records.length === 0 ? 'No submissions yet' : 'No matching records'}
            description={
              records.length === 0
                ? 'Completed submissions will be stored here with their unique reference and status.'
                : 'Try changing the filters or search term to find the record you need.'
            }
            action={
              records.length === 0 ? (
                <Button size="sm" onClick={() => navigate('/app/new')}>Create a submission</Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setKindFilter('all'); setStatusFilter('all'); setQuery(''); }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Machine / Line</th>
                  <th>Author</th>
                  <th>Submitted</th>
                  <th>Evidence</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id}>
                    <td className="mono"><strong>{record.id}</strong></td>
                    <td>
                      <span className={`badge badge--plain ${record.kind === 'inspection' ? 'badge--info' : ''}`}>
                        {record.kind === 'inspection' ? <FileCheck2 size={13} /> : <ClipboardList size={13} />}
                        {record.kind}
                      </span>
                    </td>
                    <td>{labelFor(MACHINES, record.values.machine)}</td>
                    <td>{record.authorName}</td>
                    <td title={formatDateTime(record.createdAt)}>{formatDateTime(record.createdAt)}</td>
                    <td className="numeric">{record.evidence.length}</td>
                    <td><StatusBadge status={record.status} /></td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn--secondary btn--icon btn--sm"
                          type="button"
                          aria-label={`View ${record.id}`}
                          onClick={() => setDetail(record)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn btn--secondary btn--icon btn--sm"
                          type="button"
                          aria-label={`Copy ${record.id}`}
                          onClick={() => void copyId(record.id)}
                        >
                          <Clipboard size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginTop: 18, gap: 12, flexWrap: 'wrap' }}>
        <span className="subtle" style={{ fontSize: 11 }}>
          Showing {filtered.length} of {records.length} locally stored records · Signed in as{' '}
          {user?.employeeId}
        </span>
        <button className="link-btn" style={{ color: '#ff8b94' }} type="button" onClick={() => setConfirmClear(true)}>
          <Trash2 size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }} />
          Clear all demo data
        </button>
      </div>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.id ?? 'Record details'}
        description={detail ? `${formatDateTime(detail.createdAt)} · ${detail.authorName}` : undefined}
        actions={<Button onClick={() => setDetail(null)}>Close</Button>}
      >
        {detail && (
          <div className="stack" style={{ gap: 16 }}>
            <div className="row" style={{ gap: 8 }}>
              <StatusBadge status={detail.status} />
              <span className="badge badge--plain">{detail.kind}</span>
            </div>

            <div className="summary-list" style={{ marginTop: 0 }}>
              {[
                ['Plant', labelFor(PLANTS, detail.values.plant)],
                ['Machine / Line', labelFor(MACHINES, detail.values.machine)],
                ['Shift', labelFor(SHIFTS, detail.values.shift)],
                ['Category', labelFor(categories(detail), detail.values.category)],
                ['Priority', labelFor(SEVERITY_OPTIONS, detail.values.severity)],
                ['Lot / Batch', detail.values.lotNumber || '—'],
                ['Sample / Defects', `${detail.values.inspectedQuantity || '—'} / ${detail.values.defectQuantity || '0'}`],
                ['Verdict', detail.values.verdict.toUpperCase()],
                ['Evidence', `${detail.evidence.length} file(s)`],
                ['Last updated', formatDateTime(detail.updatedAt)],
              ].map(([label, value]) => (
                <div className="summary-list__row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div>
              <span className="field__label">Description</span>
              <p className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.6 }}>
                {detail.values.description}
              </p>
            </div>

            {detail.reviewNote && (
              <div className="storage-note" style={{ color: 'var(--success)', borderColor: 'rgba(37,216,121,.3)' }}>
                <ShieldCheck size={15} />
                <span><strong>Review note:</strong> {detail.reviewNote}</span>
              </div>
            )}

            {detail.evidence.length > 0 && (
              <div>
                <span className="field__label">Attached evidence</span>
                <div className="evidence-grid" style={{ marginTop: 8 }}>
                  {detail.evidence.map((item) => (
                    <div className="evidence-card" key={item.id}>
                      {item.thumbnail ? (
                        <img className="evidence-card__media" src={item.thumbnail} alt={item.name} />
                      ) : (
                        <div className="evidence-card__placeholder">
                          <Paperclip size={26} />
                        </div>
                      )}
                      <div className="evidence-card__meta">
                        <strong title={item.name}>{item.name}</strong>
                        <span>{item.kind.toUpperCase()} · {formatBytes(item.size)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all demo data?"
        description="This permanently removes every locally stored submission from this browser. This action cannot be undone."
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmClear(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => void handleClear()}>Clear data</Button>
          </>
        }
      />
    </div>
  );
}
