"use client";

import React, { useState } from 'react';
import NewProductCard from '@/components/shared/NewProductCard';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { ProductCardSkeletonGrid } from '@/components/shared/Skeletons';

/* eslint-disable @typescript-eslint/no-explicit-any */

const filters = [
    { id: 'all', label: 'ALL PRODUCTS' },
    { id: 'new', label: 'NEW ARRIVALS' },
    { id: 'best', label: 'BEST SELLER' },
    { id: 'popular', label: 'MOST POPULAR' },
    { id: 'featured', label: 'FEATURED' },
];

/** Maps a filter tab to the products-query params the rest of the store uses. */
const paramsFor = (filter: string): Record<string, string | number | boolean> => {
    const base = { limit: 10 };
    switch (filter) {
        case 'new': return { ...base, isNewProduct: true };
        case 'best': return { ...base, sort: '-totalSold' };
        case 'popular': return { ...base, sort: '-viewCount' };
        case 'featured': return { ...base, isFeatured: true };
        default: return { ...base, sort: '-createdAt' };
    }
};

const PopularProducts: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('all');

    // Real products from the API — no demo data. Skeletons while it loads,
    // an empty state when a filter returns nothing.
    const { data, isLoading, isFetching } = useGetProductsQuery(paramsFor(activeFilter));
    const products: any[] = data?.data || [];
    const loading = isLoading || isFetching;

    return (
        <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-20'>
            {/* Section Header - Left Aligned */}
            <div className='mb-12'>
                <h2 className='text-3xl font-bold text-gray-900 mb-8'>
                    Popular Departments
                </h2>

                {/* Filter Tabs - Left Aligned */}
                <div className='flex flex-wrap gap-4'>
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-6 py-2.5 text-[13px] font-bold tracking-wider rounded-md transition-all ${activeFilter === filter.id
                                ? 'bg-[var(--color-primary)] text-white shadow-xl shadow-[var(--color-primary)]/20'
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid: skeleton while loading, real when loaded, empty state when none. */}
            {loading ? (
                <ProductCardSkeletonGrid count={10} />
            ) : products.length === 0 ? (
                <div className='py-16 text-center text-gray-500'>
                    No products to show here yet.
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6'>
                    {products.slice(0, 10).map((product) => (
                        <NewProductCard
                            key={product._id}
                            product={{
                                id: product._id,
                                slug: product.slug,
                                name: product.name,
                                image: product.thumbnail || product.images?.[0] || '',
                                price: product.price,
                                originalPrice: product.originalPrice || undefined,
                                discount: product.discount,
                                offerStartDate: product.offerStartDate,
                                offerEndDate: product.offerEndDate,
                                stock: product.stock,
                                rating: product.rating,
                                reviews: product.reviewCount,
                                warranty: product.tagline || product.brand || '',
                                categoryName: product.category?.name || '',
                                priceType: product.priceType || 'negotiable',
                                sold: product.totalSold || 0,
                                likeCount: product.likeCount || 0,
                                commentCount: product.commentCount || 0,
                                shareCount: product.shareCount || 0,
                                viewCount: product.viewCount || 0,
                                reviewCount: product.reviewCount || 0,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PopularProducts;
