import { Navigate, Outlet } from 'react-router-dom';

export function AccessGuard() {
    const userStr = localStorage.getItem('enem_pro_user');

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userStr);

    // Medicina (Lifetime) - Always Allowed
    if (user.plan === 'medicina') {
        return <Outlet />;
    }

    // Weekly Plan - Check Date
    if (user.plan === 'start') {
        const purchaseDate = new Date(user.purchase_date || new Date().toISOString()); // Fallback for old users
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            return <Navigate to="/renew" replace />;
        }
    }

    return <Outlet />;
}
