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
    const [statusMessage, setStatusMessage] = useState(null);

    const FIXED_AMOUNT = 29;

    // Razorpay checkout requires API key in server config
    const razorpayCheckoutProviderUrl = import.meta.env.VITE_RAZORPAY_LINK || null;

    // no UPI fallback - Razorpay only
    const isRazorpayLink = Boolean(razorpayCheckoutProviderUrl);

    const razorpayRedirectUrl = isRazorpayLink
        ? razorpayCheckoutProviderUrl
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

    // Poll payment status in background so UI updates when webhook marks paid
    useEffect(() => {
        if (!card || card.payment_status !== 'pending') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/api/payments/history/${card.id}`);
                if (res.data && res.data.current_status === 'paid') {
                    setCard((prev) => ({ ...prev, payment_status: 'paid' }));
                    clearInterval(interval);
                    navigate('/my-card');
                }
            } catch (err) {
                console.error('Error polling payment status', err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [card, navigate]);

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

                    {/* CASE 1: Razorpay flow */}
                    <div>
                        <button
                            className="btn btn-lg btn-primary w-100"
                            onClick={async () => {
                                setProcessing(true);
                                setError(null);
                                setStatusMessage(null);
                                try {
                                    // Razorpay-only checkout: create order on server
                                    const createRes = await axios.post('/api/payments/create-order', {
                                        vcard_id: card.id,
                                        amount: FIXED_AMOUNT,
                                    });

                                    if (!createRes.data || !createRes.data.order_id) {
                                        throw new Error('Failed to create Razorpay order');
                                    }

                                    const { order_id: orderId, key_id: keyId } = createRes.data;

                                    // Load Razorpay script if not loaded
                                    if (!window.Razorpay) {
                                        await new Promise((resolve, reject) => {
                                            const s = document.createElement('script');
                                            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                            s.onload = resolve;
                                            s.onerror = reject;
                                            document.body.appendChild(s);
                                        });
                                    }

                                    const options = {
                                        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_MERCHANT_KEY,
                                        amount: FIXED_AMOUNT * 100,
                                        currency: 'INR',
                                        name: 'QR Finder',
                                        description: `Payment for vcard ${card.name}`,
                                        order_id: orderId,
                                        handler: function (response) {
                                            // Razorpay has accepted entry; rely on webhook to finalize payment status.
                                            setCard((prev) => ({ ...prev, payment_status: 'pending' }));
                                            setStatusMessage('Payment processed by Razorpay. Awaiting webhook confirmation...');
                                            setError(null);

                                            // Optionally try immediate verify for quicker UX, fallback to webhook
                                            axios
                                                .post('/api/payments/verify', {
                                                    razorpay_order_id: response.razorpay_order_id,
                                                    razorpay_payment_id: response.razorpay_payment_id,
                                                    razorpay_signature: response.razorpay_signature,
                                                    vcard_id: card.id,
                                                })
                                                .then((verifyRes) => {
                                                    if (verifyRes.data && verifyRes.data.success) {
                                                        setCard((prev) => ({ ...prev, payment_status: 'paid' }));
                                                        setStatusMessage('Payment verified successfully. Redirecting...');
                                                        navigate('/my-card');
                                                    } else {
                                                        setStatusMessage('Payment received, waiting for webhook to mark as complete.');
                                                    }
                                                })
                                                .catch((err) => {
                                                    console.error('Immediate verification failed, waiting for webhook', err);
                                                    setStatusMessage('Waiting for webhook confirmation from Razorpay...');
                                                });
                                        },
                                        modal: {
                                            ondismiss: async function () {
                                                // If modal dismissed, optionally notify server
                                            },
                                        },
                                        prefill: {
                                            name: card.name || '',
                                        },
                                        notes: {
                                            vcard_id: card.id,
                                        },
                                    };

                                    const rzp = new window.Razorpay(options);
                                    rzp.open();

                                } catch (err) {
                                    console.error(err);
                                    setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
                                } finally {
                                    setProcessing(false);
                                }
                            }}
                            disabled={processing}
                        >
                            {processing ? 'Processing…' : 'Pay Now'}
                        </button>
                    </div>

                    {error && (
                        <p className="text-danger mt-3">{error}</p>
                    )}
                    {statusMessage && (
                        <p className="text-success mt-3">{statusMessage}</p>
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
