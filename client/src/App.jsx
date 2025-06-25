import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Scan from './components/Scan';
import Reports from './components/Reports';
import FileManager from './components/FileManager';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function MainLayout() {
    const location = useLocation();
    const [active, setActive] = React.useState(location.pathname);

    React.useEffect(() => {
        setActive(location.pathname);
    }, [location]);

    return (
        <div className="flex bg-dark-800 text-white min-h-screen">
            <Sidebar active={active} setActive={setActive} />
            <main className="flex-1 p-6 md:p-8 lg:p-10">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/scan" element={<Scan />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/files" element={<FileManager />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/*"
                        element={
                            <PrivateRoute>
                                <MainLayout />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;