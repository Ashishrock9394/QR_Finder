// resources/js/components/User/MyItems.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../Layout/Loader';

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

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

    if (loading){
        return <Loader />
    }

    return (
        <div className="container mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold">
                        <i className="bi bi-grid me-2"></i>
                        My Registered Items
                    </h2>
                    <p className="text-muted">Manage your QR-protected items</p>
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
                        <button className="btn btn-primary">
                            <i className="bi bi-plus-circle me-2"></i>
                            Register Your First Item
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row">
                    {items.map(item => (
                        <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="card-title">{item.item_name}</h5>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    
                                    {item.item_description && (
                                        <p className="card-text text-muted small mb-3">
                                            {item.item_description}
                                        </p>
                                    )}
                                    
                                    <div className="mb-3">
                                        <small className="text-muted">QR Code:</small>
                                        <br />
                                        <code className="text-primary">{item.qr_code}</code>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <small className="text-muted">Registered by Agent:</small>
                                        <br />
                                        <strong>{item.agent?.name || 'Unknown Agent'}</strong>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <small className="text-muted">Registration Date:</small>
                                        <br />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="card-footer bg-transparent">
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => setSelectedItem(item)}
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            View
                                        </button>
                                        <button className="btn btn-outline-warning btn-sm">
                                            <i className="bi bi-pencil me-1"></i>
                                            Edit
                                        </button>
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
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6>Item Information</h6>
                                        <p><strong>Name:</strong> {selectedItem.item_name}</p>
                                        <p><strong>Description:</strong> {selectedItem.item_description || 'N/A'}</p>
                                        <p><strong>QR Code:</strong> <code>{selectedItem.qr_code}</code></p>
                                        <p><strong>Status:</strong> {getStatusBadge(selectedItem.status)}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6>Contact Information</h6>
                                        <p><strong>Name:</strong> {selectedItem.contact_name}</p>
                                        <p><strong>Email:</strong> {selectedItem.contact_email}</p>
                                        <p><strong>Phone:</strong> {selectedItem.contact_phone}</p>
                                        {selectedItem.address && (
                                            <p><strong>Address:</strong> {selectedItem.address}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-12">
                                        <h6>Agent Information</h6>
                                        <p><strong>Agent:</strong> {selectedItem.agent?.name || 'Unknown'}</p>
                                        <p><strong>Registration Date:</strong> {new Date(selectedItem.created_at).toLocaleString()}</p>
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
                                <button type="button" className="btn btn-primary">
                                    <i className="bi bi-printer me-2"></i>
                                    Print Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyItems;