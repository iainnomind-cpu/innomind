import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding, ONBOARDING_STEPS } from '@/context/OnboardingContext';
import { X, ChevronRight, ChevronLeft, Bot, Sparkles } from 'lucide-react';

const OnboardingAssistant: React.FC = () => {
    const { isActive, currentStep, currentStepIndex, nextStep, prevStep, dismiss } = useOnboarding();

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 right-6 z-[100] w-80 sm:w-96 shadow-2xl rounded-2xl overflow-hidden border border-gray-200/50 bg-white/90 backdrop-blur-xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
                                <Bot size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Asistente IA</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">
                                    Paso {currentStepIndex + 1} de {ONBOARDING_STEPS.length}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={dismiss}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors relative z-10"
                            title="Cerrar tutorial"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                            {currentStep.title}
                            {currentStepIndex === 0 && <Sparkles size={18} className="text-amber-500" />}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            {currentStep.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
                            <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={dismiss}
                                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Omitir todo
                            </button>
                            
                            <div className="flex gap-2">
                                {currentStepIndex > 0 && (
                                    <button
                                        onClick={prevStep}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm shadow-blue-200"
                                >
                                    {currentStepIndex === ONBOARDING_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                                    {currentStepIndex < ONBOARDING_STEPS.length - 1 && <ChevronRight size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OnboardingAssistant;
