import { Navigate, Outlet } from 'react-router-dom';

export function AccessGuard() {
    const userStr = localStorage.getItem('enem_pro_user');

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userStr);

    // Check for new plans
    if (user.plan === 'vitalicio' || user.plan === 'medicina' || user.status === 'active') {
        return <Outlet />;
    }

    // Weekly Plan - Check Date (only if not 'active' status which overrides)
    if (user.plan === 'semanal' || user.plan === 'start') {
        const purchaseDate = new Date(user.purchase_date || new Date().toISOString());
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7 && user.status !== 'active') {
            return <Navigate to="/renew" replace />;
        }
    }

    return <Outlet />;
}
