// resources/js/components/Layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="text-light py-4" style={{
    background: "radial-gradient(circle, rgba(153,104,123,1) 0%, rgba(89,100,117,1) 100%)"
}}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="bi bi-qr-code-scan me-2"></i>
                            QR Finder
                        </h5>
                        <p className="text-light">
                            The smart way to protect and recover your valuable items. 
                            Join our community and never lose your belongings again.
                        </p>
                        <div className="d-flex gap-3">
                            <a href="#" className="text-light"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="text-light"><i className="bi bi-twitter"></i></a>
                            <a href="#" className="text-light"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="text-light"><i className="bi bi-linkedin"></i></a>
                        </div>
                    </div>
                    <div className="col-lg-2 mb-4">
                        <h6 className="fw-bold">Quick Links</h6>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="text-light text-decoration-none">Home</Link></li>
                            <li><Link to="/about" className="text-light text-decoration-none">About</Link></li>
                            <li><Link to="/contact" className="text-light text-decoration-none">Contact</Link></li>
                            <li><Link to="/login" className="text-light text-decoration-none">Login</Link></li>
                        </ul>
                    </div>
                    <div className="col-lg-3 mb-4">
                        <h6 className="fw-bold">Services</h6>
                        <ul className="list-unstyled">
                            <li><a href="#" className="text-light text-decoration-none">Item Registration</a></li>
                            <li><a href="#" className="text-light text-decoration-none">QR Code Generation</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Agent Network</a></li>
                            <li><a href="#" className="text-light text-decoration-none">Recovery Services</a></li>
                        </ul>
                    </div>
                    <div className="col-lg-3 mb-4">
                        <h6 className="fw-bold">Contact Info</h6>
                        <ul className="list-unstyled text-light">
                            <li><i className="bi bi-geo-alt me-2"></i>Sector 62, Noida, India</li>
                            <li><i className="bi bi-envelope me-2"></i>support@qrfinder.com</li>
                            <li><i className="bi bi-phone me-2"></i>+91-9198552556</li>
                        </ul>
                    </div>
                </div>
                <hr className="my-4" />
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <p className="text-light mb-0">&copy; 2025 QR Finder. All rights reserved.</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <a href="#" className="text-light text-decoration-none me-3">Privacy Policy</a>
                        <a href="#" className="text-light text-decoration-none">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;