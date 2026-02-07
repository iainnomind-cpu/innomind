
import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import ComparisonSection from './ComparisonSection';
import SuccessStories from './SuccessStories';
import FAQ from './FAQ';
import ROICalculator from './ROICalculator';
import Footer from './Footer';

export default function LandingPage() {
    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white">
            <Navbar />
            <Hero />
            <ComparisonSection />
            <SuccessStories />
            <FAQ />
            <ROICalculator />
            <Footer />
        </div>
    );
}
