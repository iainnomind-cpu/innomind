
import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import ComparisonSection from './ComparisonSection';
import ChatbotSection from './ChatbotSection';
import SuccessStories from './SuccessStories';
import FAQ from './FAQ';
import ROICalculator from './ROICalculator';
import Footer from './Footer';

export default function LandingPage() {
    return (
        <div className="font-display bg-white dark:bg-slate-900 dark:mesh-gradient-bg text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white relative min-h-screen">
            {/* Global Background Effects (Dark Mode Only) */}
            <div className="hidden dark:block fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
            </div>

            <div className="relative z-10">
                <Navbar />
                <Hero />
                <ComparisonSection />
                <ChatbotSection />
                <SuccessStories />
                <FAQ />
                <ROICalculator />
                <Footer />
            </div>
        </div>
    );
}
