import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '../Layout/Loader';

const emptyForm = (contact = {}) => ({
    qr_code: '',
    item_name: '',
    category: '',
    item_description: '',
    emergency_message: '',
    contact_name: contact.name || '',
    contact_email: contact.email || '',
    contact_phone: contact.mobile || '',
    address: contact.address || '',
    user_image: null,
    item_image: null,
});

const storageUrl = (path) => (path?.startsWith('http') ? path : `/storage/${path}`);

const RegisterItem = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFlow = location.state?.flow === 'sticker' ? 'sticker' : 'new';
    const [flow, setFlow] = useState(initialFlow);
    const [formData, setFormData] = useState(() => emptyForm());
    const [loadingContact, setLoadingContact] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [scannerError, setScannerError] = useState('');
    const [manualQrCode, setManualQrCode] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [verifiedCode, setVerifiedCode] = useState(false);
    const [createdItem, setCreatedItem] = useState(null);
    const [userImagePreview, setUserImagePreview] = useState('');
    const [itemImagePreview, setItemImagePreview] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        let active = true;
        axios.get('/api/user')
            .then(({ data }) => {
                if (active) {
                    setFormData(emptyForm(data));
                }
            })
            .catch((error) => {
                console.error('Unable to load contact information:', error);
                if (active) {
                    setErrors((current) => ({
                        ...current,
                        form: 'Could not load your account contact details. You can still enter them below.',
                    }));
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingContact(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const extractQRCode = (rawValue) => {
        const value = rawValue.trim();
        if (!value) {
            return '';
        }

        try {
            const payload = JSON.parse(value);
            if (typeof payload.qr_code === 'string') {
                return payload.qr_code.trim();
            }
        } catch {
            // QR stickers can contain a plain identifier instead of JSON.
        }

        try {
            const scannedUrl = new URL(value);
            const publicCodeMatch = scannedUrl.pathname.match(/\/qr-codes\/public\/([^/]+)$/);
            if (publicCodeMatch) {
                return decodeURIComponent(publicCodeMatch[1]);
            }
        } catch {
            return value;
        }

        return value;
    };

    const verifyQRCode = useCallback(async (rawValue) => {
        const qrCode = extractQRCode(rawValue);
        if (!qrCode) {
            setScannerError('Scan a QR code or enter its ID before continuing.');
            return;
        }

        setVerifyingCode(true);
        setScannerError('');

        try {
            await axios.post('/api/qr-codes/verify', { qr_code: qrCode });
            setFormData((current) => ({ ...current, qr_code: qrCode }));
            setManualQrCode(qrCode);
            setVerifiedCode(true);
            setCameraActive(false);
        } catch (error) {
            setScannerError(
                error.response?.data?.message
                || error.response?.data?.errors?.qr_code?.[0]
                || 'Could not verify this QR code.'
            );
        } finally {
            setVerifyingCode(false);
        }
    }, []);

    useEffect(() => {
        if (!cameraActive) {
            return undefined;
        }

        let stopped = false;
        let timeoutId;

        const stopStream = () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        const startScanner = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                setScannerError('Camera access requires HTTPS or localhost. Use a QR image or enter the sticker ID.');
                setCameraActive(false);
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: { facingMode: { ideal: 'environment' } },
                });
                streamRef.current = stream;

                if (!videoRef.current || stopped) {
                    stopStream();
                    return;
                }

                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                if (!('BarcodeDetector' in window)) {
                    setScannerError('Camera preview is open, but QR scanning is not supported in this browser. Upload an image or enter the sticker ID.');
                    return;
                }

                const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                const scanFrame = async () => {
                    if (stopped || !videoRef.current) {
                        return;
                    }

                    try {
                        const results = await detector.detect(videoRef.current);
                        if (results.length > 0) {
                            setCameraActive(false);
                            await verifyQRCode(results[0].rawValue);
                            return;
                        }
                    } catch (error) {
                        console.error('QR camera scan failed:', error);
                        setScannerError('Could not read this QR code. Hold it steady in the camera frame or enter its ID.');
                    }

                    if (!stopped) {
                        timeoutId = window.setTimeout(scanFrame, 250);
                    }
                };

                scanFrame();
            } catch (error) {
                console.error('Unable to start QR camera scanner:', error);
                setScannerError('Camera could not be started. Check the browser permission or enter the sticker ID.');
                setCameraActive(false);
                stopStream();
            }
        };

        startScanner();

        return () => {
            stopped = true;
            window.clearTimeout(timeoutId);
            stopStream();
        };
    }, [cameraActive, verifyQRCode]);

    const handleQRImageUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }

        if (!('BarcodeDetector' in window) || !window.createImageBitmap) {
            setScannerError('QR image scanning is unsupported in this browser. Enter the sticker ID manually.');
            return;
        }

        let bitmap;
        try {
            bitmap = await window.createImageBitmap(file);
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const results = await detector.detect(bitmap);
            if (results.length === 0) {
                setScannerError('No QR code was found in that image. Try another image or enter the ID manually.');
                return;
            }

            await verifyQRCode(results[0].rawValue);
        } catch (error) {
            console.error('Unable to scan QR image:', error);
            setScannerError('The selected image could not be scanned. Enter the sticker ID manually or try another image.');
        } finally {
            bitmap?.close();
        }
    };

    const handleChange = (event) => {
        const { name, value, files } = event.target;
        const nextValue = files ? (files[0] || null) : value;
        setFormData((current) => ({ ...current, [name]: nextValue }));
        setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));

        if (files?.[0] && (name === 'item_image' || name === 'user_image')) {
            const previewUrl = URL.createObjectURL(files[0]);
            if (name === 'item_image') {
                setItemImagePreview((previous) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return previewUrl;
                });
            } else {
                setUserImagePreview((previous) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return previewUrl;
                });
            }
        }
    };

    const handleFlowChange = (nextFlow) => {
        setFlow(nextFlow);
        setErrors({});
        setScannerError('');
        setVerifiedCode(false);
        setManualQrCode('');
        setCreatedItem(null);
        setCameraActive(false);
        setFormData((current) => ({ ...current, qr_code: '' }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (flow === 'sticker' && !verifiedCode) {
            setErrors({ qr_code: ['Scan and verify the physical sticker before registering the item.'] });
            return;
        }

        setSubmitting(true);
        setErrors({});
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== '' && (key !== 'qr_code' || flow === 'sticker')) {
                payload.append(key, value);
            }
        });

        try {
            const { data } = await axios.post('/api/qr-codes', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCreatedItem(data.data);
            setCameraActive(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error registering item:', error.response?.data || error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Registration failed',
                    text: error.response?.data?.message || 'Could not register this item. Please try again.',
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingContact) {
        return <Loader />;
    }

    if (createdItem) {
        return (
            <div className="container my-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-9 col-lg-7">
                        <section className="card border-0 shadow-sm text-center">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-success display-5 mb-3"><i className="bi bi-check-circle-fill" /></div>
                                <p className="text-uppercase small fw-bold text-muted mb-2">Registration complete</p>
                                <h1 className="h3 fw-bold mb-2">{createdItem.item_name} is ready</h1>
                                <p className="text-muted mb-4">
                                    {flow === 'sticker'
                                        ? 'Your physical QR sticker is now linked to this item and your contact details.'
                                        : 'Your item and printable QR code have been created.'}
                                </p>
                                {createdItem.qr_code_image_path && (
                                    <div className="d-inline-block border rounded-3 p-3 mb-4 bg-white">
                                        <img src={storageUrl(createdItem.qr_code_image_path)} alt={`QR code for ${createdItem.item_name}`} width="190" height="190" />
                                    </div>
                                )}
                                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                                    {createdItem.qr_code_image_path && (
                                        <a className="btn btn-primary" href={storageUrl(createdItem.qr_code_image_path)} download={`${createdItem.item_name}-qr.svg`}>
                                            <i className="bi bi-download me-2" />Download QR
                                        </a>
                                    )}
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/my-items')}>
                                        View My Items
                                    </button>
                                    <a className="btn btn-outline-primary" href={`/qr-view/${encodeURIComponent(createdItem.qr_code)}`} target="_blank" rel="noopener noreferrer">
                                        <i className="bi bi-box-arrow-up-right me-2" />Open public page
                                    </a>
                                    <button type="button" className="btn btn-link text-secondary" onClick={() => setCreatedItem(null)}>
                                        Register another
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-4 mb-5">
            <div className="row">
                <div className="col-12">
                    <button type="button" className="btn btn-link text-decoration-none ps-0 mb-2" onClick={() => navigate('/my-items')}>
                        <i className="bi bi-arrow-left me-2" />Back to My Items
                    </button>
                    <h1 className="h2 fw-bold mb-2"><i className="bi bi-box-seam me-2" />Register Your Item</h1>
                    <p className="text-muted mb-4">Enter your item and contact details. Your contact information will be connected to its QR code.</p>
                </div>
            </div>

            {errors.form && <div className="alert alert-warning" role="alert">{errors.form}</div>}

            <div className="btn-group mb-4" role="group" aria-label="Registration type">
                <button type="button" className={`btn ${flow === 'sticker' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleFlowChange('sticker')}>
                    <i className="bi bi-qr-code-scan me-2" />Register QR Sticker
                </button>
                <button type="button" className={`btn ${flow === 'new' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleFlowChange('new')}>
                    <i className="bi bi-plus-lg me-2" />Create New Item
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-lg-8">
                        {flow === 'sticker' && (
                            <section className="card mb-4">
                                <div className="card-header bg-white">
                                    <h2 className="h5 card-title mb-0"><i className="bi bi-qr-code-scan me-2" />Scan your physical sticker</h2>
                                </div>
                                <div className="card-body">
                                    {verifiedCode ? (
                                        <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                                            <i className="bi bi-check-circle-fill" />
                                            <span><strong>QR code verified:</strong> <code>{formData.qr_code}</code></span>
                                            <button type="button" className="btn btn-sm btn-outline-success ms-auto" onClick={() => { setVerifiedCode(false); setFormData((current) => ({ ...current, qr_code: '' })); }}>Change</button>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-muted small">Scan the unregistered QR on your sticker, upload an image of it, or enter its printed code.</p>
                                            {cameraActive ? (
                                                <video ref={videoRef} className="w-100 rounded bg-dark mb-3" style={{ maxHeight: '320px', objectFit: 'cover' }} muted playsInline />
                                            ) : (
                                                <div className="d-flex flex-column align-items-center justify-content-center bg-light rounded py-4 mb-3 text-muted">
                                                    <i className="bi bi-camera-video fs-2 mb-2" />
                                                    <span className="small">Camera preview will appear here</span>
                                                </div>
                                            )}
                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                <button type="button" className="btn btn-outline-primary" disabled={verifyingCode} onClick={() => { setScannerError(''); setCameraActive((active) => !active); }}>
                                                    <i className={`bi ${cameraActive ? 'bi-camera-video-off' : 'bi-camera-video'} me-2`} />
                                                    {cameraActive ? 'Stop camera' : 'Start camera'}
                                                </button>
                                                <label className="btn btn-outline-secondary mb-0">
                                                    <i className="bi bi-image me-2" />Upload QR image
                                                    <input type="file" accept="image/*" className="visually-hidden" onChange={handleQRImageUpload} />
                                                </label>
                                            </div>
                                            <label htmlFor="manual-qr-code" className="form-label">Or enter the sticker code manually</label>
                                            <div className="input-group">
                                                <input id="manual-qr-code" type="text" className="form-control" value={manualQrCode} onChange={(event) => setManualQrCode(event.target.value)} placeholder="Enter the ID printed on the sticker" />
                                                <button type="button" className="btn btn-outline-primary" disabled={verifyingCode || !manualQrCode.trim()} onClick={() => verifyQRCode(manualQrCode)}>
                                                    {verifyingCode ? 'Checking…' : 'Verify code'}
                                                </button>
                                            </div>
                                            {scannerError && <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">{scannerError}</div>}
                                            {errors.qr_code && <div className="text-danger small mt-2">{errors.qr_code[0]}</div>}
                                        </>
                                    )}
                                </div>
                            </section>
                        )}

                        <section className="card mb-4">
                            <div className="card-header bg-white">
                                <h2 className="h5 card-title mb-0"><i className="bi bi-box-seam me-2" />Item Details</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="item-name" className="form-label">Item Name *</label>
                                        <input id="item-name" type="text" className={`form-control ${errors.item_name ? 'is-invalid' : ''}`} name="item_name" value={formData.item_name} onChange={handleChange} required maxLength={255} placeholder="e.g., Laptop, Wallet, Keys" />
                                        {errors.item_name && <div className="invalid-feedback">{errors.item_name[0]}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="item-category" className="form-label">Category</label>
                                        <select id="item-category" className={`form-select ${errors.category ? 'is-invalid' : ''}`} name="category" value={formData.category} onChange={handleChange}>
                                            <option value="">Choose a category</option>
                                            {['Keys', 'Wallet', 'Pet', 'Bag', 'Luggage', 'Electronics', 'Other'].map((category) => <option key={category} value={category}>{category}</option>)}
                                        </select>
                                        {errors.category && <div className="invalid-feedback">{errors.category[0]}</div>}
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label htmlFor="item-description" className="form-label">Description</label>
                                        <textarea id="item-description" className={`form-control ${errors.item_description ? 'is-invalid' : ''}`} name="item_description" value={formData.item_description} onChange={handleChange} rows="3" maxLength={1000} placeholder="Brand, color, distinguishing marks..." />
                                        {errors.item_description && <div className="invalid-feedback">{errors.item_description[0]}</div>}
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label htmlFor="emergency-message" className="form-label">Message for the finder</label>
                                        <textarea id="emergency-message" className={`form-control ${errors.emergency_message ? 'is-invalid' : ''}`} name="emergency_message" value={formData.emergency_message} onChange={handleChange} rows="2" maxLength={2000} placeholder="Please contact me if you find this item." />
                                        {errors.emergency_message && <div className="invalid-feedback">{errors.emergency_message[0]}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="item-image" className="form-label">Item Photo <span className="text-muted">(Optional)</span></label>
                                        <input id="item-image" type="file" className={`form-control ${errors.item_image ? 'is-invalid' : ''}`} name="item_image" onChange={handleChange} accept="image/jpeg,image/png,image/gif,image/webp" />
                                        {errors.item_image && <div className="invalid-feedback">{errors.item_image[0]}</div>}
                                        {itemImagePreview && <img src={itemImagePreview} alt="Item preview" className="img-thumbnail mt-2" style={{ maxHeight: 110 }} />}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="owner-photo" className="form-label">Your Photo <span className="text-muted">(Optional)</span></label>
                                        <input id="owner-photo" type="file" className={`form-control ${errors.user_image ? 'is-invalid' : ''}`} name="user_image" onChange={handleChange} accept="image/jpeg,image/png,image/gif,image/webp" />
                                        {errors.user_image && <div className="invalid-feedback">{errors.user_image[0]}</div>}
                                        {userImagePreview && <img src={userImagePreview} alt="Contact preview" className="img-thumbnail rounded-circle mt-2" style={{ maxHeight: 90, maxWidth: 90 }} />}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="card mb-4">
                            <div className="card-header bg-white">
                                <h2 className="h5 card-title mb-0"><i className="bi bi-person-lines-fill me-2" />Contact Information</h2>
                                <p className="text-muted small mb-0 mt-1">Pre-filled from your account. These details are shared with the finder.</p>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="contact-name" className="form-label">Full Name *</label>
                                        <input id="contact-name" type="text" className={`form-control ${errors.contact_name ? 'is-invalid' : ''}`} name="contact_name" value={formData.contact_name} onChange={handleChange} required />
                                        {errors.contact_name && <div className="invalid-feedback">{errors.contact_name[0]}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="contact-email" className="form-label">Email Address *</label>
                                        <input id="contact-email" type="email" className={`form-control ${errors.contact_email ? 'is-invalid' : ''}`} name="contact_email" value={formData.contact_email} onChange={handleChange} required />
                                        {errors.contact_email && <div className="invalid-feedback">{errors.contact_email[0]}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="contact-phone" className="form-label">Phone Number *</label>
                                        <input id="contact-phone" type="tel" className={`form-control ${errors.contact_phone ? 'is-invalid' : ''}`} name="contact_phone" value={formData.contact_phone} onChange={handleChange} required />
                                        {errors.contact_phone && <div className="invalid-feedback">{errors.contact_phone[0]}</div>}
                                    </div>
                                    <div className="col-12 mb-3">
                                        <label htmlFor="contact-address" className="form-label">Full Address</label>
                                        <textarea id="contact-address" className={`form-control ${errors.address ? 'is-invalid' : ''}`} name="address" value={formData.address} onChange={handleChange} rows="3" maxLength={500} placeholder="Address for item return..." />
                                        {errors.address && <div className="invalid-feedback">{errors.address[0]}</div>}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="col-lg-4">
                        <aside className="card position-sticky mb-4" style={{ top: '20px' }}>
                            <div className="card-header bg-white">
                                <h2 className="h5 card-title mb-0"><i className="bi bi-info-circle me-2" />Registration Information</h2>
                            </div>
                            <div className="card-body">
                                <div className="alert alert-info small">
                                    {flow === 'sticker'
                                        ? 'The QR on your physical sticker is blank until registration. After you scan and submit this form, that sticker will be linked to the item and your contact details.'
                                        : 'A unique QR code is generated automatically after you submit the item and contact details.'}
                                </div>
                                <ol className="ps-3 mb-0 small text-muted">
                                    {flow === 'sticker' && <li className="mb-2">Scan and verify the physical QR sticker.</li>}
                                    <li className="mb-2">Fill in the item details.</li>
                                    <li className="mb-2">Confirm your contact details.</li>
                                    <li>Submit to link or generate the QR code.</li>
                                </ol>
                            </div>
                        </aside>
                        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting || (flow === 'sticker' && !verifiedCode)}>
                            {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Registering...</> : flow === 'sticker' ? 'Register Item to Sticker' : 'Create Item & Generate QR'}
                        </button>
                        {flow === 'sticker' && !verifiedCode && <p className="form-text text-center">Scan and verify your sticker before submitting.</p>}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RegisterItem;
