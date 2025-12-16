// resources/js/components/User/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UserProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                mobile: user.mobile || '',
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.put('/api/user/profile', {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile
            });

            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Profile updated successfully!',
                showConfirmButton: true,
                timer: 2000,
                allowOutsideClick: false
            });

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Error updating profile. Please try again.',
                showConfirmButton: true,
                timer: 2000,
                allowOutsideClick: false
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.new_password !== formData.new_password_confirmation) {
            Swal.fire({
                icon: 'warning',
                title: 'Password Mismatch',
                text: 'New passwords do not match.',
                showConfirmButton: true,
                timer: 2000,
                allowOutsideClick: false
            });
            setLoading(false);
            return;
        }

        try {
            await axios.put('/api/user/password', {
                current_password: formData.current_password,
                new_password: formData.new_password,
                new_password_confirmation: formData.new_password_confirmation
            });

            Swal.fire({
                icon: 'success',
                title: 'Password Changed',
                text: 'Password updated successfully!',
                showConfirmButton: true,
                timer: 2000,
                allowOutsideClick: false

            });

            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            }));

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error updating password. Please check your current password.',
                showConfirmButton: true
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="fw-bold mb-4">
                        <i className="bi bi-person-circle me-2"></i>
                        My Profile
                    </h2>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Profile Information</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleProfileUpdate}>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        className="form-control"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Profile'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Change Password</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordUpdate}>
                                <div className="mb-3">
                                    <label className="form-label">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        name="current_password"
                                        value={formData.current_password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control"
                                        name="new_password_confirmation"
                                        value={formData.new_password_confirmation}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-warning"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        'Change Password'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="card mt-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Account Information</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <strong>Account Type:</strong>
                                <span className={`badge ms-2 ${
                                    user.role === 'admin' ? 'bg-danger' :
                                    user.role === 'agent' ? 'bg-primary' : 'bg-secondary'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="mb-3">
                                <strong>Member Since:</strong>
                                <span className="ms-2">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="mb-3">
                                <strong>Email Verified:</strong>
                                <span className={`badge ms-2 ${user.email_verified_at ? 'bg-success' : 'bg-warning'}`}>
                                    {user.email_verified_at ? 'Verified' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default UserProfile;
