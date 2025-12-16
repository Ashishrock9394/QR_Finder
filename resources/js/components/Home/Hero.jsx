// resources/js/components/Home/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="text-light py-5" style={{
    background: "linear-gradient(180deg,rgba(71, 16, 16, 1) 0%, rgba(106, 137, 172, 1) 100%)"
}}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <h1 className="display-4 fw-bold mb-4">
                            Never Lose Your Belongings Again
                        </h1>
                        <p className="lead mb-4">
                            QR-based smart tracking system that helps you recover lost items quickly and securely. 
                            Join thousands of satisfied users who trust QR Finder.
                        </p>
                        <div className="d-flex gap-3">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Get Started
                            </Link>
                            <Link to="/about" className="btn btn-outline-light btn-lg">
                                Learn More
                            </Link>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="text-center">
                            <i className="bi bi-qr-code-scan" style={{ fontSize: '300px', opacity: 0.8 }}></i>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;