import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <div className="empty-state__icon"><Compass size={26} /></div>
      <h1 style={{ fontSize: 22, marginTop: 8 }}>Page not found</h1>
      <p>The page you requested does not exist in this workspace.</p>
      <Link className="btn btn--primary" style={{ marginTop: 12 }} to="/login">
        Return to login
      </Link>
    </div>
  );
}
