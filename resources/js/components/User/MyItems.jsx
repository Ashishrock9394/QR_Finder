import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../Layout/Loader';

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyItems();
    }, []);

    const fetchMyItems = async () => {
        try {
            const response = await axios.get('/api/qr-codes');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { class: 'bg-success', text: 'Active' },
            found: { class: 'bg-warning', text: 'Found' },
            inactive: { class: 'bg-secondary', text: 'Inactive' }
        };
        
        const config = statusConfig[status] || statusConfig.inactive;
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading){
        return <Loader />
    }

    return (
        <div className="container mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold">
                                <i className="bi bi-grid me-2"></i>
                                My Registered Items
                            </h2>
                            <p className="text-muted">Manage your QR-protected items</p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/register-item')}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Register New Item
                        </button>
                    </div>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="card text-center py-5">
                    <div className="card-body">
                        <i className="bi bi-qr-code display-1 text-muted"></i>
                        <h5 className="card-title mt-3">No Items Registered</h5>
                        <p className="card-text text-muted">
                            You haven't registered any items with QR codes yet.
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/register-item')}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Register Your First Item
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {items.map(item => (
                        <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                {item.item_image_path && (
                                    <div style={{ height: '200px', overflow: 'hidden', background: '#f8f9fa' }}>
                                        <img 
                                            src={`/storage/${item.item_image_path}`} 
                                            alt={item.item_name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="card-title" style={{ flex: 1 }}>{item.item_name}</h5>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    
                                    {item.item_description && (
                                        <p className="card-text text-muted small mb-3">
                                            {item.item_description.length > 80 ? item.item_description.substring(0, 80) + '...' : item.item_description}
                                        </p>
                                    )}
                                    
                                    <div className="mb-2">
                                        <small className="text-muted">QR Code:</small>
                                        <br />
                                        <code className="text-primary small">{item.qr_code}</code>
                                    </div>
                                    
                                    <div className="mb-2">
                                        <small className="text-muted">Registered:</small>
                                        <br />
                                        <small>{formatDate(item.created_at)}</small>
                                    </div>

                                    {item.user_image_path && (
                                        <div className="mb-2">
                                            <small className="text-muted">Profile Photo:</small>
                                            <br />
                                            <img 
                                                src={`/storage/${item.user_image_path}`}
                                                alt="User"
                                                className="rounded-circle"
                                                style={{ width: '30px', height: '30px', objectFit: 'cover', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-transparent">
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-outline-primary btn-sm flex-grow-1"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            View Details
                                        </button>
                                        <a 
                                            href={`/qr-view/${item.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-success btn-sm"
                                            title="View public page"
                                        >
                                            <i className="bi bi-share"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Item Details</h5>
                                <button 
                                    type="button" 
                                    className="btn-close"
                                    onClick={() => setSelectedItem(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedItem.item_image_path && (
                                    <div className="mb-3">
                                        <img 
                                            src={`/storage/${selectedItem.item_image_path}`}
                                            alt={selectedItem.item_name}
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-primary">Item Information</h6>
                                        <p><strong>Name:</strong> {selectedItem.item_name}</p>
                                        <p><strong>Description:</strong> {selectedItem.item_description || 'N/A'}</p>
                                        <p><strong>QR Code:</strong> <code>{selectedItem.qr_code}</code></p>
                                        <p><strong>Status:</strong> {getStatusBadge(selectedItem.status)}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-success">Owner Information</h6>
                                        <p><strong>Name:</strong> {selectedItem.contact_name}</p>
                                        <p><strong>Email:</strong> <a href={`mailto:${selectedItem.contact_email}`}>{selectedItem.contact_email}</a></p>
                                        <p><strong>Phone:</strong> <a href={`tel:${selectedItem.contact_phone}`}>{selectedItem.contact_phone}</a></p>
                                        {selectedItem.address && (
                                            <p><strong>Address:</strong> {selectedItem.address}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <h6 className="text-info">Registration Details</h6>
                                        <p><strong>Agent:</strong> {selectedItem.agent?.name || 'Unknown'}</p>
                                        <p><strong>Registration Date:</strong> {new Date(selectedItem.created_at).toLocaleString()}</p>
                                        {selectedItem.registration_timestamp && (
                                            <p><strong>Item Registration Timestamp:</strong> {new Date(selectedItem.registration_timestamp).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    Close
                                </button>
                                <a 
                                    href={`/qr-view/${selectedItem.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    <i className="bi bi-link-45deg me-2"></i>
                                    View Public Page
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyItems;