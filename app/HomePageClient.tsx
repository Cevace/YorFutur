'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, Check, Star,
    Linkedin, Brain, Target, Users, Play,
    Sparkles, Quote, Calendar,
    Instagram, Facebook, Twitter, Mail, Menu, X,
    ChevronDown
} from 'lucide-react';
import SwarmBackground from '@/components/SwarmBackground';
import { PricingTable } from '@/components/pricing';
import { getAllPlans } from '@/lib/pricing/plans';
import { Plan, BillingCycle } from '@/lib/pricing/types';

// --- TYPES ---
interface BlogPost {
    slug: string;
    title: string;
    category: string;
    excerpt: string;
    coverImage: string | null;
    publishedDate: string | null;
}

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSection {
    headline: string;
    items: FAQItem[];
}

interface HeroData {
    badgeText: string;
    headlinePart1: string;
    headlineHighlight: string;
    headlinePart2: string;
    description: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    heroImage: string | null;
    socialProofText: string;
}

interface Testimonial {
    slug: string;
    name: string;
    role: string;
    company: string;
    quote: string;
    photo: string | null;
    rating: number;
}

interface PricingCardData {
    slug: string;
    name: string;
    description: string;
    price: string;
    priceYearly: string;
    period: string;
    features: string[];
    highlight: boolean;
    buttonText: string;
    buttonLink: string;
}

interface FeatureData {
    slug: string;
    title: string;
    description: string;
    icon: string;
}

interface SectionConfig {
    type: string;
    enabled: boolean;
    sectionTitle: string;
}

interface QuoteData {
    text: string;
    author: string;
    role: string;
    photo: string | null;
}

interface HomePageClientProps {
    blogPosts: BlogPost[];
    faqSections: FAQSection[];
    heroData: HeroData;
    testimonials: Testimonial[];
    pricingCards: PricingCardData[];
    features: FeatureData[];
    layout: SectionConfig[];
    companyLogos: string[];
    quoteData: QuoteData;
}

// --- STYLES & ANIMATIONS ---
const Styles = () => (
    <style dangerouslySetInnerHTML={{
        __html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Spectral:ital,wght@0,400;1,400&display=swap');
    
    :root {
      --font-inter: 'Inter', sans-serif;
      --color-navy: #22223B;
      --color-orange: #d97706;
    }

    /* ANIMATIONS */
    @keyframes drift {
      0% { transform: translate(0, 0); }
      50% { transform: translate(20px, -20px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes float-card {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes scroll-x {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(-400px * 7 - 1.5rem * 7)); } 
    }

    .animate-drift {
      animation: drift 20s ease-in-out infinite;
    }
    .animate-marquee {
      animation: marquee 40s linear infinite;
    }
    .animate-float {
      animation: float-card 4s ease-in-out infinite;
    }

    /* GLASSMORPHISM CLASSES */
    .glass-premium {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    .glass-light {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    
    /* UTILS */
    .text-gradient-gold {
      background: linear-gradient(135deg, #d97706 0%, #fbbf24 50%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .noise-bg {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
    }
    .animate-scroll-blog {
      animation: scroll-x 60s linear infinite;
    }
    .animate-scroll-blog:hover {
      animation-play-state: paused;
    }
    
    /* SHAPES */
    .btn-pill { border-radius: 9999px; }
  `}} />
);

// --- DATA ---
const FOOTER_LINKS = {
    navigatie: [
        { name: 'Home', href: '/' },
        { name: 'Success Stories', href: '/success-stories' },
        { name: 'Over ons', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/contact' }
    ],
    juridisch: [
        { name: 'Privacybeleid', href: '/privacy' },
        { name: 'Algemene Voorwaarden', href: '/terms' },
        { name: 'Cookieverklaring', href: '/cookies' }
    ]
};

// --- HELPER FUNCTIONS ---
function formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- COMPONENTS ---

const Hero = ({ data }: { data: HeroData }) => (
    <section className="relative min-h-[85vh] flex items-center bg-[#22223B] overflow-hidden pt-20 pb-16">
        <SwarmBackground position="top" intensity="intense" />
        <div className="absolute inset-0 noise-bg opacity-40 z-[1]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            <div className="lg:col-span-6 space-y-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 btn-pill glass-premium border border-[#d97706]/30 animate-float mx-auto lg:mx-0">
                    <div className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse"></div>
                    <span className="text-[10px] font-semibold text-[#C9ADA7] tracking-widest uppercase">{data.badgeText}</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight text-white">
                    {data.headlinePart1} <br />
                    <span className="text-gradient-gold relative inline-block">
                        {data.headlineHighlight}
                    </span> <br />
                    {data.headlinePart2}
                </h1>

                <p className="text-lg md:text-xl text-[#9A8C98] max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                    {data.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                    <NextLink href={data.ctaPrimaryLink} className="px-8 md:px-10 py-4 bg-[#d97706] text-white btn-pill font-semibold text-sm uppercase tracking-wider hover:bg-orange-500 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-3 group hover:-translate-y-1">
                        {data.ctaPrimaryText} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </NextLink>
                    <button className="px-8 md:px-10 py-4 glass-premium text-white btn-pill font-semibold text-sm uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-3 hover:-translate-y-1">
                        <Play size={18} className="text-[#d97706] fill-[#d97706]" /> {data.ctaSecondaryText}
                    </button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-[#4A4E69] font-medium pt-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#22223B] bg-slate-800 overflow-hidden relative shadow-lg">
                                <img src={`https://i.pravatar.cc/150?img=${i + 10}`} className="w-full h-full object-cover opacity-90" alt="Member" />
                            </div>
                        ))}
                    </div>
                    <div>
                        <div className="flex gap-1 text-[#d97706] mb-1">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                        </div>
                        <p className="text-[#9A8C98]">{data.socialProofText}</p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-6 relative h-[600px] lg:h-[700px] hidden lg:block">
                <div className="absolute inset-0 overflow-hidden border border-white/10 transform rotate-2 hover:rotate-0 transition-all duration-700 shadow-2xl bg-[#1a1c30] rounded-[20px]">
                    <img src={data.heroImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop'} alt="Professional" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#22223B] via-[#22223B]/20 to-transparent"></div>
                </div>

                <div className="absolute top-24 -left-12 glass-premium p-6 border-l-4 border-l-[#d97706] animate-float z-20 w-72 backdrop-blur-3xl rounded-[20px]">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#d97706]/20 p-3 rounded-full text-[#d97706]"><Target size={24} /></div>
                        <div>
                            <div className="text-white text-sm font-semibold">Ready for Big 4</div>
                            <div className="text-[#C9ADA7] text-xs">Match Score: 98%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#F2E9E4]"></div>
    </section>
);

const ReviewCard = ({ name, role, company, text, img }: { name: string; role: string; company: string; text: string; img: string }) => (
    <div className="glass-light p-8 min-w-[350px] mx-6 hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-xl group bg-white border border-[#C9ADA7]/20 flex flex-col h-full rounded-[20px]">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                <img src={img} alt={name} className="w-full h-full object-cover" />
            </div>
            <div>
                <h4 className="text-[#22223B] font-semibold text-sm">{name}</h4>
                <div className="text-[#4A4E69] text-xs font-medium uppercase tracking-wide">{role} @ <span className="text-[#d97706]">{company}</span></div>
            </div>
        </div>
        <div className="mb-4 flex">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="text-[#d97706] fill-[#d97706] mr-0.5" />)}
        </div>
        <p className="text-[#4A4E69] text-sm leading-relaxed italic">&ldquo;{text}&rdquo;</p>
    </div>
);

const SocialProof = ({ testimonials, title, logos }: { testimonials: Testimonial[]; title: string; logos: string[] }) => (
    <section id="succesverhalen" className="bg-[#F2E9E4] py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h2 className="text-4xl font-semibold text-[#22223B] mb-4">{title || 'Join the Elite.'}</h2>
                <p className="text-[#4A4E69] text-lg font-medium">Professionals die Cevace gebruiken werken bij de top.</p>
            </div>
            <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-50 grayscale">
                {logos.length > 0 ? (
                    logos.map((logo, i) => (
                        <img key={i} src={logo} alt="Company logo" className="h-8 max-w-[200px] object-contain" />
                    ))
                ) : (
                    ['ASML', 'Deloitte', 'Google', 'KPMG'].map(logo => (
                        <span key={logo} className="text-2xl font-semibold text-[#22223B] font-serif tracking-tighter">{logo}</span>
                    ))
                )}
            </div>
        </div>
        <div className="relative w-full overflow-hidden">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                {[...testimonials, ...testimonials].map((t, i) => (
                    <ReviewCard
                        key={i}
                        name={t.name.replace(/-/g, ' ')}
                        role={t.role}
                        company={t.company}
                        text={t.quote}
                        img={t.photo || `https://i.pravatar.cc/150?img=${i + 10}`}
                    />
                ))}
            </div>
        </div>
    </section>
);

const iconMap: Record<string, React.ElementType> = {
    brain: Brain,
    linkedin: Linkedin,
    users: Users,
    target: Target,
    sparkles: Sparkles,
};

const FeaturesSection = ({ features, title, quoteData }: { features: FeatureData[]; title: string; quoteData: QuoteData }) => (
    <section id="methode" className="py-32 bg-[#F2E9E4] relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20">
                <div className="h-1 w-16 bg-[#C9ADA7] mb-6 rounded-full"></div>
                <h2 className="text-5xl font-semibold text-[#22223B] mb-6">{title || 'Tools of the Trade.'}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="space-y-16">
                    {features.map((f, i) => {
                        const IconComponent = iconMap[f.icon] || Brain;
                        return (
                            <div key={i} className="flex gap-8 group cursor-pointer">
                                <div className="w-16 h-16 bg-white border border-[#C9ADA7] rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover:border-[#d97706] transition-all duration-300 group-hover:scale-110 shadow-sm">
                                    <IconComponent size={28} className="text-[#22223B] group-hover:text-[#d97706] transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#22223B] mb-2 group-hover:text-[#d97706] transition-colors">
                                        {f.title.replace(/-/g, ' ')}
                                    </h3>
                                    <p className="text-[#4A4E69] leading-relaxed text-lg">{f.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="relative h-full min-h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d97706] to-[#22223B] rounded-[2.5rem] transform rotate-3 opacity-10"></div>
                    <div className="relative bg-white p-12 shadow-2xl border border-[#C9ADA7]/20 h-full flex flex-col justify-center items-center text-center rounded-[20px]">
                        <Quote size={48} className="text-[#d97706] mb-8 opacity-40" />
                        <p className="text-2xl md:text-3xl text-[#22223B] leading-relaxed mb-8" style={{ fontFamily: "'Spectral', serif" }}>
                            &ldquo;{quoteData.text}&rdquo;
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                <img src={quoteData.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'} alt={quoteData.author} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold uppercase tracking-widest text-[#22223B]">{quoteData.author}</div>
                                <div className="text-xs text-[#d97706] font-semibold">{quoteData.role}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const BlogSection = ({ posts }: { posts: BlogPost[] }) => (
    <section id="tips-info" className="py-24 bg-[#fffcf8] overflow-hidden">
        {/* Header with max-width */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-end">
                <div>
                    <h2 className="text-5xl font-semibold text-[#22223B] mb-4">Tips en informatie</h2>
                    <p className="text-[#4A4E69] text-lg">Praktische tips en inzichten voor je carrière en sollicitatie.</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
                    <button className="px-6 py-2 btn-pill font-semibold transition-all bg-[#22223B] text-white shadow-lg">Alles</button>
                    <button className="px-6 py-2 btn-pill font-semibold transition-all bg-white text-[#4A4E69] border border-[#C9ADA7]/30 hover:border-[#d97706] hover:text-[#d97706]">Sollicitatie Tips</button>
                    <button className="px-6 py-2 btn-pill font-semibold transition-all bg-white text-[#4A4E69] border border-[#C9ADA7]/30 hover:border-[#d97706] hover:text-[#d97706]">CV Schrijven</button>
                </div>
            </div>
        </div>

        {/* Full-width carousel */}
        <div className="relative w-full overflow-hidden pb-10">
            <div className="flex gap-8 animate-scroll-blog w-[200%] hover:[animation-play-state:paused] pl-6">
                {[...posts, ...posts].map((post, i) => (
                    <NextLink key={i} href={post.slug} className="flex-shrink-0 w-[350px] md:w-[400px] group cursor-pointer block">
                        <div className="bg-white overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-[#C9ADA7]/10 h-full flex flex-col rounded-[20px]">
                            <div className="relative h-60 bg-gray-200 overflow-hidden">
                                {post.coverImage ? (
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#22223B] to-[#4A4E69] flex items-center justify-center">
                                        <span className="text-white/50 text-6xl font-bold">C</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 btn-pill text-xs font-semibold text-[#22223B] uppercase tracking-wider">{post.category}</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs font-semibold text-[#d97706] mb-3 uppercase tracking-wider">
                                    <Calendar size={12} /> {formatDate(post.publishedDate)}
                                </div>
                                <h3 className="text-[20px] font-sans font-semibold text-[#22223B] mb-3 line-clamp-2 group-hover:text-[#d97706] transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#22223B] group-hover:translate-x-2 transition-transform pt-4">
                                    Lees artikel <ArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </NextLink>
                ))}
            </div>
        </div>

        {/* CTA button with max-width */}
        <div className="text-center mt-8">
            <NextLink href="/blog" className="inline-block bg-[#d97706] text-white px-10 py-4 btn-pill font-semibold hover:bg-orange-600 transition-all transform hover:-translate-y-1 shadow-[0_10px_30px_-10px_rgba(217,119,6,0.5)]">
                Bekijk alle posts
            </NextLink>
        </div>
    </section>
);

const FAQAccordion = ({ sections }: { sections: FAQSection[] }) => {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <section id="faq" className="py-24 bg-[#F2E9E4]">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="h-1 w-16 bg-[#c9ada7] mb-6 rounded-full mx-auto"></div>
                    <h2 className="text-5xl font-semibold text-[#22223B] mb-4">Veelgestelde Vragen</h2>
                    <p className="text-[#4A4E69] text-lg">Alles wat je moet weten over Cevace.</p>
                </div>

                <div className="space-y-8">
                    {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex}>
                            <h3 className="text-lg font-semibold text-[#22223B] mb-2 uppercase tracking-wider">{section.headline}</h3>
                            <div className="w-24 h-1 bg-[#c9ada7] rounded-full mb-4" />
                            <div className="space-y-3">
                                {section.items.map((item, itemIndex) => {
                                    const itemId = `${sectionIndex}-${itemIndex}`;
                                    const isOpen = openItem === itemId;

                                    return (
                                        <div
                                            key={itemIndex}
                                            className="bg-white border border-[#C9ADA7]/20 overflow-hidden transition-all"
                                            style={{ borderRadius: '16px' }}
                                        >
                                            <button
                                                onClick={() => toggleItem(itemId)}
                                                className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-[#22223B]">{item.question}</span>
                                                <ChevronDown
                                                    size={20}
                                                    className={`text-[#d97706] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            <div
                                                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                            >
                                                <div className="px-6 pb-6 text-[#4A4E69] leading-relaxed">
                                                    {item.answer}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <NextLink href="/landing/faq" className="text-[#d97706] font-semibold hover:underline">
                        Bekijk alle vragen →
                    </NextLink>
                </div>
            </div>
        </section>
    );
};

const PricingCardComponent = ({ tier, description, price, period, features, featured = false, buttonText, buttonLink }: {
    tier: string;
    description?: string;
    price: string;
    period: string;
    features: string[];
    featured?: boolean;
    buttonText: string;
    buttonLink: string;
}) => (
    <div className={`relative p-8 border transition-all duration-500 group flex flex-col h-full rounded-[20px] ${featured ? 'bg-[#1a1c30] border-[#d97706] scale-105 z-10 shadow-[0_0_60px_-15px_rgba(217,119,6,0.3)]' : 'glass-premium border-white/5 hover:border-white/20 hover:bg-white/5'}`}>
        {featured && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#d97706] to-[#b45309] text-white text-[10px] font-semibold px-4 py-1.5 btn-pill uppercase tracking-[0.2em] shadow-lg shadow-orange-900/50">
                Meest gekozen
            </div>
        )}

        <div className="mb-6 pt-4">
            <h3 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${featured ? 'text-[#d97706]' : 'text-white'}`}>
                {tier} {featured && <Sparkles size={16} className="animate-pulse" />}
            </h3>
            {description && (
                <p className="text-sm text-[#9A8C98] mb-4">{description}</p>
            )}
            <div className="flex items-baseline gap-1">
                <span className="text-5xl font-semibold text-white tracking-tighter">{price}</span>
                <span className="text-sm text-[#9A8C98] font-medium">{period}</span>
            </div>
        </div>

        <ul className="space-y-5 mb-10 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#C9ADA7] group-hover:text-white transition-colors">
                    <Check size={16} className={`shrink-0 mt-0.5 ${featured ? 'text-[#d97706]' : 'text-[#4A4E69]'}`} />
                    <span>{f}</span>
                </li>
            ))}
        </ul>

        <NextLink href={buttonLink} className={`w-full py-4 btn-pill text-[16px] capitalize transition-all hover:-translate-y-1 text-center block ${featured ? 'bg-[#d97706] text-white hover:bg-orange-500 shadow-lg shadow-orange-900/40' : 'bg-white/5 text-white hover:bg-white/10'}`}>
            {buttonText}
        </NextLink>
    </div>
);

const PricingSection = ({ title }: { cards?: PricingCardData[]; title: string }) => {
    const router = useRouter();
    const plans = getAllPlans();

    const handleSelectPlan = (plan: Plan, billingCycle: BillingCycle) => {
        if (plan.name === 'free') {
            router.push('/dashboard');
            return;
        }
        router.push(`/pricing?plan=${plan.name}&cycle=${billingCycle}`);
    };

    return (
        <section id="membership" className="py-32 bg-[#22223B] relative overflow-hidden">
            <div className="absolute inset-0 noise-bg opacity-30"></div>
            <SwarmBackground position="center" intensity="intense" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-semibold text-white mb-4 tracking-tight">{title || 'Investeer in je toekomst'}</h2>
                    <p className="text-xl text-[#C9ADA7] max-w-2xl mx-auto">
                        Kies het plan dat bij jou past. Alle plannen starten met een <strong>7-daagse gratis</strong> Executive proefperiode.
                    </p>
                </div>

                <PricingTable
                    plans={plans}
                    onSelectPlan={handleSelectPlan}
                />
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="text-white py-20 border-t border-white/5" style={{ backgroundColor: '#22223B' }}>
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-6">
                    <NextLink href="/">
                        <Image src="/logo/Cevace-wit-logo.svg" alt="Cevace" width={140} height={36} className="h-9 w-auto" />
                    </NextLink>
                    <p className="text-gray-400 leading-relaxed text-sm font-medium">
                        Jouw partner in het vinden van de perfecte baan. Wij combineren persoonlijke coaching met slimme technologie.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group"><Linkedin size={18} /></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group"><Instagram size={18} /></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group"><Facebook size={18} /></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#d97706] transition-colors duration-300 group"><Twitter size={18} /></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-6 text-white">Navigatie</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        {FOOTER_LINKS.navigatie.map(link => (
                            <li key={link.name}>
                                <NextLink className="text-gray-400 hover:text-[#d97706] transition-colors" href={link.href}>{link.name}</NextLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-6 text-white">Juridisch</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        {FOOTER_LINKS.juridisch.map(link => (
                            <li key={link.name}>
                                <NextLink className="text-gray-400 hover:text-[#d97706] transition-colors" href={link.href}>{link.name}</NextLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-6 text-white">Contact</h4>
                    <ul className="space-y-4 text-gray-400 text-sm font-medium">
                        <li className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-[#d97706] flex-shrink-0" />
                            <span>info@cevace.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
                <p>© 2025 Cevace. Alle rechten voorbehouden.</p>
                <p>Designed with ❤️ for Your Future</p>
            </div>
        </div>
    </footer>
);

export default function HomePageClient({ blogPosts, faqSections, heroData, testimonials, pricingCards, features, layout, companyLogos, quoteData }: HomePageClientProps) {
    const renderSection = (section: SectionConfig) => {
        if (!section.enabled) return null;

        switch (section.type) {
            case 'hero':
                return <Hero key="hero" data={heroData} />;
            case 'features':
                return <FeaturesSection key="features" features={features} title={section.sectionTitle} quoteData={quoteData} />;
            case 'testimonials':
                return <SocialProof key="testimonials" testimonials={testimonials} title={section.sectionTitle} logos={companyLogos} />;
            case 'blog':
                return <BlogSection key="blog" posts={blogPosts} />;
            case 'faq':
                return <FAQAccordion key="faq" sections={faqSections} />;
            case 'pricing':
                return <PricingSection key="pricing" cards={pricingCards} title={section.sectionTitle} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#22223B] font-sans selection:bg-[#d97706] selection:text-white overflow-x-hidden">
            <Styles />
            {layout.map((section, index) => (
                <React.Fragment key={`${section.type}-${index}`}>
                    {renderSection(section)}
                </React.Fragment>
            ))}
            <Footer />
        </div>
    );
}
