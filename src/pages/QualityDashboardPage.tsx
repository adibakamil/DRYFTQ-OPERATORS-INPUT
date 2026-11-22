import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  FileWarning,
  Gauge,
  Inbox,
  Plus,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSubmissions as useRecords } from '../context/SubmissionsContext';
import { useToast } from '../context/ToastContext';
import { formatRelative, labelFor, MACHINES, STATUS_META } from '../data/reference';
import type { SubmissionStatus } from '../types';

const LINES = [
  { id: 'HSM 1', area: 'Forming Bay A', load: 82, state: 'Running' },
  { id: 'HSM 2', area: 'Forming Bay A', load: 74, state: 'Running' },
  { id: 'CNC 04', area: 'Machining Bay', load: 91, state: 'Running' },
  { id: 'LINE A', area: 'Assembly Hall', load: 68, state: 'Running' },
  { id: 'LINE B', area: 'Assembly Hall', load: 55, state: 'Changeover' },
];

export function QualityDashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { records, loading, setStatus } = useRecords();

  const inspections = useMemo(
    () => records.filter((record) => record.kind === 'inspection'),
    [records],
  );
  const operatorQueue = useMemo(
    () => records.filter((record) => record.kind === 'observation'),
    [records],
  );

  const inspected = inspections.reduce(
    (sum, record) => sum + (Number(record.values.inspectedQuantity) || 0),
    0,
  );
  const defects = inspections.reduce(
    (sum, record) => sum + (Number(record.values.defectQuantity) || 0),
    0,
  );
  const firstPassYield = inspected > 0 ? (((inspected - defects) / inspected) * 100).toFixed(1) : '—';
  const defectRate = inspected > 0 ? ((defects / inspected) * 100).toFixed(2) : '—';
  const openFlags = records.filter((record) => record.status === 'flagged').length;
  const defectReports = inspections.filter(
    (record) => Number(record.values.defectQuantity) > 0,
  );

  const kpis = [
    {
      label: 'First Pass Yield',
      value: firstPassYield === '—' ? firstPassYield : `${firstPassYield}%`,
      meta: `${inspected.toLocaleString()} units inspected`,
      tone: 'success',
      icon: ShieldCheck,
    },
    {
      label: 'Defect Rate',
      value: defectRate === '—' ? defectRate : `${defectRate}%`,
      meta: `${defects} defective units found`,
      tone: 'warning',
      icon: TriangleAlert,
    },
    {
      label: 'Inspections logged',
      value: inspections.length,
      meta: 'Across all production lines',
      tone: 'info',
      icon: ClipboardCheck,
    },
    {
      label: 'Open flags',
      value: openFlags,
      meta: 'Escalated for engineering',
      tone: '',
      icon: FileWarning,
    },
  ];

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    try {
      await setStatus(id, status, status === 'accepted' ? 'Reviewed by quality team.' : undefined);
      toast.success('Status updated', `${id} is now ${STATUS_META[status].label.toLowerCase()}.`);
    } catch {
      toast.error('Update failed', 'The record status could not be changed.');
    }
  };

  return (
    <div className="fade-up">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Quality assurance · Production overview</span>
          <h1 style={{ marginTop: 8 }}>
            Good day, {user?.name.split(' ')[0] ?? 'Inspector'}
          </h1>
          <p>
            Monitor production quality, review operator observations and log new inspection results.
          </p>
        </div>
        <Button icon={<Plus size={17} />} onClick={() => navigate('/app/new')}>
          Create New Inspection
        </Button>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div className={`kpi-card kpi-card--${kpi.tone}`} key={kpi.label}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="kpi-card__label">{kpi.label}</span>
                <Icon size={17} style={{ color: 'var(--text-3)' }} />
              </div>
              <div className="kpi-card__value">{loading ? '—' : kpi.value}</div>
              <div className="kpi-card__meta">{kpi.meta}</div>
            </div>
          );
        })}
      </div>

      <div className="panel-section">
        <div className="section-heading">
          <div>
            <h2>Machine &amp; line information</h2>
            <p>Live loading status of monitored production assets.</p>
          </div>
          <span className="badge badge--success">
            <span className="live-dot" /> 4 of 5 running
          </span>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Area</th>
                  <th>Current load</th>
                  <th>State</th>
                  <th>Last inspection</th>
                </tr>
              </thead>
              <tbody>
                {LINES.map((line) => {
                  const related = inspections.find((record) =>
                    record.values.machine.toLowerCase().includes(line.id.toLowerCase().replace(' ', '-')),
                  );
                  return (
                    <tr key={line.id}>
                      <td><strong>{line.id}</strong></td>
                      <td>{line.area}</td>
                      <td style={{ minWidth: 170 }}>
                        <div className="row" style={{ gap: 10 }}>
                          <div
                            style={{
                              height: 5,
                              flex: 1,
                              background: '#1c2637',
                              borderRadius: 4,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${line.load}%`,
                                height: '100%',
                                background: line.load > 85 ? 'var(--warning)' : 'var(--info)',
                              }}
                            />
                          </div>
                          <span className="mono">{line.load}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${line.state === 'Running' ? 'badge--success' : 'badge--warning'}`}>
                          {line.state}
                        </span>
                      </td>
                      <td>{related ? formatRelative(related.createdAt) : 'No records'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-heading">
          <div>
            <h2>Quality inspection records</h2>
            <p>Results submitted by the quality team.</p>
          </div>
          <button className="link-btn" type="button" onClick={() => navigate('/app/history')}>
            View all records <ArrowRight size={14} style={{ verticalAlign: '-2px' }} />
          </button>
        </div>
        <div className="card">
          {inspections.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No inspections recorded"
              description="Create a new inspection to start tracking quality metrics for your lines."
              action={<Button size="sm" onClick={() => navigate('/app/new')}>Create inspection</Button>}
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Inspection ID</th>
                    <th>Line / Machine</th>
                    <th>Lot</th>
                    <th>Sample</th>
                    <th>Defects</th>
                    <th>Verdict</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.slice(0, 6).map((record) => (
                    <tr key={record.id}>
                      <td className="mono"><strong>{record.id}</strong></td>
                      <td>{labelFor(MACHINES, record.values.machine)}</td>
                      <td className="mono">{record.values.lotNumber || '—'}</td>
                      <td className="numeric">{record.values.inspectedQuantity || '—'}</td>
                      <td className="numeric">{record.values.defectQuantity || '0'}</td>
                      <td>
                        <span
                          className={`badge ${
                            record.values.verdict === 'pass'
                              ? 'badge--success'
                              : record.values.verdict === 'hold'
                                ? 'badge--warning'
                                : 'badge--danger'
                          }`}
                        >
                          {record.values.verdict}
                        </span>
                      </td>
                      <td><StatusBadge status={record.status} /></td>
                      <td>{formatRelative(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="action-grid panel-section">
        <div className="card">
          <div className="card__header">
            <div className="row" style={{ gap: 10 }}>
              <FileWarning size={18} className="accent" />
              <span className="card__title">Defect reports</span>
            </div>
            <span className="badge badge--warning">{defectReports.length} active</span>
          </div>
          <div className="card__body">
            {defectReports.length === 0 ? (
              <p className="muted" style={{ fontSize: 12.5 }}>
                No defects recorded in the current sample set.
              </p>
            ) : (
              <div className="review-list">
                {defectReports.slice(0, 3).map((record) => (
                  <div className="review-item" key={record.id}>
                    <span className="review-item__icon review-item__icon--purple">
                      <TriangleAlert size={20} />
                    </span>
                    <div className="review-item__body">
                      <h3>{record.values.notes || 'Defect detected'}</h3>
                      <p>
                        {record.values.defectQuantity} units · {labelFor(MACHINES, record.values.machine)} ·{' '}
                        {formatRelative(record.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <div className="row" style={{ gap: 10 }}>
              <Activity size={18} style={{ color: 'var(--info)' }} />
              <span className="card__title">Operator observation queue</span>
            </div>
            <span className="badge badge--info">{operatorQueue.length} total</span>
          </div>
          <div className="card__body">
            {operatorQueue.length === 0 ? (
              <p className="muted" style={{ fontSize: 12.5 }}>No operator observations to review.</p>
            ) : (
              <div className="review-list">
                {operatorQueue.slice(0, 3).map((record) => (
                  <div className="review-item" key={record.id}>
                    <span className="review-item__icon review-item__icon--info">
                      <Gauge size={19} />
                    </span>
                    <div className="review-item__body">
                      <h3>{record.id}</h3>
                      <p title={record.values.description}>
                        {labelFor(MACHINES, record.values.machine)} · {record.values.description.slice(0, 64)}
                        {record.values.description.length > 64 ? '…' : ''}
                      </p>
                    </div>
                    <select
                      className="select"
                      aria-label={`Change status for ${record.id}`}
                      style={{ minHeight: 34, padding: '5px 30px 5px 9px', fontSize: 11, width: 128 }}
                      value={record.status}
                      onChange={(event) => void updateStatus(record.id, event.target.value as SubmissionStatus)}
                    >
                      {Object.entries(STATUS_META).map(([value, meta]) => (
                        <option key={value} value={value}>{meta.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
