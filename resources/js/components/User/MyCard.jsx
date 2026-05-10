import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
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
                setFormData((prev) => ({
                    ...prev,
                    template_id: cardTemplates[0].id,
                }));
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    useEffect(() => {
        const generatePreviewQr = async () => {
            const text = formData.email || formData.mobile || 'QR Preview';
            try {
                const dataUrl = await QRCode.toDataURL(text, { width: 140 });
                setPreviewQrDataUrl(dataUrl);
            } catch (error) {
                setPreviewQrDataUrl('');
            }
        };

        generatePreviewQr();
    }, [formData.email, formData.mobile]);
    const downloadCardPDF = () => {
        const input = document.getElementById('card-to-download');
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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
        return templates.length > 0 ? templates[0] : null;
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
        };

        return template.html.replace(/{{\s*(\w+)\s*}}/g, (match, key) => values[key] || '');
    }, [selectedTemplate, defaultTemplate, formData, previewQrDataUrl]);

    const selectedCardTemplateHtml = useMemo(() => {
        const template = selectedCard?.template?.html ? selectedCard.template : defaultTemplate;

        if (!template?.html) {
            return null;
        }

        const values = {
            name: selectedCard.name,
            designation: selectedCard.designation || 'Your Designation',
            company_name: selectedCard.company_name || template.name || 'Company Name',
            mobile: selectedCard.mobile,
            email: selectedCard.email,
            website: selectedCard.website || 'https://example.com',
            address: selectedCard.address || '123 Main Street, Cityville',
            qr_image: selectedCard.qr_image ? '<img src="/storage/' + selectedCard.qr_image + '" style="width:140px;height:140px;object-fit:contain;border-radius:12px;" alt="QR Code" />' : '<div style="width:140px;height:140px;background:#f0f0f0;border-radius:12px; height:140px;width:140px;"></div>',
        };

        return template.html.replace(/{{\s*(\w+)\s*}}/g, (match, key) => values[key] || '');
    }, [selectedCard, defaultTemplate]);

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

        let response;

        if (isEditing && editingCardId) {
            data.append('_method', 'PUT');
            response = await axios.post(`/api/v-cards/${editingCardId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCards(prev => prev.map(c => (c.id === editingCardId ? response.data : c)));
        } else {
            response = await axios.post('/api/v-cards', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCards(prev => [response.data, ...prev]);
        }

        // Reset form
        setShowForm(false);
        setIsEditing(false);
        setSelectedCard(null);
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
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{isEditing ? 'Edit Visiting Card' : 'Create Visiting Card'}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="mb-3">
                                    <label className="form-label">Template</label>
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

                                <div className="mb-3">
                                    <label className="form-label">Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Designation / Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Company Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mobile *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email *</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Website</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        rows="2"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Logo (optional)</label>
                                    {existingFiles.logo && (
                                        <div className="mb-2">
                                            <img src={existingFiles.logo} alt="Logo" style={{ maxHeight: '70px' }} />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="logo"
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Photo (optional)</label>
                                    {existingFiles.photo && (
                                        <div className="mb-2">
                                            <img
                                                src={existingFiles.photo}
                                                alt="Photo"
                                                style={{ maxHeight: '70px', borderRadius: '50%' }}
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

                            <div className="col-lg-6">
                                <div className="border rounded p-3 h-100">
                                    <h5 className="mb-3">Template Preview</h5>
                                    <div
                                        className="template-preview"
                                        style={{ minHeight: '520px', overflow: 'auto' }}
                                        dangerouslySetInnerHTML={{ __html: renderTemplatePreview }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {isEditing ? 'Update Card' : 'Generate QR Card'}
                            </button>
                        </div>
                    </form>

                </div>
                </div>
            </div>
            </div>
        )}

        {/* Card Detail Modal */}
            {selectedCard && (
            <div
                className="modal fade show d-block"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
                <div className="modal-dialog modal-lg">
                <div className="modal-content p-3">
                    <div className="modal-header">
                    <h5 className="modal-title">Visiting Card</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSelectedCard(null)}
                    ></button>
                    </div>
                    <div
                        id="card-to-download"
                        className="modal-body my-2"
                        style={{
                            width: '700px',
                            height: '400px',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            margin: 'auto',
                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            userSelect: 'none',
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid #ddd',
                        }}
                    >
                        {selectedCardTemplateHtml ? (
                            <div
                                className="template-preview"
                                style={{ width: '100%', minHeight: '360px' }}
                                dangerouslySetInnerHTML={{ __html: selectedCardTemplateHtml }}
                            />
                        ) : (
                            <>
                                {/* Top section: brown background */}
                                <div
                                    style={{
                                        backgroundColor: '#a87e69', // brown color
                                        height: '120px',
                                        padding: '1rem 2rem',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '1.7rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                    }}
                                >
                                    {/* Logo or placeholder */}
                                    {selectedCard.logo ? (
                                        <img
                                            src={`/storage/${selectedCard.logo}`}
                                            alt="Logo"
                                            style={{
                                                height: '90px',
                                                width: 'auto',
                                                borderRadius: '8px',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    ) : (
                                        <div style={{ height: '90px', width: '90px' }} />
                                    )}
                                    <div>{selectedCard.company_name || 'Your Company'}</div>
                                </div>

                                {/* Bottom section: white background with info & QR */}
                                <div
                                    style={{
                                        flexGrow: 1,
                                        backgroundColor: 'white',
                                        padding: '2rem 3rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    {/* Left info */}
                                    <div style={{ maxWidth: '60%' }}>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '1.5rem', color: '#333' }}>
                                            {selectedCard.name}
                                        </p>
                                        <p style={{ margin: '4px 0 12px', fontWeight: '500', fontStyle: 'italic', color: '#666' }}>
                                            {selectedCard.designation || 'N/A'}
                                        </p>

                                        <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem' }}>
                                            <strong>Contact:</strong> {selectedCard.mobile || 'N/A'}
                                        </p>
                                        <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem' }}>
                                            <strong>Email:</strong> {selectedCard.email || 'N/A'}
                                        </p>
                                        <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem' }}>
                                            <strong>Website:</strong> {selectedCard.website || 'N/A'}
                                        </p>

                                        {selectedCard.address && (
                                            <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem' }}>
                                                <strong>Address:</strong> {selectedCard.address}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right QR code */}
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            width: '160px',
                                            position: 'relative',
                                        }}
                                    >
                                        {selectedCard.qr_image ? (
                                            <img
                                                src={`/storage/${selectedCard.qr_image}`}
                                                alt="QR Code"
                                                style={{
                                                    width: '140px',
                                                    height: '140px',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: '140px',
                                                    height: '140px',
                                                    backgroundColor: '#f0f0f0',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSelectedCard(null)}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={downloadCardPDF}
                        >
                            <i className="bi bi-download me-1"></i> Download Card
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
