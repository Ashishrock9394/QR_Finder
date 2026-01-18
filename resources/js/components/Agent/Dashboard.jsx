// resources/js/components/Agent/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../Layout/Loader';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

const Dashboard = () => {
    const [stats, setStats] = useState({});
    const [recentQRCodes, setRecentQRCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Use the useAuth hook here

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, qrCodesResponse] = await Promise.all([
                axios.get('/api/dashboard/stats'),
                axios.get('/api/qr-codes')
            ]);
            
            setStats(statsResponse.data);
            setRecentQRCodes(qrCodesResponse.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    const statCards = user?.role === 'admin' ? [
        { title: 'Total QR Codes', value: stats.total_qr_codes, color: 'secondary', icon: 'bi-qr-code' },
        { title: 'Total Visiting Codes', value: stats.total_v_cards, color: 'primary', icon: 'bi-person-vcard' },
        { title: 'Registered Agents', value: stats.total_agents, color: 'dark', icon: 'bi-person-badge' },
        { title: 'Active Agents', value: stats.total_agents, color: 'success', icon: 'bi-person-check' },
        { title: 'Registered Users', value: stats.total_users, color: 'info', icon: 'bi-person' },
        { title: 'Active Items', value: stats.active_items, color: 'success', icon: 'bi-check-circle' },
        { title: 'Found Items', value: stats.found_items, color: 'warning', icon: 'bi-search' },
        { title: 'Happy Customers', value: stats.happy_customers, color: 'primary', icon: 'bi-emoji-smile' },
        { title: 'Recovery Rate', value: `${stats.recovery_rate}%`, color: 'danger', icon: 'bi-graph-up' }
    ] : user?.role === 'agent' ? [
        { title: 'QR Codes Issued', value: stats.total_qr_codes, color: 'secondary', icon: 'bi-qr-code' },
        { title: 'Active Items', value: stats.active_items, color: 'success', icon: 'bi-check-circle' },
        { title: 'Found Items', value: stats.found_items, color: 'warning', icon: 'bi-search' },
        { title: 'Happy Customers', value: stats.happy_customers, color: 'primary', icon: 'bi-emoji-smile' }
    ] : [
        { title: 'My Items', value: stats.my_items, color: 'secondary', icon: 'bi-grid' },
        { title: 'Active Items', value: stats.active_items, color: 'success', icon: 'bi-check-circle' },
        { title: 'Found Items', value: stats.found_items, color: 'warning', icon: 'bi-search' },
        { title: 'Happy Customers', value: stats.happy_customers, color: 'primary', icon: 'bi-emoji-smile' }
    ];


    return (
        <div className="container mt-4 mb-3">
            <div className="row mb-3">
                <div className="col-12">
                    <h2 className="fw-bold">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Dashboard
                    </h2>
                    <p className="text-muted">
                        Welcome back, {user?.name}! Here's your overview.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="col-md-6 col-lg-3 mb-4">
                        <div className={`card bg-${stat.color} text-white`}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title">{stat.title}</h5>
                                        <h2 className="card-text mb-0">{stat.value || 0}</h2>
                                    </div>
                                    <i className={`bi ${stat.icon}`} style={{ fontSize: '2.5rem', opacity: 0.7 }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            {user?.role !== 'user' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-clock-history me-2"></i>
                                    Recent QR Codes
                                </h5>
                            </div>
                            <div className="card-body">
                                {recentQRCodes.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="bi bi-qr-code display-1 text-muted"></i>
                                        <p className="text-muted mt-3">No QR codes issued yet</p>
                                        {user?.role === 'agent' && (
                                            <a href="/issue-qr" className="btn btn-primary">Issue Your First QR Code</a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>QR Code</th>
                                                    <th>Item Name</th>
                                                    <th>Contact</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentQRCodes.map(qr => (
                                                    <tr key={qr.id}>
                                                        <td>
                                                            <code>{qr.qr_code}</code>
                                                        </td>
                                                        <td>{qr.item_name}</td>
                                                        <td>{qr.contact_email}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                qr.status === 'active' ? 'bg-success' :
                                                                qr.status === 'found' ? 'bg-warning' : 'bg-secondary'
                                                            }`}>
                                                                {qr.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {new Date(qr.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Dashboard;