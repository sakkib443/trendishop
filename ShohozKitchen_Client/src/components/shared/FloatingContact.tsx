"use client";

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';
import { useGetSiteContentQuery } from '@/redux/api/siteContentApi';
import { resolveContactChannels, whatsappHref } from '@/utils/contactLinks';

/**
 * The floating stack: back-to-top, and WhatsApp.
 *
 * This used to carry three — the TrendyBot chat panel, a call button and
 * Messenger. Three buttons stacked up the right edge is a lot of furniture
 * for a shop this size, so WhatsApp is the only contact button now. (The old
 * chat assistant is still in git at 62f2c67 if it is ever wanted back; the
 * /assistant/chat endpoint it called is untouched on the server.)
 *
 * The number comes from Admin → Site Content (Floating Widget, else Contact
 * Info); the shop's own number is the last resort so the button is never
 * missing.
 */

const FALLBACK_WHATSAPP = '01711946614';

/** How far down the page the back-to-top button appears. */
const REVEAL_AT = 400;

const FloatingContact: React.FC = () => {
    const { data: res } = useGetSiteContentQuery({});

    const ch = resolveContactChannels(res?.data);
    const link = (ch.showWhatsapp && ch.whatsappHref) || whatsappHref(FALLBACK_WHATSAPP);

    // ── Back to top ──
    const [showTop, setShowTop] = React.useState(false);

    React.useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > REVEAL_AT);
        onScroll(); // in case the page is restored mid-scroll
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        /* On mobile it sits above the 58px MobileBottomNav so it never covers
           the Sign In tab; normal position from sm up. */
        <div className="fixed bottom-[72px] right-4 z-[9999] flex flex-col items-end gap-3 sm:bottom-5">

            {/* Back to top — slides up into place once the page has scrolled.
                It keeps its slot in the stack either way (pointer-events off
                while hidden), so WhatsApp never jumps as it appears. */}
            <div className="group relative flex items-center">
                <div className="pointer-events-none absolute right-full mr-2 translate-x-2 whitespace-nowrap rounded-lg bg-[#221f1c] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                    Back to top
                    <div className="absolute right-[-4px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-4 border-l-4 border-t-4 border-b-transparent border-l-[#221f1c] border-t-transparent" />
                </div>
                <button
                    type="button"
                    onClick={toTop}
                    aria-label="Back to top"
                    tabIndex={showTop ? 0 : -1}
                    aria-hidden={!showTop}
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 ease-out hover:scale-110 ${showTop
                        ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                        : 'pointer-events-none translate-y-3 scale-75 opacity-0'
                        }`}
                    style={{
                        backgroundImage: 'linear-gradient(to bottom, #3b352f 0%, #221f1c 100%)',
                        boxShadow: '0 4px 15px rgba(15, 23, 42, 0.35)',
                    }}
                >
                    <FiArrowUp size={20} />
                </button>
            </div>

            {/* WhatsApp */}
            {link && (
                <div className="group relative flex items-center">
                    <div className="pointer-events-none absolute right-full mr-2 translate-x-2 whitespace-nowrap rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                        Chat on WhatsApp
                        <div className="absolute right-[-4px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-4 border-l-4 border-t-4 border-b-transparent border-l-[#25D366] border-t-transparent" />
                    </div>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat on WhatsApp"
                        className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-110"
                        style={{
                            background: 'linear-gradient(135deg, #25D366, #128C7E)',
                            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                        }}
                    >
                        <FaWhatsapp size={24} />
                    </a>
                </div>
            )}
        </div>
    );
};

export default FloatingContact;
