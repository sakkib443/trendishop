"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiUpload, FiTrash2, FiSend, FiBox } from 'react-icons/fi';
import { useCreateInquiryMutation } from '@/redux/api/inquiryApi';

const COUNTRIES = [
    'China', 'India', 'USA', 'UK', 'Germany', 'Japan',
    'South Korea', 'Thailand', 'Vietnam', 'Malaysia', 'Other',
];

const CATEGORIES = [
    'Phones', 'Laptops', 'Audio', 'Wearables', 'Monitors',
    'Tablets', 'Power & Backup', 'Accessories', 'Home Appliances', 'Other',
];

const SHIPPING_TYPES = ['By Air (fast)', 'By Ship (economy)', 'Whatever is cheapest'];
const UNITS = ['Piece', 'Box', 'Set', 'Pair', 'KG', 'Carton'];

interface FormState {
    name: string;
    phone: string;
    email: string;
    productName: string;
    productCategory: string;
    sourcingCountry: string;
    productLink: string;
    quantity: string;
    unit: string;
    aboutProduct: string;
    shippingType: string;
    deliveryArea: string;
}

const EMPTY: FormState = {
    name: '',
    phone: '',
    email: '',
    productName: '',
    productCategory: '',
    sourcingCountry: '',
    productLink: '',
    quantity: '',
    unit: 'Piece',
    aboutProduct: '',
    shippingType: 'By Air (fast)',
    deliveryArea: '',
};

/** Fields that feed the completeness meter. Photos are tracked separately. */
const completenessFields: { key: keyof FormState | 'photos'; label: string }[] = [
    { key: 'name', label: 'Your Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'productName', label: 'Product Name' },
    { key: 'productCategory', label: 'Category' },
    { key: 'photos', label: 'Product Photo' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'aboutProduct', label: 'Details' },
    { key: 'deliveryArea', label: 'Delivery Area' },
];

const API = process.env.NEXT_PUBLIC_API_URL || '';

const inputCls =
    'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(var(--color-primary-rgb),0.12)]';
const labelCls = 'block text-[13px] font-semibold text-gray-700 mb-1.5';

const RequestQuotationPage: React.FC = () => {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const [createInquiry] = useCreateInquiryMutation();

    const set = (key: keyof FormState, value: string) => setForm(prev => ({ ...prev, [key]: value }));

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const arr = [...photos, ...Array.from(files)].filter(f => f.type.startsWith('image/')).slice(0, 4);
        setPhotos(arr);
        setPreviews(arr.map(f => URL.createObjectURL(f)));
    };

    const removePhoto = (i: number) => {
        const next = photos.filter((_, idx) => idx !== i);
        setPhotos(next);
        setPreviews(next.map(f => URL.createObjectURL(f)));
    };

    const isFilled = (key: keyof FormState | 'photos') =>
        key === 'photos' ? photos.length > 0 : String(form[key]).trim().length > 0;

    const filledCount = completenessFields.filter(f => isFilled(f.key)).length;
    const pct = Math.round((filledCount / completenessFields.length) * 100);
    const meterLabel = pct < 40 ? 'POOR' : pct < 70 ? 'FAIR' : pct < 90 ? 'GOOD' : 'GREAT';
    const meterColor = pct < 40 ? '#EF4444' : pct < 70 ? '#F59E0B' : pct < 90 ? '#3B82F6' : '#22C55E';

    // Donut geometry
    const r = 54, cx = 70, cy = 70, strokeW = 11;
    const circumference = 2 * Math.PI * r;
    const dash = (pct / 100) * circumference;

    const canSubmit = form.name.trim() && form.phone.trim() && form.productName.trim() && !submitting;

    const uploadPhotos = async (): Promise<string[]> => {
        if (photos.length === 0) return [];
        const fd = new FormData();
        photos.forEach(f => fd.append('images', f));
        const res = await fetch(`${API}/upload/images`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Image upload failed');
        const json = await res.json();
        return json?.data?.urls || [];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        setError('');
        try {
            const urls = await uploadPhotos();

            const lines = [
                `Product: ${form.productName}`,
                form.productCategory && `Category: ${form.productCategory}`,
                form.sourcingCountry && `Sourcing country: ${form.sourcingCountry}`,
                form.productLink && `Reference link: ${form.productLink}`,
                (form.quantity || form.unit) && `Quantity: ${form.quantity || '1'} ${form.unit}`,
                form.shippingType && `Preferred shipping: ${form.shippingType}`,
                form.deliveryArea && `Delivery area: ${form.deliveryArea}`,
                form.aboutProduct && `\nDetails:\n${form.aboutProduct}`,
            ].filter(Boolean);

            await createInquiry({
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                subject: `Product Request: ${form.productName.trim()}`,
                message: lines.join('\n'),
                images: urls,
            }).unwrap();

            setSuccess(true);
            setForm(EMPTY);
            setPhotos([]);
            setPreviews([]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please check your details and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Success screen ── */
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: PAGE_BG }}>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-md text-center">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5"
                        style={{ background: 'rgba(var(--color-primary-rgb),0.10)' }}>
                        <FiCheckCircle size={40} className="text-[var(--color-primary)]" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Request Received!</h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-7">
                        Thanks — our sourcing team will review your product request and get back to you
                        with pricing and availability, usually within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => setSuccess(false)}
                            className="px-6 py-3 rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-dark)] transition-colors">
                            Request Another
                        </button>
                        <Link href="/"
                            className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: PAGE_BG }}>

            {/* ── Hero ── */}
            <div style={{ background: HERO_BG }} className="relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: HERO_GLOW }} />
                <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-6 transition-colors">
                        <FiArrowLeft size={16} /> Back to store
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                            style={{ background: 'rgba(203,132,59,0.18)', color: 'var(--hd-gold)', border: '1px solid rgba(222,180,117,0.35)' }}>
                            <FiBox size={12} /> Sourcing Service
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight max-w-2xl">
                        Can&apos;t find it here?{' '}
                        <span style={{ color: 'var(--hd-gold)' }}>We&apos;ll source it for you.</span>
                    </h1>
                    <p className="text-white/60 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
                        Upload a photo of any product — even ones not in our store — and our team will bring it
                        in for you with the best price. Fill in the details below to get started.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6">
                        {['Share the product & a photo', 'We source it & quote you', 'Approve & we deliver'].map((s, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ background: i === 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)' }}>
                                    {i + 1}
                                </span>
                                <span className="text-[13px] text-white/70">{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">

                    {/* Left: form */}
                    <div className="flex-1 space-y-6">

                        {/* Your details */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-primary)' }}>1</span>
                                Your details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Your name <span className="text-red-500">*</span></label>
                                    <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahim Uddin" />
                                </div>
                                <div>
                                    <label className={labelCls}>Phone <span className="text-red-500">*</span></label>
                                    <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelCls}>Email <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" />
                                </div>
                            </div>
                        </section>

                        {/* Product */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-primary)' }}>2</span>
                                What do you want?
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className={labelCls}>Product name <span className="text-red-500">*</span></label>
                                    <input className={inputCls} value={form.productName} onChange={e => set('productName', e.target.value)}
                                        placeholder="Be specific — e.g. 'Anker 737 Power Bank' not just 'power bank'" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelCls}>Category</label>
                                        <select className={`${inputCls} appearance-none`} value={form.productCategory} onChange={e => set('productCategory', e.target.value)}>
                                            <option value="">Select a category</option>
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Bring it from</label>
                                        <select className={`${inputCls} appearance-none`} value={form.sourcingCountry} onChange={e => set('sourcingCountry', e.target.value)}>
                                            <option value="">No preference</option>
                                            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Reference link <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input className={inputCls} type="url" value={form.productLink} onChange={e => set('productLink', e.target.value)}
                                        placeholder="Paste a link from AliExpress, Amazon, Daraz, etc." />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelCls}>Quantity</label>
                                        <div className="flex gap-3">
                                            <input className={inputCls} type="number" min={1} value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="1" />
                                            <select className={`${inputCls} !w-32 appearance-none`} value={form.unit} onChange={e => set('unit', e.target.value)}>
                                                {UNITS.map(u => <option key={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Preferred shipping</label>
                                        <select className={`${inputCls} appearance-none`} value={form.shippingType} onChange={e => set('shippingType', e.target.value)}>
                                            {SHIPPING_TYPES.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Details & requirements</label>
                                    <textarea rows={4} className={`${inputCls} resize-none`} value={form.aboutProduct} onChange={e => set('aboutProduct', e.target.value)}
                                        placeholder="Colour, variant, model, specs, budget, or anything else that helps us find the exact item." />
                                </div>
                            </div>
                        </section>

                        {/* Photos */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                            <h2 className="text-base font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-primary)' }}>3</span>
                                Add a photo
                            </h2>
                            <p className="text-xs text-gray-400 mb-4 ml-8">A clear picture helps us match the exact product. Up to 4 images.</p>

                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                                onClick={() => fileRef.current?.click()}
                                className={`w-full border-2 border-dashed rounded-xl py-9 flex flex-col items-center justify-center cursor-pointer transition-colors
                                    ${dragOver ? 'border-[var(--color-primary)] bg-[var(--color-primary-lightest)]' : 'border-gray-200 bg-gray-50 hover:border-[var(--color-primary-border)]'}`}
                            >
                                <FiUpload size={26} className="text-[var(--color-primary)] mb-2" />
                                <p className="text-sm text-gray-500">
                                    Drag &amp; drop or <span className="text-[var(--color-primary)] font-semibold underline">choose images</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · up to 4 files</p>
                            </div>
                            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />

                            {previews.length > 0 && (
                                <div className="grid grid-cols-4 gap-3 mt-4">
                                    {previews.map((src, i) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                                            <img src={src} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FiTrash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Delivery + submit */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
                            <div className="mb-5">
                                <label className={labelCls}>Delivery area</label>
                                <input className={inputCls} value={form.deliveryArea} onChange={e => set('deliveryArea', e.target.value)}
                                    placeholder="e.g. Mirpur, Dhaka" />
                            </div>

                            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                            <button type="submit" disabled={!canSubmit}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                                style={{ background: 'linear-gradient(140deg, var(--color-primary), var(--color-primary-dark))' }}>
                                <FiSend size={16} /> {submitting ? 'Sending…' : 'Send Request'}
                            </button>
                            <p className="text-xs text-gray-400 mt-3">No payment now — we quote first, you decide.</p>
                        </section>
                    </div>

                    {/* Right: completeness */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-6">
                            <h3 className="text-base font-bold text-gray-900 text-center mb-4">Request strength</h3>
                            <div className="flex justify-center mb-4">
                                <svg width="140" height="140" viewBox="0 0 140 140">
                                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={strokeW} />
                                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={meterColor} strokeWidth={strokeW}
                                        strokeDasharray={`${dash} ${circumference - dash}`}
                                        strokeDashoffset={circumference / 4} strokeLinecap="round"
                                        style={{ transition: 'stroke-dasharray 0.4s ease, stroke 0.3s ease' }} />
                                    <text x={cx} y={cy - 2} textAnchor="middle" fontSize="17" fontWeight="bold" fill={meterColor}>{meterLabel}</text>
                                    <text x={cx} y={cy + 18} textAnchor="middle" fontSize="12" fill="#9CA3AF">{pct}%</text>
                                </svg>
                            </div>
                            <p className="text-xs text-gray-400 text-center mb-5">The more you fill in, the faster and more accurate our quote.</p>
                            <ul className="space-y-2.5">
                                {completenessFields.map(f => {
                                    const filled = isFilled(f.key);
                                    return (
                                        <li key={f.key} className="flex items-center gap-2.5 text-sm">
                                            {filled
                                                ? <FiCheckCircle className="text-green-500 flex-shrink-0" size={17} />
                                                : <FiXCircle className="text-gray-300 flex-shrink-0" size={17} />}
                                            <span className={filled ? 'text-gray-700' : 'text-gray-400'}>{f.label}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

/* Home-matching surfaces: warm cream page, charcoal hero with a gold bloom. */
const PAGE_BG =
    'radial-gradient(60% 50% at 90% -5%, rgba(250,204,21,0.06), transparent 70%),' +
    'radial-gradient(50% 42% at 0% 18%, rgba(245,158,11,0.035), transparent 72%),' +
    'linear-gradient(180deg, #FFFFFF 0%, #FFFEF9 55%, #FFFCF2 100%)';
const HERO_BG = 'linear-gradient(135deg, #1c1a17 0%, #262019 55%, #2e2114 100%)';
const HERO_GLOW = 'radial-gradient(50% 120% at 88% 0%, rgba(203,132,59,0.28), transparent 60%)';

export default RequestQuotationPage;
