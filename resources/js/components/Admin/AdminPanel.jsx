// resources/js/components/Admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Loader from '../Layout/Loader';
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

const AdminPanel = () => {
    const [stats, setStats] = useState({});
    const [agents, setAgents] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [qrCodeCount, setQrCodeCount] = useState(10);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const generateQRCodePDF = async () => {
        const doc = new jsPDF("p", "mm", "a4");

        const qrsPerPage = 30;
        const cols = 5;
        const rows = 6;
        // const url = "https://github.com/Ashishrock9394";

        for (let i = 0; i < qrCodeCount; i++) {
            const qrId = `QR${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
            const qrBase64 = await QRCode.toDataURL(qrId, { width: 100 });
            // const qrBase64 = await QRCode.toDataURL(url, { width: 100 });

            const indexOnPage = i % qrsPerPage;

            const col = indexOnPage % cols;
            const row = Math.floor(indexOnPage / cols);

            const xPos = 10 + col * 40;
            const yPos = 10 + row * 40;
            if (indexOnPage === 0 && i !== 0) {
                doc.addPage();
            }
            doc.addImage(qrBase64, "PNG", xPos, yPos, 30, 30);
        }

        doc.save("qr_codes.pdf");
    };


    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [statsResponse, agentsResponse, usersResponse] = await Promise.all([
                axios.get('/api/admin/dashboard/stats'),
                axios.get('/api/admin/agents'),
                axios.get('/api/admin/users')
            ]);
            
            setStats(statsResponse.data);
            setAgents(agentsResponse.data || []);
            setUsers(usersResponse.data || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';

        const result = await Swal.fire({
            title: `Change status of ${user.name}?`,
            text: `User will be ${newStatus}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await axios.patch(`/api/admin/user/${user.id}/status`, { status: newStatus });
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `${user.name} is now ${newStatus}`
                });
                fetchAdminData();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Unable to update status'
                });
            }
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="container mt-4 mb-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold">
                        <i className="bi bi-shield-lock me-2"></i>
                        Admin Panel
                    </h2>
                    <p className="text-muted">Manage your QR Finder platform</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="row mb-4">
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-secondary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Total QR Codes</h6>
                                    <h3>{stats.total_qr_codes || 0}</h3>
                                </div>
                                <i className="bi bi-qr-code display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Total Visiting Cards</h6>
                                    <h3>{stats.total_v_cards || 0}</h3>
                                </div>
                                <i className="bi bi-person-vcard display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registered Agents */}
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-dark text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Registered Agents</h6>
                                    <h3>{stats.total_agents || 0}</h3>
                                </div>
                                <i className="bi bi-person-badge display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Agents */}
                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Active Agents</h6>
                                    <h3>{stats.active_agents || 0}</h3>
                                </div>
                                <i className="bi bi-person-check display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Registered Users</h6>
                                    <h3>{stats.total_users || 0}</h3>
                                </div>
                                <i className="bi bi-person display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card bg-danger text-white h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Recovery Rate</h6>
                                    <h3>{stats.recovery_rate || 0}%</h3>
                                </div>
                                <i className="bi bi-graph-up display-6 opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tabs */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <ul className="nav nav-tabs card-header-tabs">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        <i className="bi bi-speedometer2 me-2"></i>
                                        Overview
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'agents' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('agents')}
                                    >
                                        <i className="bi bi-people me-2"></i>
                                        Agents
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('users')}
                                    >
                                        <i className="bi bi-person me-2"></i>
                                        Users
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('settings')}
                                    >
                                        <i className="bi bi-gear me-2"></i>
                                        Settings
                                    </button>
                                </li>

                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'qr-generator' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('qr-generator')}
                                    >
                                        <i className="bi bi-qr-code me-2"></i>
                                        QR Generator
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="card-body">

                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div>
                                    <h5>Platform Overview</h5>
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Metric</th>
                                                            <th>Value</th>
                                                            <th>Trend</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>Total QR Codes Issued</td>
                                                            <td>{stats.total_qr_codes || 0}</td>
                                                            <td>
                                                                <span className="badge bg-success">
                                                                    <i className="bi bi-arrow-up"></i> 12%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Items Recovered</td>
                                                            <td>{stats.found_items || 0}</td>
                                                            <td>
                                                                <span className="badge bg-success">
                                                                    <i className="bi bi-arrow-up"></i> 8%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Active Agents</td>
                                                            <td>{stats.total_agents || 0}</td>
                                                            <td>
                                                                <span className="badge bg-success">
                                                                    <i className="bi bi-arrow-up"></i> 5%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>Registered Users</td>
                                                            <td>{stats.total_users || 0}</td>
                                                            <td>
                                                                <span className="badge bg-success">
                                                                    <i className="bi bi-arrow-up"></i> 15%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light">
                                                <div className="card-body">
                                                    <h6>Quick Actions</h6>
                                                    <div className="d-grid gap-2">
                                                        <button className="btn btn-outline-primary btn-sm">
                                                            <i className="bi bi-person-plus me-2"></i>
                                                            Add New Agent
                                                        </button>
                                                        <button className="btn btn-outline-success btn-sm">
                                                            <i className="bi bi-graph-up me-2"></i>
                                                            Generate Report
                                                        </button>
                                                        <button className="btn btn-outline-info btn-sm">
                                                            <i className="bi bi-gear me-2"></i>
                                                            System Settings
                                                        </button>
                                                        <button className="btn btn-outline-warning btn-sm">
                                                            <i className="bi bi-bell me-2"></i>
                                                            Send Notification
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Agents Tab */}
                            {activeTab === 'agents' && (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5>Agent Management</h5>
                                        <button className="btn btn-primary btn-sm">
                                            <i className="bi bi-person-plus me-2"></i>
                                            Add Agent
                                        </button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>QR Codes Issued</th>
                                                    <th>Items Found</th>
                                                    <th>Success Rate</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {agents.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <i className="bi bi-people display-1 text-muted"></i>
                                                            <p className="text-muted mt-3">No agents found</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    agents.map(agent => (
                                                        <tr key={agent.id}>
                                                            <td>{agent.name}</td>
                                                            <td>{agent.email}</td>
                                                            <td>{agent.qr_issued || 0}</td>
                                                            <td>{agent.items_found || 0}</td>
                                                            <td>
                                                                <span className={`badge ${(agent.success_rate || 0) > 50 ? 'bg-success' : 'bg-warning'}`}>
                                                                    {agent.success_rate || 0}%
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${agent.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {agent.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className={`btn btn-sm ${agent.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                                                    onClick={() => toggleStatus(agent)}
                                                                >
                                                                    {agent.status === 'active' ? 'Active' : 'Inactive'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <h5>User Management</h5>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th>Registered Items</th>
                                                    <th>Joined Date</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-4">
                                                            <i className="bi bi-person display-1 text-muted"></i>
                                                            <p className="text-muted mt-3">No users found</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    users.map(user => (
                                                        <tr key={user.id}>
                                                            <td>{user.name}</td>
                                                            <td>{user.email}</td>
                                                            <td>
                                                                <span className={`badge ${
                                                                    user.role === 'admin' ? 'bg-danger' :
                                                                    user.role === 'agent' ? 'bg-primary' : 'bg-secondary'
                                                                }`}>
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td>{user.registered_items || 0}</td>
                                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                            <td>
                                                                <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {user.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className={`btn btn-sm ${user.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
                                                                    onClick={() => toggleStatus(user)}
                                                                >
                                                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && (
                                <div>
                                    <h5>System Settings</h5>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card mb-4">
                                                <div className="card-header">
                                                    <h6 className="mb-0">General Settings</h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="mb-3">
                                                        <label className="form-label">Platform Name</label>
                                                        <input type="text" className="form-control" defaultValue="QR Finder" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Support Email</label>
                                                        <input type="email" className="form-control" defaultValue="support@qrfinder.com" />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label className="form-label">Support Phone</label>
                                                        <input type="tel" className="form-control" defaultValue="+91-9198552556" />
                                                    </div>
                                                    <button className="btn btn-primary">Save Changes</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card">
                                                <div className="card-header">
                                                    <h6 className="mb-0">Notification Settings</h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="form-check form-switch mb-3">
                                                        <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                                                        <label className="form-check-label" htmlFor="emailNotifications">
                                                            Email Notifications
                                                        </label>
                                                    </div>
                                                    <div className="form-check form-switch mb-3">
                                                        <input className="form-check-input" type="checkbox" id="smsNotifications" />
                                                        <label className="form-check-label" htmlFor="smsNotifications">
                                                            SMS Notifications
                                                        </label>
                                                    </div>
                                                    <div className="form-check form-switch mb-3">
                                                        <input className="form-check-input" type="checkbox" id="pushNotifications" defaultChecked />
                                                        <label className="form-check-label" htmlFor="pushNotifications">
                                                            Push Notifications
                                                        </label>
                                                    </div>
                                                    <button className="btn btn-primary">Update Notifications</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* QR Code Generator Tab */}
                            {activeTab === 'qr-generator' && (
                                <div>
                                    <h5>Generate QR Codes</h5>
                                    <div className="mb-3">
                                        <label className="form-label">Number of QR Codes</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={qrCodeCount} 
                                            onChange={(e) => setQrCodeCount(e.target.value)} 
                                            min="1" 
                                            max="1000" 
                                        />
                                    </div>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={generateQRCodePDF}
                                    >
                                        Generate QR Codes
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
