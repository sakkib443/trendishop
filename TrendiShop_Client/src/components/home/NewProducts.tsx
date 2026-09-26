"use client";

import React from 'react';
import SectionHeading from '@/components/shared/SectionHeading';
import NewProductCard from '@/components/shared/NewProductCard';
import { useGetProductsQuery } from '@/redux/api/productApi';
import { ProductCardSkeletonGrid } from '@/components/shared/Skeletons';

/* eslint-disable @typescript-eslint/no-explicit-any */

const GRID = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10';

/**
 * "Day of the deal" — the biggest-discount products from the real API. No demo
 * data: skeletons while the query loads, real cards when it resolves, and the
 * whole section renders nothing if there are no deals.
 */
const NewProducts: React.FC = () => {
    const { data, isLoading } = useGetProductsQuery({ limit: 10, sort: '-discount' });
    const products: any[] = data?.data || [];

    // Nothing on offer yet — render nothing rather than fake deals.
    if (!isLoading && products.length === 0) return null;

    return (
        <div className='container mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-20'>
            <div>
                <SectionHeading
                    description="Don't wait. The time will never be just right."
                    heading="Day of "
                    colorHeading="The deal"
                />
            </div>
            <div>
                {isLoading ? (
                    <ProductCardSkeletonGrid count={10} className={GRID} />
                ) : (
                    <div className={GRID}>
                        {products.map((product) => (
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
        </div>
    );
};

export default NewProducts;
