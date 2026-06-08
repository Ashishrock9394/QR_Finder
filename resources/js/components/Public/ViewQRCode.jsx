import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Loader from '../Layout/Loader';

const ViewQRCode = () => {
    const { id } = useParams();
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQRData();
    }, [id]);

    const fetchQRData = async () => {
        try {
            const response = await axios.get(`/api/qr-codes/public/view/${id}`);
            setQrData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Item not found');
            console.error('Error fetching QR data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'success',
            inactive: 'secondary',
            found: 'warning'
        };
        return colors[status] || 'secondary';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card text-center py-5">
                            <div className="card-body">
                                <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
                                <h5 className="card-title mt-3">Item Not Found</h5>
                                <p className="card-text text-muted">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!qrData) {
        return <Loader />;
    }

    return (
        <div className="container mt-4 mb-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {/* Status Banner */}
                    <div className={`alert alert-${getStatusColor(qrData.status)} alert-dismissible fade show`} role="alert">
                        <i className={`bi ${qrData.status === 'found' ? 'bi-check-circle' : 'bi-info-circle'} me-2`}></i>
                        <strong>Status: </strong>
                        <span className="text-capitalize">{qrData.status}</span>
                        {qrData.status === 'active' && ' - This item is actively registered'}
                        {qrData.status === 'inactive' && ' - This item is no longer active'}
                        {qrData.status === 'found' && ' - This item has been found!'}
                    </div>

                    {/* Item Information Card */}
                    <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-box-seam me-2"></i>
                                Item Information
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h5>{qrData.item_name}</h5>
                                    {qrData.item_image_path && (
                                        <div className="mb-3">
                                            <img
                                                src={`/storage/${qrData.item_image_path}`}
                                                alt={qrData.item_name}
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '250px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    {qrData.item_description && (
                                        <div className="mb-3">
                                            <h6 className="text-muted">Description</h6>
                                            <p>{qrData.item_description}</p>
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <h6 className="text-muted">QR Code</h6>
                                        <code className="bg-light p-2 rounded">{qrData.qr_code}</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Information Card */}
                    <div className="card mb-4">
                        <div className="card-header bg-success text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-person-circle me-2"></i>
                                Owner Information
                            </h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 text-center">
                                    {qrData.user_image_path ? (
                                        <img
                                            src={`/storage/${qrData.user_image_path}`}
                                            alt={qrData.contact_name}
                                            className="rounded-circle mb-3"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover', border: '3px solid #198754' }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle mb-3 d-flex align-items-center justify-content-center"
                                            style={{ width: '150px', height: '150px', backgroundColor: '#e9ecef', border: '3px solid #198754' }}
                                        >
                                            <i className="bi bi-person" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-8">
                                    <h5>{qrData.contact_name}</h5>
                                    <div className="mb-3">
                                        <h6 className="text-muted">Email</h6>
                                        <a href={`mailto:${qrData.contact_email}`} className="text-decoration-none">
                                            <i className="bi bi-envelope me-2"></i>
                                            {qrData.contact_email}
                                        </a>
                                    </div>
                                    <div className="mb-3">
                                        <h6 className="text-muted">Phone</h6>
                                        <a href={`tel:${qrData.contact_phone}`} className="text-decoration-none">
                                            <i className="bi bi-telephone me-2"></i>
                                            {qrData.contact_phone}
                                        </a>
                                    </div>
                                    {qrData.address && (
                                        <div className="mb-3">
                                            <h6 className="text-muted">Address</h6>
                                            <p>
                                                <i className="bi bi-geo-alt me-2"></i>
                                                {qrData.address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Details Card */}
                    <div className="card mb-4">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-clock-history me-2"></i>
                                Registration Details
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-muted">Registered By Agent</h6>
                                    <p className="mb-3">{qrData.agent?.name || 'Unknown Agent'}</p>

                                    <h6 className="text-muted">Registration Date</h6>
                                    <p className="mb-3">
                                        <i className="bi bi-calendar me-2"></i>
                                        {formatDate(qrData.created_at)}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="text-muted">Item Registration Timestamp</h6>
                                    <p className="mb-3">
                                        <i className="bi bi-calendar-check me-2"></i>
                                        {qrData.registration_timestamp ? formatDate(qrData.registration_timestamp) : 'Not set'}
                                    </p>

                                    <h6 className="text-muted">Current Status</h6>
                                    <p>
                                        <span className={`badge bg-${getStatusColor(qrData.status)} text-capitalize`}>
                                            {qrData.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="card bg-light border-0">
                        <div className="card-body">
                            <h5 className="card-title mb-3">
                                <i className="bi bi-hand-thumbs-up me-2"></i>
                                Found This Item?
                            </h5>
                            <p className="text-muted mb-3">
                                If you found this item, please contact the owner immediately using the email or phone number above.
                            </p>
                            <div className="d-flex gap-2">
                                <a
                                    href={`mailto:${qrData.contact_email}?subject=I found your ${qrData.item_name}`}
                                    className="btn btn-success"
                                >
                                    <i className="bi bi-envelope me-2"></i>
                                    Send Email
                                </a>
                                <a
                                    href={`tel:${qrData.contact_phone}`}
                                    className="btn btn-primary"
                                >
                                    <i className="bi bi-telephone me-2"></i>
                                    Call Now
                                </a>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => window.print()}
                                >
                                    <i className="bi bi-printer me-2"></i>
                                    Print Details
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="alert alert-warning mt-4" role="alert">
                        <i className="bi bi-shield-exclamation me-2"></i>
                        <strong>Privacy & Security Note:</strong> This page displays the owner's information and photo that were provided during item registration. This information is shared to help return lost items. Please use it responsibly.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewQRCode;
