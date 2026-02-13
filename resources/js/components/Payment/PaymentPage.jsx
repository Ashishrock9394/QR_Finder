import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const PaymentPage = () => {
    const { cardId } = useParams();
    const navigate = useNavigate();

    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const FIXED_AMOUNT = 29;

    // Check environment variable
    const ENV_UPI = import.meta.env.VITE_MERCHANT_UPI;

    const isRazorpayLink =
        ENV_UPI && ENV_UPI.startsWith('http');

    const FALLBACK_UPI = '9198552556@ybl';

    const MERCHANT_UPI = isRazorpayLink
        ? ENV_UPI
        : ENV_UPI || FALLBACK_UPI;

    // UPI Deep Link (for QR)
    const upiDeepLink = `upi://pay?pa=${MERCHANT_UPI}&pn=QR%20Finder&am=${FIXED_AMOUNT}&cu=INR`;

    // Razorpay.me URL with amount
    const razorpayRedirectUrl = isRazorpayLink
        ? `${MERCHANT_UPI}`
        : null;

    // Fetch card details
    useEffect(() => {
        const fetchCard = async () => {
            try {
                const response = await axios.get('/api/v-cards');
                const foundCard = response.data.find(
                    (c) => c.id === parseInt(cardId)
                );
                if (foundCard) {
                    setCard(foundCard);
                } else {
                    setError('Card not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load card details');
            } finally {
                setLoading(false);
            }
        };

        fetchCard();
    }, [cardId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading card details...</p>
            </div>
        );
    }

    if (!card) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-danger">{error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/my-card')}
                    >
                        Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light d-flex align-items-center justify-content-center py-5">
            <div
                className="card shadow-lg"
                style={{ maxWidth: '500px', width: '100%' }}
            >
                <div className="card-body p-5 text-center">
                    <h2 className="fw-bold mb-3">
                        Complete Payment
                    </h2>

                    <div className="card bg-primary text-white mb-4 p-4">
                        <p className="mb-1 small">Amount to Pay</p>
                        <h3 className="m-0">
                            ₹{FIXED_AMOUNT.toFixed(2)}
                        </h3>
                    </div>

                    {/* CASE 1: Razorpay.me exists */}
                    {isRazorpayLink ? (
                        <button
                            className="btn btn-lg btn-primary w-100"
                            onClick={() =>
                                window.location.href =
                                    razorpayRedirectUrl
                            }
                        >
                            Pay via Razorpay
                        </button>
                    ) : (
                        <>
                            {/* CASE 2: No ENV → Generate QR */}
                            <div className="text-center mb-4 p-4 bg-light rounded">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                                        upiDeepLink
                                    )}`}
                                    alt="UPI QR"
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        margin: 'auto',
                                    }}
                                />
                                <p className="text-muted mt-3">
                                    Scan with any UPI app
                                </p>
                                <p className="small text-muted">
                                    UPI ID: {MERCHANT_UPI}
                                </p>
                            </div>

                            <a
                                href={upiDeepLink}
                                className="btn btn-success w-100"
                            >
                                Open in UPI App
                            </a>
                        </>
                    )}

                    <button
                        className="btn btn-light mt-4 w-100"
                        onClick={() => navigate('/my-card')}
                    >
                        Back to Cards
                    </button>

                    <hr className="my-4" />
                    <p className="small text-muted">
                        Secured Payment
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
