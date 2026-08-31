import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { signOutLocal } from '../lib/api';
import { useAuth } from '../auth';
import { Spinner } from './ui';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/foods', label: 'Foods' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/users', label: 'Users' },
];

export function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-loading"><Spinner /></div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Shell />;
}

function Shell() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const signOut = async () => {
    await signOutLocal();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">FitWell Admin</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
        <div className="sidebar-spacer" />
        <div className="muted" style={{ padding: '0 12px 8px', fontSize: 12 }}>
          Signed in as {user?.email}
        </div>
        <button className="signout-btn" onClick={signOut}>Sign out</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
