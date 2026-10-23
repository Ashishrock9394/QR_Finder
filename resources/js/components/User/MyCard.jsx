import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Loader from '../Layout/Loader';

const MyCard = () => {
    const [cards, setCards] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCardId, setEditingCardId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        template_id: '',
        name: '',
        designation: '',
        company_name: '',
        mobile: '',
        email: '',
        website: '',
        address: '',
        logo: null,
        photo: null,
    });
    const [existingFiles, setExistingFiles] = useState({ logo: null, photo: null });
    const [previewQrDataUrl, setPreviewQrDataUrl] = useState('');
    const [previewLogoUrl, setPreviewLogoUrl] = useState('');
    const [cardPreviewScale, setCardPreviewScale] = useState(1);
    const cardFrameRef = useRef(null);
    const formPreviewFrameRef = useRef(null);
    const previewModalFrameRef = useRef(null);
    const [formPreviewScale, setFormPreviewScale] = useState(1);
    const [previewModalScale, setPreviewModalScale] = useState(1);

    useEffect(() => {
        fetchCards();
        fetchTemplates();
    }, []);

    const fetchCards = async () => {
        try {
            const response = await axios.get('/api/v-cards');
            setCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('/api/card-templates');
            const cardTemplates = response.data || [];
            setTemplates(cardTemplates);

            if (!formData.template_id && cardTemplates.length) {
                const defaultTemplate = cardTemplates.find((template) => template.template_key === 'modern_minimal') || cardTemplates[0];
                setFormData((prev) => ({
                    ...prev,
                    template_id: defaultTemplate.id,
                }));
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    useEffect(() => {
        if (typeof File === 'undefined' || !(formData.logo instanceof File)) {
            setPreviewLogoUrl('');

            return undefined;
        }

        const logoUrl = URL.createObjectURL(formData.logo);
        setPreviewLogoUrl(logoUrl);

        return () => URL.revokeObjectURL(logoUrl);
    }, [formData.logo]);

    useEffect(() => {
        const generatePreviewQr = async () => {
            const text = formData.email || formData.mobile || 'QR Preview';
            try {
                const dataUrl = await QRCode.toDataURL(text, { width: 140 });
                setPreviewQrDataUrl(dataUrl);
            } catch (error) {
                console.error('Error generating card preview QR code:', error);
                setPreviewQrDataUrl('');
            }
        };

        generatePreviewQr();
    }, [formData.email, formData.mobile]);

    useEffect(() => {
        const frame = cardFrameRef.current;
        if (!selectedCard || showForm || !frame) {
            return;
        }

        const updateScale = () => {
            setCardPreviewScale(Math.min(1, frame.clientWidth / 700));
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(frame);

        return () => observer.disconnect();
    }, [selectedCard, showForm]);

    useEffect(() => {
        const frame = formPreviewFrameRef.current;
        if (!showForm || !frame) {
            return;
        }

        const updateScale = () => {
            setFormPreviewScale(Math.min(1, frame.clientWidth / 700));
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(frame);

        return () => observer.disconnect();
    }, [showForm]);

    useEffect(() => {
        const frame = previewModalFrameRef.current;
        if (!showPreview || !frame) {
            return;
        }

        const updateScale = () => {
            setPreviewModalScale(Math.min(1, frame.clientWidth / 700));
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(frame);

        return () => observer.disconnect();
    }, [showPreview]);

    const downloadCardPDF = () => {
        const input = document.getElementById('card-to-download');
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'cm',
                format: [8.9, 5.1]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 8.9, 5.1);
            pdf.save(`${selectedCard.name}_VisitingCard.pdf`);
        });
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const selectedTemplate = useMemo(() => {
        return templates.find((template) => String(template.id) === String(formData.template_id));
    }, [templates, formData.template_id]);

    const defaultTemplate = useMemo(() => {
        return templates.find((template) => template.template_key === 'modern_minimal') || (templates.length > 0 ? templates[0] : null);
    }, [templates]);

    const renderTemplatePreview = useMemo(() => {
        const template = selectedTemplate?.html ? selectedTemplate : defaultTemplate;

        if (!template?.html) {
            return '<div class="text-muted p-3">Select a template and fill your details to preview the card.</div>';
        }

        const values = {
            name: formData.name || 'Your Name',
            designation: formData.designation || 'Your Designation',
            company_name: formData.company_name || 'Company Name',
            mobile: formData.mobile || '+1 555 123 4567',
            email: formData.email || 'email@example.com',
            website: formData.website || 'https://example.com',
            address: formData.address || '123 Main Street, Cityville',
            qr_image: previewQrDataUrl ? `<img src="${previewQrDataUrl}" style="width:140px;height:140px;object-fit:contain;border-radius:12px;" alt="QR Code" />` : '<div style="width:140px;height:140px;background:#f0f0f0;border-radius:12px; height:140px;width:140px;"></div>',
            company_logo: previewLogoUrl
                ? `<img src="${previewLogoUrl}" style="max-height:80px;object-fit:contain;border-radius:6px;" alt="Logo" />`
                : existingFiles.logo
                    ? `<img src="${existingFiles.logo}" style="max-height:80px;object-fit:contain;border-radius:6px;" alt="Logo" />`
                    : '',
        };

        return template.html.replace(/{{\s*(\w+)\s*}}/g, (match, key) => values[key] || '');
    }, [selectedTemplate, defaultTemplate, formData, previewQrDataUrl, existingFiles.logo, previewLogoUrl]);

    const selectedCardTemplateHtml = useMemo(() => {
        if (!selectedCard) {
            return null;
        }

        const template = selectedCard?.template?.html ? selectedCard.template : defaultTemplate;

        if (!template?.html) {
            return null;
        }

        const values = {
            name: selectedCard.name || 'Your Name',
            designation: selectedCard.designation || 'Your Designation',
            company_name: selectedCard.company_name || template.name || 'Company Name',
            mobile: selectedCard.mobile || 'N/A',
            email: selectedCard.email || 'email@example.com',
            website: selectedCard.website || 'https://example.com',
            address: selectedCard.address || '123 Main Street, Cityville',
            qr_image: selectedCard.qr_image ? '<img src="/storage/' + selectedCard.qr_image + '" style="width:140px;height:140px;object-fit:contain;border-radius:12px;" alt="QR Code" />' : '<div style="width:140px;height:140px;background:#f0f0f0;border-radius:12px; height:140px;width:140px;"></div>',
            company_logo: selectedCard.logo ? '<img src="/storage/' + selectedCard.logo + '" style="max-height:80px;object-fit:contain;border-radius:6px;" alt="Logo" />' : '',
        };

        return template.html.replace(/{{\s*(\w+)\s*}}/g, (match, key) => values[key] || '');
    }, [selectedCard, defaultTemplate]);

    const generatePreview = async (e) => {
        e.preventDefault();

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        if (!formData.name.trim() || !formData.mobile.trim() || !formData.email.trim() || !emailValid) {
            await Swal.fire({
                icon: 'warning',
                title: 'Check required details',
                text: 'Please enter your name, mobile number, and a valid email before previewing the card.',
            });
            return;
        }

        setIsPreviewLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) data.append(key, formData[key]);
        });

        if (!formData.template_id && defaultTemplate) {
            data.append('template_id', defaultTemplate.id);
        }

        try {
            const qrDataUrl = await QRCode.toDataURL(formData.email || formData.mobile || 'QR Preview', { width: 140 });
            setPreviewQrDataUrl(qrDataUrl);

            const response = await axios.post('/api/v-cards/preview', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPreviewData(response.data);
            setShowPreview(true);
        } catch (error) {
            console.error('Error generating preview:', error.response?.data || error);
            const validationErrors = error.response?.data?.errors;
            const message = validationErrors
                ? Object.values(validationErrors).flat().join('\n')
                : error.response?.data?.message || error.response?.data?.error || 'Failed to generate preview. Please check your data.';

            await Swal.fire({
                icon: 'error',
                title: 'Unable to generate preview',
                text: message,
            });
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const paidCards = useMemo(() => cards.filter((card) => card.payment_status === 'paid'), [cards]);
    const pendingCards = useMemo(() => cards.filter((card) => card.payment_status !== 'paid'), [cards]);

    const handleEdit = (card) => {
        setFormData({
        template_id: card.template_id || '',
        name: card.name,
        designation: card.designation || '',
        company_name: card.company_name || '',
        mobile: card.mobile,
        email: card.email,
        website: card.website,
        address: card.address || '',
        logo: null,
        photo: null,
        });
        setExistingFiles({
        logo: card.logo ? `/storage/${card.logo}` : null,
        photo: card.photo ? `/storage/${card.photo}` : null,
        });
        setSelectedCard(card);
        setEditingCardId(card.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => {
        if (formData[key] !== null) data.append(key, formData[key]);
        });

        try {
        if (!formData.template_id && defaultTemplate) {
            data.append('template_id', defaultTemplate.id);
        }

        const uploadConfig = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        let response;

        if (isEditing && editingCardId) {
            data.append('_method', 'PUT');
            response = await axios.post(`/api/v-cards/${editingCardId}`, data, uploadConfig);
            setCards(prev => prev.map(c => (c.id === editingCardId ? response.data : c)));
        } else {
            response = await axios.post('/api/v-cards', data, uploadConfig);
            setCards(prev => [response.data, ...prev]);
        }

        // Reset form and modals
        setShowForm(false);
        setShowPreview(false);
        setIsEditing(false);
        setSelectedCard(null);
        setPreviewData(null);
        setFormData({
            name: '',
            designation: '',
            company_name: '',
            mobile: '',
            email: '',
            website: '',
            address: '',
            logo: null,
            photo: null,
        });
        setExistingFiles({ logo: null, photo: null });

        } catch (error) {
        console.error('Error saving card:', error);
        const validationErrors = error.response?.data?.errors;
        const message = validationErrors
            ? Object.values(validationErrors).flat().join('\n')
            : error.response?.data?.message || error.response?.data?.error || 'Unable to save your card. Please try again.';
        await Swal.fire({
            icon: 'error',
            title: 'Unable to save card',
            text: message,
        });
        }
    };

    const handleDelete = async (cardId) => {
        if (!window.confirm('Are you sure you want to delete this card?')) return;
        try {
        await axios.delete(`/api/v-cards/${cardId}`);
        setCards(prev => prev.filter(c => c.id !== cardId));
        if (selectedCard && selectedCard.id === cardId) setSelectedCard(null);
        } catch (error) {
        console.error('Error deleting card:', error);
        }
    };

    if (loading){
        return <Loader />
    }

    return (
        <div className="container mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
            <h2 className="fw-bold"><i className="bi bi-person-vcard me-2"></i> My Visiting Cards</h2>
            <p className="text-muted">Manage and generate your digital visiting cards</p>
            </div>
            <button className="btn btn-primary" onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setSelectedCard(null);
            setFormData({
                template_id: defaultTemplate?.id || '',
                name: '',
                designation: '',
                company_name: '',
                mobile: '',
                email: '',
                website: '',
                address: '',
                logo: null,
                photo: null,
            });
            setExistingFiles({ logo: null, photo: null });
            }}>
            <i className="bi bi-plus-circle me-1"></i> Add Card
            </button>
        </div>

        {/* No cards */}
        {paidCards.length === 0 && pendingCards.length === 0 && (
            <div className="card text-center py-5">
            <div className="card-body">
                <i className="bi bi-qr-code display-1 text-muted"></i>
                <h5 className="card-title mt-3">No Cards Created</h5>
                <p className="card-text text-muted">You haven't created any visiting cards yet.</p>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <i className="bi bi-plus-circle me-2"></i> Create Your First Card
                </button>
            </div>
            </div>
        )}

        {pendingCards.length > 0 && (
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 className="mb-1">Pending Payment</h4>
                        <p className="text-muted mb-0">Your card details are visible, but the QR remains blurred until payment completes.</p>
                    </div>
                    <span className="badge bg-warning">{pendingCards.length} pending</span>
                </div>
                <div className="row">
                    {pendingCards.map((card) => (
                        <div key={card.id} className="col-md-6 col-lg-4 mb-4">
                            <div className="card h-100 shadow-lg rounded-3 position-relative" style={{ overflow: 'hidden' }}>
                                {card.qr_image && (
                                    <img
                                        src={`/storage/${card.qr_image}`}
                                        className="card-img-top rounded-3 m-auto pt-2"
                                        alt="QR Code"
                                        style={{ width: '150px', height: '150px', objectFit: 'contain', filter: 'blur(4px)', opacity: 0.65 }}
                                    />
                                )}
                                <div className="card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                                            <h5 className="card-title mb-1">{card.name}</h5>
                                            {card.designation && (
                                                <p className="text-muted mb-2">{card.designation}</p>
                                            )}
                                            {card.company_name && (
                                                <strong className="d-block text-dark mt-2 mb-1">{card.company_name}</strong>
                                            )}
                                            <span className="badge bg-warning mt-2">
                                                <i className="bi bi-clock-history me-1"></i> Pending
                                            </span>
                                        </div>

                                        <div style={{ flex: '0 0 auto', textAlign: 'center', marginLeft: '1rem' }}>
                                            {card.photo && (
                                                <img
                                                    src={`/storage/${card.photo}`}
                                                    alt="Photo"
                                                    style={{ maxHeight: '80px', borderRadius: '50%', display: 'block', marginBottom: '0.5rem' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <p className="mb-1"><strong>Mobile: </strong>{card.mobile}</p>
                                    <p className="mb-1"><strong>Email: </strong><a href={`mailto:${card.email}`}>{card.email}</a></p>
                                    {card.website && (
                                        <p className="mb-1">
                                            <strong>Website: </strong>
                                            <a href={card.website} target="_blank" rel="noopener noreferrer" className="text-primary">{card.website}</a>
                                        </p>
                                    )}
                                    {card.address && (
                                        <p className="mb-1"><strong>Address: </strong>{card.address}</p>
                                    )}
                                </div>

                                <div className="card-footer bg-transparent d-flex justify-content-end gap-2">
                                    <button
                                        className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 hover-shadow"
                                        onClick={() => navigate(`/payment/${card.id}`)}
                                    >
                                        <i className="bi bi-credit-card me-1"></i> Pay Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {paidCards.length > 0 && (
            <div className="row">
                {paidCards.map((card) => (
                    <div key={card.id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100 shadow-lg rounded-3 hover-shadow-lg position-relative" style={{ overflow: 'hidden' }}>
                            {/* QR Code Image */}
                            {card.qr_image && (
                                <img
                                    src={`/storage/${card.qr_image}`}
                                    className="card-img-top rounded-3 m-auto pt-2"
                                    alt="QR Code"
                                    style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                                />
                            )}
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    {/* LEFT: Name & Designation */}
                                    <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                                        <h5 className="card-title mb-1">{card.name}</h5>
                                        {card.designation && (
                                            <p className="text-muted mb-2">{card.designation}</p>
                                        )}
                                        {card.company_name && (
                                            <strong className="d-block text-dark mt-2 mb-1">{card.company_name}</strong>
                                        )}
                                        <span className="badge bg-success mt-2">
                                            <i className="bi bi-check-circle me-1"></i> Paid
                                        </span>
                                    </div>

                                    {/* RIGHT: Photo & Logo */}
                                    <div style={{ flex: '0 0 auto', textAlign: 'center', marginLeft: '1rem' }}>
                                        {card.photo && (
                                            <img
                                                src={`/storage/${card.photo}`}
                                                alt="Photo"
                                                style={{ maxHeight: '80px', borderRadius: '50%', display: 'block', marginBottom: '0.5rem' }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <p className="mb-1"><strong>Mobile: </strong>{card.mobile}</p>
                                <p className="mb-1"><strong>Email: </strong><a href={`mailto:${card.email}`}>{card.email}</a></p>
                                {card.website && (
                                    <p className="mb-1">
                                        <strong>Website: </strong>
                                        <a href={card.website} target="_blank" rel="noopener noreferrer" className="text-primary">{card.website}</a>
                                    </p>
                                )}
                                {card.address && (
                                    <p className="mb-1"><strong>Address: </strong>{card.address}</p>
                                )}
                            </div>

                            <div className="card-footer bg-transparent d-flex justify-content-between gap-2">
                                <button
                                    className="btn btn-outline-info btn-sm rounded-pill px-3 py-2 hover-shadow"
                                    onClick={() => setSelectedCard(card)}
                                >
                                    <i className="bi bi-eye me-1"></i> View
                                </button>
                                <button
                                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-2 hover-shadow"
                                    onClick={() => handleEdit(card)}
                                >
                                    <i className="bi bi-pencil me-1"></i> Edit
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 hover-shadow"
                                    onClick={() => handleDelete(card.id)}
                                >
                                    <i className="bi bi-trash me-1"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}


        {/* Create/Edit Modal */}
        {showForm && (
            <div
                className="modal fade show d-block"
                role="dialog"
                aria-modal="true"
                aria-labelledby="card-form-modal-title"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1055,
                    overflowY: 'auto',
                    backgroundColor: 'rgba(15, 23, 42, 0.68)',
                    backdropFilter: 'blur(4px)',
                }}
            >
            <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '1320px' }}>
                <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px' }}>
                <div className="modal-header border-0 px-4 px-lg-5 pt-4 pb-3">
                    <div>
                        <h5 id="card-form-modal-title" className="modal-title fw-bold mb-1">{isEditing ? 'Edit Visiting Card' : 'Create Visiting Card'}</h5>
                        <div className="small text-muted">Enter your contact details and preview the print-ready design.</div>
                    </div>
                    <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowForm(false)}></button>
                </div>
                <div className="modal-body px-4 px-lg-5 pt-2" style={{ maxHeight: 'calc(100vh - 170px)', overflowY: 'auto' }}>
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label fw-semibold">Card design</label>
                                    <select
                                        className="form-select"
                                        name="template_id"
                                        value={formData.template_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Default layout</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Designation / Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Company Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Mobile *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold">Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold">Website</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold">Address</label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        rows="2"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Logo <span className="text-muted fw-normal">(optional)</span></label>
                                    {existingFiles.logo && (
                                        <div className="mb-2">
                                            <img src={existingFiles.logo} alt="Logo" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="logo"
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">Photo <span className="text-muted fw-normal">(optional)</span></label>
                                    {existingFiles.photo && (
                                        <div className="mb-2">
                                            <img
                                                src={existingFiles.photo}
                                                alt="Photo"
                                                style={{ maxHeight: '48px', maxWidth: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="photo"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="h-100 p-3 p-lg-4 rounded-4" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                    <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                                        <div>
                                            <h6 className="fw-bold mb-1">Live preview</h6>
                                            <div className="small text-muted">Print size: 8.9 × 5.1 cm</div>
                                        </div>
                                        <span className="badge rounded-pill text-bg-light border">Landscape</span>
                                    </div>
                                    <div
                                        ref={formPreviewFrameRef}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            aspectRatio: '700 / 401',
                                            overflow: 'hidden',
                                            borderRadius: '12px',
                                            background: '#fff',
                                            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                                        }}
                                    >
                                        <div
                                            className="template-preview"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '700px',
                                                height: '401px',
                                                overflow: 'hidden',
                                                transform: `scale(${formPreviewScale})`,
                                                transformOrigin: 'top left',
                                            }}
                                            dangerouslySetInnerHTML={{ __html: renderTemplatePreview }}
                                        />
                                    </div>
                                    <div className="d-flex align-items-start gap-2 mt-3 small text-muted">
                                        <i className="bi bi-info-circle mt-1"></i>
                                        <span>The preview scales to fit this panel. Your print dimensions stay fixed.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-info"
                                onClick={generatePreview}
                                disabled={isPreviewLoading}
                            >
                                {isPreviewLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Generating Preview...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-eye me-1"></i> Preview Card
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                </div>
                </div>
            </div>
            </div>
        )}

        {/* Card Detail Modal */}
            {selectedCard && !showForm && (
            <div
                className="modal fade show d-block"
                role="dialog"
                aria-modal="true"
                aria-labelledby="card-detail-modal-title"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1055,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    backgroundColor: 'rgba(15, 23, 42, 0.68)',
                    backdropFilter: 'blur(4px)',
                    overflowY: 'auto',
                }}
            >
                <div className="modal-dialog m-0 w-100" style={{ maxWidth: '760px' }}>
                <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px' }}>
                    <div className="modal-header border-0 px-4 pt-4 pb-3">
                        <div>
                            <h5 id="card-detail-modal-title" className="modal-title fw-bold mb-1">Visiting Card</h5>
                            <div className="small text-muted">Print size: 8.9 × 5.1 cm</div>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => setSelectedCard(null)}
                        ></button>
                    </div>
                    <div
                        id="card-to-download"
                        ref={cardFrameRef}
                        style={{
                            position: 'relative',
                            width: 'min(100%, 700px)',
                            aspectRatio: '700 / 401',
                            overflow: 'hidden',
                            margin: '8px auto 20px',
                            backgroundColor: '#fff',
                            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '700px',
                                height: '401px',
                                overflow: 'hidden',
                                transform: `scale(${cardPreviewScale})`,
                                transformOrigin: 'top left',
                                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                userSelect: 'none',
                            }}
                        >
                            {selectedCardTemplateHtml ? (
                                <div
                                    className="template-preview"
                                    style={{ width: '700px', height: '401px', overflow: 'hidden' }}
                                    dangerouslySetInnerHTML={{ __html: selectedCardTemplateHtml }}
                                />
                            ) : (
                                <>
                                <div
                                    style={{
                                        height: '401px',
                                        boxSizing: 'border-box',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        background: '#f8fafc',
                                    }}
                                >
                                    <div style={{ height: '105px', boxSizing: 'border-box', padding: '15px 28px', display: 'flex', alignItems: 'center', gap: '18px', background: '#17324d', color: '#fff', borderBottom: '5px solid #21b6a8' }}>
                                        {selectedCard.logo ? (
                                            <img src={`/storage/${selectedCard.logo}`} alt="Company logo" style={{ maxWidth: '100px', maxHeight: '70px', objectFit: 'contain' }} />
                                        ) : null}
                                        <div style={{ fontSize: '17px', fontWeight: 700 }}>{selectedCard.company_name || 'Your Company'}</div>
                                    </div>
                                    <div style={{ flex: 1, minHeight: 0, boxSizing: 'border-box', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                                        <div style={{ minWidth: 0, color: '#475569', fontSize: '12px', lineHeight: 1.8 }}>
                                            <div style={{ color: '#17324d', fontSize: '26px', lineHeight: 1.15, fontWeight: 700 }}>{selectedCard.name}</div>
                                            <div style={{ color: '#12877f', fontSize: '13px', marginBottom: '12px' }}>{selectedCard.designation || ' '}</div>
                                            <div>{selectedCard.mobile}</div>
                                            <div>{selectedCard.email}</div>
                                            {selectedCard.website && <div>{selectedCard.website}</div>}
                                            {selectedCard.address && <div>{selectedCard.address}</div>}
                                        </div>
                                        <div style={{ flex: '0 0 155px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '12px', background: '#fff', border: '1px solid #dce9e7', borderRadius: '14px' }}>
                                            {selectedCard.qr_image ? (
                                                <img src={`/storage/${selectedCard.qr_image}`} alt="QR Code" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ width: '130px', height: '130px', background: '#f0f0f0', borderRadius: '8px' }} />
                                            )}
                                            <span style={{ color: '#12877f', fontSize: '9px', fontWeight: 700, letterSpacing: '1px' }}>SCAN TO CONNECT</span>
                                        </div>
                                    </div>
                                </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer border-0 px-4 pb-4 pt-0">
                        <button
                            type="button"
                            className="btn btn-light rounded-pill px-4"
                            onClick={() => setSelectedCard(null)}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4"
                            onClick={downloadCardPDF}
                        >
                            <i className="bi bi-download me-2"></i>Download print-ready PDF
                        </button>
                    </div>
                </div>
                </div>
            </div>
            )}

        {/* Preview Modal */}
        {showPreview && previewData && (
            <div
                className="modal fade show d-block"
                role="dialog"
                aria-modal="true"
                aria-labelledby="card-preview-modal-title"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1060,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(15, 23, 42, 0.68)',
                    backdropFilter: 'blur(4px)',
                }}
            >
                <div className="modal-dialog m-0 w-100" style={{ maxWidth: '760px' }}>
                    <div className="modal-content border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px' }}>
                        <div className="modal-header">
                            <h5 id="card-preview-modal-title" className="modal-title">
                                <i className="bi bi-eye me-2"></i>Preview Your Card
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setShowPreview(false);
                                    setPreviewData(null);
                                }}
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    aspectRatio: '700 / 401',
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                                }}
                                ref={previewModalFrameRef}
                            >
                                {renderTemplatePreview && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '700px',
                                            height: '401px',
                                            overflow: 'hidden',
                                            transform: `scale(${previewModalScale})`,
                                            transformOrigin: 'top left',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: renderTemplatePreview }}
                                    />
                                )}
                            </div>
                            <div className="mt-3 p-3 bg-light rounded">
                                <p className="text-muted mb-0">
                                    <i className="bi bi-info-circle me-2"></i>
                                    This is a preview of your card. Click "Generate Card" to create it officially.
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowPreview(false);
                                    setPreviewData(null);
                                }}
                            >
                                Back to Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                            >
                                <i className="bi bi-check-circle me-1"></i> Generate Card
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        </div>
    );
};

export default MyCard;
