import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from './Layout/MainLayout';
import Homepage from './Home/Homepage';
import About from './Home/About';
import Contact from './Home/Contact';
import Login from './Auth/Login';
import OTPLogin from './Auth/OTPLogin';
import Register from './Auth/Register';
import Dashboard from './Agent/Dashboard';
import IssueQR from './Agent/IssueQR';
import AdminPanel from './Admin/AdminPanel';
import UserProfile from './User/UserProfile';
import MyItems from './User/MyItems';
import MyCard from './User/MyCard';
import CardDetailPage from './Home/CardDetailPage';

const App = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const ProtectedRoute = ({ children, roles = [] }) => {
        if (!user) return <Navigate to="/login" />;
        if (roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" />;
        return children;
    };

    return (
        <Routes>
            {/* Wrap all pages in MainLayout */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Homepage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/login/otp" element={!user ? <OTPLogin /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/v-cards/:id" element={<CardDetailPage />} />
                
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/issue-qr" element={
                    <ProtectedRoute roles={['agent', 'admin']}>
                        <IssueQR />
                    </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                    <ProtectedRoute roles={['admin']}>
                        <AdminPanel />
                    </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                } />
                
                <Route path="/my-items" element={
                    <ProtectedRoute>
                        <MyItems />
                    </ProtectedRoute>
                } />
                
                <Route path="/my-card" element={
                    <ProtectedRoute>
                        <MyCard />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
            </Route>
        </Routes>
    );
};

export default App;
