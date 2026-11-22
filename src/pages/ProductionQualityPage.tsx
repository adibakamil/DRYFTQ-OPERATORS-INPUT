import { ArrowLeft, ClipboardCheck, FileWarning, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { useSubmissions } from '../context/SubmissionsContext';
import { formatRelative, labelFor, MACHINES } from '../data/reference';

export function ProductionQualityPage() {
  const navigate = useNavigate();
  const { records, loading } = useSubmissions();
  const inspections = records.filter((record) => record.kind === 'inspection');
  const inspected = inspections.reduce((sum, record) => sum + (Number(record.values.inspectedQuantity) || 0), 0);
  const defects = inspections.reduce((sum, record) => sum + (Number(record.values.defectQuantity) || 0), 0);
  const yieldRate = inspected ? (((inspected - defects) / inspected) * 100).toFixed(1) : '—';

  return (
    <div className="fade-up">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Read-only quality view</span>
          <h1 style={{ marginTop: 8 }}>Production Quality</h1>
          <p>
            Live quality performance and inspection outcomes across all monitored production lines.
          </p>
        </div>
        <button className="btn btn--secondary" type="button" onClick={() => navigate('/app/operator')}>
          <ArrowLeft size={16} /> Back to dashboard
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card kpi-card--success">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="kpi-card__label">First Pass Yield</span>
            <ShieldCheck size={17} style={{ color: 'var(--text-3)' }} />
          </div>
          <div className="kpi-card__value">{yieldRate === '—' ? yieldRate : `${yieldRate}%`}</div>
          <div className="kpi-card__meta">{inspected.toLocaleString()} units sampled</div>
        </div>
        <div className="kpi-card kpi-card--warning">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="kpi-card__label">Defects found</span>
            <FileWarning size={17} style={{ color: 'var(--text-3)' }} />
          </div>
          <div className="kpi-card__value">{defects}</div>
          <div className="kpi-card__meta">Across all inspections</div>
        </div>
        <div className="kpi-card kpi-card--info">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="kpi-card__label">Inspections</span>
            <ClipboardCheck size={17} style={{ color: 'var(--text-3)' }} />
          </div>
          <div className="kpi-card__value">{loading ? '—' : inspections.length}</div>
          <div className="kpi-card__meta">Quality team records</div>
        </div>
        <div className="kpi-card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="kpi-card__label">Flagged records</span>
            <FileWarning size={17} style={{ color: 'var(--text-3)' }} />
          </div>
          <div className="kpi-card__value">
            {inspections.filter((record) => record.status === 'flagged').length}
          </div>
          <div className="kpi-card__meta">Awaiting engineering</div>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-heading">
          <div>
            <h2>Inspection records</h2>
            <p>Most recent production quality checks.</p>
          </div>
        </div>
        <div className="card">
          {inspections.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No inspection records"
              description="Quality Inspectors have not submitted any inspection results yet."
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
                    <th>Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((record) => (
                    <tr key={record.id}>
                      <td className="mono"><strong>{record.id}</strong></td>
                      <td>{labelFor(MACHINES, record.values.machine)}</td>
                      <td className="mono">{record.values.lotNumber || '—'}</td>
                      <td className="numeric">{record.values.inspectedQuantity || '—'}</td>
                      <td className="numeric">{record.values.defectQuantity || '0'}</td>
                      <td>
                        <span className={`badge ${record.values.verdict === 'pass' ? 'badge--success' : record.values.verdict === 'hold' ? 'badge--warning' : 'badge--danger'}`}>
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
    </div>
  );
}
