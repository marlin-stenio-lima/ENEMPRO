import { LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    userEmail?: string;
    userName?: string;
}

export function Navbar({ userEmail, userName }: NavbarProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                        <span className="text-xl font-bold text-gray-900">ENEM Pro</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <UserIcon className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">{userName || userEmail}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
