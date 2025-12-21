'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import type { AnalysisInsights } from '@/lib/motivation-letter/types';

interface LoadingAnalysisProps {
    insights?: AnalysisInsights;
    onComplete: () => void;
}

export default function LoadingAnalysis({ insights, onComplete }: LoadingAnalysisProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showIcons, setShowIcons] = useState(false);

    // If no insights yet (API still loading), show placeholders
    const steps = insights ? [
        insights.step1,
        insights.step2,
        insights.step3
    ] : [
        'Analyseren van bedrijfscultuur en waarden...',
        'Jouw unieke haakje vinden...',
        'Drie strategische invalshoeken formuleren...'
    ];

    useEffect(() => {
        // Show icons immediately
        setShowIcons(true);

        // Timing for each step (total ~6 seconds)
        const stepTimings = [2000, 2000, 2000]; // 2s per step

        let totalTime = 0;
        stepTimings.forEach((delay, index) => {
            totalTime += delay;
            setTimeout(() => {
                setCurrentStep(index + 1);
            }, totalTime);
        });

        // When all steps done, wait 500ms then call onComplete
        setTimeout(() => {
            onComplete();
        }, totalTime + 500);

    }, [insights, onComplete]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center z-50">
            <div className="max-w-2xl w-full px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Even geduld...
                    </h2>
                    <p className="text-gray-600">
                        We analyseren de vacature en jouw profiel
                    </p>
                </motion.div>

                {/* Icons with Connection */}
                <AnimatePresence>
                    {showIcons && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center gap-12 mb-16"
                        >
                            {/* CV Icon */}
                            <div className="relative">
                                <div className="w-20 h-20 bg-cevace-blue rounded-2xl flex items-center justify-center">
                                    <FileText className="w-10 h-10 text-white" />
                                </div>
                                <motion.div
                                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-cevace-orange rounded-full flex items-center justify-center"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <Sparkles className="w-4 h-4 text-white" />
                                </motion.div>
                            </div>

                            {/* Animated Connection Line */}
                            <motion.div
                                className="flex-1 h-1 bg-gradient-to-r from-cevace-blue via-purple-400 to-cevace-orange rounded-full relative overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.div
                                    className="absolute inset-0 bg-white/30"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                />
                            </motion.div>

                            {/* Vacancy Icon */}
                            <div className="relative">
                                <div className="w-20 h-20 bg-cevace-orange rounded-2xl flex items-center justify-center">
                                    <Building2 className="w-10 h-10 text-white" />
                                </div>
                                <motion.div
                                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-cevace-blue rounded-full flex items-center justify-center"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                >
                                    <Sparkles className="w-4 h-4 text-white" />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Analysis Steps */}
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: currentStep > index ? 1 : 0.3,
                                x: currentStep > index ? 0 : -20
                            }}
                            transition={{ delay: index * 0.3 }}
                            className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${currentStep > index
                                    ? 'bg-white shadow-md border border-green-100'
                                    : 'bg-gray-100/50'
                                }`}
                        >
                            {/* Checkmark or Loading */}
                            <div className="flex-shrink-0 mt-0.5">
                                {currentStep > index ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                    >
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </motion.div>
                                ) : currentStep === index ? (
                                    <motion.div
                                        className="w-6 h-6 border-3 border-cevace-blue border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    />
                                ) : (
                                    <div className="w-6 h-6 border-3 border-gray-300 rounded-full" />
                                )}
                            </div>

                            {/* Step Text */}
                            <div className="flex-1">
                                <p className={`text-sm leading-relaxed ${currentStep > index ? 'text-gray-900 font-medium' : 'text-gray-500'
                                    }`}>
                                    {step}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Progress Bar */}
                <motion.div
                    className="mt-8 h-2 bg-gray-200 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-cevace-blue to-cevace-orange"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
