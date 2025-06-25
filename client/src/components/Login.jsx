import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react'; // Using Mail icon for Google

export default function Login() {
    const { signInWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            await signInWithGoogle();
            navigate('/');
        } catch (e) {
            console.error(e);
            setError('Failed to log in with Google');
        }
        setLoading(false);
    }

    return (
        <div className="flex items-center justify-center h-screen bg-dark-800">
            <div className="card w-full max-w-md p-8 text-center">
                <Shield className="w-16 h-16 text-primary-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to VirusScanner</h2>
                <p className="text-gray-400 mb-8">Sign in to continue to your dashboard.</p>
                
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">{error}</div>}
                
                <button 
                    disabled={loading} 
                    onClick={handleGoogleSignIn}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                >
                    <Mail className="w-5 h-5" />
                    <span>{loading ? 'Signing In...' : 'Sign In with Google'}</span>
                </button>

                <p className="text-xs text-gray-500 mt-8">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
} 