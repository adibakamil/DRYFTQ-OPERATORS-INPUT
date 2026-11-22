import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileBarChart2,
  HardHat,
  Inbox,
  Plus,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSubmissions } from '../context/SubmissionsContext';
import { formatRelative, labelFor, MACHINES } from '../data/reference';

export function OperatorDashboardPage() {
  const { user } = useAuth();
  const { records, loading } = useSubmissions();
  const navigate = useNavigate();

  const observations = records.filter((record) => record.kind === 'observation');
  const mine = observations.filter((record) => record.authorId === user?.employeeId);
  const pending = observations.filter(
    (record) => record.status === 'submitted' || record.status === 'under-review',
  ).length;
  const accepted = observations.filter((record) => record.status === 'accepted').length;
  const safety = observations.filter((record) => record.values.category === 'safety-risk').length;

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const kpis = [
    {
      label: 'My observations',
      value: mine.length,
      meta: `${observations.length} across all shifts`,
      icon: ClipboardList,
      tone: '',
    },
    {
      label: 'Awaiting review',
      value: pending,
      meta: 'Open with quality team',
      icon: Clock3,
      tone: 'warning',
    },
    {
      label: 'Accepted',
      value: accepted,
      meta: 'Closed and actioned',
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      label: 'Safety risks logged',
      value: safety,
      meta: 'Requires immediate attention',
      icon: ShieldAlert,
      tone: 'info',
    },
  ];

  return (
    <div className="fade-up">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Operator workspace · {today}</span>
          <h1 style={{ marginTop: 8 }}>
            Welcome back, {user?.name.split(' ')[0] ?? 'Operator'}
          </h1>
          <p>
            Here is the current status of observations on your plant floor. Your reports feed
            directly into the quality review queue.
          </p>
        </div>
        <Button icon={<Plus size={17} />} onClick={() => navigate('/app/new')}>
          New observation
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
              <div className="kpi-card__meta">
                <TrendingUp size={12} className="up" /> {kpi.meta}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel-section">
        <div className="section-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Start a report or review live production quality data.</p>
          </div>
        </div>
        <div className="action-grid">
          <button className="action-tile" type="button" onClick={() => navigate('/app/new')}>
            <span className="action-tile__icon">
              <HardHat size={25} strokeWidth={1.8} />
            </span>
            <span className="action-tile__content">
              <h3>Operator Observations</h3>
              <p>
                Report machine issues, safety risks and observations. Capture evidence, review and
                submit in one guided flow.
              </p>
              <span className="action-tile__cta">
                Create observation <ArrowRight size={14} />
              </span>
            </span>
          </button>

          <button
            className="action-tile action-tile--info"
            type="button"
            onClick={() => navigate('/app/quality-view')}
          >
            <span className="action-tile__icon">
              <FileBarChart2 size={25} strokeWidth={1.8} />
            </span>
            <span className="action-tile__content">
              <h3>Production Quality</h3>
              <p>
                Inspect live quality metrics, line performance, defect reports and recent inspection
                records across the plant.
              </p>
              <span className="action-tile__cta">
                View quality data <ArrowRight size={14} />
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="panel-section">
        <div className="section-heading">
          <div>
            <h2>Recent activity</h2>
            <p>Latest observation submissions and their review status.</p>
          </div>
          <Link className="link-btn" to="/app/history">
            View all submissions <ArrowRight size={14} style={{ verticalAlign: '-2px' }} />
          </Link>
        </div>

        <div className="card">
          {loading ? (
            <div className="empty-state">
              <span className="spinner" />
              <p>Loading activity…</p>
            </div>
          ) : observations.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No observations yet"
              description="Your submitted observations will appear here with their current status and timestamps."
              action={
                <Button size="sm" onClick={() => navigate('/app/new')}>
                  Create the first observation
                </Button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Observation ID</th>
                    <th>Machine / Line</th>
                    <th>Category</th>
                    <th>Submitted by</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {observations.slice(0, 7).map((record) => (
                    <tr key={record.id}>
                      <td className="mono"><strong>{record.id}</strong></td>
                      <td>{labelFor(MACHINES, record.values.machine)}</td>
                      <td>{record.values.category.replace(/-/g, ' ')}</td>
                      <td>{record.authorName}</td>
                      <td title={new Date(record.createdAt).toLocaleString()}>
                        {formatRelative(record.createdAt)}
                      </td>
                      <td><StatusBadge status={record.status} /></td>
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
