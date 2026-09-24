/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux';
import { logout } from '@/redux/slices/authSlice';
import Logo from '@/components/shared/Logo';
import { FiMapPin, FiMail, FiPhone, FiGlobe, FiArrowRight } from 'react-icons/fi';
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import { telHref, whatsappHref } from '@/utils/contactLinks';
import { homeFor, isStaffRole } from '@/components/admin/access';
import type { IconType } from 'react-icons';

/**
 * The site footer.
 *
 * Charcoal, on the same gradient and the same 18px corner radius as the
 * header — so the page opens and closes on the brand's dark tone with the
 * light catalogue between.
 *
 * Organised in four bands, widest concern first: newsletter, then five
 * columns (brand · shop · help · policies · contact), then the payment strip,
 * then the copyright line. The link columns are declared as data below rather
 * than written out as markup, which is what keeps them the same width, the
 * same spacing and the same order every time one is edited.
 *
 * Everything contactable is still driven by Admin → Site Content; an empty
 * field is simply not rendered.
 */

/* ─── Map a social label to its icon (case-insensitive) ─── */
const SOCIAL_ICONS: { match: string; icon: IconType }[] = [
    { match: 'facebook', icon: FaFacebookF },
    { match: 'instagram', icon: FaInstagram },
    { match: 'youtube', icon: FaYoutube },
    { match: 'linkedin', icon: FaLinkedinIn },
    { match: 'twitter', icon: FaXTwitter },
    { match: 'tiktok', icon: FaTiktok },
    { match: 'whatsapp', icon: FaWhatsapp },
];

const getSocialIcon = (label: string): IconType => {
    const found = SOCIAL_ICONS.find((s) => label.toLowerCase().includes(s.match));
    return found?.icon || FaFacebookF;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/* The three link columns. Every href here is a page that exists. */
const LINK_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
    {
        heading: 'Shop',
        links: [
            { label: 'All Products', href: '/products' },
            { label: 'Phones', href: '/products?category=phones' },
            { label: 'Laptops', href: '/products?category=laptops' },
            { label: 'Audio', href: '/products?category=audio' },
            { label: 'Wishlist', href: '/wishlist' },
        ],
    },
    {
        heading: 'Help',
        links: [
            { label: 'Track Order', href: '/track' },
            { label: 'Contact Us', href: '/contact' },
            { label: 'Our Services', href: '/services' },
            { label: 'Payment Methods', href: '/payment' },
        ],
    },
    {
        heading: 'Policies',
        links: [
            { label: 'Terms & Conditions', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Refund Policy', href: '/refund' },
        ],
    },
];

/* The wallets and cards the shop takes. Drawn as text chips rather than
   loaded as logos — six tiny images is six more requests for no gain.
   These are each brand's hue lifted toward white, because the real colours
   (#1A1F71 Visa, #00529B DBBL) all but vanish against the charcoal glass. */
const PAYMENTS: { label: string; color: string; size?: string }[] = [
    { label: 'VISA', color: '#A9B6FF', size: 'text-[11px]' },
    { label: 'Mastercard', color: '#EB001B' },
    { label: 'bKash', color: '#FF6F96' },
    { label: 'Nagad', color: '#FFB35C' },
    { label: 'Rocket', color: '#D090D0' },
    { label: 'DBBL', color: '#6FB5EE' },
];

const NewFooter: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { data: siteRes } = useGetSiteContentQuery({});

    // ── Newsletter subscribe ──
    const [email, setEmail] = React.useState('');
    const [subscribing, setSubscribing] = React.useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = email.trim();
        if (!value) {
            toast.error('Please enter your email');
            return;
        }
        setSubscribing(true);
        try {
            const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: value }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json?.message || 'Subscription failed');
            }
            toast.success(json?.message || 'Subscribed! Thanks for joining our newsletter.');
            setEmail('');
        } catch (err: any) {
            toast.error(err?.message || 'Subscription failed. Please try again.');
        } finally {
            setSubscribing(false);
        }
    };

    // Social links from DB (admin → site-content). Only show ones with a real URL.
    const socials: { label: string; url: string }[] = (siteRes?.data?.contact?.socials || [])
        .filter((s: any) => s?.url && s.url !== '#');

    // Contact info from Admin → Site Content. No sample fallbacks: an empty field is
    // simply not shown (and links nowhere) until an admin fills it in.
    const contact = siteRes?.data?.contact || {};
    const clean = (list: unknown): string[] => (Array.isArray(list) ? list : []).map((v) => String(v ?? '').trim()).filter(Boolean);
    const phoneList: string[] = clean(contact.phones).length > 0 ? clean(contact.phones) : clean([contact.phone]);
    const emailList: string[] = clean(contact.emails).length > 0 ? clean(contact.emails) : clean([contact.email]);
    const website: string = String(contact.website || '').trim().replace(/^https?:\/\//i, '');
    const corporateOffice: string = String(contact.corporateOffice || contact.address || '').trim();
    const warehouse: string = String(contact.warehouse || '').trim();

    // "Live Chat (WhatsApp)" — only when a WhatsApp number is set.
    const whatsappLink = whatsappHref(contact.whatsapp || siteRes?.data?.floating?.whatsapp);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        toast.success('Logged out successfully');
        router.push('/');
    };

    const year = new Date().getFullYear();
    const companyName = siteRes?.data?.footer?.companyName || 'Trendy Shops';
    const copyright = siteRes?.data?.footer?.copyright || '© ' + year + ' ' + companyName + '. All rights reserved.';

    const accountLink = isAuthenticated
        ? { label: 'My Account', href: isStaffRole(user?.role) ? homeFor(user?.role) : '/dashboard/user' }
        : { label: 'Sign In / Register', href: '/login' };

    return (
        <footer className="ft mt-6">

            {/* ── Band 1 · Newsletter ── */}
            <div className="container mx-auto px-4 py-8 sm:py-9">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h4 className="ft-h">Subscribe to our newsletter</h4>
                        <p className="ft-meta mt-1.5">
                            New arrivals, price drops and offers — straight to your inbox.
                        </p>
                    </div>
                    <form onSubmit={handleSubscribe} className="ft-form w-full max-w-md">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            aria-label="Email address"
                            disabled={subscribing}
                            className="ft-input"
                        />
                        <button type="submit" disabled={subscribing} className="ft-sub">
                            {subscribing ? 'Subscribing…' : 'Subscribe'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ── Band 2 · Brand, links, contact ── */}
            <div className="ft-rule">
                <div className="container mx-auto px-4 py-9 sm:py-11">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-12 lg:gap-8">

                        {/* Brand + address */}
                        <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                            <Link href="/" className="inline-flex select-none items-center" aria-label={companyName}>
                                <Logo size={58} light />
                            </Link>

                            <div className="mt-5 space-y-3">
                                {corporateOffice && (
                                    <div className="flex items-start gap-2.5">
                                        <FiMapPin size={14} className="ft-ico mt-[3px]" />
                                        <p className="ft-meta"><span className="ft-strong">Corporate Office:</span> {corporateOffice}</p>
                                    </div>
                                )}
                                {warehouse && (
                                    <div className="flex items-start gap-2.5">
                                        <FiMapPin size={14} className="ft-ico mt-[3px]" />
                                        <p className="ft-meta"><span className="ft-strong">Warehouse:</span> {warehouse}</p>
                                    </div>
                                )}
                                {website && (
                                    <div className="flex items-start gap-2.5">
                                        <FiGlobe size={14} className="ft-ico mt-[3px]" />
                                        <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="ft-a">{website}</a>
                                    </div>
                                )}
                                {emailList.map((em) => (
                                    <div key={em} className="flex items-center gap-2.5">
                                        <FiMail size={14} className="ft-ico" />
                                        <a href={`mailto:${em}`} className="ft-a break-all">{em}</a>
                                    </div>
                                ))}
                            </div>

                            {socials.length > 0 && (
                                <div className="mt-6 flex items-center gap-2.5">
                                    {socials.map((s) => {
                                        const Icon = getSocialIcon(s.label);
                                        return (
                                            <a
                                                key={s.label}
                                                href={s.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={s.label}
                                                className="ft-soc"
                                            >
                                                <Icon size={14} />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Three link columns, identical by construction */}
                        {LINK_COLUMNS.map((col) => (
                            <nav key={col.heading} className="lg:col-span-2" aria-label={col.heading}>
                                <h4 className="ft-h mb-4">{col.heading}</h4>
                                <ul className="space-y-2.5">
                                    {col.links.map((l) => (
                                        <li key={l.href}>
                                            <Link href={l.href} className="ft-a">{l.label}</Link>
                                        </li>
                                    ))}
                                    {/* The account link belongs under Help, but only it changes
                                        with auth state — so it is appended rather than declared. */}
                                    {col.heading === 'Help' && (
                                        <li><Link href={accountLink.href} className="ft-a">{accountLink.label}</Link></li>
                                    )}
                                </ul>
                            </nav>
                        ))}

                        {/* Contact */}
                        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                            <h4 className="ft-h mb-4">Talk to us</h4>
                            <div className="space-y-2.5">
                                {phoneList.map((p, i) => {
                                    const href = telHref(p);
                                    if (!href) return null;
                                    const isPrimary = i === 0;
                                    return (
                                        <a
                                            key={p}
                                            href={href}
                                            className={isPrimary
                                                ? 'flex items-center gap-2.5 text-[17px] font-bold text-white hover:opacity-90'
                                                : 'ft-a flex items-center gap-2.5'}
                                        >
                                            <FiPhone
                                                size={isPrimary ? 16 : 14}
                                                className={isPrimary ? 'text-[var(--color-primary)]' : 'ft-ico'}
                                            />
                                            {p}
                                        </a>
                                    );
                                })}
                                {whatsappLink && (
                                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="ft-a flex items-center gap-2.5">
                                        <FaWhatsapp size={14} className="ft-ico" />
                                        WhatsApp
                                        <FiArrowRight size={12} />
                                    </a>
                                )}
                                <p className="ft-meta">10am – 10pm, seven days a week.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Band 3 · Payment strip ── */}
            <div className="ft-rule">
                <div className="container mx-auto px-4 py-5">
                    <div className="flex flex-col items-center gap-3.5 sm:flex-row sm:justify-between">
                        <h4 className="ft-h">We Accept</h4>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {PAYMENTS.map((p) => (
                                <div key={p.label} className="ft-pay w-[62px]" title={p.label}>
                                    {p.label === 'Mastercard' ? (
                                        <span className="flex items-center">
                                            <span className="h-3.5 w-3.5 rounded-full bg-[#EB001B] opacity-85" />
                                            <span className="-ml-2 h-3.5 w-3.5 rounded-full bg-[#F79E1B] opacity-85" />
                                        </span>
                                    ) : (
                                        <span
                                            className={'font-bold tracking-tight ' + (p.size || 'text-[10px]')}
                                            style={{ color: p.color }}
                                        >
                                            {p.label}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Band 4 · Copyright ── */}
            <div className="ft-rule">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col items-center justify-between gap-2.5 md:flex-row">
                        <p className="text-xs text-white/40">{copyright}</p>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-white/40">
                                Developed by{' '}
                                <a
                                    href="https://www.extrainweb.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-white/65 transition-colors hover:text-[var(--color-primary)]"
                                >
                                    Extrain Web
                                </a>
                            </span>
                            <a
                                href="https://www.facebook.com/extrainweb"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Extrain Web on Facebook"
                                className="text-white/40 transition-colors hover:text-[var(--color-primary)]"
                            >
                                <FaFacebookF size={13} />
                            </a>
                            <a
                                href="https://www.extrainweb.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Extrain Web website"
                                className="text-white/40 transition-colors hover:text-[var(--color-primary)]"
                            >
                                <FiGlobe size={13} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default NewFooter;
