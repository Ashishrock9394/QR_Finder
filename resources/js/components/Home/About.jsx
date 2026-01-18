// resources/js/components/Home/About.jsx
import React from 'react';

const About = () => {
    return (
        <section className="py-4 mb-4">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <h2 className="display-6 fw-bold mb-4">About QR Finder</h2>
                        <p className="lead mb-4">
                            QR Finder is a revolutionary platform that connects people who find lost items 
                            with their rightful owners through secure QR code technology.
                        </p>
                        <p className="mb-4">
                            Our mission is to create a world where lost items always find their way back home. 
                            With a network of trusted agents and cutting-edge technology, we've helped recover 
                            thousands of valuable items.
                        </p>
                        <div className="d-flex gap-3">
                            <div className="text-center">
                                <h3 className="text-primary fw-bold">10,000+</h3>
                                <p className="text-muted">Items Recovered</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-primary fw-bold">500+</h3>
                                <p className="text-muted">Trusted Agents</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-primary fw-bold">98%</h3>
                                <p className="text-muted">Success Rate</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="card border-0 shadow">
                            <div className="card-body p-4">
                                <h5 className="card-title">How It Works</h5>
                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3">1</div>
                                    <div>
                                        <h6>Get Your QR Code</h6>
                                        <p className="text-muted mb-0">Register your items with unique QR codes</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3">2</div>
                                    <div>
                                        <h6>Attach to Items</h6>
                                        <p className="text-muted mb-0">Place QR stickers on your valuable items</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start mb-3">
                                    <div className="bg-primary text-white rounded-circle p-2 me-3">3</div>
                                    <div>
                                        <h6>Instant Recovery</h6>
                                        <p className="text-muted mb-0">Anyone finding your item can scan and contact you</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;