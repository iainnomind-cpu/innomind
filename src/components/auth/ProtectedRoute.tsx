import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UserContext';
import TrialExpiredScreen from '@/components/ui/TrialExpiredScreen';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const { isTrialExpired, isLoadingProfile } = useUsers();

    if (loading || isLoadingProfile) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/crm/login" replace />;
    }

    if (isTrialExpired) {
        return <TrialExpiredScreen />;
    }

    return <Outlet />;
}
