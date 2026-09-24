"use client";

import React from 'react';
import Link from 'next/link';
import { FiArrowRight, FiShoppingBag, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import { telHref, whatsappHref } from '@/utils/contactLinks';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The home page's closing call to action.
 *
 * A rounded charcoal band carrying the same gradient as the header, so the
 * page is bookended by the brand's dark tone rather than the stock indigo it
 * shipped with. Two ways forward: the catalogue, or a human on the phone.
 */

const FALLBACK_PHONE = '01711946614';

const CtaBanner: React.FC = () => {
    const { data: siteRes } = useGetSiteContentQuery({});
    const contact: any = siteRes?.data?.contact || {};

    const phone = String(contact.phones?.[0] || contact.phone || FALLBACK_PHONE).trim();
    const tel = telHref(phone);
    const wa = whatsappHref(contact.whatsapp || siteRes?.data?.floating?.whatsapp || FALLBACK_PHONE);

    return (
        <section className="w-full">
            <div className="container mx-auto py-8 sm:py-12">
                <div className="cta-band px-6 py-9 sm:px-10 sm:py-12">
                    <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">

                        {/* Copy */}
                        <div className="max-w-xl">
                            <span className="cta-eyebrow"><i />Shop Trendy Shops</span>
                            <h2 className="cta-h mt-3">
                                Every gadget you want,<br className="hidden sm:block" /> at a price that makes sense.
                            </h2>
                            <p className="cta-p">
                                Phones, laptops, audio, wearables, monitors and power backup — genuine
                                stock with official warranty, delivered anywhere in Bangladesh.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch xl:flex-row">
                            <Link href="/products" className="cta-primary">
                                <FiShoppingBag size={16} />
                                Shop all products
                                <FiArrowRight size={16} />
                            </Link>

                            {wa ? (
                                <a href={wa} target="_blank" rel="noopener noreferrer" className="cta-ghost">
                                    <FaWhatsapp size={17} />
                                    {phone}
                                </a>
                            ) : tel ? (
                                <a href={tel} className="cta-ghost">
                                    <FiPhone size={16} />
                                    {phone}
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CtaBanner;
