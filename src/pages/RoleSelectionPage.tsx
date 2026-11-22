import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  HardHat,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Role } from '../types';

const ROLES: {
  id: Role;
  title: string;
  description: string;
  icon: typeof HardHat;
  tone: 'primary' | 'info';
}[] = [
  {
    id: 'operator',
    title: 'Operator',
    description: 'Report machine issues, log safety risks and submit daily machine observations.',
    icon: HardHat,
    tone: 'primary',
  },
  {
    id: 'quality-inspector',
    title: 'Quality Inspector',
    description: 'Report production quality, monitor quality data and review production metrics.',
    icon: ClipboardCheck,
    tone: 'info',
  },
];

export function RoleSelectionPage() {
  const { user, chooseRole, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>('operator');

  if (!user) return <Navigate to="/login" replace />;
  if (user.roleConfirmed) {
    return (
      <Navigate
        to={user.role === 'quality-inspector' ? '/app/quality' : '/app/operator'}
        replace
      />
    );
  }

  const continueToDashboard = () => {
    chooseRole(selected);
    const destination = selected === 'quality-inspector' ? '/app/quality' : '/app/operator';
    toast.success(
      `${selected === 'quality-inspector' ? 'Quality Inspector' : 'Operator'} workspace selected`,
      'Opening your dashboard…',
    );
    navigate(destination, { replace: true });
  };

  return (
    <div className="role-page">
      <div className="role-shell fade-up">
        <div className="role-header">
          <div className="role-header__badge">2</div>
          <div>
            <h1>Choose your role</h1>
            <p>Signed in as {user.name} · {user.employeeId}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <BrandLogo />
          </div>
        </div>

        <div className="role-body">
          <h2>How are you working today?</h2>
          <p>Your selection determines the dashboard and reporting tools you will see.</p>

          <div className="role-grid" role="radiogroup" aria-label="Select your role">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  className={`role-card ${isSelected ? 'role-card--selected' : ''} ${
                    role.tone === 'info' ? 'role-card--info' : ''
                  }`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelected(role.id)}
                >
                  <span className="role-card__bar" />
                  <span className="role-card__check">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="role-card__icon">
                    <Icon size={56} strokeWidth={1.4} />
                  </span>
                  <span className="role-card__text">
                    <h3>{role.title}</h3>
                    <p>{role.description}</p>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="role-footer">
          <span className="role-footer__hint">
            SESSION {user.employeeId} · ROLE SELECTION REQUIRED
          </span>
          <div className="row" style={{ gap: 10 }}>
            <Button
              variant="secondary"
              icon={<LogOut size={16} />}
              onClick={() => {
                signOut();
                navigate('/login', { replace: true });
              }}
            >
              Sign out
            </Button>
            <Button size="lg" iconAfter={<ArrowRight size={18} />} onClick={continueToDashboard}>
              Continue
            </Button>
          </div>
        </div>
      </div>

      <button
        className="link-btn"
        type="button"
        style={{ marginTop: 18 }}
        onClick={() => {
          signOut();
          navigate('/login', { replace: true });
        }}
      >
        <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }} />
        Back to login
      </button>
    </div>
  );
}
