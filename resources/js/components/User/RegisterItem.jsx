import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../Layout/Loader';

const RegisterItem = () => {
    const [formData, setFormData] = useState({
        qr_code: '',
        item_name: '',
        item_description: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        user_image: null,
        item_image: null,
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [userImagePreview, setUserImagePreview] = useState(null);
    const [itemImagePreview, setItemImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData({
                ...formData,
                [name]: files[0]
            });

            const reader = new FileReader();
            reader.onload = (event) => {
                if (name === 'user_image') {
                    setUserImagePreview(event.target.result);
                } else if (name === 'item_image') {
                    setItemImagePreview(event.target.result);
                }
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleScan = () => {
        const simulatedQR = `QR${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        setFormData(prev => ({
            ...prev,
            qr_code: simulatedQR
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('qr_code', formData.qr_code);
            formDataToSend.append('item_name', formData.item_name);
            formDataToSend.append('item_description', formData.item_description);
            formDataToSend.append('contact_name', formData.contact_name);
            formDataToSend.append('contact_email', formData.contact_email);
            formDataToSend.append('contact_phone', formData.contact_phone);
            formDataToSend.append('address', formData.address);

            if (formData.user_image) {
                formDataToSend.append('user_image', formData.user_image);
            }
            if (formData.item_image) {
                formDataToSend.append('item_image', formData.item_image);
            }

            await axios.post('/api/qr-codes', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setSuccess(true);
            setFormData({
                qr_code: '',
                item_name: '',
                item_description: '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
                address: '',
                user_image: null,
                item_image: null,
            });
            setUserImagePreview(null);
            setItemImagePreview(null);

            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error registering item:', error);
                alert('Error registering item. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 mb-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="fw-bold mb-4">
                        <i className="bi bi-box-seam me-2"></i>
                        Register Your Item
                    </h2>
                    <p className="text-muted mb-4">Fill in your item details with your contact information. Your photo will be saved for security.</p>
                </div>
            </div>

            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Item registered successfully! Your QR code is ready.
                    <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="card-title mb-0">QR Code & Item Details</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">QR Code *</label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.qr_code ? 'is-invalid' : ''}`}
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
                                                    Scan
                                                </button>
                                            </div>
                                            {errors.qr_code && <div className="invalid-feedback d-block">{errors.qr_code[0]}</div>}
                                            <div className="form-text">
                                                Scan the physical QR code or click Scan button
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Item Name *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.item_name ? 'is-invalid' : ''}`}
                                                name="item_name"
                                                value={formData.item_name}
                                                onChange={handleChange}
                                                required
                                                placeholder="e.g., Laptop, Wallet, Keys"
                                            />
                                            {errors.item_name && <div className="invalid-feedback d-block">{errors.item_name[0]}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Item Description</label>
                                    <textarea
                                        className={`form-control ${errors.item_description ? 'is-invalid' : ''}`}
                                        name="item_description"
                                        value={formData.item_description}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Describe the item in detail (color, brand, special marks, etc.)..."
                                    ></textarea>
                                    {errors.item_description && <div className="invalid-feedback d-block">{errors.item_description[0]}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Item Photo (Optional)</label>
                                    <div className="input-group">
                                        <input
                                            type="file"
                                            className={`form-control ${errors.item_image ? 'is-invalid' : ''}`}
                                            name="item_image"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    {errors.item_image && <div className="invalid-feedback d-block">{errors.item_image[0]}</div>}
                                    {itemImagePreview && (
                                        <div className="mt-2">
                                            <img src={itemImagePreview} alt="Item preview" className="img-thumbnail" style={{ maxHeight: '150px', maxWidth: '150px' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Your Contact Information</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Full Name *</label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.contact_name ? 'is-invalid' : ''}`}
                                                name="contact_name"
                                                value={formData.contact_name}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.contact_name && <div className="invalid-feedback d-block">{errors.contact_name[0]}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Email Address *</label>
                                            <input
                                                type="email"
                                                className={`form-control ${errors.contact_email ? 'is-invalid' : ''}`}
                                                name="contact_email"
                                                value={formData.contact_email}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.contact_email && <div className="invalid-feedback d-block">{errors.contact_email[0]}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Phone Number *</label>
                                            <input
                                                type="tel"
                                                className={`form-control ${errors.contact_phone ? 'is-invalid' : ''}`}
                                                name="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.contact_phone && <div className="invalid-feedback d-block">{errors.contact_phone[0]}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Your Photo (Optional)</label>
                                            <input
                                                type="file"
                                                className={`form-control ${errors.user_image ? 'is-invalid' : ''}`}
                                                name="user_image"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                            />
                                            {errors.user_image && <div className="invalid-feedback d-block">{errors.user_image[0]}</div>}
                                            {userImagePreview && (
                                                <div className="mt-2">
                                                    <img src={userImagePreview} alt="User preview" className="img-thumbnail rounded-circle" style={{ maxHeight: '100px', maxWidth: '100px' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Full Address</label>
                                    <textarea
                                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Full address for item return..."
                                    ></textarea>
                                    {errors.address && <div className="invalid-feedback d-block">{errors.address[0]}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card position-sticky" style={{ top: '20px' }}>
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Security Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-info" role="alert">
                                    <h6 className="alert-heading">Why we save your photo?</h6>
                                    <small>Your photo and registration timestamp are saved for security purposes. When someone finds your item and scans the QR code, they'll see your information and photo to confirm they're returning it to the right person.</small>
                                </div>

                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3" style={{ minWidth: '32px', textAlign: 'center' }}>1</div>
                                    <div>
                                        <h6>Scan QR Code</h6>
                                        <p className="text-muted small mb-0">Scan the physical QR code on your item</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3" style={{ minWidth: '32px', textAlign: 'center' }}>2</div>
                                    <div>
                                        <h6>Fill Item Details</h6>
                                        <p className="text-muted small mb-0">Describe your item accurately</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3" style={{ minWidth: '32px', textAlign: 'center' }}>3</div>
                                    <div>
                                        <h6>Add Your Information</h6>
                                        <p className="text-muted small mb-0">Include your contact details</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3" style={{ minWidth: '32px', textAlign: 'center' }}>4</div>
                                    <div>
                                        <h6>Upload Photos (Optional)</h6>
                                        <p className="text-muted small mb-0">Add your photo and item photo for verification</p>
                                    </div>
                                </div>

                                <div className="d-flex align-items-start">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3" style={{ minWidth: '32px', textAlign: 'center' }}>5</div>
                                    <div>
                                        <h6>Submit</h6>
                                        <p className="text-muted small mb-0">Register your item and get protection</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-lg-8">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-100"
                            disabled={loading || !formData.qr_code}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Registering Item...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-2"></i>
                                    Register Item
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegisterItem;
