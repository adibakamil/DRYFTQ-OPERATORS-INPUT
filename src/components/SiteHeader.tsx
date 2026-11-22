import { Bell, ChevronRight, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BrandLogo } from './BrandLogo';

interface SiteHeaderProps {
  minimal?: boolean;
}

export function SiteHeader({ minimal = false }: SiteHeaderProps) {
  const { user } = useAuth();
  const toast = useToast();

  const dashboard = user?.role === 'quality-inspector' ? '/app/quality' : '/app/operator';

  const links = [
    { label: 'Overview', to: dashboard },
    { label: 'Observations', to: '/app/history' },
    { label: 'Quality', to: '/app/quality-view' },
    { label: 'Profile', to: '/app/profile' },
  ];

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to={user?.roleConfirmed ? dashboard : '/'} className="site-header__brand" aria-label="DRYFTQ Collect home">
          <BrandLogo />
        </Link>

        {!minimal && (
          <nav className="site-header__nav" aria-label="Primary">
            {links.map((link) => (
              <Link key={link.label} to={link.to} className="site-header__link">
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="site-header__right">
          <span className="site-header__status">
            <span className="live-dot" /> PLANT LINK NOMINAL
          </span>
          <span className="site-header__divider" />
          <button
            className="site-header__icon"
            type="button"
            aria-label="View alerts"
            onClick={() =>
              toast.info('No new alerts', 'Your notification queue is clear at this time.')
            }
          >
            <Bell size={17} />
          </button>
          {user ? (
            <Link to="/app/profile" className="site-header__user">
              <span className="avatar">{user.initials}</span>
              <span className="site-header__user-meta">
                <strong>{user.name}</strong>
                <small>{user.role === 'quality-inspector' ? 'QA INSPECTOR' : 'OPERATOR'}</small>
              </span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <span className="site-header__secure">
              <LockKeyhole size={14} /> SECURE ACCESS
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
