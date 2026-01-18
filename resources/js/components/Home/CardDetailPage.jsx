// resources/js/components/Home/CardDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Loader from '../Layout/Loader';

const CardDetailPage = () => {
    const { id } = useParams();
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
            navigate('/my-cards');
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

    if (loading) return <Loader />;

    // Icons using Bootstrap Icons (or substitute with your icons)
    const iconStyle = { marginRight: '8px', color: '#555' };

    return (
        <div className="container mt-4 mb-4">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
                &larr; Back
            </button>

            <div
                id="card-to-download"
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
                    {/* Logo or company name */}
                    {card.logo ? (
                        <img
                            src={`/storage/${card.logo}`}
                            alt="Logo"
                            style={{
                                height: '90px',
                                width: 'auto',
                                borderRadius: '8px',
                                objectFit: 'contain',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                height: '90px',
                                width: '90px',
                            }}
                        />
                    )}
                    <div>{card.company_name || 'Your Company'}</div>
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
                        <p style={{ margin: '0', fontWeight: '700', fontSize: '1.5rem', color: '#333' }}>
                            {card.name}
                        </p>
                        <p style={{ margin: '4px 0 12px', fontWeight: '500', fontStyle: 'italic', color: '#666' }}>
                            {card.designation || 'N/A'}
                        </p>

                        {/* Contact details */}
                        <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            <i className="bi bi-telephone-fill" style={iconStyle}></i> {card.mobile || 'N/A'}
                        </p>
                        <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            <i className="bi bi-envelope-fill" style={iconStyle}></i> {card.email || 'N/A'}
                        </p>
                        <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            <i className="bi bi-globe" style={iconStyle}></i> {card.website || 'N/A'}
                        </p>

                        {card.address && (
                            <p style={{ margin: '6px 0', color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                <i className="bi bi-geo-alt-fill" style={iconStyle}></i> {card.address}
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
                        {card.qr_image ? (
                            <img
                                src={`/storage/${card.qr_image}`}
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
                        <div
                            style={{
                                marginTop: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#a87e69',
                                userSelect: 'none',
                            }}
                        >
                        </div>
                    </div>
                </div>
            </div>

            {/* Download button */}
            <div className="d-flex justify-content-center mt-3 gap-2">
                <button className="btn btn-success" onClick={downloadCardPDF}>
                    <i className="bi bi-download me-1"></i> Download Card
                </button>
            </div>
        </div>
    );
};

export default CardDetailPage;
