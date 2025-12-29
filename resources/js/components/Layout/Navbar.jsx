// resources/js/components/Layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
    const { user, login, register, logout, loading } = useAuth();
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
            const response = await axios.get('/api/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            setNotifications(notifications.map(notif => 
                notif.id === notificationId ? { ...notif, is_read: true } : notif
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/api/notifications/read-all');
            setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
            setUnreadCount(0);
            setShowNotifications(false);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return 'bi-check-circle-fill text-success';
            case 'warning': return 'bi-exclamation-triangle-fill text-warning';
            case 'error': return 'bi-x-circle-fill text-danger';
            default: return 'bi-info-circle-fill text-info';
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style={{
    background: "radial-gradient(circle, rgba(153,104,123,1) 0%, rgba(89,100,117,1) 100%)"
}}
>
            <div className="container">
                {/* Brand */}
                <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
                    <i className="bi bi-qr-code-scan me-2"></i>
                    QR Finder
                </Link>

                {/* Mobile Toggle */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarContent"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navbar Content */}
                <div className="collapse navbar-collapse" id="navbarContent">
                    {/* Left Navigation */}
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <i className="bi bi-house me-1"></i>
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">
                                <i className="bi bi-info-circle me-1"></i>
                                About
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">
                                <i className="bi bi-envelope me-1"></i>
                                Contact
                            </Link>
                        </li>
                        
                        {/* Agent Links */}
                        {user && user.role === 'agent' && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">
                                        <i className="bi bi-speedometer2 me-1"></i>
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/issue-qr">
                                        <i className="bi bi-qr-code me-1"></i>
                                        Issue QR
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* Admin Links */}
                        {user && user.role === 'admin' && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin">
                                        <i className="bi bi-shield-lock me-1"></i>
                                        Admin Panel
                                    </Link>
                                </li>
                            </>                            
                        )}

                        {/* User Links */}
                        {user && user.role === 'user' && (
                            <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard">
                                    <i className="bi bi-speedometer2 me-1"></i>
                                    Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/my-items">
                                    <i className="bi bi-grid me-1"></i>
                                    My Items
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/my-card">
                                    <i className="bi bi-person-vcard me-1"></i>
                                    My Card
                                </Link>
                            </li>
                            </>                            
                        )}
                    </ul>

                    {/* Right Navigation */}
                    <div className="d-flex align-items-center">
                        {/* Search Bar */}
                        {user && (
                            <form className="d-none d-md-flex me-3" onSubmit={handleSearch}>
                                <div className="input-group input-group-md">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Search..." 
                                        value={searchTerm} id="searchContent"
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ width: '150px' }}
                                    />
                                    <button className="btn btn-outline-light" type="submit">
                                        <i className="bi bi-search"></i>
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Notifications */}
                        {user && (
                            <div className="dropdown me-3">
                                <button 
                                    className="btn btn-outline-light position-relative"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    type="button"
                                >
                                    <i className="bi bi-bell"></i>
                                    {unreadCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                
                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="dropdown-menu show" style={{ 
                                        width: '350px', 
                                        maxHeight: '400px', 
                                        overflowY: 'auto',
                                        right: 0, 
                                        left: 'auto' 
                                    }}>
                                        <div className="dropdown-header d-flex justify-content-between align-items-center">
                                            <span>
                                                Notifications
                                                {unreadCount > 0 && (
                                                    <span className="badge bg-primary ms-2">{unreadCount} new</span>
                                                )}
                                            </span>
                                            {unreadCount > 0 && (
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        
                                        {notifications.length === 0 ? (
                                            <div className="px-3 py-4 text-center text-muted">
                                                <i className="bi bi-bell-slash display-6"></i>
                                                <p className="mt-2 mb-0">No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 10).map(notification => (
                                                <div 
                                                    key={notification.id} 
                                                    className={`dropdown-item d-flex align-items-start p-3 ${!notification.is_read ? 'bg-light' : ''}`}
                                                    onClick={() => markAsRead(notification.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className={`bi ${getNotificationIcon(notification.type)} me-2 mt-1`}></i>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <h6 className="mb-1">{notification.title}</h6>
                                                            <small className="text-muted">
                                                                {new Date(notification.created_at).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                        <p className="mb-1 small">{notification.message}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        
                                        {notifications.length > 0 && (
                                            <>
                                                <div className="dropdown-divider"></div>
                                                <Link 
                                                    to="/notifications" 
                                                    className="dropdown-item text-center text-primary"
                                                    onClick={() => setShowNotifications(false)}
                                                >
                                                    View All Notifications
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Menu */}
                        {user ? (
                            <div className="dropdown">
                                <button 
                                    className="btn btn-light dropdown-toggle d-flex align-items-center" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="bi bi-person-circle me-2"></i>
                                    <span className="d-none d-sm-inline">{user.name}</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <Link 
                                            className="dropdown-item" 
                                            to="/profile"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            <i className="bi bi-person me-2"></i>
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            className="dropdown-item" 
                                            to="/my-items"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            <i className="bi bi-grid me-2"></i>
                                            My Items
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button 
                                            className="dropdown-item text-danger" 
                                            onClick={handleLogout}
                                        >
                                            <i className="bi bi-box-arrow-right me-2"></i>
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link to="/login" className="btn btn-outline-light">
                                    <i className="bi bi-box-arrow-in-right me-1"></i>
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-light">
                                    <i className="bi bi-person-plus me-1"></i>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Close notifications when clicking outside */}
            {showNotifications && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100"
                    onClick={() => setShowNotifications(false)}
                    style={{ zIndex: 1040 }}
                ></div>
            )}
        </nav>
    );
};

export default Navbar;