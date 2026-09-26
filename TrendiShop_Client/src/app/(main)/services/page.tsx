import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FiPackage, FiTruck, FiGlobe, FiShield, FiBox, FiHeadphones, FiArrowRight } from 'react-icons/fi';

export const metadata: Metadata = {
    title: "Our Services",
    description: "End-to-end sourcing and shipping: bring any product from China, USA, UK and more to your door in Bangladesh — sourcing, freight, customs and warehousing, all handled for you.",
    alternates: { canonical: "/services" },
};

const services = [
    {
        id: 'sourcing',
        icon: <FiPackage size={26} />,
        title: 'Product Sourcing',
        desc: "Can't find it in our store? We source any product directly from verified manufacturers and marketplaces abroad — at the best price, genuine every time.",
    },
    {
        id: 'shipping',
        icon: <FiTruck size={26} />,
        title: 'Shipping & Logistics',
        desc: 'End-to-end shipping from China, USA, UK and beyond to Bangladesh — by air, sea and express, with real-time tracking the whole way.',
    },
    {
        id: 'freight',
        icon: <FiGlobe size={26} />,
        title: 'Freight Forwarding',
        desc: 'We handle all documentation, transit and consolidation so your order moves smoothly from the source warehouse to your hands.',
    },
    {
        id: 'customs',
        icon: <FiShield size={26} />,
        title: 'Customs Clearance',
        desc: 'Full customs support — your goods clear smoothly with all the right paperwork and compliance, no surprises at the border.',
    },
    {
        id: 'warehousing',
        icon: <FiBox size={26} />,
        title: 'Warehousing & QC',
        desc: 'Secure storage and quality inspection at our source and Bangladesh warehouses before anything ships to you.',
    },
    {
        id: 'support',
        icon: <FiHeadphones size={26} />,
        title: 'Dedicated Support',
        desc: 'A real team you can reach any time for orders, tracking and questions — we stay with you from request to doorstep.',
    },
];

const PAGE_BG =
    'radial-gradient(60% 50% at 90% -5%, rgba(250,204,21,0.06), transparent 70%),' +
    'radial-gradient(50% 42% at 0% 18%, rgba(245,158,11,0.035), transparent 72%),' +
    'linear-gradient(180deg, #FFFFFF 0%, #FFFEF9 55%, #FFFCF2 100%)';
const HERO_BG = 'linear-gradient(135deg, #1c1a17 0%, #262019 55%, #2e2114 100%)';
const HERO_GLOW = 'radial-gradient(50% 120% at 88% 0%, rgba(203,132,59,0.28), transparent 60%)';

export default function ServicesPage() {
    return (
        <div className="min-h-screen" style={{ background: PAGE_BG }}>

            {/* Hero */}
            <div style={{ background: HERO_BG }} className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: HERO_GLOW }} />
                <div className="relative max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
                        style={{ background: 'rgba(203,132,59,0.18)', color: 'var(--hd-gold)', border: '1px solid rgba(222,180,117,0.35)' }}>
                        What we do
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                        Our <span style={{ color: 'var(--hd-gold)' }}>Services</span>
                    </h1>
                    <p className="text-white/60 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                        From sourcing to your doorstep — we handle every step of bringing quality products
                        into Bangladesh, so you don&apos;t have to.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-2 text-sm text-white/40">
                        <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white/80">Services</span>
                    </div>
                </div>
            </div>

            {/* Services grid */}
            <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {services.map((s) => (
                        <div
                            key={s.id}
                            id={s.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group scroll-mt-28"
                        >
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                                style={{ background: 'rgba(var(--color-primary-rgb),0.10)', color: 'var(--color-primary)' }}
                            >
                                {s.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-12 rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden" style={{ background: HERO_BG }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: HERO_GLOW }} />
                    <div className="relative">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Looking for something we don&apos;t stock?</h2>
                        <p className="text-sm text-white/60 mb-7 max-w-lg mx-auto">
                            Send us a photo and the details — our sourcing team will find it, quote the best price,
                            and bring it right to your door.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/quotations"
                                className="inline-flex items-center justify-center gap-2 text-white px-8 py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(140deg, var(--color-primary), var(--color-primary-dark))' }}
                            >
                                Request a Product <FiArrowRight />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white border border-white/20 hover:bg-white/10 transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
