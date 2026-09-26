"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetActiveOffersQuery } from '@/redux/api/offerApi';
import { useGetProductsQuery } from '@/redux/api/productApi';
import NewProductCard from '@/components/shared/NewProductCard';

/* eslint-disable @typescript-eslint/no-explicit-any */

const pad = (n: number) => String(n).padStart(2, '0');

const secondsUntil = (end: Date): number =>
    Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));

/** One unit of the countdown. */
const Unit: React.FC<{ v: number }> = ({ v }) => (
    <span className="fs-clock" suppressHydrationWarning>{pad(v)}</span>
);

/* The clock renders zeros on the server and the real time after mount. Reading
   the difference during render would make the server and client HTML disagree
   and React would throw the tree away. */
const Countdown: React.FC<{ endTime: string }> = ({ endTime }) => {
    const [secs, setSecs] = useState<number | null>(null);

    useEffect(() => {
        const end = new Date(endTime);
        setSecs(secondsUntil(end));
        const t = setInterval(() => setSecs(secondsUntil(end)), 1000);
        return () => clearInterval(t);
    }, [endTime]);

    const total = secs ?? 0;
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return (
        <div className="flex items-center gap-1.5">
            <Unit v={d} /><span className="fs-colon">:</span>
            <Unit v={h} /><span className="fs-colon">:</span>
            <Unit v={m} /><span className="fs-colon">:</span>
            <Unit v={s} />
        </div>
    );
};

type Tab = 'newest' | 'popular';

/** Flash Sale — the campaign set in Admin, falling back to anything on sale. */
const FlashSale: React.FC = () => {
    const { data } = useGetActiveOffersQuery({ type: 'flash-sale' });
    const { data: onSaleData } = useGetProductsQuery({ isOnSale: true, limit: 20 });
    const [tab, setTab] = useState<Tab>('popular');

    const offers: any[] = data?.data || [];
    const offer = offers[0];

    const pool: any[] = useMemo(() => {
        const offerItems: any[] = (offer?.products || []).filter(Boolean);
        const onSaleItems: any[] = onSaleData?.data || [];
        return offerItems.length > 0 ? offerItems : onSaleItems;
    }, [offer, onSaleData]);

    /* "Newest" and "Popular" sort the same set rather than re-fetching — the row
       only ever shows five, so a round trip to reorder them would be wasteful. */
    const items = useMemo(() => {
        const sorted = [...pool];
        if (tab === 'popular') sorted.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        else sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        return sorted.slice(0, 5);
    }, [pool, tab]);

    /* With no campaign record configured there is no offer.endTime, and the row
       showed no clock at all. The products carry their own offer window, so the
       soonest one still in the future is what the sale actually ends on. */
    const endsAt = useMemo(() => {
        if (offer?.endTime) return offer.endTime as string;
        const future = pool
            .map((p) => p.offerEndDate)
            .filter(Boolean)
            .map((d: string) => new Date(d).getTime())
            .filter((t: number) => Number.isFinite(t) && t > Date.now())
            .sort((a: number, b: number) => a - b);
        return future.length ? new Date(future[0]).toISOString() : '';
    }, [offer, pool]);

    if (items.length === 0) return null;

    return (
        <section className="fs-band">
            <div className="container mx-auto py-8 sm:py-10">

                {/* ── Heading row ──────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <h2 className="fs-title">{offer?.title || 'Flash Sale'}</h2>
                        {endsAt && <Countdown endTime={endsAt} />}
                    </div>
                    <Link href={offer?.link || '/products?isOnSale=true'} className="fs-seeall">
                        See All
                    </Link>
                </div>

                {/* ── Tabs ─────────────────────────────────────────────────── */}
                <div className="mt-5 flex items-center gap-2">
                    {(['newest', 'popular'] as Tab[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`fs-tab ${tab === t ? 'is-on' : ''}`}
                        >
                            {t === 'newest' ? 'Newest' : 'Popular'}
                        </button>
                    ))}
                </div>

                {/* ── Five cards, the same card the rest of the shop uses ──── */}
                <div className="mt-5 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {items.map((p) => (
                        <NewProductCard
                            key={p._id}
                            product={{
                                id: p._id,
                                slug: p.slug,
                                name: p.name,
                                image: p.thumbnail || p.images?.[0] || '',
                                price: p.price,
                                originalPrice: p.originalPrice || undefined,
                                discount: p.discount,
                                offerStartDate: p.offerStartDate,
                                offerEndDate: p.offerEndDate,
                                stock: p.stock,
                                rating: p.rating,
                                reviews: p.reviewCount,
                                categoryName: p.category?.name || '',
                                priceType: p.priceType || 'negotiable',
                                sold: p.totalSold || 0,
                                reviewCount: p.reviewCount || 0,
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FlashSale;
