import { useEffect, useState } from 'react';
import { Button, Spinner } from '../components/ui';
import { AdminUser, listUsers, setRole, deleteUser } from '../lib/admin';

export default function Users() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await listUsers());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (u: AdminUser) => {
    setError('');
    try {
      await setRole(u.id, u.is_admin ? 'user' : 'admin');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (u: AdminUser) => {
    if (!window.confirm(`Delete user "${u.email ?? u.full_name}"? Their data will be removed.`)) return;
    setError('');
    try {
      await deleteUser(u.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Users</h1><p>{items.length} registered users</p></div>
      </div>
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="panel">
        <div className="table-wrap">
          {loading ? (
            <div className="center-loading"><Spinner /></div>
          ) : items.length === 0 ? (
            <div className="empty">No users found.</div>
          ) : (
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Goal</th><th>Diet</th><th>Status</th><th>Role</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name || '—'}</td>
                    <td className="muted">{u.email ?? '—'}</td>
                    <td><span className="pill">{u.fitness_goal}</span></td>
                    <td><span className="pill">{u.dietary_preference}</span></td>
                    <td>{u.onboarded ? <span className="pill ok">Onboarded</span> : <span className="pill">Pending</span>}</td>
                    <td>{u.is_admin ? <span className="pill ok">Admin</span> : <span className="pill">User</span>}</td>
                    <td>
                      <Button variant="ghost" className="btn-sm" onClick={() => toggleRole(u)}>
                        {u.is_admin ? 'Revoke admin' : 'Make admin'}
                      </Button>{' '}
                      <Button variant="danger" className="btn-sm" onClick={() => remove(u)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
