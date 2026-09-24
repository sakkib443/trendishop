"use client";

import React from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useAppSelector } from '@/redux';
import { useWishlist } from '@/hooks/useWishlist';

/**
 * A fixed quick-action rail pinned to the right edge, vertically centred — a
 * persistent shortcut to the wishlist and the cart that follows the page.
 *
 * Styling is deliberately "futuristic": a frosted charcoal glass slab with a
 * thin gold rim, each control lit by a soft radial glow that blooms on hover.
 * Desktop only (md+) — on phones the header row and the bottom nav already carry
 * these, so the rail would just be furniture.
 *
 * Counts come from the same sources the header uses (Redux cart, useWishlist),
 * and are held back until after mount so the server/client trees match.
 */

const QuickActionRail: React.FC = () => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    const cartCount = useAppSelector((s) => s.cart.items.length);
    const { count: wishlistCount } = useWishlist();

    const item = (
        href: string,
        label: string,
        icon: React.ReactNode,
        count: number,
        accent: string,
    ) => (
        <Link
            href={href}
            aria-label={label}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-white/90 transition-all duration-300 hover:-translate-x-0.5"
        >
            {/* Hover glow — a warm bloom rising from the base of the control. */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: 'radial-gradient(circle at 50% 118%, rgba(222,180,117,0.6), transparent 70%)' }}
            />
            {/* Hairline that brightens on hover, so the control reads as lit glass. */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl border border-white/10 transition-colors duration-300 group-hover:border-[rgba(222,180,117,0.55)]"
            />
            <span className="relative transition-transform duration-300 group-hover:scale-110">{icon}</span>

            {/* Slide-in label */}
            <span className="pointer-events-none absolute right-full mr-2.5 translate-x-2 whitespace-nowrap rounded-lg bg-[#221f1c] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                {label}
                <span className="absolute right-[-4px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-4 border-l-4 border-t-4 border-b-transparent border-l-[#221f1c] border-t-transparent" />
            </span>

            {mounted && count > 0 && (
                <span
                    className="absolute -top-1 -left-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2 ring-[#1a1714]"
                    style={{ background: accent }}
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );

    return (
        <div className="fixed right-0 top-1/2 z-[55] hidden -translate-y-1/2 md:block">
            <div
                className="flex flex-col items-center gap-1 rounded-l-2xl p-1.5"
                style={{
                    background: 'linear-gradient(180deg, rgba(38,34,30,0.92), rgba(18,16,14,0.94))',
                    border: '1px solid rgba(222,180,117,0.3)',
                    borderRight: 'none',
                    boxShadow: '-10px 0 34px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                {item('/wishlist', 'Wishlist', <FiHeart size={19} strokeWidth={1.8} style={{ color: '#e9c79b' }} />, wishlistCount, '#cb843b')}
                <span aria-hidden className="h-px w-6 bg-white/10" />
                {item('/cart', 'Cart', <FiShoppingCart size={19} strokeWidth={1.8} />, cartCount, 'var(--color-sale)')}
            </div>
        </div>
    );
};

export default QuickActionRail;
