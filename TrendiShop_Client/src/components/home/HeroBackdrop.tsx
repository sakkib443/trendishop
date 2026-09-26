import React from 'react';

/* Futuristic backdrop for the top of the home page. It sits behind the hero and
   the (now transparent) category row and fades out before the product grids.

   Purely decorative: aria-hidden, no pointer events. It paints above the page's
   warm base gradient and below every real element because the page wrapper is an
   `isolate` stacking context and this layer carries a negative z-index.

   The 3D read comes from the *space itself*, not from props: a flat mesh reads as
   a far wall, a second mesh is tilted back in perspective so its lines converge
   to a horizon, and a glowing vanishing line sits where the two meet. The result
   is a shallow room you look into. A film-grain texture and side-to-side light
   beams sit on top; everything is low-alpha so the section stays pale. */

// Inline SVG fractal noise — one small tile, repeated, for a faint surface grain.
const GRAIN =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const HeroBackdrop: React.FC = () => {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[880px] overflow-hidden"
            style={{
                // Solid through the hero and the whole category row, then dissolved
                // into the base gradient before the product grids begin, so the
                // layer's bottom edge never shows as a hard line.
                WebkitMaskImage: 'linear-gradient(to bottom, #000 84%, transparent 100%)',
                maskImage: 'linear-gradient(to bottom, #000 84%, transparent 100%)',
            }}
        >
            {/* Far wall — a flat mesh high up, revealed only near the top by a
                radial mask so the edges never show a hard cut-off. */}
            <div
                className="absolute inset-x-0 top-0 h-[52%]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(30, 58, 138, 0.04) 1px, transparent 1px),' +
                        'linear-gradient(90deg, rgba(30, 58, 138, 0.04) 1px, transparent 1px)',
                    backgroundSize: '54px 54px',
                    WebkitMaskImage: 'radial-gradient(120% 96% at 50% 2%, #000 24%, transparent 72%)',
                    maskImage: 'radial-gradient(120% 96% at 50% 2%, #000 24%, transparent 72%)',
                }}
            />

            {/* Floor — the same mesh tilted back in perspective so its lines run away
                from the viewer and converge toward the horizon behind the category
                row. This is the 3D: the page appears to have depth, not props. */}
            <div className="absolute inset-x-0 top-[45%] bottom-0 [perspective:560px] [perspective-origin:50%_0%]">
                <div
                    className="absolute inset-0 origin-top [transform:rotateX(62deg)]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(30, 58, 138, 0.09) 1px, transparent 1px),' +
                            'linear-gradient(90deg, rgba(30, 58, 138, 0.09) 1px, transparent 1px)',
                        backgroundSize: '52px 52px',
                        // Solid at the near edge (bottom), fading toward the horizon (top).
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 34%, #000 70%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, #000 34%, #000 70%, transparent 100%)',
                    }}
                />
            </div>

            {/* Vanishing line — a lit horizon where wall meets floor, plus a wide
                soft glow bleeding up from it, which is what actually sells the
                sense of distance. */}
            <div
                className="absolute left-1/2 top-[45%] h-44 w-[86%] -translate-x-1/2 -translate-y-1/2 blur-2xl"
                style={{ background: 'radial-gradient(ellipse 62% 52% at 50% 50%, rgba(56, 189, 248, 0.24), transparent 70%)' }}
            />
            <div
                className="absolute left-[8%] top-[45%] h-px w-[84%]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.42), transparent)' }}
            />

            {/* Grain texture over everything, multiplied in so it reads as a faint
                tactile surface rather than flat colour. */}
            <div
                className="absolute inset-0 opacity-[0.045] mix-blend-multiply"
                style={{ backgroundImage: GRAIN }}
            />

            {/* Diagonal light beams — full-width gradient rails tilted a few degrees
                so they sweep from one side to the other. Crisp hairline + blurred
                beam so the parts in open space read as soft light, not a bare line. */}
            <div
                className="absolute -left-[10%] top-[15%] h-px w-[120%] -rotate-[7deg]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.5), transparent)' }}
            />
            <div
                className="absolute -left-[10%] top-[21%] h-[3px] w-[120%] -rotate-[7deg] opacity-80 blur-[4px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(250, 204, 21, 0.55), transparent)' }}
            />
            <div
                className="absolute -left-[10%] top-[33%] h-px w-[120%] -rotate-[6deg]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(241, 90, 36, 0.36), transparent)' }}
            />
            <div
                className="absolute -left-[10%] top-[64%] h-[3px] w-[120%] -rotate-[4deg] opacity-70 blur-[4px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.34), transparent)' }}
            />

            {/* Ambient light glows — large, diffuse, blurred; they read as lighting
                in the space, giving the flat plane depth. */}
            <div
                className="absolute -top-24 right-[5%] h-80 w-80 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.32), transparent 68%)' }}
            />
            <div
                className="absolute top-[26%] -left-24 h-72 w-72 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(241, 90, 36, 0.18), transparent 70%)' }}
            />
            <div
                className="absolute top-[62%] right-[14%] h-64 w-64 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.16), transparent 72%)' }}
            />
        </div>
    );
};

export default HeroBackdrop;
