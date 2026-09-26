"use client";

import React, { useState, useLayoutEffect, useRef } from 'react';

// The preloader greets a visitor once, on the first page they open, and stays out
// of the way for the rest of the visit. `PRELOADER_SEEN_KEY` is also read by the
// inline script in app/layout.tsx, which hides the markup before first paint —
// keep the two in step.
export const PRELOADER_SEEN_KEY = 'trendishop:preloaded';

// Once the page itself has loaded, how long to keep waiting for the homepage's
// `trendishop:dataReady` cue before leaving anyway.
const DATA_GRACE_MS = 1200;
// Hard ceiling, in case neither signal ever arrives.
const SAFETY_MS = 4500;
// Never dismiss before this — gives the two-line greeting time to play out even
// when the page loads instantly.
const MIN_DISPLAY_MS = 2700;

const GREETING = 'Assalamu Alaikum';

function hasShownThisSession(): boolean {
    try {
        return window.sessionStorage.getItem(PRELOADER_SEEN_KEY) === '1';
    } catch {
        return false;
    }
}

function markShownThisSession(): void {
    try {
        window.sessionStorage.setItem(PRELOADER_SEEN_KEY, '1');
    } catch {
        /* ignore — a visitor who cannot be remembered just sees it again */
    }
}

// Keyframes ship inline so the overlay never depends on the global CSS pipeline.
const PL_CSS = `
@keyframes plRise     { from { opacity: 0; transform: translateY(1em); } to { opacity: 1; transform: translateY(0); } }
@keyframes plExitUp   { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-0.9em); } }
@keyframes plFloat    { 0%,100% { transform: translateY(0); opacity:.45; } 50% { transform: translateY(-9px); opacity:1; } }
@keyframes plGlow     { 0%,100% { opacity:.55; } 50% { opacity:1; } }
`;

/* ─── Main Preloader ─── */
const Preloader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [progress, setProgress] = useState(0);

    const pageLoadedRef = useRef(false);
    const dataReadyRef = useRef(false);
    const finishedRef = useRef(false);
    const startRef = useRef(0);

    useLayoutEffect(() => {
        if (hasShownThisSession()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoading(false);
            return;
        }
        markShownThisSession();
        startRef.current = Date.now();

        const markPage = () => { pageLoadedRef.current = true; };
        if (document.readyState === 'complete') pageLoadedRef.current = true;
        else window.addEventListener('load', markPage);

        const markData = () => { dataReadyRef.current = true; };
        window.addEventListener('trendishop:dataReady', markData);

        // Hold the overlay until BOTH the greeting has had time to play and the page
        // is ready, then fill to 100% and fade out.
        const finish = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            const wait = Math.max(0, MIN_DISPLAY_MS - (Date.now() - startRef.current));
            setTimeout(() => {
                setProgress(100);
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => setIsLoading(false), 650);
                }, 450);
            }, wait);
        };

        let grace: ReturnType<typeof setTimeout> | undefined;
        const startGrace = () => {
            if (grace === undefined) grace = setTimeout(finish, DATA_GRACE_MS);
        };

        const tick = setInterval(() => {
            setProgress(prev => {
                if (finishedRef.current) return prev;
                const bothReady = pageLoadedRef.current && dataReadyRef.current;
                if (bothReady) {
                    const next = prev + Math.max(3, (100 - prev) * 0.28);
                    if (next >= 100) { clearInterval(tick); finish(); return 100; }
                    return next;
                }
                if (pageLoadedRef.current) startGrace();
                const ceiling = pageLoadedRef.current ? 88 : dataReadyRef.current ? 60 : 82;
                if (prev >= ceiling) return ceiling;
                return prev + Math.max(1.2, (ceiling - prev) * 0.08);
            });
        }, 75);

        const safety = setTimeout(finish, SAFETY_MS);
        return () => {
            clearInterval(tick);
            clearTimeout(safety);
            if (grace !== undefined) clearTimeout(grace);
            window.removeEventListener('load', markPage);
            window.removeEventListener('trendishop:dataReady', markData);
        };
    }, []);

    if (!isLoading) return null;

    const rounded = Math.round(Math.min(progress, 100));

    return (
        <div
            id="trendy-preloader"
            className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden transition-opacity duration-[650ms] ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{
                background: 'radial-gradient(130% 100% at 50% 38%, #241c11 0%, #15120e 46%, #0b0a08 100%)',
                pointerEvents: fadeOut ? 'none' : 'auto',
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: PL_CSS }} />

            {/* Warm gold bloom, breathing softly */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(42% 40% at 50% 46%, rgba(203,132,59,0.22), transparent 72%)', animation: 'plGlow 3s ease-in-out infinite' }}
            />
            {/* A few slow-floating gold motes */}
            {[
                { left: '20%', top: '32%', d: '0s', s: 4 },
                { left: '80%', top: '30%', d: '0.7s', s: 3 },
                { left: '30%', top: '66%', d: '1.2s', s: 3 },
                { left: '72%', top: '64%', d: '0.4s', s: 4 },
            ].map((m, i) => (
                <span
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: m.left, top: m.top, width: m.s, height: m.s,
                        background: 'rgba(242,180,106,0.85)', boxShadow: '0 0 8px rgba(242,180,106,0.7)',
                        animation: `plFloat 3.6s ease-in-out ${m.d} infinite`,
                    }}
                />
            ))}

            {/* ── The two-line greeting, both centred in the same slot ── */}
            <div className="relative z-10 flex items-center justify-center px-6" style={{ height: '1.6em' }}>

                {/* Phase 1 — "Assalamu Alaikum" rises letter by letter, then lifts away */}
                <div
                    className="absolute whitespace-nowrap"
                    style={{ animation: 'plExitUp 0.65s ease-in 1.55s forwards' }}
                    aria-label={GREETING}
                >
                    <span className="inline-flex" style={{ overflow: 'hidden', paddingBottom: '0.12em' }}>
                        {GREETING.split('').map((ch, i) => (
                            <span
                                key={i}
                                aria-hidden
                                style={{
                                    display: 'inline-block',
                                    whiteSpace: 'pre',
                                    color: '#fff',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 500,
                                    fontSize: 'clamp(20px, 5.2vw, 34px)',
                                    letterSpacing: '0.03em',
                                    animation: 'plRise 0.6s cubic-bezier(.2,.7,.2,1) both',
                                    animationDelay: `${0.06 + i * 0.045}s`,
                                }}
                            >
                                {ch === ' ' ? ' ' : ch}
                            </span>
                        ))}
                    </span>
                </div>

                {/* Phase 2 — "Welcome to TrendiShop" slides up from below */}
                <div
                    className="absolute whitespace-nowrap"
                    style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: 'clamp(20px, 5.6vw, 36px)',
                        letterSpacing: '0.01em',
                        opacity: 0,
                        animation: 'plRise 0.7s cubic-bezier(.2,.7,.2,1) 1.95s forwards',
                    }}
                >
                    <span style={{ color: '#fff' }}>Welcome to </span>
                    <span style={{ color: '#fff' }}>Trendi</span>
                    <span style={{ color: 'var(--color-primary)' }}>Shop</span>
                </div>
            </div>

            {/* Thin progress line pinned to the bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                    className="h-full"
                    style={{
                        width: `${rounded}%`,
                        background: 'linear-gradient(90deg, #f4c07a, #f15a24)',
                        boxShadow: '0 0 12px rgba(241,90,36,0.6)',
                        transition: 'width 0.35s ease',
                    }}
                />
            </div>
        </div>
    );
};

export default Preloader;
