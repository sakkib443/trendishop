"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
    useGetProductReviewsQuery,
    usePublicCreateReviewMutation,
    useLikeReviewMutation,
    useReplyToReviewMutation,
    useLikeReplyMutation,
} from '@/redux/api/reviewApi';
import { useToggleWishlistMutation, useGetWishlistQuery } from '@/redux/api/userApi';
import { useAppDispatch, useAppSelector } from '@/redux';
import { addToCart } from '@/redux/slices/cartSlice';
import { toggleWishlist } from '@/redux/slices/wishlistSlice';
import { FiStar, FiX, FiCopy, FiCheck, FiSend, FiThumbsUp, FiCornerDownRight, FiHeart, FiEye, FiTrendingUp } from "react-icons/fi";
import { getDisplayPrice } from '@/utils/offerPrice';

interface Product {
    _id?: string;
    id: string | number;
    slug?: string;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    mrp?: number;
    discount?: number | string;
    offerStartDate?: string | Date | null;
    offerEndDate?: string | Date | null;
    rating?: number;
    reviews?: number;
    categoryName?: string;
    warranty?: string;
    priceType?: 'negotiable' | 'fixed';
    sold?: number;
    soldCount?: number;
    totalSold?: number;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
    viewCount?: number;
    reviewCount?: number;
    stock?: number;
}

interface NewProductCardProps {
    product: Product;
}

export const PRODUCT_IMAGE_FALLBACK = '/images/placeholder-product.webp';

const formatCount = (n: number): string => {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
    return String(n);
};

/* Drawn here rather than taken from react-icons: the set's bag glyphs are all
   handle-and-body outlines, and the mark the card wants is a lidded basket —
   a flat top with the handle arc above it. A few paths are cheaper than
   shipping another icon font for one shape. */
const BasketIcon: React.FC<{ size?: number }> = ({ size = 17 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {/* handle */}
        <path d="M8.5 7.5V6a3.5 3.5 0 0 1 7 0v1.5" />
        {/* lid */}
        <path d="M3.8 8.4h16.4" />
        {/* body, tapering to a rounded base */}
        <path d="M5.4 8.4h13.2l-1 9.2a2.6 2.6 0 0 1-2.6 2.3H9a2.6 2.6 0 0 1-2.6-2.3z" />
    </svg>
);

/* Compare: two lanes swapping over each other. react-icons' shuffle puts the
   arrowheads at different heights, which reads as a shuffle rather than a
   like-for-like comparison — these two mirror each other exactly. */
const CompareIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7.5h4.2c3.4 0 3.4 9 6.8 9H21" />
        <path d="M3 16.5h4.2c3.4 0 3.4-9 6.8-9H21" />
        <path d="m18.2 4.6 2.8 2.9-2.8 2.9" />
        <path d="m18.2 13.6 2.8 2.9-2.8 2.9" />
    </svg>
);

const NewProductCard: React.FC<NewProductCardProps> = ({ product }) => {

    const [toggleWishlistApi] = useToggleWishlistMutation();
    const dispatch = useAppDispatch();
    const productId = String(product._id || product.id);

    // Auth + cart state
    const { isAuthenticated } = useAppSelector((state: any) => state.auth);
    const cartItems = useAppSelector((state: any) => state.cart.items);
    const isInCart = cartItems.some((item: any) => item.id === productId);

    // Wishlist state — server for logged-in users, Redux for guests
    const localWishlist = useAppSelector((state: any) => state.wishlist.items);
    const { data: serverWishlist } = useGetWishlistQuery({}, { skip: !isAuthenticated });
    const serverItems: any[] = serverWishlist?.data || [];
    const isInWishlist = isAuthenticated
        ? serverItems.some((item: any) => String(item._id || item.id) === productId)
        : localWishlist.some((item: any) => item.id === productId);
    const [wishlistAnim, setWishlistAnim] = useState(false);
    const [showAlreadyAdded, setShowAlreadyAdded] = useState(false);

    // Falls back to a local placeholder rather than via.placeholder.com: that
    // service has been unreliable since 2024, and a card whose image 404s would
    // otherwise hang on a cross-origin request that never answers.
    const [imageFailed, setImageFailed] = useState(false);
    const imageSrc = (!imageFailed && product.image) || PRODUCT_IMAGE_FALLBACK;



    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlistAnim(true);
        setTimeout(() => setWishlistAnim(false), 400);
        if (isAuthenticated) {
            try {
                await toggleWishlistApi(productId).unwrap();
            } catch (err) {
                console.error('Wishlist toggle failed:', err);
            }
        } else {
            dispatch(toggleWishlist({
                id: productId,
                name: product.name,
                price: product.price,
                mrp: product.originalPrice || product.mrp || product.price,
                image: product.image,
                category: product.categoryName || '',
                rating: product.rating || 0,
            }));
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInCart) {
            setShowAlreadyAdded(true);
            setTimeout(() => setShowAlreadyAdded(false), 1500);
            return;
        }
        dispatch(addToCart({
            id: productId,
            productId: productId,
            name: product.name,
            price: product.price,
            mrp: product.originalPrice || product.mrp || product.price,
            image: product.image,
            category: product.categoryName || 'General',
        }));
    };

    // Respect the offer-validity window: while the offer is active the card shows
    // the offer price + discount; once it expires (or before it starts) it falls
    // back to the regular price with no discount badge. With no offer dates the
    // result is unchanged from before (offerActive = true).
    const display = getDisplayPrice({
        price: product.price,
        originalPrice: product.originalPrice ?? product.mrp ?? undefined,
        discount: typeof product.discount === 'string' ? Number(product.discount) || 0 : (product.discount ?? 0),
        offerStartDate: product.offerStartDate,
        offerEndDate: product.offerEndDate,
    });
    const currentPrice = display.currentPrice;
    const oldPrice = display.originalPrice;
    const discountPercent = display.offerActive && oldPrice && oldPrice > currentPrice
        ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
        : 0;
    const soldCount = product.sold || product.soldCount || product.totalSold || 0;

    const href = `/product/${product.slug || product.id}`;
    const inStock = product.stock === undefined || product.stock > 0;

    return (
        <div className='pc group relative flex h-full flex-col overflow-hidden bg-white transition-shadow duration-300'>

            {/* ── Picture ──────────────────────────────────────────────────
                A fixed square so every card in a row lines up whatever the
                source image's aspect ratio is. object-contain, not cover: a
                packshot cropped to fill loses the edges of the product. */}
            {/* The inner box stops short of the bottom by exactly the shelf's
                height, so the photograph never runs behind the two controls —
                padding could not do this, because `fill` positions against the
                padding box and would ignore it. */}
            <Link href={href} className='pc-pic'>
                <span className='pc-pic-inner'>
                    <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px'
                        className='object-contain transition-transform duration-500 group-hover:scale-[1.06]'
                        onError={() => setImageFailed(true)}
                    />
                </span>
            </Link>

            {/* Discount, top left */}
            {discountPercent > 0 && (
                <span className='pc-badge-off absolute left-3 top-3 z-20'>{discountPercent}%</span>
            )}

            {/* Standing, top right. Only shown once something has actually sold —
                a "Top Selling" badge on every card means nothing. */}
            {soldCount > 0 && (
                <span className='pc-badge-top absolute right-3 top-3 z-20'>
                    <FiTrendingUp size={12} strokeWidth={2.5} />
                    Top Selling
                </span>
            )}

            {/* Low stock, over the foot of the picture. Under ten is a real reason
                to hurry; anything more and the badge is just decoration. */}
            {inStock && product.stock !== undefined && product.stock <= 10 && (
                <span className='pc-badge-low absolute bottom-[30%] left-3 z-20'>
                    Only {product.stock} left!
                </span>
            )}

            {/* ── Details ────────────────────────────────────────────────── */}
            <div className='pc-body relative mt-auto flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-4'>

                {/* The panel's top edge rises over the two controls instead of
                    running straight past them — see .pc-notch in globals.css. */}
                <div className='pc-notch'>
                    <button
                        onClick={handleWishlistToggle}
                        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={`pc-icon ${isInWishlist ? 'is-on' : ''} ${wishlistAnim ? 'scale-110' : ''}`}
                    >
                        <FiHeart size={15} style={{ fill: isInWishlist ? 'currentColor' : 'none' }} />
                    </button>
                    <Link href={href} aria-label='Compare' className='pc-icon'>
                        <CompareIcon size={16} />
                    </Link>
                </div>

                {/* One line, always. A name that wrapped to two pushed the price
                    and the button row down on that card alone, so a row of cards
                    no longer shared a baseline. */}
                <h3 className='pc-name'>
                    <Link href={href} className='hover:text-[var(--color-primary)] transition-colors'>{product.name}</Link>
                </h3>

                <div className='flex items-baseline gap-2'>
                    <span className='pc-price'>৳ {currentPrice.toLocaleString('en-US')}</span>
                    {oldPrice && oldPrice > currentPrice && (
                        <span className='pc-price-old'>৳ {oldPrice.toLocaleString('en-US')}</span>
                    )}
                    {soldCount > 0 && (
                        <span className='pc-sold'>{formatCount(soldCount)} sold</span>
                    )}
                </div>

                <div className='mt-1 flex items-center gap-2'>
                    <button onClick={handleAddToCart} className='pc-cart' disabled={!inStock}>
                        <BasketIcon size={17} />
                        {isInCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                    <Link href={href} aria-label='Quick view' className='pc-icon pc-icon-lg'>
                        <FiEye size={16} />
                    </Link>
                </div>

                {showAlreadyAdded && (
                    <span className='absolute inset-x-4 bottom-4 rounded-lg bg-slate-900/90 py-2 text-center text-[11px] font-medium text-white'>
                        Already in your cart
                    </span>
                )}
            </div>
        </div>
    );
};


/* ═══════════════════════════════════════════════ */
/* ═══ COMMENTS POPUP — with write comment ═══ */
/* ═══════════════════════════════════════════════ */

// localStorage helpers — track which reviews/replies this device has liked
const LIKED_REVIEWS_KEY = 'trendyshops_liked_reviews';
const LIKED_REPLIES_KEY = 'trendyshops_liked_replies';

const getLikedSet = (key: string): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
        const raw = localStorage.getItem(key);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
};
const addToLikedSet = (key: string, id: string) => {
    if (typeof window === 'undefined') return;
    const set = getLikedSet(key);
    set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
};

const CommentsPopup: React.FC<{
    productId: string;
    productName: string;
    productImage: string;
    onClose: () => void;
}> = ({ productId, productName, productImage, onClose }) => {
    const { data: reviewsData, isLoading } = useGetProductReviewsQuery({ productId });
    const [publicCreateReview] = usePublicCreateReviewMutation();
    const [likeReview] = useLikeReviewMutation();
    const [replyToReview] = useReplyToReviewMutation();
    const [likeReply] = useLikeReplyMutation();
    const reviews = reviewsData?.data || [];

    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Like tracking (per-device via localStorage)
    const [likedReviews, setLikedReviews] = useState<Set<string>>(() => getLikedSet(LIKED_REVIEWS_KEY));
    const [likedReplies, setLikedReplies] = useState<Set<string>>(() => getLikedSet(LIKED_REPLIES_KEY));

    // Reply UI state — which review has reply box open + text
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            await publicCreateReview({
                product: productId,
                rating: newRating,
                comment: newComment.trim(),
                userName: 'Anonymous'
            }).unwrap();
            setNewComment('');
            setNewRating(5);
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to submit review:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeReview = async (reviewId: string) => {
        if (likedReviews.has(reviewId)) return;
        addToLikedSet(LIKED_REVIEWS_KEY, reviewId);
        setLikedReviews(prev => new Set(prev).add(reviewId));
        try { await likeReview(reviewId).unwrap(); } catch (e) { console.error(e); }
    };

    const handleLikeReply = async (reviewId: string, replyId: string) => {
        const key = `${reviewId}_${replyId}`;
        if (likedReplies.has(key)) return;
        addToLikedSet(LIKED_REPLIES_KEY, key);
        setLikedReplies(prev => new Set(prev).add(key));
        try { await likeReply({ reviewId, replyId }).unwrap(); } catch (e) { console.error(e); }
    };

    const handleSubmitReply = async (reviewId: string) => {
        const text = replyText.trim();
        if (!text) return;
        setIsReplying(true);
        try {
            await replyToReview({ reviewId, text, userName: 'Anonymous' }).unwrap();
            setReplyText('');
            setReplyingTo(null);
        } catch (e) { console.error(e); }
        finally { setIsReplying(false); }
    };

    return (
        <div
            className='fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4'
            onClick={onClose}
        >
            <div
                className='bg-white rounded-lg w-full max-w-[620px] max-h-[88vh] flex flex-col overflow-hidden shadow-2xl'
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'fbModalIn 0.2s ease-out' }}
            >
                {/* ── Header ── */}
                <div className='flex items-center justify-between px-4 py-2.5 border-b border-gray-200 shrink-0'>
                    <h3 className='text-[15px] font-bold text-gray-900 truncate pr-4'>{productName}</h3>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors shrink-0'
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* ── Product image — full view ── */}
                <div className='shrink-0 border-b border-gray-200'>
                    <div className='w-full bg-gray-50 flex items-center justify-center' style={{ maxHeight: '280px' }}>
                        <img
                            src={productImage}
                            alt={productName}
                            className='w-full object-contain'
                            style={{ maxHeight: '280px' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = PRODUCT_IMAGE_FALLBACK;
                            }}
                        />
                    </div>
                    {/* Stats bar */}
                    <div className='flex items-center justify-between px-4 py-1.5 text-xs text-gray-500'>
                        <span>{reviews.length} {reviews.length === 1 ? 'Comment' : 'Comments'}</span>
                    </div>
                </div>

                {/* ── Comments List — scrollable ── */}
                <div className='flex-1 overflow-y-auto px-4 py-2 space-y-2.5' style={{ minHeight: '60px' }}>
                    {isLoading ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='w-6 h-6 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin' />
                        </div>
                    ) : reviews.length > 0 ? (
                        <>
                            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wide'>Most relevant</p>
                            {reviews.map((review: any) => {
                                const reviewId = review._id;
                                const isLiked = likedReviews.has(reviewId);
                                const likeCount = review.likes || 0;
                                const replies = review.replies || [];
                                const isReplyOpen = replyingTo === reviewId;

                                return (
                                    <div key={reviewId} className='flex gap-2'>
                                        <div className='flex-1 min-w-0'>
                                            <div className='bg-gray-100 rounded-2xl px-3 py-2'>
                                                {review.comment && (
                                                    <p className='text-[12px] text-gray-800 leading-snug'>{review.comment}</p>
                                                )}
                                            </div>
                                            <div className='flex items-center gap-3 px-3 mt-0.5 text-[10px] text-gray-400'>
                                                <span className='flex gap-0.5'>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FiStar key={star} size={9} style={{
                                                            color: '#f59e0b',
                                                            fill: star <= (review.rating || 0) ? '#f59e0b' : 'none'
                                                        }} />
                                                    ))}
                                                </span>
                                                <button
                                                    onClick={() => handleLikeReview(reviewId)}
                                                    className={`font-medium hover:underline flex items-center gap-1 ${isLiked ? 'text-[var(--color-secondary)]' : ''}`}
                                                    disabled={isLiked}
                                                >
                                                    <FiThumbsUp size={10} style={{ fill: isLiked ? 'var(--color-secondary)' : 'none' }} />
                                                    <span>Like{likeCount > 0 ? ` (${likeCount})` : ''}</span>
                                                </button>
                                                <button
                                                    onClick={() => { setReplyingTo(isReplyOpen ? null : reviewId); setReplyText(''); }}
                                                    className='font-medium hover:underline'
                                                >
                                                    Reply{replies.length > 0 ? ` (${replies.length})` : ''}
                                                </button>
                                            </div>

                                            {/* ── Replies list ── */}
                                            {replies.length > 0 && (
                                                <div className='mt-1.5 ml-1 space-y-1.5'>
                                                    {replies.map((reply: any) => {
                                                        const replyKey = `${reviewId}_${reply._id}`;
                                                        const isReplyLiked = likedReplies.has(replyKey);
                                                        return (
                                                            <div key={reply._id} className='flex gap-2'>
                                                                <FiCornerDownRight size={12} className='text-gray-300 mt-1.5 shrink-0' />
                                                                <div className='flex-1 min-w-0'>
                                                                    <div className='bg-gray-50 rounded-2xl px-3 py-1.5'>
                                                                        <p className='text-[11px] text-gray-800 leading-snug'>{reply.text}</p>
                                                                    </div>
                                                                    <div className='flex items-center gap-3 px-3 mt-0.5 text-[10px] text-gray-400'>
                                                                        <button
                                                                            onClick={() => handleLikeReply(reviewId, reply._id)}
                                                                            className={`font-medium hover:underline flex items-center gap-1 ${isReplyLiked ? 'text-[var(--color-secondary)]' : ''}`}
                                                                            disabled={isReplyLiked}
                                                                        >
                                                                            <FiThumbsUp size={9} style={{ fill: isReplyLiked ? 'var(--color-secondary)' : 'none' }} />
                                                                            <span>Like{reply.likes > 0 ? ` (${reply.likes})` : ''}</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* ── Reply input ── */}
                                            {isReplyOpen && (
                                                <div className='flex gap-2 mt-2 ml-1'>
                                                    <FiCornerDownRight size={12} className='text-gray-300 mt-2 shrink-0' />
                                                    <div className='flex-1 flex items-center bg-gray-100 rounded-full px-3 py-1'>
                                                        <input
                                                            type='text'
                                                            autoFocus
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                            onKeyDown={e => { if (e.key === 'Enter' && replyText.trim()) handleSubmitReply(reviewId); }}
                                                            placeholder='Write a reply...'
                                                            className='flex-1 bg-transparent text-[11px] text-gray-700 outline-none'
                                                        />
                                                        <button
                                                            onClick={() => handleSubmitReply(reviewId)}
                                                            disabled={!replyText.trim() || isReplying}
                                                            className='text-[var(--color-primary)] font-semibold text-[11px] ml-2 disabled:opacity-30 flex items-center gap-1'
                                                        >
                                                            {isReplying ? (
                                                                <div className='w-3 h-3 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin' />
                                                            ) : (
                                                                <FiSend size={11} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div className='text-center py-6'>
                            <p className='text-sm text-gray-500'>No comments yet</p>
                            <p className='text-xs text-gray-400 mt-1'>Be the first to comment!</p>
                        </div>
                    )}
                </div>

                {/* ── Comment Input — bottom bar ── */}
                <div className='border-t border-gray-200 px-4 py-2.5 shrink-0 bg-white'>
                    {submitSuccess && (
                        <div className='mb-2 text-center text-xs text-green-600 font-medium bg-green-50 py-1.5 rounded-lg'>
                            ✅ Comment posted!
                        </div>
                    )}

                    <div className='flex items-start gap-2.5'>
                        {/* Comment + Rating */}
                        <div className='flex-1 min-w-0 bg-gray-100 rounded-2xl px-3 py-1.5'>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && newComment.trim()) handleSubmitComment(); }}
                                placeholder="Write a comment..."
                                className='w-full bg-transparent text-[12px] text-gray-700 font-normal placeholder-gray-400 placeholder:font-normal outline-none py-1'
                            />
                            {/* Rating + Send row */}
                            <div className='flex items-center justify-between mt-1 pt-1.5 border-t border-gray-200/60'>
                                <div className='flex items-center gap-1.5'>
                                    <span className='text-[11px] text-gray-400'>Rating</span>
                                    <div className='flex gap-px'>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setNewRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className='p-px transition-transform hover:scale-125'
                                            >
                                                <FiStar size={13} style={{
                                                    color: '#f59e0b',
                                                    fill: star <= (hoverRating || newRating) ? '#f59e0b' : 'none',
                                                    transition: 'all 0.15s ease'
                                                }} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim() || isSubmitting}
                                    className='text-[var(--color-primary)] font-semibold text-[13px] hover:text-[var(--color-primary-dark)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1'
                                >
                                    {isSubmitting ? (
                                        <div className='w-4 h-4 border-2 border-gray-300 border-t-[var(--color-primary)] rounded-full animate-spin' />
                                    ) : (
                                        <><FiSend size={13} /> Post</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fbModalIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export { CommentsPopup };
export default NewProductCard;
