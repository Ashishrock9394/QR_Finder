// resources/js/components/Agent/IssueQR.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../Layout/Loader';

const IssueQR = () => {
    const [formData, setFormData] = useState({
        qr_code: '',
        item_name: '',
        item_description: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleScan = () => {
        // Simulate QR code scanning
        const simulatedQR = `QR${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        setFormData(prev => ({
            ...prev,
            qr_code: simulatedQR
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            await axios.post('/api/qr-codes', formData);
            setSuccess(true);
            setFormData({
                qr_code: '',
                item_name: '',
                item_description: '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                address: ''
            });
            
            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error issuing QR code:', error);
            alert('Error issuing QR code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 mb-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="fw-bold mb-4">
                        <i className="bi bi-qr-code me-2"></i>
                        Issue QR Code
                    </h2>
                </div>
            </div>

            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    QR Code issued successfully!
                    <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
                </div>
            )}

            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">QR Code Information</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">QR Code *</label>
                                            <div className="input-group">
                                                <input 
                                                    type="text" 
                                                    className="form-control"
                                                    name="qr_code"
                                                    value={formData.qr_code}
                                                    onChange={handleChange}
                                                    required 
                                                    readOnly
                                                />
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-primary"
                                                    onClick={handleScan}
                                                >
                                                    <i className="bi bi-qr-code-scan me-1"></i>
                                                    Scan QR
                                                </button>
                                            </div>
                                            <div className="form-text">
                                                Scan the physical QR code to automatically populate this field
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Item Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                name="item_name"
                                                value={formData.item_name}
                                                onChange={handleChange}
                                                required 
                                                placeholder="e.g., Laptop, Wallet, Keys"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Item Description</label>
                                    <textarea 
                                        className="form-control"
                                        name="item_description"
                                        value={formData.item_description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Describe the item in detail..."
                                    ></textarea>
                                </div>

                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Contact Name *</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                name="contact_name"
                                                value={formData.contact_name}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Contact Email *</label>
                                            <input 
                                                type="email" 
                                                className="form-control"
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Contact Phone *</label>
                                            <input 
                                                type="tel" 
                                                className="form-control"
                                                name="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Address</label>
                                    <textarea 
                                        className="form-control"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Full address for item return..."
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-lg"
                                    disabled={loading || !formData.qr_code}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Issuing QR Code...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Issue QR Code
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                Instructions
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex align-items-start mb-3">
                                <div className="bg-primary text-white rounded-circle p-2 me-3">1</div>
                                <div>
                                    <h6>Scan QR Code</h6>
                                    <p className="text-muted small mb-0">Use the scan button to read the physical QR code</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-start mb-3">
                                <div className="bg-primary text-white rounded-circle p-2 me-3">2</div>
                                <div>
                                    <h6>Fill Item Details</h6>
                                    <p className="text-muted small mb-0">Provide accurate information about the item</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-start mb-3">
                                <div className="bg-primary text-white rounded-circle p-2 me-3">3</div>
                                <div>
                                    <h6>Contact Information</h6>
                                    <p className="text-muted small mb-0">Enter the owner's contact details</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-start">
                                <div className="bg-primary text-white rounded-circle p-2 me-3">4</div>
                                <div>
                                    <h6>Submit</h6>
                                    <p className="text-muted small mb-0">Click issue to register the QR code</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueQR;