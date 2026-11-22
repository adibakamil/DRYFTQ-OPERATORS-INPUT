import { Outlet } from 'react-router-dom';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

/** Full website shell for focused pages (role selection, wizards). */
export function StandaloneLayout() {
  return (
    <div className="website-page">
      <SiteHeader />
      <main className="website-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
