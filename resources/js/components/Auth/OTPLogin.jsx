// resources/js/components/Auth/OTPLogin.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OTPLogin = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post('/api/send-otp', { email });
            setMessage('OTP sent successfully! Check your email.');
            setStep(2);
        } catch (error) {
            setMessage('Error sending OTP. Please try again.');
        }
        setLoading(false);
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await axios.post('/api/verify-otp', { email, otp });
            const { user, token } = response.data;
            
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/dashboard');
        } catch (error) {
            setMessage('Invalid or expired OTP. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="container mt-4 mb-4">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow border-0">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h3 className="card-title fw-bold">
                                    {step === 1 ? 'Sign in with OTP' : 'Enter OTP Code'}
                                </h3>
                                <p className="text-muted">
                                    {step === 1 
                                        ? 'Enter your email to receive a one-time password' 
                                        : 'Enter the 6-digit code sent to your email'
                                    }
                                </p>
                            </div>

                            {message && (
                                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mb-4`}>
                                    {message}
                                </div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={handleSendOTP}>
                                    <div className="mb-4">
                                        <label className="form-label">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-100 py-2"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Sending OTP...
                                            </>
                                        ) : (
                                            'Send OTP'
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP}>
                                    <div className="mb-4">
                                        <label className="form-label">Enter OTP</label>
                                        <input 
                                            type="text" 
                                            className="form-control text-center" 
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required 
                                            placeholder="000000"
                                            maxLength={6}
                                            style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                        />
                                        <div className="form-text text-center">
                                            Enter the 6-digit code sent to {email}
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn btn-success w-100 py-2 mb-3"
                                        disabled={loading || otp.length !== 6}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify OTP'
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary w-100"
                                        onClick={() => {
                                            setStep(1);
                                            setMessage('');
                                            setOtp('');
                                        }}
                                    >
                                        Change Email
                                    </button>
                                </form>
                            )}

                            <div className="text-center mt-4">
                                <p className="mb-2">
                                    <Link to="/login" className="text-decoration-none">
                                        ← Back to regular login
                                    </Link>
                                </p>
                                <p className="mb-0">
                                    Don't have an account? <Link to="/register" className="text-decoration-none">Sign up</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPLogin;