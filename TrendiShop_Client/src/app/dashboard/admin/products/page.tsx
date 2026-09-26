/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LuPlus, LuUpload, LuPencil, LuTrash2, LuExternalLink, LuPackage, LuX } from 'react-icons/lu';
import { useGetProductsQuery, useGetProductStatsQuery, useDeleteProductMutation, useUpdateProductMutation } from '@/redux/api/productApi';
import { toast } from 'react-hot-toast';
import BulkUploadModal from './BulkUploadModal';
import { useGetUnitsQuery, findUnit } from '@/redux/api/unitApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
    PageHeader, Btn, SearchInput, SelectPill, FilterBar, StatTile, Badge, TableCard, TH, TD, TR,
    EmptyRow, SkeletonRows, Pager, RowMenu, taka, fmtDateTime, cx, type Tone,
} from '@/components/admin/ui';

const PAGE_SIZE = 10;


const STATUS: Record<string, { label: string; tone: Tone }> = {
    active: { label: 'Active', tone: 'green' },
    draft: { label: 'Draft', tone: 'gray' },
    'out-of-stock': { label: 'Out of stock', tone: 'red' },
};

const STATUS_OPTIONS = Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }));

/** Debounce the search box so every keystroke doesn't hit the API. */
function useDebounced<T>(value: T, ms = 300) {
    const [v, setV] = useState(value);
    useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
    return v;
}

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkStatus, setBulkStatus] = useState('');
    const q = useDebounced(search);

    const { data, isLoading, isFetching } = useGetProductsQuery({
        // Drafts are listed only here (and only for a signed-in admin) — never on the storefront.
        includeDrafts: true,
        searchTerm: q || undefined,
        status: status !== 'all' ? status : undefined,
        sort: '-createdAt',
        page,
        limit: PAGE_SIZE,
    });
    const { data: statsData } = useGetProductStatsQuery(undefined);
    const [deleteProduct] = useDeleteProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    // Editors add and update products; deleting and bulk upload are for admins.
    const isEditor = useSelector((s: RootState) => s.auth.user?.role) === 'editor';
    const { data: units } = useGetUnitsQuery({ scope: 'all' });
    // Products store their unit as a word (e.g. "piece"); show the unit's short name.
    const unitShort = (u?: string) => findUnit(units, u || 'piece')?.shortName || (u || 'piece').toUpperCase();

    const products: any[] = data?.data || [];
    const meta = data?.meta || { total: 0, totalPages: 1 };
    const stats = statsData?.data || { total: 0, active: 0, draft: 0, outOfStock: 0 };

    // Any change of filter or page starts a fresh selection.
    const clearSelection = () => setSelected(new Set());
    const pick = (s: string) => { setStatus(s); setPage(1); clearSelection(); };
    const goToPage = (p: number) => { setPage(p); clearSelection(); };

    const handleDelete = async (p: any) => {
        if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
        try {
            await deleteProduct(p._id).unwrap();
            toast.success('Product deleted');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to delete product');
        }
    };

    // ── Bulk selection ──
    const allSelected = products.length > 0 && products.every((p: any) => selected.has(p._id));
    const someSelected = selected.size > 0 && !allSelected;

    const toggleOne = (id: string) => setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
    const toggleAll = () => setSelected((prev) => {
        const next = new Set(prev);
        if (products.every((p: any) => next.has(p._id))) products.forEach((p: any) => next.delete(p._id));
        else products.forEach((p: any) => next.add(p._id));
        return next;
    });

    const handleBulkStatus = async (newStatus: string) => {
        const ids = Array.from(selected);
        if (!ids.length || !newStatus) return;
        const tId = toast.loading(`Updating ${ids.length} product${ids.length > 1 ? 's' : ''}…`);
        const results = await Promise.allSettled(ids.map((id) => updateProduct({ id, data: { status: newStatus } }).unwrap()));
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.length - ok;
        if (ok > 0) toast.success(`Updated ${ok} product${ok > 1 ? 's' : ''} to ${STATUS[newStatus]?.label || newStatus}${failed ? ` · ${failed} failed` : ''}`, { id: tId });
        else toast.error('Could not update the selected products', { id: tId });
        clearSelection();
        setBulkStatus('');
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selected);
        if (!ids.length) return;
        if (!window.confirm(`Delete ${ids.length} product${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
        const tId = toast.loading(`Deleting ${ids.length} product${ids.length > 1 ? 's' : ''}…`);
        const results = await Promise.allSettled(ids.map((id) => deleteProduct(id).unwrap()));
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.length - ok;
        if (ok > 0) toast.success(`Deleted ${ok} product${ok > 1 ? 's' : ''}${failed ? ` · ${failed} failed` : ''}`, { id: tId });
        else toast.error('Could not delete the selected products', { id: tId });
        clearSelection();
    };

    return (
        <div>
            <PageHeader
                title="Products"
                subtitle="Manage the catalog - simple products and attribute-based variants."
                actions={<>
                    {!isEditor && <Btn icon={<LuUpload size={15} />} onClick={() => setShowBulkUpload(true)}>Bulk upload</Btn>}
                    <Btn variant="primary" icon={<LuPlus size={16} />} href="/dashboard/admin/products/new">Add product</Btn>
                </>}
            />

            {showBulkUpload && <BulkUploadModal onClose={() => setShowBulkUpload(false)} />}

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile label="All products" value={stats.total} active={status === 'all'} onClick={() => pick('all')} />
                <StatTile label="Active" value={stats.active} hint="Visible in the store" active={status === 'active'} onClick={() => pick('active')} />
                <StatTile label="Draft" value={stats.draft} hint="Hidden until published" active={status === 'draft'} onClick={() => pick('draft')} />
                <StatTile label="Out of stock" value={stats.outOfStock} active={status === 'out-of-stock'} onClick={() => pick('out-of-stock')} />
            </div>

            <FilterBar>
                <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); clearSelection(); }} placeholder="Search products…" />
                <SelectPill
                    ariaLabel="Status"
                    value={status}
                    onChange={pick}
                    className="sm:w-44"
                    options={[
                        { value: 'all', label: 'All statuses' },
                        { value: 'active', label: 'Active' },
                        { value: 'draft', label: 'Draft' },
                        { value: 'out-of-stock', label: 'Out of stock' },
                    ]}
                />
            </FilterBar>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--color-primary-border)] bg-[var(--color-primary-lightest)] px-4 py-3 sm:flex-row sm:items-center">
                    <p className="text-sm font-medium text-gray-800">
                        <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-primary)] px-2 text-xs text-white">{selected.size}</span>
                        product{selected.size > 1 ? 's' : ''} selected
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                        <SelectPill
                            ariaLabel="Change status"
                            className="w-48"
                            value={bulkStatus}
                            onChange={handleBulkStatus}
                            options={[{ value: '', label: 'Change status to…' }, ...STATUS_OPTIONS]}
                        />
                        {!isEditor && <Btn variant="danger" icon={<LuTrash2 size={15} />} onClick={handleBulkDelete}>Delete</Btn>}
                        <Btn variant="ghost" icon={<LuX size={15} />} onClick={clearSelection}>Clear</Btn>
                    </div>
                </div>
            )}

            <TableCard
                footer={<Pager page={page} totalPages={meta.totalPages} total={meta.total} pageSize={PAGE_SIZE} count={products.length} onPage={goToPage} noun="products" />}
            >
                <table className={`w-full ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
                    <thead>
                        <tr>
                            <th className={`${TH} w-10`}>
                                <input
                                    type="checkbox"
                                    aria-label="Select all products on this page"
                                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[var(--color-primary)]"
                                />
                            </th>
                            <th className={`${TH} w-12`}>#</th>
                            <th className={TH}>Product</th>
                            <th className={TH}>Category</th>
                            <th className={`${TH} text-right`}>Price</th>
                            <th className={`${TH} text-right`}>Stock</th>
                            <th className={TH}>Status</th>
                            <th className={TH}>Created</th>
                            <th className={`${TH} w-12`} />
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? <SkeletonRows cols={9} /> : products.length === 0 ? (
                            <EmptyRow colSpan={9}>
                                <LuPackage size={28} className="mx-auto mb-2 text-gray-300" />
                                {search || status !== 'all' ? 'No products match these filters.' : 'No products yet — add your first one.'}
                            </EmptyRow>
                        ) : products.map((p, i) => {
                            const st = STATUS[p.status] || { label: p.status, tone: 'gray' as Tone };
                            const low = p.stock <= (p.lowStockThreshold ?? 5);
                            const was = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : 0;
                            return (
                                <tr key={p._id} className={cx(TR, selected.has(p._id) && 'bg-[var(--color-primary-lightest)] hover:bg-[var(--color-primary-lightest)]')}>
                                    <td className={TD}>
                                        <input
                                            type="checkbox"
                                            aria-label="Select product"
                                            checked={selected.has(p._id)}
                                            onChange={() => toggleOne(p._id)}
                                            className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[var(--color-primary)]"
                                        />
                                    </td>
                                    <td className={`${TD} text-gray-400`}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                                    <td className={TD}>
                                        <div className="flex min-w-[260px] items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                {p.thumbnail ? <img src={p.thumbnail} alt="" className="h-full w-full object-cover" /> : <LuPackage className="text-gray-300" />}
                                            </div>
                                            <div className="min-w-0">
                                                <Link href={`/dashboard/admin/products/new?id=${p._id}`} className="line-clamp-1 font-medium text-gray-900 hover:text-[var(--color-primary)]">{p.name}</Link>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {p.sku || 'No SKU'}
                                                    {p.variants?.length > 0 && <> · {p.variants.length} variant{p.variants.length > 1 ? 's' : ''}</>}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={TD}>
                                        <span className="whitespace-nowrap">{p.category?.name || '—'}</span>
                                        {p.subCategory?.name && <span className="block text-xs text-gray-400">{p.subCategory.name}</span>}
                                    </td>
                                    <td className={`${TD} whitespace-nowrap text-right`}>
                                        <span className="font-medium text-gray-900">{taka(p.price)}</span>
                                        {was > 0 && <span className="block text-xs text-gray-400 line-through">{taka(was)}</span>}
                                    </td>
                                    <td className={`${TD} whitespace-nowrap text-right`}>
                                        <span className={p.stock === 0 ? 'font-medium text-red-600' : low ? 'font-medium text-amber-600' : ''}>
                                            {Number(p.stock || 0).toLocaleString('en-IN')} {unitShort(p.unit)}
                                        </span>
                                        {p.stock > 0 && low && <span className="block text-xs text-amber-600">Low</span>}
                                    </td>
                                    <td className={TD}><Badge tone={st.tone}>{st.label}</Badge></td>
                                    <td className={`${TD} whitespace-nowrap text-gray-500`}>{fmtDateTime(p.createdAt)}</td>
                                    <td className={`${TD} text-right`}>
                                        <RowMenu items={[
                                            { label: 'Edit', icon: <LuPencil size={15} />, href: `/dashboard/admin/products/new?id=${p._id}` },
                                            { label: 'View in store', icon: <LuExternalLink size={15} />, href: `/product/${p.slug}`, hidden: !p.slug || p.status !== 'active' },
                                            { label: 'Delete', icon: <LuTrash2 size={15} />, onClick: () => handleDelete(p), danger: true, hidden: isEditor },
                                        ]} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </TableCard>
        </div>
    );
}
