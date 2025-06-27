import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, UploadCloud, File, FileText, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ active, setActive }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const navItems = [
        { id: '/', name: 'Dashboard', icon: Shield },
        { id: '/scan', name: 'Scan', icon: UploadCloud },
        { id: '/reports', name: 'Reports', icon: FileText },
        { id: '/files', name: 'File Manager', icon: File },
    ];

    return (
        <aside className="w-64 bg-dark-900/50 backdrop-blur-sm p-6 flex flex-col justify-between border-r border-dark-700">
            <div>
                <div className="flex items-center space-x-3 mb-10">
                    <Shield className="w-8 h-8 text-primary-500" />
                    <span className="text-xl font-bold text-white">ClamSecure</span>
                </div>
                <nav>
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <Link
                                    to={item.id}
                                    onClick={() => setActive(item.id)}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors mb-2 ${
                                        active === item.id
                                            ? 'bg-primary-500 text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="border-t border-dark-700 pt-4">
                {currentUser && (
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={currentUser?.photoURL || '/default-avatar.png'}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="text-white font-semibold">{currentUser.displayName}</p>
                            <p className="text-gray-400 text-xs">{currentUser.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-400 hover:bg-red-500/20 hover:text-red-400 w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;