// resources/js/components/Home/Reviews.jsx
import React from 'react';

const Reviews = () => {
    const reviews = [
        {
            name: 'Sarah Johnson',
            role: 'Frequent Traveler',
            rating: 5,
            comment: 'QR Finder saved my laptop when I left it at the airport. Got it back within hours!',
            avatar: 'SJ'
        },
        {
            name: 'Mike Chen',
            role: 'Business Owner',
            rating: 4,
            comment: 'As an agent, I\'ve helped return over 50 items. The system is incredibly efficient.',
            avatar: 'MC'
        },
        {
            name: 'Emily Davis',
            role: 'Student',
            rating: 5,
            comment: 'Lost my backpack with all my study materials. Thanks to QR Finder, everything was returned safely.',
            avatar: 'ED'
        }
    ];

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="display-6 fw-bold">What Our Users Say</h2>
                    <p className="lead">Join thousands of happy customers who trust QR Finder</p>
                </div>
                <div className="row g-4">
                    {reviews.map((review, index) => (
                        <div key={index} className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-primary text-white rounded-circle p-2 me-3">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <h6 className="mb-0">{review.name}</h6>
                                            <small className="text-muted">{review.role}</small>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <i key={i} className="bi bi-star-fill text-warning"></i>
                                        ))}
                                    </div>
                                    <p className="card-text">"{review.comment}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Reviews;