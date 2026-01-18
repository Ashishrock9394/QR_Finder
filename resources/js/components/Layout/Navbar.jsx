import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            fetchNotifications();
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('/api/notifications/unread-count');
            setUnreadCount(res.data.count);
        } catch (e) {}
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications');
            setNotifications(res.data);
        } catch (e) {}
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        setSearchTerm('');
    };

    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark sticky-top"
            style={{
                background: 'radial-gradient(circle, rgba(153,104,123,1) 0%, rgba(89,100,117,1) 100%)'
            }}
        >
            <div className="container">

                {/* BRAND */}
                <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
                    <i className="bi bi-qr-code-scan me-2"></i>
                    QR Finder
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">

                    {/* LEFT NAV */}
                    <ul className="navbar-nav me-3 align-items-lg-center">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <i className="bi bi-house me-1"></i> Home
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/about">
                                <i className="bi bi-info-circle me-1"></i> About
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">
                                <i className="bi bi-envelope me-1"></i> Contact
                            </Link>
                        </li>

                        {user?.role === 'agent' && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard">
                                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                </Link>
                            </li>
                        )}

                        {user?.role === 'admin' && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">
                                        <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin">
                                        <i className="bi bi-shield-lock me-1"></i> Admin Panel
                                    </Link>
                                </li>
                            </>
                        )}

                        {user?.role === 'user' && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">
                                        <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/my-items">
                                        <i className="bi bi-grid me-1"></i> My Items
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/my-card">
                                        <i className="bi bi-person-vcard me-1"></i> My Card
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    {/* Search bar */}
                    <form
                        className="d-none d-lg-flex mx-auto"
                        style={{ maxWidth: 260 }}
                        onSubmit={handleSearch}
                    >
                        <div className="input-group input-group-sm">
                            <input
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-outline-light">
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </form>

                    {/* RIGHT SIDE */}
                    <div className="d-flex align-items-center gap-3 ms-lg-3">

                        {/* NOTIFICATIONS */}
                        {user && (
                            <button className="btn btn-sm btn-outline-light position-relative">
                                <i className="bi bi-bell"></i>
                                {unreadCount > 0 && (
                                    <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* USER */}
                        {user ? (
                            <div className="dropdown">
                                <button
                                    className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center"
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="bi bi-person-circle me-2"></i>
                                    <span className="d-none d-md-inline">{user.name}</span>
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end text-center shadow dropdown-fit">
                                    <li>
                                        <button className="dropdown-item text-danger px-2" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right me-1"></i>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link to="/login" className="btn btn-sm btn-outline-light">
                                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                                </Link>
                                <Link to="/register" className="btn btn-sm btn-light">
                                    <i className="bi bi-person-plus me-1"></i> Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;