// resources/js/components/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'agent',
        mobile: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { register } = useAuth(); // Use the useAuth hook here
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear errors when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await register(formData);
            navigate('/dashboard');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Registration failed. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow border-0">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h3 className="card-title fw-bold">Create Account</h3>
                                <p className="text-muted">Join QR Finder today</p>
                            </div>

                            {errors.general && (
                                <div className="alert alert-danger mb-4">
                                    {errors.general}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input 
                                                type="text" 
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required 
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Mobile Number</label>
                                            <input 
                                                type="tel" 
                                                className="form-control"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input 
                                        type="email" 
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required 
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Password</label>
                                            <input 
                                                type="password" 
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required 
                                            />
                                            {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Confirm Password</label>
                                            <input 
                                                type="password" 
                                                className="form-control"
                                                name="password_confirmation"
                                                value={formData.password_confirmation}
                                                onChange={handleChange}
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Account Type</label>
                                    <div>
                                        <div className="form-check form-check-inline">
                                            <input 
                                                className="form-check-input"
                                                type="radio"
                                                name="role"
                                                id="roleAgent"
                                                value="agent"
                                                checked={formData.role === 'agent'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="roleAgent">
                                                QR Agent
                                            </label>
                                        </div>
                                    </div>
                                    <small className="form-text text-muted">
                                        {formData.role === 'agent' 
                                            ? 'Agents can issue QR codes and help recover items' 
                                            : 'Users can register items and receive notifications'
                                        }
                                    </small>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 py-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="mb-0">
                                    Already have an account? <Link to="/login" className="text-decoration-none">Sign in</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;