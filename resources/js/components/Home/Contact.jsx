// resources/js/components/Home/Contact.jsx
import React, { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        alert('Thank you for your message! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <section className="py-5">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <h2 className="display-6 fw-bold mb-4">Contact Us</h2>
                        <p className="lead mb-4">
                            Have questions? We're here to help. Get in touch with our team.
                        </p>
                        <div className="mb-4">
                            <h5><i className="bi bi-envelope text-primary me-2"></i>Email</h5>
                            <p>support@qrfinder.com</p>
                        </div>
                        <div className="mb-4">
                            <h5><i className="bi bi-telephone text-primary me-2"></i>Phone</h5>
                            <p>+91-9198552556</p>
                        </div>
                        <div className="mb-4">
                            <h5><i className="bi bi-clock text-primary me-2"></i>Support Hours</h5>
                            <p>Monday - Friday: 9:00 AM - 7:00 PM IST</p>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card border-0 shadow">
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="fullname" className="form-label">Full Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="fullname"
                                            id="fullname"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="emailId" className="form-label">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            name="emailId"
                                            id="emailId"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="subject" className="form-label">Subject</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="subject"
                                            id="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="message" className="form-label">Message</label>
                                        <textarea 
                                            className="form-control" 
                                            rows="5"
                                            name="message"
                                            id="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;