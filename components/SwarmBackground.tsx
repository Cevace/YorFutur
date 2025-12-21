'use client';

import React from 'react';

// CSS Animation Definitions
const AnimationStyles = () => (
    <style dangerouslySetInnerHTML={{
        __html: `
    /* Blob 1: De Leider - Grote, trage, diagonale beweging */
    @keyframes swarm-lead {
      0% { transform: translate(0%, 0%) scale(1); }
      25% { transform: translate(20%, 10%) scale(1.2); }
      50% { transform: translate(-10%, 20%) scale(0.9); }
      75% { transform: translate(-20%, -10%) scale(1.1); }
      100% { transform: translate(0%, 0%) scale(1); }
    }

    /* Blob 2: De Volger - Snellere, cirkelvormige beweging */
    @keyframes swarm-follow {
      0% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
      33% { transform: translate(30%, -20%) rotate(120deg) scale(1.3); }
      66% { transform: translate(-20%, 30%) rotate(240deg) scale(0.8); }
      100% { transform: translate(0%, 0%) rotate(360deg) scale(1); }
    }

    /* Blob 3: De Dwarsligger - Horizontale sweep voor contrast */
    @keyframes swarm-cross {
      0% { transform: translateX(-20%) translateY(-10%) scale(1); opacity: 0.4; }
      50% { transform: translateX(20%) translateY(10%) scale(1.4); opacity: 0.6; }
      100% { transform: translateX(-20%) translateY(-10%) scale(1); opacity: 0.4; }
    }

    /* Blob 4: Diepte - Pulseert op de achtergrond */
    @keyframes swarm-deep {
      0% { transform: scale(0.8) translate(0,0); opacity: 0.3; }
      50% { transform: scale(1.5) translate(10%, -10%); opacity: 0.5; }
      100% { transform: scale(0.8) translate(0,0); opacity: 0.3; }
    }

    /* Noise Texture voor de 'Film Grain' look */
    .swarm-noise-overlay {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    }
  `}} />
);

interface SwarmBackgroundProps {
    position?: 'top' | 'bottom' | 'center';
    intensity?: 'subtle' | 'normal' | 'intense';
}

export default function SwarmBackground({
    position = 'center',
    intensity = 'subtle'
}: SwarmBackgroundProps) {

    // Opacity based on intensity
    const opacityMap = {
        subtle: { blob1: 0.4, blob2: 0.35, blob3: 0.3, blob4: 0.25 },
        normal: { blob1: 0.5, blob2: 0.45, blob3: 0.4, blob4: 0.35 },
        intense: { blob1: 0.7, blob2: 0.6, blob3: 0.5, blob4: 0.4 }
    };

    const opacity = opacityMap[intensity];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <AnimationStyles />

            {/* Texture Layer: Film grain effect */}
            <div className="absolute inset-0 swarm-noise-overlay z-20 mix-blend-soft-light"></div>

            {/* BLOB 1: ORANJE KERN (Cevace Orange) */}
            <div
                className="absolute w-[80vw] h-[80vw] md:w-[800px] md:h-[800px] rounded-full mix-blend-screen filter blur-[80px]"
                style={{
                    background: 'radial-gradient(circle, #d97706 0%, transparent 70%)',
                    top: position === 'top' ? '-20%' : position === 'center' ? '10%' : 'auto',
                    bottom: position === 'bottom' ? '-20%' : 'auto',
                    left: '-10%',
                    opacity: opacity.blob1,
                    animation: 'swarm-lead 35s infinite ease-in-out'
                }}
            />

            {/* BLOB 2: LILA TEGENHANGER (Contrastkleur) */}
            <div
                className="absolute w-[70vw] h-[70vw] md:w-[700px] md:h-[700px] rounded-full mix-blend-screen filter blur-[90px]"
                style={{
                    background: 'radial-gradient(circle, #9A8C98 0%, transparent 70%)',
                    top: position === 'top' ? '20%' : 'auto',
                    bottom: position === 'bottom' ? '10%' : position === 'center' ? '5%' : '10%',
                    right: '-10%',
                    opacity: opacity.blob2,
                    animation: 'swarm-follow 40s infinite linear reverse'
                }}
            />

            {/* BLOB 3: GOUDEN ACCENT (Snelle beweging) */}
            <div
                className="absolute w-[50vw] h-[50vw] md:w-[500px] md:h-[500px] rounded-full mix-blend-screen filter blur-[60px]"
                style={{
                    background: 'radial-gradient(circle, #fbbf24 0%, transparent 60%)',
                    top: position === 'top' ? '40%' : position === 'center' ? '30%' : 'auto',
                    bottom: position === 'bottom' ? '40%' : 'auto',
                    left: '40%',
                    opacity: opacity.blob3,
                    animation: 'swarm-cross 25s infinite ease-in-out'
                }}
            />

            {/* BLOB 4: DIEP ORANJE (Achtergrond diepte) */}
            <div
                className="absolute w-[60vw] h-[60vw] md:w-[600px] md:h-[600px] rounded-full mix-blend-overlay filter blur-[100px]"
                style={{
                    background: '#b45309',
                    top: '10%',
                    right: '20%',
                    opacity: opacity.blob4,
                    animation: 'swarm-deep 30s infinite ease-in-out'
                }}
            />
        </div>
    );
}
