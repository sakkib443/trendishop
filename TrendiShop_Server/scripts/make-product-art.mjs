/**
 * Draws the demo catalogue's product artwork.
 *
 * The seed used to point at Unsplash, where a third of the photo ids turned out
 * to be dead — a demo that 404s is worse than no demo. These are flat SVG
 * illustrations instead: a few hundred bytes each, sharp at any size, no
 * network call, and one visual language across the whole catalogue.
 *
 *   node scripts/make-product-art.mjs
 *
 * Writes into the client's public/products/, which the seed references as
 * /products/<slug>.svg.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '..', '..', 'TrendiShop_Client', 'public', 'products',
);

/** Each illustration sits on a tinted square, drawn on a 400×400 grid. */
const wrap = (tint, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img">
  <rect width="400" height="400" fill="${tint}"/>
  ${body}
</svg>
`;

const INK = '#2b2b2b';
const STEEL = '#8d949c';
const STEEL_D = '#5f666e';
const BRASS = '#d4a97a';
const COPPER = '#c9743a';

const art = {
    'led-ceiling-panel-light-24w': wrap('#fdf6e8', `
    <circle cx="200" cy="200" r="132" fill="#fceec9" opacity=".75"/>
    <circle cx="200" cy="200" r="104" fill="#fbe3a4" opacity=".8"/>
    <rect x="118" y="118" width="164" height="164" rx="14" fill="#ffffff" stroke="${STEEL}" stroke-width="5"/>
    <rect x="134" y="134" width="132" height="132" rx="8" fill="#fff8e1"/>
    <g stroke="#f0cf7a" stroke-width="4" stroke-linecap="round">
      <path d="M156 168h88M156 200h88M156 232h88"/>
    </g>
    <rect x="186" y="96" width="28" height="24" rx="5" fill="${STEEL_D}"/>`),

    'smart-wifi-led-bulb-9w-rgb': wrap('#f3f0fb', `
    <path d="M200 92c-44 0-78 33-78 76 0 30 17 49 28 63 8 10 12 17 12 27h76c0-10 4-17 12-27 11-14 28-33 28-63 0-43-34-76-78-76z" fill="#ffffff" stroke="${STEEL}" stroke-width="5"/>
    <path d="M200 112c-33 0-58 25-58 56 0 22 12 36 21 47h74c9-11 21-25 21-47 0-31-25-56-58-56z" fill="#f6b73c" opacity=".55"/>
    <path d="M200 112c-33 0-58 25-58 56 0 8 2 15 4 21h108c2-6 4-13 4-21 0-31-25-56-58-56z" fill="#e0567a" opacity=".45"/>
    <rect x="164" y="258" width="72" height="16" rx="5" fill="${STEEL_D}"/>
    <rect x="170" y="278" width="60" height="14" rx="5" fill="${STEEL}"/>
    <rect x="176" y="296" width="48" height="14" rx="6" fill="${STEEL_D}"/>
    <g fill="none" stroke="#7c6cf0" stroke-width="7" stroke-linecap="round">
      <path d="M286 122a52 52 0 0 1 0 60"/>
      <path d="M310 104a86 86 0 0 1 0 96"/>
    </g>`),

    'bldc-ceiling-fan-56-remote': wrap('#eef4f8', `
    <rect x="192" y="52" width="16" height="48" rx="5" fill="${STEEL_D}"/>
    <g fill="${STEEL}">
      <path d="M200 132c52 0 128 14 128 34 0 9-72 12-128 12z" opacity=".95"/>
      <path d="M200 178c-30 46-70 108-53 119 8 5 42-46 70-92z" opacity=".8"/>
      <path d="M200 178c30 46 70 108 53 119-8 5-42-46-70-92z" opacity=".65"/>
    </g>
    <circle cx="200" cy="158" r="46" fill="#ffffff" stroke="${STEEL_D}" stroke-width="5"/>
    <circle cx="200" cy="158" r="22" fill="${BRASS}"/>
    <circle cx="200" cy="158" r="8" fill="${STEEL_D}"/>`),

    'rechargeable-table-fan-12': wrap('#eef6f3', `
    <circle cx="200" cy="168" r="106" fill="#ffffff" stroke="${STEEL}" stroke-width="6"/>
    <g fill="none" stroke="${STEEL}" stroke-width="3" opacity=".6">
      <circle cx="200" cy="168" r="84"/><circle cx="200" cy="168" r="62"/><circle cx="200" cy="168" r="40"/>
    </g>
    <g fill="${STEEL_D}" opacity=".85">
      <path d="M200 168c0-38 10-58 26-58s26 20 10 44z"/>
      <path d="M200 168c33 19 42 39 34 53s-30 10-44-14z"/>
      <path d="M200 168c-33 19-53 19-61 5s6-30 34-35z"/>
    </g>
    <circle cx="200" cy="168" r="18" fill="${BRASS}"/>
    <rect x="186" y="274" width="28" height="42" fill="${STEEL_D}"/>
    <rect x="136" y="316" width="128" height="26" rx="12" fill="${STEEL_D}"/>
    <rect x="160" y="286" width="34" height="12" rx="5" fill="#4caf7d"/>`),

    'modular-switch-socket-board-6-gang': wrap('#f2f4f7', `
    <rect x="78" y="106" width="244" height="188" rx="16" fill="#ffffff" stroke="${STEEL}" stroke-width="6"/>
    <rect x="98" y="126" width="204" height="148" rx="8" fill="#f7f9fb"/>
    <g fill="#ffffff" stroke="${STEEL}" stroke-width="4">
      <rect x="112" y="140" width="56" height="54" rx="6"/>
      <rect x="176" y="140" width="56" height="54" rx="6"/>
      <rect x="240" y="140" width="48" height="54" rx="6"/>
      <rect x="112" y="206" width="56" height="54" rx="6"/>
      <rect x="176" y="206" width="56" height="54" rx="6"/>
      <rect x="240" y="206" width="48" height="54" rx="6"/>
    </g>
    <g fill="${BRASS}">
      <rect x="124" y="152" width="32" height="18" rx="4"/>
      <rect x="188" y="152" width="32" height="18" rx="4"/>
      <rect x="124" y="218" width="32" height="18" rx="4"/>
      <rect x="188" y="218" width="32" height="18" rx="4"/>
    </g>
    <g fill="${STEEL_D}">
      <circle cx="256" cy="158" r="5"/><circle cx="272" cy="158" r="5"/><circle cx="264" cy="176" r="5"/>
      <circle cx="256" cy="224" r="5"/><circle cx="272" cy="224" r="5"/><circle cx="264" cy="242" r="5"/>
    </g>`),

    'copper-house-wire-1-5mm-100m': wrap('#fbf1ea', `
    <g fill="none" stroke="${COPPER}" stroke-width="15">
      <ellipse cx="200" cy="200" rx="122" ry="98"/>
      <ellipse cx="200" cy="200" rx="96" ry="76"/>
      <ellipse cx="200" cy="200" rx="70" ry="54"/>
    </g>
    <g fill="none" stroke="#e39a63" stroke-width="5" opacity=".7">
      <ellipse cx="200" cy="194" rx="122" ry="98"/>
      <ellipse cx="200" cy="194" rx="96" ry="76"/>
      <ellipse cx="200" cy="194" rx="70" ry="54"/>
    </g>
    <path d="M296 246c26 14 40 32 34 46" fill="none" stroke="${COPPER}" stroke-width="15" stroke-linecap="round"/>
    <path d="M330 292l14 6" stroke="#f0b98d" stroke-width="10" stroke-linecap="round"/>`),

    'circuit-breaker-mcb-32a-single-pole': wrap('#f1f4f6', `
    <rect x="140" y="82" width="120" height="236" rx="12" fill="#ffffff" stroke="${STEEL}" stroke-width="6"/>
    <rect x="140" y="82" width="120" height="52" rx="12" fill="#eceff2"/>
    <rect x="164" y="146" width="72" height="80" rx="8" fill="${BRASS}"/>
    <rect x="178" y="160" width="44" height="52" rx="5" fill="#fff5e8"/>
    <text x="200" y="196" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="26" font-weight="700" fill="${INK}">32</text>
    <g fill="${STEEL_D}">
      <rect x="176" y="248" width="48" height="14" rx="4"/>
      <rect x="176" y="272" width="48" height="10" rx="4"/>
    </g>
    <rect x="120" y="318" width="160" height="16" rx="5" fill="${STEEL}"/>`),

    'pure-sine-wave-ips-1200va': wrap('#eef2f7', `
    <rect x="72" y="118" width="256" height="170" rx="16" fill="#ffffff" stroke="${STEEL}" stroke-width="6"/>
    <rect x="94" y="140" width="126" height="76" rx="8" fill="#1f2a33"/>
    <path d="M104 178q16-26 32 0t32 0 32 0" fill="none" stroke="#5fd39b" stroke-width="6" stroke-linecap="round"/>
    <g fill="${STEEL}" opacity=".7">
      <rect x="244" y="144" width="62" height="7" rx="3"/><rect x="244" y="158" width="62" height="7" rx="3"/>
      <rect x="244" y="172" width="62" height="7" rx="3"/><rect x="244" y="186" width="62" height="7" rx="3"/>
      <rect x="244" y="200" width="62" height="7" rx="3"/>
    </g>
    <circle cx="116" cy="248" r="12" fill="#5fd39b"/>
    <circle cx="150" cy="248" r="12" fill="${BRASS}"/>
    <rect x="182" y="238" width="120" height="20" rx="8" fill="#eceff2"/>
    <rect x="108" y="288" width="24" height="26" fill="${STEEL_D}"/>
    <rect x="268" y="288" width="24" height="26" fill="${STEEL_D}"/>`),

    'tubular-battery-150ah': wrap('#f0f3f0', `
    <rect x="94" y="120" width="212" height="188" rx="12" fill="#1f5c3d"/>
    <rect x="94" y="120" width="212" height="40" rx="12" fill="#2a7a52"/>
    <rect x="112" y="176" width="176" height="112" rx="8" fill="#ffffff" opacity=".12"/>
    <g fill="${STEEL_D}">
      <rect x="126" y="92" width="40" height="34" rx="6"/>
      <rect x="234" y="92" width="40" height="34" rx="6"/>
    </g>
    <g fill="#d9534f"><rect x="126" y="92" width="40" height="10" rx="4"/></g>
    <g fill="#3d6fd0"><rect x="234" y="92" width="40" height="10" rx="4"/></g>
    <g fill="#ffffff" opacity=".85">
      <circle cx="146" cy="196" r="11"/><circle cx="186" cy="196" r="11"/>
      <circle cx="226" cy="196" r="11"/><circle cx="266" cy="196" r="11"/>
    </g>
    <text x="200" y="266" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff" opacity=".9">150Ah</text>`),

    'automatic-voltage-stabiliser-5kva': wrap('#f4f1ec', `
    <rect x="86" y="112" width="228" height="180" rx="14" fill="#ffffff" stroke="${STEEL}" stroke-width="6"/>
    <circle cx="160" cy="196" r="52" fill="#f7f9fb" stroke="${STEEL}" stroke-width="5"/>
    <path d="M124 214a42 42 0 0 1 72-30" fill="none" stroke="#5fd39b" stroke-width="7" stroke-linecap="round"/>
    <path d="M160 196l28-24" stroke="${COPPER}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="160" cy="196" r="8" fill="${INK}"/>
    <g fill="${STEEL}" opacity=".75">
      <rect x="236" y="148" width="56" height="8" rx="4"/>
      <rect x="236" y="166" width="56" height="8" rx="4"/>
      <rect x="236" y="184" width="56" height="8" rx="4"/>
    </g>
    <rect x="236" y="212" width="56" height="30" rx="8" fill="${BRASS}"/>
    <rect x="120" y="292" width="30" height="24" fill="${STEEL_D}"/>
    <rect x="250" y="292" width="30" height="24" fill="${STEEL_D}"/>`),
};

mkdirSync(OUT, { recursive: true });
for (const [slug, svg] of Object.entries(art)) {
    writeFileSync(resolve(OUT, `${slug}.svg`), svg, 'utf8');
    console.log(`drew  ${slug}.svg`);
}
console.log(`\n${Object.keys(art).length} files → ${OUT}`);
