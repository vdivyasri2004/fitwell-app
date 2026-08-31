import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth';
import { ProtectedLayout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import Exercises from './pages/Exercises';
import Workouts from './pages/Workouts';
import Users from './pages/Users';
import { isConfigured } from './lib/api';

export default function App() {
  if (!isConfigured) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>Configuration needed</h1>
          <p>Set VITE_API_URL in /fitwell/admin/.env to point at the FitWell server.</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="foods" element={<Foods />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
