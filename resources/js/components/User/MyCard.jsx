import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Loader from '../Layout/Loader';

const MyCard = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCardId, setEditingCardId] = useState(null);

    const [formData, setFormData] = useState({
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

    useEffect(() => {
        fetchCards();
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

    const handleEdit = (card) => {
        setFormData({
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
            setFormData({ name: '', designation: '', company_name: '', mobile: '', email: '', website: '', address: '', logo: null, photo: null });
            setExistingFiles({ logo: null, photo: null });
            }}>
            <i className="bi bi-plus-circle me-1"></i> Add Card
            </button>
        </div>

        {/* No cards */}
        {cards.length === 0 && (
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

        {/* Cards Grid */}
        <div className="row">
            {cards.map((card) => (
                <div key={card.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow-lg rounded-3 hover-shadow-lg">
                        {/* QR Code Image */}
                        {card.qr_image && (
                            <img
                                src={`/storage/${card.qr_image}`}
                                className="card-img-top rounded-3 m-auto pt-2"
                                alt="QR Code" style={{ width: '150px', height: '150px', objectFit: 'contain' }}
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

                            {/* Optional: Company / Contact Info below flex row */}
                            
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



                        {/* Card Footer with Buttons */}
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

                            <div className="col-md-6 mb-3">
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

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Designation / Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
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

                            <div className="col-md-6 mb-3">
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

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Website</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Full width fields */}
                            <div className="col-12 mb-3">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-control"
                                    name="address"
                                    rows="2"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>

                            <div className="col-md-6 mb-3">
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

                            <div className="col-md-6 mb-3">
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
