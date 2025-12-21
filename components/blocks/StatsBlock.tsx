'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
    value: string;
    label: string;
}

interface StatsBlockProps {
    data: {
        stats: readonly Stat[];
    };
}

function CountUpNumber({ endValue }: { endValue: string }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    // Extract numeric value and suffix (e.g., "31+" -> 31 and "+")
    const numericMatch = endValue.match(/(\d+)/);
    const targetNumber = numericMatch ? parseInt(numericMatch[0]) : 0;
    const suffix = endValue.replace(/\d+/, '');

    // Intersection Observer to trigger animation when visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [isVisible]);

    // Counter animation
    useEffect(() => {
        if (!isVisible) return;

        const duration = 2000; // 2 seconds
        const steps = 60; // 60 fps
        const increment = targetNumber / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;

            if (currentStep >= steps) {
                setCount(targetNumber);
                clearInterval(timer);
            } else {
                // Easing function for smooth animation
                const progress = currentStep / steps;
                const easeOut = 1 - Math.pow(1 - progress, 3); // cubic ease-out
                setCount(Math.floor(targetNumber * easeOut));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [isVisible, targetNumber]);

    return (
        <div ref={elementRef} className="text-4xl md:text-5xl font-bold text-cevace-orange mb-2">
            {count}{suffix}
        </div>
    );
}

export default function StatsBlock({ data }: StatsBlockProps) {
    const { stats } = data;
    return (
        <section className="py-16 bg-cevace-blue text-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
                    {stats.map((stat, index) => (
                        <div key={index} className="p-4">
                            <CountUpNumber endValue={stat.value} />
                            <div className="text-sm md:text-base text-gray-300 uppercase tracking-wider font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
