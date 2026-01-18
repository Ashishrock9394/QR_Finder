// resources/js/components/Home/Homepage.jsx
import React from 'react';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Reviews from './Reviews';
import Contact from './Contact';
import Footer from '../Layout/Footer';

const Homepage = () => {
    return (
        <div>
            <Hero />
            <Features />
            <About />
            <Reviews />
            <Contact />
        </div>
    );
};

export default Homepage;