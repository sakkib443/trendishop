/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FiShoppingCart, FiChevronDown, FiMenu, FiX,
    FiUser, FiHeart, FiPhone, FiLogOut,
    FiGrid, FiBox, FiMapPin, FiGlobe,
} from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '@/redux';
import { useGetCategoriesQuery } from '@/redux/api/categoryApi';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import { logout } from '@/redux/slices/authSlice';
import Logo from '@/components/shared/Logo';
import { useTheme } from '@/components/shared/ThemeProvider';
import SearchAutocomplete from '@/components/shared/SearchAutocomplete';
import { useWishlist } from '@/hooks/useWishlist';
import { telHref } from '@/utils/contactLinks';
import { homeFor, isStaffRole } from '@/components/admin/access';

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon?: string;
    image?: string;
}

const isCatImg = (c: Category) => Boolean(c.image || (c.icon && (c.icon.startsWith('http') || c.icon.startsWith('/'))));
const getCatImg = (c: Category) => c.image || c.icon || '';

const FALLBACK_CATEGORIES: Category[] = [
    { _id: 'f-cookware', name: 'Cookware', slug: 'cookware', icon: '🍳', image: '/categories/cookware.webp' },
    { _id: 'f-dinnerware', name: 'Dinnerware', slug: 'dinnerware', icon: '🍽️', image: '/categories/dinnerware.webp' },
    { _id: 'f-kitchen-tools', name: 'Kitchen Tools', slug: 'kitchen-tools', icon: '🔪', image: '/categories/kitchen-tools.webp' },
    { _id: 'f-food-storage', name: 'Food Storage', slug: 'food-storage', icon: '🫙', image: '/categories/food-storage.webp' },
    { _id: 'f-appliances', name: 'Appliances', slug: 'appliances', icon: '⚡', image: '/categories/appliances.webp' },
    { _id: 'f-bakeware', name: 'Bakeware', slug: 'bakeware', icon: '🧁', image: '/categories/bakeware.webp' },
    { _id: 'f-drinkware', name: 'Drinkware', slug: 'drinkware', icon: '🥤', image: '/categories/drinkware.webp' },
    { _id: 'f-cutlery', name: 'Cutlery', slug: 'cutlery', icon: '🍴', image: '/categories/cutlery.webp' },
];

/** Row 2 — the four quick links that sit between the logo and the search field. */
const PRIMARY_LINKS: { href: string; label: string; highlight?: boolean }[] = [
    { href: '/shop', label: 'Shop' },
    { href: '/services', label: 'Services' },
    { href: '/products?sort=discount', label: 'Offer', highlight: true },
    { href: '/ship-for-me', label: 'Ship For Me' },
];

/** Row 4 — the announcement ticker. Edit this list to change what scrolls. */
const TICKER: string[] = [
    '🔥 Fresh stock in — same-day dispatch inside Dhaka',
    '💥 Pay in 3 instalments on bKash — 0% interest',
    '🚚 Free delivery on every order above ৳3,000',
    '📦 7-day easy return, no questions asked',
    '📍 Cash on delivery available nationwide',
];

const Header: React.FC = () => {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchCatOpen, setIsSearchCatOpen] = useState(false);
    const [selectedSearchCat, setSelectedSearchCat] = useState<Category | null>(null);
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const searchCatRef = useRef<HTMLDivElement>(null);
    const mobileSearchCatRef = useRef<HTMLDivElement>(null);
    const exploreRef = useRef<HTMLDivElement>(null);

    const cartItems = useAppSelector((state) => state.cart.items);
    const { count: wishlistCount } = useWishlist();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const wishlistHref = '/wishlist';

    const { data: categoriesData } = useGetCategoriesQuery({});
    const categories: Category[] = categoriesData?.data?.length > 0 ? categoriesData.data : FALLBACK_CATEGORIES;
    const { data: siteContentRes } = useGetSiteContentQuery(undefined);
    const contact = siteContentRes?.data?.contact || {};
    const contactPhoneHref = telHref(contact.phone);

    /** The category bar shows the first eight; the rest live under EXPLORE ALL. */
    const barCategories = categories.slice(0, 8);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
            const inDesktop = searchCatRef.current && searchCatRef.current.contains(e.target as Node);
            const inMobile = mobileSearchCatRef.current && mobileSearchCatRef.current.contains(e.target as Node);
            if (!inDesktop && !inMobile) setIsSearchCatOpen(false);
            if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setIsExploreOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        setIsProfileOpen(false);
        router.push('/');
    };

    const handleSearch = (rawTerm?: string) => {
        const trimmed = (rawTerm ?? searchQuery).trim();
        if (!trimmed && !selectedSearchCat) return;
        const params = new URLSearchParams();
        if (trimmed) params.set('q', trimmed);
        if (selectedSearchCat) params.set('category', selectedSearchCat._id);
        router.push(`/products?${params.toString()}`);
    };

    /* ── Shared bits ─────────────────────────────────────────────────── */

    /** One container for every row. Each row used to carry its own max-width
        and padding (1420/px-12, 1400/px-9, 1344/px-2), which staggered the
        three left edges by up to 40px and was what made the header look
        unaligned. One rule now, so the rows sit in a single column. */
    const SHELL = 'shell';

    /** The square the action icons sit in. Height comes from --hd-control, the
        same token the search field and EXPLORE ALL use, so all three line up.
        Futuristic frosted glass: a translucent panel with a thin gold rim, a top
        sheen and a glow that blooms on hover — a step up from the flat white
        squares this used to be. */
    const iconBtn = "group relative w-[var(--hd-control)] h-[var(--hd-control)] rounded-[var(--hd-radius)] flex items-center justify-center transition-all duration-300 shrink-0 hover:-translate-y-0.5";
    const iconBtnStyle: React.CSSProperties = {
        background: 'linear-gradient(150deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05) 58%, rgba(203,132,59,0.12))',
        border: '1px solid rgba(222,180,117,0.4)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 6px 18px -8px rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
    };
    /** The warm bloom each control gets on hover. */
    const iconGlow = (
        <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[var(--hd-radius)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: 'radial-gradient(circle at 50% 118%, rgba(222,180,117,0.55), transparent 68%)' }}
        />
    );

    /** Counts come back from localStorage on the client, so the server renders
        zero and the first client render would not. Holding them until after
        mount keeps both trees identical and avoids a hydration mismatch. */
    const countBadge = (n: number, bg: string) => mounted && n > 0 ? (
        <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white"
            style={{ background: bg }}
        >
            {n > 99 ? '99+' : n}
        </span>
    ) : null;

    const renderCategorySelector = (isMobile: boolean) => (
        <div className="relative shrink-0" ref={isMobile ? mobileSearchCatRef : searchCatRef}>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsSearchCatOpen((prev) => !prev); }}
                className={`flex items-center gap-1.5 ${isMobile ? 'pl-2.5 pr-2 h-8 text-xs' : 'pl-3.5 pr-2.5 h-9 text-[13px]' } font-semibold whitespace-nowrap transition-colors rounded-[6px] cursor-pointer select-none text-[var(--color-text-primary)] hover:bg-black/[0.04]`}
                title="Select category to filter"
            >
                <FiGlobe size={13} strokeWidth={2} style={{ color: 'var(--hd-gold-deep)' }} className="shrink-0" />
                <span className={isMobile ? 'max-w-[62px] truncate' : 'max-w-[90px] truncate'}>
                    {selectedSearchCat ? selectedSearchCat.name : 'All'}
                </span>
                <FiChevronDown size={12} strokeWidth={2.5}
                    className={`transition-transform duration-200 shrink-0 text-gray-500 ${isSearchCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSearchCatOpen && (
                <div className={`absolute top-full left-0 mt-2 ${isMobile ? 'w-60 max-w-[85vw]' : 'w-64'} bg-white rounded-[var(--hd-radius-lg)] border border-gray-100 z-[100] max-h-80 overflow-y-auto p-1.5 animate-fadeIn`}
                    style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)' }}>
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                        Filter by Category
                    </div>
                    <button type="button"
                        onClick={() => { setSelectedSearchCat(null); setIsSearchCatOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-[var(--hd-radius)] text-xs font-semibold transition-all cursor-pointer ${!selectedSearchCat ? 'bg-[var(--hd-gold-soft)] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <span className="flex items-center gap-2"><span>🛒</span> All Categories</span>
                        {!selectedSearchCat && <span className="text-xs font-bold" style={{ color: 'var(--hd-gold-deep)' }}>✓</span>}
                    </button>
                    {categories.map((cat) => {
                        const isSelected = selectedSearchCat?._id === cat._id;
                        return (
                            <button key={cat._id} type="button"
                                onClick={() => { setSelectedSearchCat(cat); setIsSearchCatOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-[var(--hd-radius)] text-xs transition-all cursor-pointer ${isSelected ? 'bg-[var(--hd-gold-soft)] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <span className="flex items-center gap-2 truncate pr-2"><span className="truncate">{cat.name}</span></span>
                                {isSelected && <span className="text-xs font-bold shrink-0" style={{ color: 'var(--hd-gold-deep)' }}>✓</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const cartBadge = countBadge(cartItems.length, 'var(--color-sale)');

    return (
        <header className="dz-header w-full sticky top-0 z-[60] lg:static bg-white lg:px-4 transition-colors duration-300">

            {/* Rows 1–3 share the charcoal backdrop; the ticker below sits on white. */}
            <div className="dz-header-bg">

            {/* ═══════════ 1 · UTILITY BAR ═══════════
                Hairline strip of secondary links. Hidden below md, exactly as the
                reference does — on a phone this row is pure noise. */}
            <div className="hidden md:block">
                <div className={`${SHELL} h-9 rounded-b-[8px] flex items-center justify-between bg-white`}>

                    <nav className="flex items-center gap-6">
                        {[{ href: '/expert', label: 'Expert Advice' }, { href: '/cost-calculator', label: 'Cost Calculator' }].map(l => (
                            <Link key={l.href} href={l.href}
                                className="text-xs font-medium transition-[filter] hover:brightness-110 bg-clip-text text-transparent"
                                style={{ backgroundImage: 'linear-gradient(to right, var(--color-text-primary), var(--hd-gold-deep))' }}>
                                {l.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-6">
                        {contactPhoneHref && contact.phone && (
                            <a href={contactPhoneHref} className="flex items-center gap-2 text-xs text-[#222] hover:text-black transition-colors">
                                <FiPhone size={13} strokeWidth={2} />
                                <span>{contact.phone}</span>
                            </a>
                        )}
                        <Link href="/track" className="flex items-center gap-2 text-xs text-[#222] hover:text-black transition-colors">
                            <FiMapPin size={13} strokeWidth={2} />
                            <span>Track Order</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══════════ 2 · MAIN BAR ═══════════
                Logo · quick links · search (takes the slack) · action squares. */}
            <div className="border-b border-white/5">
                <div className={SHELL}>

                    <div className="hidden md:flex items-center gap-5 py-3">

                        <Link href="/" className="shrink-0" onClick={() => setSearchQuery('')}>
                            <HeaderLogo light />
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1 shrink-0">
                            {PRIMARY_LINKS.map(l => (
                                <Link key={l.href} href={l.href}
                                    className={`text-sm px-3 py-1.5 rounded-[6px] transition-colors font-medium whitespace-nowrap ${l.highlight ? 'border text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                                    style={l.highlight
                                        ? { borderColor: 'var(--hd-gold-line)', background: 'var(--hd-gold-soft)' }
                                        : undefined}>
                                    {l.label}
                                </Link>
                            ))}
                        </nav>

                        {/* min-w-0: a flex item will not shrink past the intrinsic
                            width of its content by default, so without this the
                            search field holds the row open and pushes the action
                            squares off the right edge between lg and xl. */}
                        <div className="flex-1 relative min-w-0">
                            <SearchAutocomplete
                                variant="desktop"
                                value={searchQuery}
                                onChange={setSearchQuery}
                                onSubmit={(term) => handleSearch(term)}
                                placeholder="Search for the item"
                                leading={<>{renderCategorySelector(false)}<span className="shrink-0 w-px h-5 bg-gray-200" aria-hidden /></>}
                            />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">

                            {/* Account — dropdown when signed in, straight to /login when not */}
                            {isAuthenticated && user ? (
                                <div className="relative" ref={profileRef}>
                                    <button onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`${iconBtn} cursor-pointer`}
                                        style={iconBtnStyle}
                                        aria-label="Account">
                                        {iconGlow}
                                        {user.avatar
                                            ? <img src={user.avatar} alt="" className="relative w-7 h-7 rounded-full object-cover" />
                                            : <FiUser size={22} strokeWidth={1.7} className="relative text-white" />}
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-[var(--hd-radius-lg)] border border-gray-100 overflow-hidden z-[100] animate-fadeIn"
                                            style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)' }}>
                                            <div className="px-4 py-3.5 border-b border-gray-100" style={{ background: 'var(--hd-gold-soft)' }}>
                                                <p className="text-sm font-bold text-gray-800 truncate">{user.name || 'User'}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                                            </div>
                                            <div className="py-1.5">
                                                {[
                                                    { href: isStaffRole(user.role) ? homeFor(user.role) : '/dashboard/user', icon: <FiGrid size={15} />, label: 'Dashboard' },
                                                    ...(isStaffRole(user.role) ? [] : [{ href: '/dashboard/user/orders', icon: <FiBox size={15} />, label: 'My Orders' }]),
                                                    { href: wishlistHref, icon: <FiHeart size={15} />, label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ''}` },
                                                ].map(item => (
                                                    <Link key={item.href} href={item.href} onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                        {item.icon} {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-100 py-1.5">
                                                <button onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                                    <FiLogOut size={15} /> Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/login" className={iconBtn} style={iconBtnStyle} aria-label="Sign in">
                                    {iconGlow}
                                    <FiUser size={22} strokeWidth={1.7} className="relative text-white" />
                                </Link>
                            )}

                            <Link href="/cart" className={iconBtn} style={iconBtnStyle} aria-label="Cart">
                                {iconGlow}
                                <FiShoppingCart size={21} strokeWidth={1.8} className="relative text-white" />
                                {cartBadge}
                            </Link>

                            {/* The reference puts a theme toggle in this gold square. There is no
                                dark mode to toggle here — useTheme() carries store branding, not a
                                colour scheme — so the slot holds the wishlist instead. It wears a
                                warmer gold rim than its neighbours so it reads as the accent. */}
                            <Link href={wishlistHref} className={`${iconBtn} cursor-pointer`}
                                style={{
                                    background: 'linear-gradient(150deg, rgba(233,204,174,0.4), rgba(203,132,59,0.2))',
                                    border: '1px solid rgba(222,180,117,0.6)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 18px -8px rgba(203,132,59,0.5)',
                                    backdropFilter: 'blur(6px)',
                                    WebkitBackdropFilter: 'blur(6px)',
                                }}
                                aria-label="Wishlist">
                                {iconGlow}
                                <FiHeart size={21} strokeWidth={1.8} className="relative" style={{ color: '#f2d3a6' }} />
                                {countBadge(wishlistCount, 'var(--hd-gold-deep)')}
                            </Link>
                        </div>
                    </div>

                    {/* ── Mobile bar ──────────────────────────────────────────────
                        The backdrop above supplies the dark slab and its rounded
                        underside; the white action squares and the search field read
                        as cut-outs in it. Stays put while the page scrolls — the
                        header is sticky below lg. */}
                    <div className="md:hidden py-3">
                        <div className="flex items-center justify-between gap-3">
                            <Link href="/" className="shrink-0" onClick={() => setSearchQuery('')}>
                                <HeaderLogo light height={30} maxWidth={150} />
                            </Link>
                            <div className="flex items-center gap-2">
                                <Link href={wishlistHref} className="w-11 h-11 rounded-[var(--hd-radius)] flex items-center justify-center shrink-0"
                                    style={{ background: 'var(--hd-gold)' }} aria-label="Wishlist">
                                    <FiHeart size={18} className="text-gray-900" />
                                </Link>
                                <Link href="/track" className="w-11 h-11 rounded-[var(--hd-radius)] flex items-center justify-center bg-white shrink-0" aria-label="Track order">
                                    <FiMapPin size={18} className="text-[#222]" />
                                </Link>
                                <Link href="/cart" className="w-11 h-11 rounded-[var(--hd-radius)] flex items-center justify-center bg-white relative shrink-0" aria-label="Cart">
                                    <FiShoppingCart size={18} className="text-[#222]" />
                                    {cartBadge}
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex-1 min-w-0">
                                <SearchAutocomplete
                                    variant="mobile"
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    onSubmit={(term) => handleSearch(term)}
                                    placeholder="Search for the item"
                                />
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="w-11 h-11 rounded-[var(--hd-radius)] bg-white flex items-center justify-center shrink-0"
                                aria-label="Menu">
                                {isMobileMenuOpen ? <FiX size={20} className="text-[#222]" /> : <FiMenu size={20} className="text-[#222]" />}
                            </button>
                        </div>

                        {isMobileMenuOpen && (
                            <div className="bg-white rounded-[var(--hd-radius-lg)] p-2 mt-3 max-h-[60vh] overflow-y-auto">
                                <button onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-gray-800 font-semibold text-sm rounded-[6px] hover:bg-gray-50">
                                    <span>Categories</span>
                                    <FiChevronDown size={14} className={`transition-transform ${isMobileCategoryOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isMobileCategoryOpen && (
                                    <div className="pl-3 space-y-0.5">
                                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-3 py-2 text-gray-600 text-sm rounded-[6px] hover:bg-gray-50">🛒 All Products</Link>
                                        {categories.map(cat => (
                                            <Link key={cat._id} href={`/products?category=${cat._id}`} onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm rounded-[6px] hover:bg-gray-50">
                                                {isCatImg(cat)
                                                    ? <img src={getCatImg(cat)} alt="" className="w-4 h-4 object-contain rounded-xs shrink-0" />
                                                    : cat.icon && <span className="text-sm shrink-0">{cat.icon}</span>}
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {[...PRIMARY_LINKS.map(l => ({ href: l.href, label: l.label })),
                                { href: '/track', label: 'Track Order' },
                                { href: '/contact', label: 'Help & Support' },
                                { href: wishlistHref, label: 'Wishlist' },
                                ].map(item => (
                                    <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-[6px] transition-colors">
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════ 3 · CATEGORY BAR ═══════════
                EXPLORE ALL holds the full list; the rail beside it carries the
                first eight so the common ones are one click away. lg and up only. */}
            <div className="hidden lg:block">
                <div className={`${SHELL} py-3.5 flex items-center gap-4`}>

                        <div className="relative shrink-0" ref={exploreRef}>
                            <button type="button" onClick={() => setIsExploreOpen(p => !p)}
                                className="hd-pill flex items-center gap-2 h-[var(--hd-control)] px-5 rounded-[var(--hd-radius)] text-gray-900 font-bold text-[12.5px] tracking-wide transition-colors cursor-pointer"
                                style={{ background: 'var(--hd-gold)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--hd-gold-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--hd-gold)')}>
                                EXPLORE ALL
                                <FiChevronDown size={14} strokeWidth={2.5}
                                    className={`transition-transform duration-200 ${isExploreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isExploreOpen && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-[var(--hd-radius-lg)] border border-gray-100 z-[100] max-h-[70vh] overflow-y-auto p-1.5 animate-fadeIn"
                                    style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)' }}>
                                    <Link href="/products" onClick={() => setIsExploreOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--hd-radius)] text-[13px] font-bold transition-colors hover:bg-gray-50"
                                        style={{ color: 'var(--hd-gold-deep)' }}>
                                        <FiGrid size={15} /> All Products
                                    </Link>
                                    <div className="my-1 border-t border-gray-100" />
                                    {categories.map(cat => (
                                        <Link key={cat._id} href={`/products?category=${cat._id}`} onClick={() => setIsExploreOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--hd-radius)] text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                                            {isCatImg(cat)
                                                ? <img src={getCatImg(cat)} alt="" className="w-5 h-5 object-contain rounded shrink-0" />
                                                : cat.icon && <span className="text-base shrink-0">{cat.icon}</span>}
                                            <span className="truncate">{cat.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-white/15 shrink-0" />

                        {/* An even gap rather than justify-between: spacing that is
                            computed from the leftover width changes with every
                            viewport and with every category name, which is what made
                            the rhythm here look accidental. Overflow scrolls sideways,
                            so a longer catalogue never squeezes the row. */}
                        <nav className="hd-pill hd-rail flex items-center gap-1 flex-1 min-w-0 overflow-x-auto h-[var(--hd-control)] rounded-[var(--hd-radius)] bg-white px-2 relative z-[99]">
                            {barCategories.map(cat => (
                                <Link key={cat._id} href={`/products?category=${cat._id}`}
                                    className="flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-[6px] text-[13.5px] font-medium text-[#222] hover:bg-black/[0.04] transition-colors whitespace-nowrap">
                                    <span className="truncate max-w-[130px]">{cat.name}</span>
                                    <FiChevronDown size={13} strokeWidth={2.5} className="text-gray-400 shrink-0" />
                                </Link>
                            ))}
                        </nav>
                </div>
            </div>
            </div>{/* /dz-header-bg */}

            {/* ═══════════ 4 · ANNOUNCEMENT TICKER ═══════════
                The list is rendered twice and the track slides exactly -50%, so the
                second copy is under the cursor the moment the first runs out and the
                loop never shows a seam. Pauses on hover; see globals.css. */}
            <div className="hd-ticker relative w-full h-11 flex items-center overflow-hidden select-none">
                <div className="flex items-center marquee-track w-max">
                    {[...TICKER, ...TICKER].map((item, i) => (
                        <span key={i}
                            className="flex items-center gap-2 px-8 whitespace-nowrap shrink-0 justify-center border-r border-black/10 text-[13px] text-[#222]">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </header>
    );
};

// The logo and its height come from Settings → Store. With no logo uploaded, the
// built-in one is drawn at that height instead.
function HeaderLogo({ light = false, height, maxWidth = 260 }: { light?: boolean; height?: number; maxWidth?: number }) {
    const { logoUrl, logoHeight } = useTheme();
    const uploaded = logoUrl && logoUrl !== '/logo.svg';
    // The wordmark is ~4.8× as wide as it is tall, so on a 375px phone the full
    // height would leave no room for the three action squares beside it.
    const size = height ?? logoHeight;
    return (
        <div className="group select-none transition-transform duration-300 hover:scale-105">
            {uploaded
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoUrl} alt="Store" style={{ height: size, width: 'auto', maxWidth }} className="block object-contain" />
                : <Logo size={size} light={light} />}
        </div>
    );
}

export default Header;
