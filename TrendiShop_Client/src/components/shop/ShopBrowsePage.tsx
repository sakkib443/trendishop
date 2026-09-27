"use client";

import React from 'react';
import Link from 'next/link';
import { FiChevronRight, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import StoreListing from '@/components/shared/StoreListing';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { useGetProductsQuery } from '@/redux/api/productApi';

/* /shop — the storefront's "Browse all" entry point. A premium hero band sits
   above the shared product listing; the numbers and category pills are all
   pulled live from the API (no placeholder/demo content). */

const ShopHero: React.FC = () => {
    const { data: catData } = useGetCategoriesQuery({});
    const { data: prodData } = useGetProductsQuery({ page: 1, limit: 1 });

    // The counts and pills are driven by client-fetched data, which the server
    // does not have — gate them behind mount so the first client render matches
    // the server HTML and React doesn't report a hydration mismatch.
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);

    // Top-level categories only, capped so the pill row never wraps into a wall.
    const categories: any[] = (catData?.data || [])
        .filter((c: any) => !(c?.parent?._id || c?.parent))
        .slice(0, 8);
    const totalProducts: number | undefined = prodData?.meta?.total;

    return (
        <section className="relative overflow-hidden">
            {/* Warm brand gradient base */}
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(118deg, #c23a09 0%, #f15a24 54%, #ff8a4c 100%)' }}
            />
            {/* Soft decorative light, kept behind the content for depth */}
            <div
                className="absolute -top-20 -right-12 w-72 h-72 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,220,190,0.55), transparent 70%)' }}
            />
            <div
                className="absolute -bottom-28 left-[22%] w-80 h-80 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)' }}
            />

            <div className="relative container mx-auto px-4 pt-6 pb-7 sm:pt-8 sm:pb-9">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-[12px] text-white/70 mb-4">
                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    <FiChevronRight size={11} />
                    <span className="text-white font-medium">Shop</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                    <div className="max-w-xl">
                        <h1 className="text-[26px] sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                            Shop All Products
                        </h1>
                        <p className="mt-2 text-sm sm:text-[15px] text-white/85 leading-relaxed">
                            Everything TrendiShop carries, in one place — filter by category, price,
                            rating and brand to find exactly what you need.
                        </p>
                    </div>

                    {/* Live counts */}
                    {mounted && typeof totalProducts === 'number' && (
                        <div className="flex items-center gap-5 shrink-0">
                            <div className="text-white">
                                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums leading-none">{totalProducts}</div>
                                <div className="text-[11px] uppercase tracking-wide text-white/70 mt-1">Products</div>
                            </div>
                            <div className="w-px h-10 bg-white/25" />
                            <div className="text-white">
                                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums leading-none">{categories.length}</div>
                                <div className="text-[11px] uppercase tracking-wide text-white/70 mt-1">Categories</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category quick-pills (live) */}
                {mounted && categories.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        <Link
                            href="/products"
                            className="text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full bg-white text-[#c23a09] shadow-sm hover:shadow transition-shadow"
                        >
                            All Products
                        </Link>
                        {categories.map((c: any) => (
                            <Link
                                key={c._id}
                                href={`/products?category=${c._id}`}
                                className="text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full bg-white/15 text-white border border-white/25 hover:bg-white hover:text-[#c23a09] hover:border-white transition-colors"
                            >
                                {c.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Trust strip */}
            <div className="relative border-t border-white/15 bg-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-white/90 text-[12px] font-medium">
                    <span className="flex items-center gap-1.5"><FiTruck size={13} /> Fast delivery inside Dhaka</span>
                    <span className="flex items-center gap-1.5"><FiRefreshCw size={13} /> 7-day easy return</span>
                    <span className="flex items-center gap-1.5"><FiShield size={13} /> Cash on delivery available</span>
                </div>
            </div>
        </section>
    );
};

const ShopBrowsePage: React.FC = () => {
    return (
        <div
            className="min-h-screen"
            style={{
                background:
                    'radial-gradient(55% 35% at 90% 0%, rgba(var(--color-primary-rgb), 0.05), transparent 70%),' +
                    'radial-gradient(40% 30% at 0% 15%, rgba(var(--color-primary-rgb), 0.04), transparent 70%),' +
                    '#F8FAFC',
            }}
        >
            <StoreListing syncUrl headerSlot={<ShopHero />} />
        </div>
    );
};

export default ShopBrowsePage;
