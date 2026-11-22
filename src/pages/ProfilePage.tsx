import {
  BadgeCheck,
  Database,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSubmissions } from '../context/SubmissionsContext';
import { formatDateTime } from '../data/reference';

export function ProfilePage() {
  const { user, signOut, switchRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { records } = useSubmissions();

  if (!user) return null;

  const mine = records.filter((record) => record.authorId === user.employeeId);

  return (
    <div className="fade-up">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Account settings</span>
          <h1 style={{ marginTop: 8 }}>Profile</h1>
          <p>Your session identity, assigned role and local data information.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card profile-id">
          <div className="avatar">{user.initials}</div>
          <h2>{user.name}</h2>
          <p>{user.department}</p>
          <div style={{ marginTop: 14 }}>
            <span className="badge badge--success">
              <BadgeCheck size={13} /> Active session
            </span>
          </div>
          <div className="summary-list" style={{ width: '100%', marginTop: 24 }}>
            <div className="summary-list__row"><span>My submissions</span><strong>{mine.length}</strong></div>
            <div className="summary-list__row">
              <span>Member since</span>
              <strong>{new Date().getFullYear()}</strong>
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 18 }}>
          <div className="card">
            <div className="card__header">
              <div className="row" style={{ gap: 10 }}>
                <UserRound size={18} className="accent" />
                <span className="card__title">Account details</span>
              </div>
            </div>
            <div className="card__body">
              <div className="profile-rows">
                <div className="profile-row"><span>Full name</span><strong>{user.name}</strong></div>
                <div className="profile-row"><span>Employee ID</span><strong className="mono">{user.employeeId}</strong></div>
                <div className="profile-row">
                  <span>Assigned role</span>
                  <strong>{user.role === 'quality-inspector' ? 'Quality Inspector' : 'Operator'}</strong>
                </div>
                <div className="profile-row"><span>Department</span><strong>{user.department}</strong></div>
                <div className="profile-row"><span>Session started</span><strong>{formatDateTime(new Date().toISOString())}</strong></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="row" style={{ gap: 10 }}>
                <Database size={18} style={{ color: 'var(--info)' }} />
                <span className="card__title">Storage &amp; integration</span>
              </div>
            </div>
            <div className="card__body">
              <div className="storage-note" style={{ marginBottom: 16 }}>
                <ShieldCheck size={15} />
                <span>
                  No backend is connected. Submissions, drafts and your session are saved in this
                  browser's local storage via a replaceable service layer.
                </span>
              </div>
              <div className="profile-rows">
                <div className="profile-row"><span>Storage mode</span><strong>Local demo (localStorage)</strong></div>
                <div className="profile-row"><span>Stored records</span><strong className="numeric">{records.length}</strong></div>
                <div className="profile-row"><span>Application version</span><strong className="mono">v2.4.1-COLLECT</strong></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <div className="row" style={{ gap: 10 }}>
                <KeyRound size={18} className="accent" />
                <span className="card__title">Session actions</span>
              </div>
            </div>
            <div className="card__body row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                icon={<RefreshCw size={16} />}
                onClick={() => {
                  switchRole();
                  toast.info('Role selection', 'Choose a role to switch workspaces.');
                  navigate('/role', { replace: true });
                }}
              >
                Switch role
              </Button>
              <Button
                variant="danger"
                icon={<LogOut size={16} />}
                onClick={() => {
                  signOut();
                  toast.info('Signed out', 'Your local session has ended.');
                  navigate('/login', { replace: true });
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
