// resources/js/components/Auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        mobile: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await register(formData);
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: response.message,
                confirmButtonText: 'OK',
                allowOutsideClick: false
            }).then(() => {
                navigate('/login');
            });

        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: 'Something went wrong. Please try again.'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 mb-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow border-0">
                        <div className="card-body p-5">

                            <div className="text-center mb-4">
                                <h3 className="fw-bold">Create Account</h3>
                                <p className="text-muted">Join QR Finder today</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Mobile</label>
                                        <input
                                            type="text"
                                            name="mobile"
                                            className="form-control"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password[0]}</div>}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            className="form-control"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Account Type</label>
                                    <div className="d-flex gap-4">
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="user"
                                                checked={formData.role === 'user'}
                                                onChange={handleChange}
                                                className="form-check-input"
                                            />
                                            <label className="form-check-label">User</label>
                                        </div>

                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="agent"
                                                checked={formData.role === 'agent'}
                                                onChange={handleChange}
                                                className="form-check-input"
                                            />
                                            <label className="form-check-label">QR Agent</label>
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p>
                                    Already have an account?
                                    <Link to="/login" className="ms-1">Login</Link>
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
