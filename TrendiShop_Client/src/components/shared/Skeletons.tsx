"use client";

import React from 'react';

/**
 * Reusable loading skeletons that shape-match the real cards/rows so nothing
 * jumps when the API data arrives. Used in place of fake/demo/fallback data:
 * while a query is loading these render; once it resolves the real content
 * takes over; if it comes back empty the caller renders an empty state (or
 * nothing) — never placeholder products or categories.
 *
 * The shimmer keyframes are defined INLINE via a <style> tag rather than in
 * globals.css: this project is on Tailwind v4, which drops rules appended to
 * the global stylesheet. Each grid/row renders the <style> once.
 *
 * All skeleton markup is aria-hidden; callers set aria-busy on the region.
 */

/* Neutral light-gray shimmer. Named uniquely so it can't collide with any
   other keyframes in the app. */
const ShimmerStyle = () => (
    <style>{`
        .tsk {
            position: relative;
            overflow: hidden;
            background: #ececec;
            background-image: linear-gradient(90deg, #ececec 0%, #f5f5f5 40%, #f5f5f5 60%, #ececec 100%);
            background-size: 400% 100%;
            animation: tsk-shimmer 1.4s ease-in-out infinite;
        }
        @keyframes tsk-shimmer {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
            .tsk { animation: none; }
        }
    `}</style>
);

/* ── Product card skeleton ────────────────────────────────────────────────
   Matches NewProductCard: a square picture, a one-line name, a price row and
   the cart-button + icon shelf. Same 24px outer radius and hairline ring. */
export const ProductCardSkeleton: React.FC = () => (
    <div
        aria-hidden
        className="flex h-full flex-col overflow-hidden bg-white"
        style={{
            borderRadius: 24,
            boxShadow: '0 1px 2px rgba(15, 23, 42, .05), 0 0 0 1px rgba(15, 23, 42, .06)',
        }}
    >
        <div className="tsk w-full" style={{ aspectRatio: '1 / 1' }} />
        <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-4">
            <div className="tsk h-4 w-4/5 rounded-md" />
            <div className="flex items-center gap-2">
                <div className="tsk h-5 w-20 rounded-md" />
                <div className="tsk h-3 w-12 rounded-md" />
            </div>
            <div className="mt-1 flex items-center gap-2">
                <div className="tsk h-9 flex-1 rounded-lg" />
                <div className="tsk h-9 w-9 rounded-lg" />
            </div>
        </div>
    </div>
);

interface GridProps {
    count?: number;
    className?: string;
}

/** A grid of product-card skeletons. Defaults to the 5-up layout the home
    product rows use; pass `className` to match a different grid. */
export const ProductCardSkeletonGrid: React.FC<GridProps> = ({
    count = 10,
    className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6',
}) => (
    <div className={className} aria-busy="true">
        <ShimmerStyle />
        {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
        ))}
    </div>
);

/* ── Category tile skeleton ───────────────────────────────────────────────
   Matches CategoryExpertise's tiles: a rounded square with a label line. */
export const CategoryTileSkeleton: React.FC = () => (
    <div aria-hidden className="flex flex-col items-center gap-2.5">
        <div className="tsk w-full" style={{ aspectRatio: '1 / 1', borderRadius: 20 }} />
        <div className="tsk h-3 w-16 rounded-md" />
    </div>
);

/** A grid of category-tile skeletons matching CategoryExpertise's grid. */
export const CategoryTileSkeletonGrid: React.FC<GridProps> = ({
    count = 7,
    className = 'grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4',
}) => (
    <div className={className} aria-busy="true">
        <ShimmerStyle />
        {Array.from({ length: count }).map((_, i) => (
            <CategoryTileSkeleton key={i} />
        ))}
    </div>
);

/* ── Category pill skeleton ───────────────────────────────────────────────
   For the header category rail — a short rounded pill. */
export const CategoryPillSkeleton: React.FC<{ width?: number }> = ({ width = 92 }) => (
    <div aria-hidden className="tsk h-7 rounded-[6px] shrink-0" style={{ width }} />
);

/** A row of category-pill skeletons for the desktop header category bar.
    Widths vary a little so it reads as real category names rather than a bar. */
export const CategoryPillSkeletonRow: React.FC<{ count?: number }> = ({ count = 8 }) => {
    const widths = [88, 104, 76, 96, 84, 112, 80, 100];
    return (
        <div className="flex items-center gap-1" aria-busy="true">
            <ShimmerStyle />
            {Array.from({ length: count }).map((_, i) => (
                <CategoryPillSkeleton key={i} width={widths[i % widths.length]} />
            ))}
        </div>
    );
};

/** Stacked lines for the mobile category dropdown list. */
export const CategoryListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div className="space-y-1.5 px-3 py-2" aria-busy="true">
        <ShimmerStyle />
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="tsk h-4 rounded-md" style={{ width: `${70 + (i % 3) * 10}%` }} />
        ))}
    </div>
);
