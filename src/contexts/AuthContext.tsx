import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Assuming supabase client is set up

interface User {
    email: string;
    name?: string;
    plan?: string;
    role?: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    login: (email: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('enem_pro_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string) => {
        // Admin Override
        const ADMINS = ['admin@enem.pro', 'marlinstenio0312@gmail.com'];

        if (ADMINS.includes(email)) {
            const adminUser = { email, name: 'Admin', role: 'admin' as const, plan: 'unlimited' };
            setUser(adminUser);
            localStorage.setItem('enem_pro_user', JSON.stringify(adminUser));
            return { success: true };
        }

        try {
            // Check Supabase
            const { data, error } = await supabase
                .from('saas_leads')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                return { success: false, message: 'Email não encontrado na base de alunos.' };
            }

            if (data.status === 'blocked') {
                return { success: false, message: 'Acesso bloqueado. Entre em contato com o suporte.' };
            }

            // Success
            const newUser = {
                email: data.email,
                name: data.name,
                plan: data.plan,
                role: 'user' as const
            };

            setUser(newUser);
            localStorage.setItem('enem_pro_user', JSON.stringify(newUser));
            return { success: true };

        } catch (err) {
            console.error('Login error', err);
            // Fallback for demo if supabase fails/table missing
            // Remove this for production!
            if (email.includes('@')) {
                const demoUser = { email, name: 'Aluno Demo', plan: 'pro', role: 'user' as const };
                setUser(demoUser);
                localStorage.setItem('enem_pro_user', JSON.stringify(demoUser));
                return { success: true, message: 'Modo Demo Ativado' };
            }
            return { success: false, message: 'Erro ao conectar no servidor.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('enem_pro_user');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
