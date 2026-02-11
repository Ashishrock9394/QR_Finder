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
    const [amount, setAmount] = useState(0);

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
                    setAmount(foundCard.amount || 29); // Default amount
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
                amount: amount,
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
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                name: 'QR Finder',
                description: `Payment for Virtual Card - ${card.name}`,
                order_id: order_id,
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
                prefill: {
                    email: card?.email || '',
                    contact: card?.mobile || '',
                },
                notes: {
                    vcard_id: card?.id,
                },
                theme: {
                    color: '#3399cc',
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
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Payment for Virtual Card</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="border rounded-lg p-4 mb-4">
                        <h2 className="text-lg font-semibold mb-2">{card.name}</h2>
                        <p className="text-gray-600 text-sm mb-1">
                            <span className="font-medium">Email:</span> {card.email}
                        </p>
                        <p className="text-gray-600 text-sm mb-1">
                            <span className="font-medium">Mobile:</span> {card.mobile}
                        </p>
                        {card.company_name && (
                            <p className="text-gray-600 text-sm">
                                <span className="font-medium">Company:</span> {card.company_name}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount (INR)
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={amount || 0}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAmount(value === '' ? 0 : parseFloat(value) || 0);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={processing}
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-gray-700">
                            <span className="font-bold text-lg text-blue-600">₹{typeof amount === 'number' && !isNaN(amount) ? amount.toFixed(2) : '0.00'}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Make your card visible by completing this payment
                        </p>
                    </div>
                </div>

                <button
                    onClick={initializePayment}
                    disabled={processing || amount <= 0}
                    className={`w-full py-2 px-4 rounded font-medium text-white transition ${
                        processing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : amount > 0
                            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    {processing ? 'Processing...' : `Pay ₹${typeof amount === 'number' && !isNaN(amount) ? amount.toFixed(2) : '0.00'}`}
                </button>

                <button
                    onClick={() => navigate('/my-card')}
                    disabled={processing}
                    className="w-full mt-3 py-2 px-4 rounded font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                    Cancel
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                    Secured by Razorpay Payment Gateway
                </p>
            </div>
        </div>
    );
};

export default PaymentPage;
