import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Scene3D from '../3d/Scene3D';
import { useAuthStore } from '../../store/authStore';

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen relative">
      <Scene3D interactive={false} />
      <Sidebar />
      <main className="lg:ml-64 min-h-screen p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
