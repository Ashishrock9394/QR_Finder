// resources/js/components/Home/Features.jsx
import React from 'react';

const Features = () => {
    const features = [
        {
            icon: 'bi-qr-code',
            title: 'QR Code Tracking',
            description: 'Each item gets a unique QR code for easy identification and recovery.'
        },
        {
            icon: 'bi-shield-check',
            title: 'Secure & Private',
            description: 'Your contact information is protected and only shared when needed.'
        },
        {
            icon: 'bi-lightning',
            title: 'Quick Recovery',
            description: 'Fast and efficient item return process with instant notifications.'
        },
        {
            icon: 'bi-phone',
            title: 'Mobile Friendly',
            description: 'Access your items and manage your account from any device.'
        }
    ];

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="display-5 fw-bold">Why Choose QR Finder?</h2>
                    <p className="lead">Powerful features that make item recovery simple and reliable</p>
                </div>
                <div className="row g-4">
                    {features.map((feature, index) => (
                        <div key={index} className="col-md-6 col-lg-3">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center">
                                    <i className={`bi ${feature.icon} text-primary`} style={{ fontSize: '3rem' }}></i>
                                    <h5 className="card-title mt-3">{feature.title}</h5>
                                    <p className="card-text">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;