import React from 'react';

/**
 * The Trendy Shops logo: a two-tone "Trendy Shops" wordmark with a small
 * raised BD, and a rounded-square TS monogram for tight spaces.
 *
 * Drawn as inline SVG rather than loaded as an image so it stays crisp at
 * every size, picks up the site font, and can recolour itself for dark
 * backgrounds. The same artwork is available as static files for favicons /
 * OG images: `/logo.svg` (full lockup) and `/logo-mark.svg` (monogram only).
 */

const BRAND = 'var(--color-primary)';
const INK = '#202020';

const FONT = "Poppins, 'Segoe UI', Arial, Helvetica, sans-serif";

/** Lockup geometry — the wordmark occupies 0…198 on a 48-high grid. */
const LOCKUP_W = 198;

/** The TS monogram, on its own 48×48 grid. */
const Mark = ({ light = false }: { light?: boolean }) => (
    <>
        <rect x="0" y="0" width="48" height="48" rx="12" fill={light ? '#ffffff' : BRAND} />
        <text
            x="24"
            y="33"
            textAnchor="middle"
            fontFamily={FONT}
            fontSize="23"
            fontWeight={800}
            letterSpacing="-0.8"
            fill={light ? BRAND : '#ffffff'}
        >
            TS
        </text>
    </>
);

interface LogoProps {
    /** Logo height in px. */
    size?: number;
    /** On a dark background — the wordmark switches to white. */
    light?: boolean;
    /** Explicit white rounded chip behind the logo. */
    boxed?: boolean;
    /** Kept for API compatibility. */
    showTagline?: boolean;
    /** Render just the monogram, without the wordmark. */
    iconOnly?: boolean;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({
    size = 40,
    light = false,
    boxed = false,
    iconOnly = false,
    className,
}) => {
    // "Shops" stays brand-coloured on both grounds — that contrast against the
    // first word is what makes the lockup read as a mark rather than as text.
    const wordFill = light ? '#ffffff' : INK;
    const bdFill = light ? '#ffffff' : BRAND;

    const svg = iconOnly ? (
        <svg
            viewBox="0 0 48 48"
            height={size}
            width={size}
            role="img"
            aria-label="Trendy Shops"
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        >
            <Mark light={light} />
        </svg>
    ) : (
        <svg
            viewBox={`0 0 ${LOCKUP_W} 48`}
            height={size}
            width={size * (LOCKUP_W / 48)}
            role="img"
            aria-label="Trendy Shops BD"
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        >
            {/* One <text> with tspans: the BD rides on the flow of the word
                before it, so it lands correctly whatever the font metrics are
                rather than at a guessed x. */}
            <text
                x="0"
                y="33"
                fontFamily={FONT}
                fontSize="26"
                fontWeight={800}
                letterSpacing="-0.7"
            >
                <tspan fill={wordFill}>Trendy</tspan>
                <tspan fill={BRAND}> Shops</tspan>
                <tspan
                    fill={bdFill}
                    fontSize="10"
                    fontWeight={700}
                    letterSpacing="0.6"
                    dy="-13"
                >
                    BD
                </tspan>
            </text>
        </svg>
    );

    if (boxed) {
        return (
            <span
                className={className}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#fff',
                    borderRadius: 10,
                    padding: '6px 10px',
                }}
            >
                {svg}
            </span>
        );
    }

    return (
        <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {svg}
        </span>
    );
};

/** Compact brand mark — the monogram only, for tight spaces. */
export const LogoMark: React.FC<{ size?: number; light?: boolean; className?: string }> = (props) => (
    <Logo {...props} iconOnly />
);

export default Logo;
