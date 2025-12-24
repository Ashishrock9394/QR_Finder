import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CardDetailPage = () => {
    const { id } = useParams(); // Get card ID from route
    console.log('Card ID:', id);
    const navigate = useNavigate();

    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCard();
    }, [id]);

    const fetchCard = async () => {
        try {
            const response = await axios.get(`/api/v-cards/${id}`);
            setCard(response.data);
        } catch (error) {
            console.error('Error fetching card:', error);
            alert('Card not found or you do not have access.');
            navigate('/my-cards'); // redirect if error
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
            pdf.save(`${card.name}_VisitingCard.pdf`);
        });
    };

    if (loading) return (
        <div className="container mt-4 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container mt-4">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
                &larr; Back
            </button>

            <div id="card-to-download" style={{
                backgroundColor: 'white', padding: '50px', maxWidth: '800px', margin: 'auto',
                border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
                    justifyContent: 'space-between'
                }}>
                    {/* Left: Logo & Info */}
                    <div style={{ flex: '1 1 auto', minWidth: '250px' }}>
                        {card.logo ? (
                            <img
                            src={`/storage/${card.logo}`}
                            alt="Logo" className="mb-4"
                            style={{ maxWidth: '250px', maxHeight: '250px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div
                            style={{
                                width: '120px',
                                height: '120px',
                                backgroundColor: '#fff',
                            }}
                            />
                        )}
                        <p style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.05rem' }}>
                            {card.name}
                        </p>
                        <p style={{  margin: '0 0 0.3rem 0', fontWeight: '400', fontStyle: 'italic', color: '#555' }}>
                            {card.designation || 'N/A'}
                        </p>                        
                        <p style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.3rem' }}>
                            {card.company_name || 'N/A'}
                        </p>
                        <p style={{ margin: '0.1rem 0' }}>
                            <strong>Contact:</strong> {card.mobile}, {card.email}, {card.website}
                        </p>
                        {card.address && (
                            <p style={{ margin: '0.1rem 0', color: '#444' }}>
                                <strong>Address:</strong> {card.address}
                            </p>
                        )}
                    </div>

                    {/* Right: QR */}
                    <div style={{ flex: '0 0 140px', textAlign: 'center' }}>
                        {card.qr_image ? (
                            <img
                                src={`/storage/${card.qr_image}`}
                                alt="QR Code"
                                style={{ width: '140px', height: '140px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{ width: '140px', height: '140px', backgroundColor: '#eee' }} />
                        )}
                    </div>
                </div>
                
            </div>

            <div className="d-flex justify-content-center mt-3 gap-2">
                <button className="btn btn-success" onClick={downloadCardPDF}>
                    <i className="bi bi-download me-1"></i> Download Card
                </button>
            </div>
        </div>
    );
};

export default CardDetailPage;
