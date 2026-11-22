import {
  ClipboardCheck,
  ClipboardList,
  Database,
  FileBarChart2,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { SiteFooter } from '../components/SiteFooter';
import { useAuth } from '../context/AuthContext';

interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

const operatorNav: NavEntry[] = [
  { to: '/app/operator', label: 'Home', icon: LayoutDashboard },
  { to: '/app/new', label: 'Operator Observations', icon: ClipboardList, primary: true },
  { to: '/app/quality-view', label: 'Production Quality', icon: FileBarChart2 },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
];

const qualityNav: NavEntry[] = [
  { to: '/app/quality', label: 'Overview', icon: LayoutDashboard },
  { to: '/app/new', label: 'Create New Inspection', icon: ClipboardCheck, primary: true },
  { to: '/app/history', label: 'Inspection Records', icon: History },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const isQuality = user.role === 'quality-inspector';
  const nav = isQuality ? qualityNav : operatorNav;
  const current = nav.find((item) => item.to === location.pathname);
  const title = current?.label ?? (isQuality ? 'Quality Inspector' : 'Operator Console');

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      {menuOpen && (
        <div
          className="sidebar-backdrop sidebar-backdrop--visible"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <BrandLogo />
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          <div className="sidebar__group">Workspace</div>
          {nav.map(({ to, label, icon: Icon, primary }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={17} strokeWidth={1.9} />
              <span>{label}</span>
              {primary && <span className="nav-item__count">NEW</span>}
            </NavLink>
          ))}

          <div className="sidebar__group" style={{ marginTop: 12 }}>
            System
          </div>
          <div className="nav-item" style={{ cursor: 'default' }}>
            <Database size={17} strokeWidth={1.9} />
            <span>Local demo data</span>
          </div>
        </nav>

        <div className="sidebar__footer">
          <div className="storage-note">
            <Database size={14} />
            <span>
              Records are stored in this browser only. No backend is connected in this demo build.
            </span>
          </div>
          <button
            className="nav-item"
            type="button"
            onClick={handleLogout}
            style={{ width: '100%', marginTop: 10 }}
          >
            <LogOut size={17} strokeWidth={1.9} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar__left">
            <button
              className="btn btn--secondary btn--icon mobile-menu-btn"
              type="button"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={19} />
            </button>
            <span className="topbar__title">{title}</span>
            <span className="topbar__divider" />
            <span className="system-status">
              <span className="live-dot" /> Plant link nominal
            </span>
          </div>

          <div className="topbar__right">
            <span className="badge badge--plain mono">
              {user.employeeId} · {isQuality ? 'QA INSPECTOR' : 'OPERATOR'}
            </span>
            <div className="user-chip">
              <div className="avatar">{user.initials}</div>
              <div className="user-chip__meta">
                <strong>{user.name}</strong>
                <span>{isQuality ? 'Quality Assurance' : 'Plant Operations'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
