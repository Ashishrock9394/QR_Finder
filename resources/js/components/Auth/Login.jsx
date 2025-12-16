// resources/js/components/Auth/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import Swal from 'sweetalert2';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Use the hook here
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData);
            // Login successful, navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            // Backend returned a response
            if (error.response) {
                const { status, data } = error.response;

                if (status === 401) {
                    // Account not approved or invalid credentials
                    Swal.fire({
                        icon: 'warning',
                        title: 'Login Failed',
                        text: data.error || 'Your account is not approved yet.',
                        showConfirmButton: true,
                        allowOutsideClick: false
                    });
                } else if (status === 422) {
                    // Validation errors
                    const messages = Object.values(data.errors)
                        .flat()
                        .join('\n');
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: messages,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: 'Something went wrong. Please try again.',
                        showConfirmButton: true,
                        allowOutsideClick: false
                    });
                }
            } else {
                // Network error
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: 'Unable to connect to the server.',
                    showConfirmButton: true,
                    allowOutsideClick: false
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow border-0">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h3 className="card-title fw-bold">Welcome Back</h3>
                                <p className="text-muted">Sign in to your account</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required 
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required 
                                        placeholder="Enter your password"
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
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>
                            <div className="text-center mt-4">
                                <p className="mb-2">
                                    <Link to="/login/otp" className="text-decoration-none">
                                        Sign in with OTP instead
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

export default Login;
