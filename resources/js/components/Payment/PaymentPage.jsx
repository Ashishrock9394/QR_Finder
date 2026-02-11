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
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [showCardModal, setShowCardModal] = useState(false);
    const [showUPIModal, setShowUPIModal] = useState(false);
    const [showQRLock, setShowQRLock] = useState(false);
    const [upiId, setUpiId] = useState('');
    const FIXED_AMOUNT = 29;
    const MERCHANT_UPI = import.meta.env.VITE_MERCHANT_UPI || 'testqrfinder@ybl';

    const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [cardType, setCardType] = useState('');
    const [cardValid, setCardValid] = useState(false);
    const [upiValid, setUpiValid] = useState(false);

    // Basic card type detection (Visa, Mastercard, Amex, RuPay)
    const detectCardType = (num) => {
        if (!num) return '';
        const v = num.replace(/\s+/g, '');
        if (/^4/.test(v)) return 'Visa';
        if (/^(5[1-5])/.test(v) || /^(2(2[2-9]|[3-6]\d|7[01]|720))/.test(v)) return 'Mastercard';
        if (/^3[47]/.test(v)) return 'Amex';
        if (/^(60|65|81)/.test(v)) return 'RuPay';
        return 'Unknown';
    };

    // Luhn algorithm for card validation
    const luhnCheck = (num) => {
        const s = num.replace(/\D/g, '');
        let sum = 0;
        let toggle = false;
        for (let i = s.length - 1; i >= 0; i--) {
            let d = parseInt(s.charAt(i), 10);
            if (toggle) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            toggle = !toggle;
        }
        return s.length > 0 && sum % 10 === 0;
    };

    const verifyUpiId = (id) => {
        if (!id) return false;
        // basic UPI id pattern: localpart@handle
        return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(id);
    };

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            console.log('Razorpay script loaded');
        };
        script.onerror = () => {
            setError('Failed to load Razorpay');
        };
        document.body.appendChild(script);
        
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Fetch card details
    useEffect(() => {
        const fetchCard = async () => {
            try {
                const response = await axios.get(`/api/v-cards`);
                const foundCard = response.data.find(c => c.id === parseInt(cardId));
                if (foundCard) {
                    setCard(foundCard);
                } else {
                    setError('Card not found');
                }
            } catch (err) {
                setError('Failed to load card details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCard();
    }, [cardId]);

    const initializePayment = async () => {
        try {
            setProcessing(true);
            setError(null);

            // Create order
            const orderResponse = await axios.post('/api/payments/create-order', {
                vcard_id: card.id,
                amount: FIXED_AMOUNT,
            });

            if (!orderResponse.data.success) {
                setError('Failed to create payment order');
                setProcessing(false);
                return;
            }

            const { order_id, key_id } = orderResponse.data;

            // Razorpay options
            const options = {
                key: key_id,
                amount: FIXED_AMOUNT * 100, // Amount in paise
                currency: 'INR',
                name: 'QR Finder',
                description: `Payment for Virtual Card - ${card.name}`,
                order_id: order_id,
                method: paymentMethod,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyResponse = await axios.post(
                            '/api/payments/verify',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                vcard_id: card.id,
                            }
                        );

                        if (verifyResponse.data.success) {
                            setError(null);
                            alert('Payment successful! Your card is now visible.');
                            navigate('/my-card');
                        } else {
                            setError('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        setError('Payment verification failed');
                    }
                    setProcessing(false);
                },
                theme: {
                    color: '#b34e75',
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                    }
                }
            };

            // Load Razorpay script
            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                setError('Razorpay SDK not loaded. Please refresh the page.');
                setProcessing(false);
            }

        } catch (err) {
            console.error('Payment initialization error:', err);
            setError('Failed to initialize payment');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading card details...</p>
                </div>
            </div>
        );
    }

    if (!card) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Card not found'}</p>
                    <button
                        onClick={() => navigate('/my-card')}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        Back to Cards
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light d-flex align-items-center justify-content-center py-5">
            <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="card-body p-5 text-center">
                    {/* Header */}
                    <h2 className="fw-bold mb-3">Select Payment Method</h2>
                    <p className="text-muted mb-4">Choose how you want to pay</p>

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <i className="bi bi-exclamation-circle me-2"></i>
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                        </div>
                    )}

                    {/* Amount Display */}
                    <div className="card bg-primary text-white mb-4 p-4">
                        <p className="mb-1 small">Amount to Pay</p>
                        <h3 className="m-0">₹{FIXED_AMOUNT.toFixed(2)}</h3>
                    </div>

                    {/* Payment Methods */}
                    <div className="d-grid gap-3">
                        {/* Card Payment */}
                        <button
                            className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center gap-3 py-3"
                            onClick={() => {
                                setPaymentMethod('card');
                                setShowCardModal(true);
                            }}
                            style={{ borderWidth: '2px' }}
                        >
                            <i className="bi bi-credit-card fs-5"></i>
                            <div className="text-start">
                                <div className="fw-bold">Debit/Credit Card</div>
                                <small className="text-muted">Visa, Mastercard, RuPay</small>
                            </div>
                        </button>

                        {/* UPI Payment */}
                        <button
                            className="btn btn-outline-primary btn-lg d-flex align-items-center justify-content-center gap-3 py-3"
                            onClick={() => {
                                setPaymentMethod('upi');
                                setShowUPIModal(true);
                            }}
                            style={{ borderWidth: '2px' }}
                        >
                            <i className="bi bi-phone fs-5"></i>
                            <div className="text-start">
                                <div className="fw-bold">UPI</div>
                                <small className="text-muted">Google Pay, PhonePe, Paytm</small>
                            </div>
                        </button>
                    </div>

                    {/* Back Button */}
                    <button
                        className="btn btn-light mt-4 w-100"
                        onClick={() => navigate('/my-card')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>Back to Cards
                    </button>

                    {/* Footer */}
                    <hr className="my-4" />
                    <p className="small text-muted mb-0">
                        <i className="bi bi-shield-lock me-1"></i>Secured by Razorpay
                    </p>
                </div>
            </div>

            {/* Card Payment Modal */}
            {showCardModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-credit-card me-2"></i>Card Payment
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCardModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-3 text-center">
                                    <i className="bi bi-credit-card text-primary" style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}></i>
                                    <h5 className="mb-1">Enter Card Details</h5>
                                    <p className="text-muted small">We will detect card type and validate number</p>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Card Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardDetails.number}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCardDetails(prev => ({ ...prev, number: val }));
                                            const t = detectCardType(val);
                                            setCardType(t);
                                            setCardValid(luhnCheck(val));
                                        }}
                                        disabled={processing}
                                    />
                                    <div className="mt-2 small text-muted">Type: <strong>{cardType || '—'}</strong> • Valid: <strong>{cardValid ? 'Yes' : 'No'}</strong></div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Name on Card</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={cardDetails.name}
                                            onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                                            disabled={processing}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Expiry (MM/YY)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="12/25"
                                            value={cardDetails.expiry}
                                            onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                                            disabled={processing}
                                        />
                                    </div>
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">CVV</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="123"
                                            value={cardDetails.cvv}
                                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                                            disabled={processing}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCardModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (!cardValid) {
                                            setError('Please enter a valid card number');
                                            return;
                                        }
                                        // proceed to payment using Razorpay (card)
                                        initializePayment();
                                        setShowCardModal(false);
                                    }}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : `Pay ₹${FIXED_AMOUNT.toFixed(2)}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* UPI Payment Modal */}
            {showUPIModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-phone me-2"></i>UPI Payment
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowUPIModal(false);
                                        setShowQRLock(false);
                                        setUpiId('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="text-center mb-4">
                                    <p className="text-muted">Amount: <strong>₹{FIXED_AMOUNT.toFixed(2)}</strong></p>
                                </div>

                                {/* QR Code Section */}
                                <div className="text-center mb-4 p-4 bg-light rounded" style={{ position: 'relative' }}>
                                    {/* Generate QR for merchant UPI and amount */}
                                    {/** If QR is locked we show the QR with overlay lock */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(`upi://pay?pa=${MERCHANT_UPI}&pn=QR%20Finder&am=${FIXED_AMOUNT}&cu=INR`)}`}
                                        alt="UPI QR"
                                        style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto' }}
                                    />
                                    <p className="text-muted mt-2 small">Scan with any UPI app to pay</p>

                                    {/* Lock Icon on QR (overlay) */}
                                    {showQRLock && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                backgroundColor: 'rgba(0,0,0,0.65)',
                                                color: 'white',
                                                padding: '0.75rem',
                                                borderRadius: '50%',
                                                width: '64px',
                                                height: '64px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <i className="bi bi-lock-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => setShowQRLock(!showQRLock)}
                                        >
                                            {showQRLock ? 'Unlock QR' : 'Pay via QR'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => {
                                                // generate a dynamic UPI string for scanning using merchant UPI
                                                setShowQRLock(true);
                                            }}
                                        >
                                            Refresh QR
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="text-center mb-4">
                                    <span className="badge bg-light text-dark">OR</span>
                                </div>

                                {/* UPI ID Input */}
                                <div className="mb-4">
                                    <label className="form-label">Enter UPI ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="yourname@paytm"
                                        value={upiId}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setUpiId(v);
                                            const ok = verifyUpiId(v.trim());
                                            setUpiValid(ok);
                                            if (ok) setError(null);
                                        }}
                                        disabled={processing}
                                    />
                                    <small className={`d-block mt-1 ${upiValid ? 'text-success' : 'text-muted'}`}>
                                        {upiValid ? 'Valid UPI ID' : 'e.g., yourname@okhdfcbank, mobile@googlepay'}
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowUPIModal(false);
                                        setShowQRLock(false);
                                        setUpiId('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (!showQRLock && !upiValid) {
                                            setError('Please enter a valid UPI ID or unlock the QR code');
                                            return;
                                        }
                                        initializePayment();
                                        setShowUPIModal(false);
                                        setShowQRLock(false);
                                    }}
                                    disabled={processing || (!showQRLock && !upiValid)}
                                >
                                    {processing ? 'Processing...' : `Proceed to Pay ₹${FIXED_AMOUNT.toFixed(2)}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
