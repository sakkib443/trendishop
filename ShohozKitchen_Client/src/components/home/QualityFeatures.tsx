"use client";

import React from 'react';
import { FiTruck, FiAward, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

/**
 * The service bar that closes the product rows.
 *
 * Four promises in one framed row, divided by hairlines — no heading, no
 * kicker, no six shadowed tiles. A service bar is a statement of fact, not a
 * section, so it reads faster with nothing introducing it.
 */

const PROMISES = [
    { icon: FiTruck,      title: 'Fast Delivery',    desc: 'Dhaka in 24 hours · nationwide in 2–3 days' },
    { icon: FiAward,      title: 'Genuine Products', desc: '100% authentic with official warranty' },
    { icon: FiRefreshCw,  title: '7-Day Returns',    desc: 'Free replacement if it arrives wrong' },
    { icon: FiHeadphones, title: 'We Pick Up',       desc: 'Call or WhatsApp us, 10am – 10pm daily' },
];

const QualityFeatures: React.FC = () => {
    return (
        <section className="w-full">
            <div className="container mx-auto py-6 sm:py-8">
                <div className="svc-wrap">
                    <div className="svc-row">
                        {PROMISES.map((p) => (
                            <div key={p.title} className="svc-item">
                                <span className="svc-ico">
                                    <p.icon size={19} />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="svc-t">{p.title}</h3>
                                    <p className="svc-d">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QualityFeatures;
