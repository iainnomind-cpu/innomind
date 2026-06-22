import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PricingSection from './PricingSection';
import FAQ from './FAQ';
import ROICalculator from './ROICalculator';

export default function PreciosPage() {
    return (
        <div className="font-display bg-white dark:bg-slate-900 text-slate-900 dark:text-white antialiased selection:bg-blue-600 selection:text-white min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 pt-20">
                {/* Hero */}
                <section className="relative pt-24 pb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-800/20 dark:to-slate-900 -z-10" />
                    <div className="absolute top-0 left-1/2 w-[800px] h-[800px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl -z-10 -translate-y-1/2 -translate-x-1/2" />

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
                            Planes transparentes, <br className="hidden sm:block" />
                            <span className="text-blue-600 dark:text-blue-400">sin sorpresas</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Elige la modalidad que mejor se adapte a las necesidades de tu empresa. Desde acceso inmediato hasta desarrollo 100% a la medida.
                        </p>
                    </div>
                </section>

                {/* Main Pricing */}
                <PricingSection standalone={true} />

                <ROICalculator />

                <FAQ />
            </main>

            <Footer />
        </div>
    );
}
