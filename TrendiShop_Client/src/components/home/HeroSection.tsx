"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';

/* The two banners the shop ships with. An admin can replace the left rail from
   Site Content → Hero Slides; the right panel falls back to this until one is
   set. Both are served through next/image, which is what keeps a 1.6 MB PNG
   from reaching the visitor as a 1.6 MB PNG. */
const DEFAULT_HERO_MAIN = '/banners/hero-main.png';
const DEFAULT_HERO_SIDE = '/banners/hero-side.png';

/* Natural sizes: 1672×941 and 1254×1254. Splitting the row's width in the same
   1.777 : 1 ratio as their aspect ratios makes the two panels come out exactly
   the same height — including once the gap is subtracted, since both shrink by
   the same proportion.
   Both heights are then trimmed by the same ~9% (941 → 856, 1 → 0.91) so the
   band sits a little shorter; the images stay object-cover / object-center and
   just crop a hair top and bottom. Scaling both by one factor keeps them level. */
const MAIN_ASPECT = '1672 / 856';
const SIDE_ASPECT = '100 / 91';

interface HeroSlide {
    _id?: string;
    imageUrl: string;
    link?: string;
    active?: boolean;
    order?: number;
}

const HeroSection: React.FC = () => {
    const { data: siteRes } = useGetSiteContentQuery({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const slides: HeroSlide[] = useMemo(() => {
        const rawSlides: HeroSlide[] = siteRes?.data?.heroSlides;
        if (Array.isArray(rawSlides) && rawSlides.length > 0) {
            const activeOnly = rawSlides
                .filter((s) => s && s.active !== false && s.imageUrl)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            if (activeOnly.length > 0) return activeOnly;
        }
        return [{ imageUrl: DEFAULT_HERO_MAIN, link: '/products' }];
    }, [siteRes]);

    /* The side panel takes the second configured slide when there is one, so an
       admin can drive both halves from the same list. */
    const sidePanel = useMemo(() => {
        const raw: HeroSlide[] = siteRes?.data?.heroSide;
        const first = Array.isArray(raw) ? raw.find((s) => s && s.active !== false && s.imageUrl) : null;
        return first || { imageUrl: DEFAULT_HERO_SIDE, link: '/products?category=phones' };
    }, [siteRes]);

    const total = slides.length;
    const safeIndex = currentIndex < total ? currentIndex : 0;

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => ((prev < total ? prev : 0) + 1) % total);
    }, [total]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => ((prev < total ? prev : 0) - 1 + total) % total);
    }, [total]);

    useEffect(() => {
        if (total <= 1 || isHovered) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [total, isHovered, nextSlide]);

    const currentSlide = slides[safeIndex] || slides[0];

    return (
        <section className="w-full">
            {/* .shell, the same column the header uses, so the banners' edges sit
                directly under the header's. The wider .container used before grew
                with the viewport and overhung it on a large monitor. */}
            <div className="shell py-4 sm:py-5">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[1.777fr_1fr]">

                    {/* ── Left: the wide rail ───────────────────────────────── */}
                    <div
                        className="hero-panel group relative"
                        style={{ aspectRatio: MAIN_ASPECT }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Link
                            href={currentSlide.link || '/products'}
                            className="block h-full w-full"
                            aria-label="Featured offer"
                        >
                            <Image
                                key={currentSlide.imageUrl}
                                src={currentSlide.imageUrl}
                                alt="Featured offer"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 64vw"
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                        </Link>

                        {total > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
                                    aria-label="Previous slide"
                                    className="hero-arrow left-3"
                                >
                                    <FiChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
                                    aria-label="Next slide"
                                    className="hero-arrow right-3"
                                >
                                    <FiChevronRight className="h-5 w-5" />
                                </button>

                                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 backdrop-blur-xs">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
                                            aria-label={`Go to slide ${idx + 1}`}
                                            className={`cursor-pointer rounded-full transition-all duration-300 ${idx === safeIndex ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/50 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Right: the square panel ───────────────────────────── */}
                    <Link
                        href={sidePanel.link || '/products'}
                        className="hero-panel group relative block"
                        style={{ aspectRatio: SIDE_ASPECT }}
                        aria-label="Featured range"
                    >
                        <Image
                            src={sidePanel.imageUrl}
                            alt="Featured range"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 36vw"
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
