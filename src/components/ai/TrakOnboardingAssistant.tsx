import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrakOnboarding, TRAK_ONBOARDING_STEPS } from '@/context/TrakOnboardingContext';
import { X, ChevronRight, ChevronLeft, Bot, MousePointerClick, Minus, ChevronUp } from 'lucide-react';

const MODULE_GROUPS = [...new Set(TRAK_ONBOARDING_STEPS.map(s => s.module))];

const TrakOnboardingAssistant: React.FC = () => {
    const { isActive, currentStep, currentStepIndex, totalSteps, nextStep, prevStep, dismiss } = useTrakOnboarding();
    const [minimized, setMinimized] = useState(false);

    const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
    const currentModule = currentStep?.module ?? '';

    return (
        <AnimatePresence>
            {isActive && (
                <>
                    {/* ── Minimized pill (purple) ─────────────────────── */}
                    {minimized && (
                        <motion.button
                            key="trak-onboarding-pill"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                            onClick={() => setMinimized(false)}
                            className="fixed bottom-6 right-6 z-[110] flex items-center gap-2.5 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                boxShadow: '0 4px 24px 0 rgba(124,58,237,0.45)'
                            }}
                        >
                            <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <span className="text-sm font-bold">Asistente Trak</span>
                            <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-semibold">
                                {currentStepIndex + 1}/{totalSteps}
                            </span>
                            <ChevronUp size={16} className="text-purple-200" />
                        </motion.button>
                    )}

                    {/* ── Full widget ─────────────────────────────────── */}
                    {!minimized && (
                        <motion.div
                            key="trak-onboarding-widget"
                            initial={{ opacity: 0, y: 60, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 60, scale: 0.92 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                            className="fixed bottom-6 right-6 z-[110] w-[22rem] rounded-2xl overflow-hidden border border-purple-500/30"
                            style={{
                                background: '#0F1624',
                                boxShadow: '0 8px 40px 0 rgba(124,58,237,0.30)'
                            }}
                        >
                            {/* ── Header ─────────────────────────────── */}
                            <div
                                className="px-4 py-3 text-white flex justify-between items-center relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' }}
                            >
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-violet-300/10 rounded-full blur-xl pointer-events-none" />

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                                        <Bot size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm leading-tight">Asistente IA · Trak</p>
                                        <p className="text-[10px] text-purple-200 font-semibold uppercase tracking-widest">
                                            {currentModule}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 relative z-10">
                                    <span className="text-xs text-purple-200 font-semibold mr-1">
                                        {currentStepIndex + 1}/{totalSteps}
                                    </span>
                                    <button onClick={() => setMinimized(true)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" title="Minimizar">
                                        <Minus size={15} />
                                    </button>
                                    <button onClick={dismiss} className="p-1.5 hover:bg-white/20 rounded-full transition-colors" title="Cerrar tutorial">
                                        <X size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* ── Progress bar ───────────────────────── */}
                            <div className="h-1 bg-white/10 w-full">
                                <motion.div
                                    className="h-1 rounded-full"
                                    style={{ background: 'linear-gradient(90deg, #a78bfa, #7c3aed)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                />
                            </div>

                            {/* ── Body ───────────────────────────────── */}
                            <div className="p-5">
                                {/* Module pills */}
                                <div className="flex gap-1 mb-4 flex-wrap">
                                    {MODULE_GROUPS.map((mod) => {
                                        const moduleSteps = TRAK_ONBOARDING_STEPS.filter(s => s.module === mod);
                                        const lastIdx = TRAK_ONBOARDING_STEPS.indexOf(moduleSteps[moduleSteps.length - 1]);
                                        const isCurrentMod = mod === currentModule;
                                        const isPast = lastIdx < currentStepIndex;
                                        return (
                                            <span
                                                key={mod}
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                                    isCurrentMod
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : isPast
                                                        ? 'bg-purple-900/50 text-purple-300 border-purple-700'
                                                        : 'bg-white/5 text-white/30 border-white/10'
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
                                    className="text-base font-bold text-white mb-2 flex items-center gap-2 leading-tight"
                                >
                                    <span className="text-xl">{currentStep.icon}</span>
                                    {currentStep.title}
                                </motion.h4>

                                {/* Description */}
                                <motion.p
                                    key={currentStepIndex + '-desc'}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25, delay: 0.05 }}
                                    className="text-sm text-gray-400 leading-relaxed mb-4"
                                >
                                    {currentStep.description}
                                </motion.p>

                                {/* Action Hint */}
                                <motion.div
                                    key={currentStepIndex + '-hint'}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: 0.1 }}
                                    className="rounded-xl p-3 mb-4 flex gap-2 items-start border border-purple-500/30"
                                    style={{ background: 'rgba(124,58,237,0.12)' }}
                                >
                                    <MousePointerClick size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-purple-200 leading-relaxed font-medium">
                                        {currentStep.actionHint}
                                    </p>
                                </motion.div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between">
                                    <button onClick={dismiss} className="text-xs text-white/30 hover:text-white/60 font-semibold transition-colors">
                                        Terminar tutorial
                                    </button>
                                    <div className="flex gap-2">
                                        {currentStepIndex > 0 && (
                                            <button
                                                onClick={prevStep}
                                                className="p-2 rounded-lg border border-white/10 text-white/50 hover:bg-white/5 transition-colors"
                                            >
                                                <ChevronLeft size={15} />
                                            </button>
                                        )}
                                        <button
                                            onClick={nextStep}
                                            className="px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                                        >
                                            {currentStepIndex === totalSteps - 1 ? '¡Finalizar! 🎉' : 'Siguiente'}
                                            {currentStepIndex < totalSteps - 1 && <ChevronRight size={15} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </AnimatePresence>
    );
};

export default TrakOnboardingAssistant;
