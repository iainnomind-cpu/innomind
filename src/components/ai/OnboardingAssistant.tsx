import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding, ONBOARDING_STEPS } from '@/context/OnboardingContext';
import { X, ChevronRight, ChevronLeft, Bot, Sparkles, MousePointerClick } from 'lucide-react';

// Group steps by module for the progress dots
const MODULE_GROUPS = [...new Set(ONBOARDING_STEPS.map(s => s.module))];

const OnboardingAssistant: React.FC = () => {
    const { isActive, currentStep, currentStepIndex, totalSteps, nextStep, prevStep, dismiss } = useOnboarding();

    const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
    const currentModule = currentStep?.module ?? '';

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    key="onboarding-widget"
                    initial={{ opacity: 0, y: 60, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.92 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                    className="fixed bottom-6 right-6 z-[110] w-[22rem] shadow-2xl rounded-2xl overflow-hidden border border-blue-100 bg-white"
                    style={{ boxShadow: '0 8px 40px 0 rgba(37,99,235,0.18)' }}
                >
                    {/* ── Header ───────────────────────────────────────── */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 px-4 py-3 text-white flex justify-between items-center relative overflow-hidden">
                        {/* decorative blobs */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm leading-tight">Asistente IA · Innomind</p>
                                <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-widest">
                                    {currentModule}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 relative z-10">
                            <span className="text-xs text-blue-200 font-semibold mr-1">
                                {currentStepIndex + 1}/{totalSteps}
                            </span>
                            <button
                                onClick={dismiss}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                                title="Cerrar tutorial"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* ── Progress bar ─────────────────────────────────── */}
                    <div className="h-1 bg-gray-100 w-full">
                        <motion.div
                            className="h-1 bg-blue-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>

                    {/* ── Body ─────────────────────────────────────────── */}
                    <div className="p-5">
                        {/* Step indicator dots by module */}
                        <div className="flex gap-1 mb-4 flex-wrap">
                            {MODULE_GROUPS.map((mod, i) => {
                                const moduleSteps = ONBOARDING_STEPS.filter(s => s.module === mod);
                                const firstIdx = ONBOARDING_STEPS.indexOf(moduleSteps[0]);
                                const lastIdx = ONBOARDING_STEPS.indexOf(moduleSteps[moduleSteps.length - 1]);
                                const isCurrentMod = mod === currentModule;
                                const isPast = lastIdx < currentStepIndex;
                                return (
                                    <span
                                        key={mod}
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                            isCurrentMod
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : isPast
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-400 border-gray-200'
                                        }`}
                                    >
                                        {isPast ? '✓ ' : ''}{mod}
                                    </span>
                                );
                            })}
                        </div>

                        {/* Title */}
                        <motion.h4
                            key={currentStepIndex + '-title'}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2 leading-tight"
                        >
                            <span className="text-xl">{currentStep.icon}</span>
                            {currentStep.title.replace(/[^\x00-\x7F]/g, '').trim() || currentStep.title}
                        </motion.h4>

                        {/* Description */}
                        <motion.p
                            key={currentStepIndex + '-desc'}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: 0.05 }}
                            className="text-sm text-gray-600 leading-relaxed mb-4"
                        >
                            {currentStep.description}
                        </motion.p>

                        {/* Action Hint */}
                        <motion.div
                            key={currentStepIndex + '-hint'}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: 0.1 }}
                            className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex gap-2 items-start"
                        >
                            <MousePointerClick size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                {currentStep.actionHint}
                            </p>
                        </motion.div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={dismiss}
                                className="text-xs text-gray-400 hover:text-gray-600 font-semibold transition-colors"
                            >
                                Omitir todo
                            </button>
                            <div className="flex gap-2">
                                {currentStepIndex > 0 && (
                                    <button
                                        onClick={prevStep}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    {currentStepIndex === totalSteps - 1 ? '¡Finalizar! 🎉' : 'Siguiente'}
                                    {currentStepIndex < totalSteps - 1 && <ChevronRight size={15} />}
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
