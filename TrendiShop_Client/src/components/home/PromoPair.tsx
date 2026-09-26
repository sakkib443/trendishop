"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Two wide promo banners side by side.
 *
 * Both sources in a pair share one aspect ratio, so equal-width columns come
 * out the same height without a fixed pixel value. An admin can replace either
 * from Site Content → Promo Pair; until then the defaults ship with the shop.
 *
 * Used twice on the home page: once under Flash Sale (the pre-book pair) and
 * once above Popular Products (the Online Exclusive pair), the second passing
 * its own banners and its own site-content key.
 */

export interface PromoBanner {
    imageUrl: string;
    link?: string;
    alt?: string;
}

const DEFAULTS: PromoBanner[] = [
    {
        imageUrl: '/products/img/12757-e663cad8-d8d3-496d-b99a-4f08c2d4666c.webp',
        link: '/products?category=phones',
        alt: 'iPhone Duo — pre-book now',
    },
    {
        imageUrl: '/products/img/12795-704c1d20-a287-42f9-8075-3b217b69b1ab.webp',
        link: '/products?category=phones',
        alt: 'iPhone 18 Pro Series — pre-book now',
    },
];

interface PromoPairProps {
    /** Falls back to the pre-book pair. */
    banners?: PromoBanner[];
    /** Natural ratio of the sources, e.g. '640 / 237'. */
    aspect?: string;
    /** Which siteContent array an admin can override this pair from. */
    contentKey?: string;
    /** Vertical rhythm — the second pair sits tighter against the row below it. */
    className?: string;
}

const PromoPair: React.FC<PromoPairProps> = ({
    banners: fallback = DEFAULTS,
    aspect = '1080 / 590',
    contentKey = 'promoPair',
    className = 'py-6 sm:py-8',
}) => {
    const { data: siteRes } = useGetSiteContentQuery({});

    const raw: any[] = siteRes?.data?.[contentKey];
    const banners = Array.isArray(raw) && raw.filter((b) => b?.imageUrl).length >= 2
        ? raw.filter((b) => b?.imageUrl).slice(0, 2)
        : fallback;

    return (
        <section className="w-full">
            <div className={`container mx-auto ${className}`}>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    {banners.map((b, i) => (
                        <Link
                            key={b.imageUrl || i}
                            href={b.link || '/products'}
                            className="hero-panel group relative block"
                            style={{ aspectRatio: aspect }}
                            aria-label={b.alt || 'Promotion'}
                        >
                            <Image
                                src={b.imageUrl}
                                alt={b.alt || 'Promotion'}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PromoPair;

/** The Online Exclusive pair that sits above Popular Products. 640×237 each. */
export const ONLINE_EXCLUSIVE: PromoBanner[] = [
    {
        imageUrl: '/banners/online-exclusive-laptops.webp',
        link: '/products?category=laptops',
        alt: 'Online Exclusive — laptops',
    },
    {
        imageUrl: '/banners/online-exclusive-phones.webp',
        link: '/products?category=phones',
        alt: 'Online Exclusive — phones',
    },
];
