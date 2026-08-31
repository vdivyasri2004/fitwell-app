import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { Card, Spinner } from '../components/ui';
import { getStats, DashboardStats } from '../lib/admin';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    getStats().then(
      (s) => { if (active) setStats(s); },
      (e) => { if (active) setError(e.message); },
    );
    return () => { active = false; };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div>
        <div className="page-header"><h1>Access denied</h1></div>
        <div className="error-banner">Your account does not have the admin role. Access is determined server-side.</div>
      </div>
    );
  }

  if (!stats) {
    return <div className="center-loading">{error ? <div className="error-banner">{error}</div> : <Spinner />}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Dashboard</h1><p>Overview of FitWell platform data</p></div>
      </div>
      <div className="stat-grid">
        <Card title="Users" count={stats.users} accent="#3B82F6" />
        <Card title="Foods" count={stats.foods} accent="#10B981" />
        <Card title="Exercises" count={stats.exercises} accent="#8B5CF6" />
        <Card title="Workouts" count={stats.workouts} accent="#F59E0B" />
        <Card title="Food logs" count={stats.food_logs} accent="#EF4444" />
        <Card title="Workout logs" count={stats.workout_logs} accent="#06B6D4" />
        <Card title="Admins" count={stats.admins} accent="#0F172A" />
      </div>
    </div>
  );
}
