/**
 * Demo catalogue — ten electrical products across four categories.
 *
 * Idempotent: everything is matched by slug and updated in place, so running it
 * twice leaves ten products rather than twenty. It only ever touches the
 * documents listed here; anything else in the database is left alone.
 *
 *   npm run seed:electrical
 *
 * Artwork is drawn locally by scripts/make-product-art.mjs and served from the
 * client as /products/<slug>.svg — a third of the stock-photo ids first used
 * here turned out to be dead, and a demo that 404s is worse than no demo.
 */
import mongoose from 'mongoose';
import config from './app/config';
import { Category } from './app/modules/category/category.model';
import { Product } from './app/modules/product/product.model';

/** Artwork drawn by scripts/make-product-art.mjs and served from the client. */
const art = (slug: string) => "/products/" + slug + ".svg";

/** Supplied photography, dropped into the client's public/products/img/. */
const photo = (file: string) => "/products/img/" + file;

interface SeedCategory {
    name: string;
    slug: string;
    icon: string;
    image: string;
}

const CATEGORIES: SeedCategory[] = [
    { name: 'Phones', slug: 'phones', icon: '📱', image: photo('iphone-18-pro-max-glacier-42997c16-d21b-4695-80e0-ba0512072af7.webp') },
    { name: 'Laptops', slug: 'laptops', icon: '💻', image: photo('untitled-design-15-51286e58-7289-4db6-bf4d-65e985b6eac8.avif') },
    { name: 'Audio', slug: 'audio', icon: '🎧', image: photo('main-image-12001263-2026-09-05t204540551-33b5a647-7aff-4a33-a03b-ea308b46959c.webp') },
    { name: 'Wearables', slug: 'wearables', icon: '⌚', image: photo('main-image-12001263-2026-09-05t200956282-ca3010fd-0610-4895-a3e3-2e6596be3dea.webp') },
    { name: 'Monitors', slug: 'monitors', icon: '🖥️', image: photo('benq-mobiuz-ex270m-27-gaming-monitor.webp') },
    { name: 'Tablets', slug: 'tablets', icon: '📲', image: photo('samsung-galaxy-tab-s10-plus.webp') },
    { name: 'Power & Backup', slug: 'power-backup', icon: '🔋', image: photo('benq-zowie-xl2566x-24-monitor.webp') },
];

interface SeedProduct {
    name: string;
    slug: string;
    category: string;           // category slug
    brand: string;
    model: string;
    price: number;
    originalPrice: number | null;
    stock: number;
    shortDescription: string;
    description: string;
    specifications: { key: string; value: string }[];
    warrantyMonths: number;
    isFeatured?: boolean;
    /** Overrides the drawn artwork when a real photograph exists. */
    image?: string;
    /** Demo sales history, so Top Selling badges and best-seller rows mean something. */
    sold: number;
    rating: number;
    reviews: number;
}

const PRODUCTS: SeedProduct[] = [

    /* ── Gadgets, on supplied photography ──────────────────────────────── */

    {
        name: 'iPhone 18 Pro Max 256GB — Glacier',
        slug: 'iphone-18-pro-max-256gb-glacier',
        sold: 318, rating: 4.9, reviews: 126,
        category: 'phones',
        brand: 'Apple', model: 'A3298',
        price: 189900, originalPrice: 214900, stock: 14,
        shortDescription: 'Titanium body, 6.9" ProMotion display and the four-camera Pro system.',
        description:
            '<p>The Pro Max is the one to buy if the camera matters. The four-lens system covers ultra-wide through 5× telephoto without swapping to digital crop, and ProRes recording writes straight to an external drive over USB-C.</p>'
            + '<ul><li>6.9" Super Retina XDR, 120Hz ProMotion</li><li>Titanium frame, Ceramic Shield 2 front</li><li>Up to 33 hours of video playback</li></ul>',
        image: photo('iphone-18-pro-max-glacier-42997c16-d21b-4695-80e0-ba0512072af7.webp'),
        specifications: [
            { key: 'Display', value: '6.9" OLED, 120Hz' },
            { key: 'Storage', value: '256 GB' },
            { key: 'Rear camera', value: '48MP + 48MP ultra-wide + 12MP 5× tele' },
            { key: 'Charging', value: 'USB-C, 40W wired' },
        ],
        warrantyMonths: 12,
        isFeatured: true,
    },
    {
        name: 'HP Victus Gaming Laptop — RTX 4060',
        slug: 'hp-victus-gaming-laptop-rtx-4060',
        sold: 74, rating: 4.6, reviews: 38,
        category: 'laptops',
        brand: 'HP', model: 'Victus 16',
        price: 134500, originalPrice: 152000, stock: 9,
        shortDescription: 'RTX 4060 and a 144Hz panel — plays current titles at native resolution.',
        description:
            '<p>An RTX 4060 with 8 GB of VRAM is the point where current titles run at the panel\'s own resolution without dropping to upscaling. The 144Hz screen is what makes that framerate visible.</p>'
            + '<ul><li>16.1" FHD 144Hz IPS</li><li>16 GB DDR5, 512 GB NVMe SSD</li><li>Dual-fan cooling with a rear exhaust</li></ul>',
        image: photo('untitled-design-15-51286e58-7289-4db6-bf4d-65e985b6eac8.avif'),
        specifications: [
            { key: 'Graphics', value: 'NVIDIA RTX 4060 8GB' },
            { key: 'Memory', value: '16 GB DDR5' },
            { key: 'Storage', value: '512 GB NVMe SSD' },
            { key: 'Display', value: '16.1" FHD 144Hz' },
        ],
        warrantyMonths: 12,
        isFeatured: true,
    },
    {
        name: 'Lenovo IdeaPad Slim 5 — Ryzen 7',
        slug: 'lenovo-ideapad-slim-5-ryzen-7',
        sold: 112, rating: 4.5, reviews: 47,
        category: 'laptops',
        brand: 'Lenovo', model: 'IdeaPad Slim 5',
        price: 98900, originalPrice: 112000, stock: 16,
        shortDescription: 'A quiet eight-core ultrabook that lasts a working day unplugged.',
        description:
            '<p>Eight Zen 4 cores in a 1.5 kg chassis, and it stays quiet doing office work because the fan only spins up under sustained load. Comfortably a full day away from a charger.</p>'
            + '<ul><li>14" 2.2K IPS, 300 nits</li><li>16 GB LPDDR5, 512 GB SSD</li><li>Backlit keyboard, fingerprint reader</li></ul>',
        image: photo('untitled-design-17-f9fa3ffb-618f-49ea-938f-0380bbc055db.avif'),
        specifications: [
            { key: 'Processor', value: 'AMD Ryzen 7, 8 cores' },
            { key: 'Memory', value: '16 GB LPDDR5' },
            { key: 'Storage', value: '512 GB NVMe SSD' },
            { key: 'Weight', value: '1.5 kg' },
        ],
        warrantyMonths: 24,
    },
    {
        name: 'AirPods 4 with Active Noise Cancellation',
        slug: 'airpods-4-active-noise-cancellation',
        sold: 264, rating: 4.7, reviews: 89,
        category: 'audio',
        brand: 'Apple', model: 'AirPods 4 ANC',
        price: 21900, originalPrice: 25500, stock: 42,
        shortDescription: 'Open-fit buds that still cancel noise, with a USB-C charging case.',
        description:
            '<p>Noise cancellation in an open-fit bud, which is the trick here — no silicone tip pressing into the ear canal, and still a usable amount of cabin and traffic noise removed.</p>'
            + '<ul><li>Adaptive Audio and Transparency</li><li>Up to 30 hours total with the case</li><li>USB-C and wireless charging</li></ul>',
        image: photo('main-image-12001263-2026-09-05t204540551-33b5a647-7aff-4a33-a03b-ea308b46959c.webp'),
        specifications: [
            { key: 'Fit', value: 'Open, tip-free' },
            { key: 'Battery', value: '5 h buds, 30 h with case' },
            { key: 'Charging', value: 'USB-C + Qi wireless' },
            { key: 'Water resistance', value: 'IP54' },
        ],
        warrantyMonths: 12,
        isFeatured: true,
    },
    {
        name: 'Apple Watch SE 44mm — Starlight',
        slug: 'apple-watch-se-44mm-starlight',
        sold: 187, rating: 4.6, reviews: 64,
        category: 'wearables',
        brand: 'Apple', model: 'Watch SE 44mm',
        price: 32900, originalPrice: 37500, stock: 23,
        shortDescription: 'Crash and fall detection, sleep tracking, and two days between charges.',
        description:
            '<p>The SE keeps the parts that matter day to day — heart rate, sleep stages, crash and fall detection — and drops the always-on display, which is most of why it costs what it does.</p>'
            + '<ul><li>44 mm Retina display</li><li>Water resistant to 50 m</li><li>Up to 18 hours, ~2 days with low power mode</li></ul>',
        image: photo('main-image-12001263-2026-09-05t200956282-ca3010fd-0610-4895-a3e3-2e6596be3dea.webp'),
        specifications: [
            { key: 'Case size', value: '44 mm' },
            { key: 'Sensors', value: 'Heart rate, accelerometer, gyroscope' },
            { key: 'Water resistance', value: '50 m' },
            { key: 'Battery', value: 'Up to 18 h' },
        ],
        warrantyMonths: 12,
    },

    /* ── Monitors ──────────────────────────────────────────────────────── */

    {
        name: 'BenQ MOBIUZ EX270M 27" 240Hz Gaming Monitor',
        slug: 'benq-mobiuz-ex270m-27-gaming-monitor',
        sold: 63, rating: 4.8, reviews: 31,
        category: 'monitors',
        brand: 'BenQ', model: 'MOBIUZ EX270M',
        price: 46500, originalPrice: 54000, stock: 11,
        shortDescription: '240Hz IPS with HDRi — fast enough that the panel stops being the limit.',
        description:
            '<p>240Hz on an IPS panel, so the viewing angles survive the refresh rate. BenQ\'s HDRi reads the room and lifts shadow detail rather than crushing it, which is the difference between seeing someone in a dark corner and not.</p>'
            + '<ul><li>27" FHD IPS, 240Hz, 1ms</li><li>HDRi with an ambient light sensor</li><li>treVolo 2.1 speakers built in</li></ul>',
        image: photo('benq-mobiuz-ex270m-27-gaming-monitor.webp'),
        specifications: [
            { key: 'Size', value: '27 inch' },
            { key: 'Refresh rate', value: '240 Hz' },
            { key: 'Panel', value: 'IPS, 1ms MPRT' },
            { key: 'Inputs', value: '2× HDMI 2.0, DisplayPort 1.4' },
        ],
        warrantyMonths: 36,
        isFeatured: true,
    },
    {
        name: 'BenQ ZOWIE XL2566X+ 24" 400Hz Esports Monitor',
        slug: 'benq-zowie-xl2566x-24-monitor',
        sold: 28, rating: 4.9, reviews: 17,
        category: 'monitors',
        brand: 'BenQ ZOWIE', model: 'XL2566X+',
        price: 89900, originalPrice: 99000, stock: 6,
        shortDescription: '400Hz with DyAc 2 — built for competitive play, not for looking pretty.',
        description:
            '<p>A tournament panel. DyAc 2 clears the smear on fast horizontal movement, which is what lets you keep tracking through a spray instead of guessing where the target went.</p>'
            + '<ul><li>24.1" TN, 400Hz refresh</li><li>DyAc 2 motion clarity</li><li>Height, tilt, swivel and pivot adjustment</li></ul>',
        image: photo('benq-zowie-xl2566x-24-monitor.webp'),
        specifications: [
            { key: 'Size', value: '24.1 inch' },
            { key: 'Refresh rate', value: '400 Hz' },
            { key: 'Panel', value: 'TN, 0.5ms GtG' },
            { key: 'Feature', value: 'DyAc 2' },
        ],
        warrantyMonths: 36,
    },
    {
        name: 'Aiwa MD2419-V 24" 200Hz FHD IPS Monitor',
        slug: 'aiwa-md2419v-24-monitor',
        sold: 96, rating: 4.3, reviews: 24,
        category: 'monitors',
        brand: 'Aiwa', model: 'MD2419-V',
        price: 14900, originalPrice: 17500, stock: 26,
        shortDescription: '200Hz at a price where 75Hz is the norm.',
        description:
            '<p>The sensible first monitor: an IPS panel at 200Hz, which is well past the point where most people stop noticing, for roughly what a 75Hz screen used to cost.</p>'
            + '<ul><li>23.8" FHD IPS, 200Hz</li><li>Adaptive-Sync</li><li>HDMI and DisplayPort</li></ul>',
        image: photo('aiwa-md2419v-24-monitor.avif'),
        specifications: [
            { key: 'Size', value: '23.8 inch' },
            { key: 'Refresh rate', value: '200 Hz' },
            { key: 'Panel', value: 'IPS, 1ms' },
            { key: 'Resolution', value: '1920 × 1080' },
        ],
        warrantyMonths: 24,
    },

    /* ── Tablets ───────────────────────────────────────────────────────── */

    {
        name: 'Samsung Galaxy Tab S10+ — Moonstone Gray',
        slug: 'samsung-galaxy-tab-s10-plus',
        sold: 84, rating: 4.7, reviews: 42,
        category: 'tablets',
        brand: 'Samsung', model: 'Galaxy Tab S10+',
        price: 124900, originalPrice: 139900, stock: 13,
        shortDescription: '12.4" AMOLED with the S Pen in the box — no extra purchase.',
        description:
            '<p>A 12.4" AMOLED at 120Hz, and the S Pen ships with it rather than being sold separately. DeX turns it into a desktop when you attach a keyboard, which is the part that makes it a laptop substitute rather than a large phone.</p>'
            + '<ul><li>12.4" Dynamic AMOLED 2X, 120Hz</li><li>S Pen included, no charging needed</li><li>IP68 — rated for dust and water</li></ul>',
        image: photo('samsung-galaxy-tab-s10-plus.webp'),
        specifications: [
            { key: 'Display', value: '12.4" AMOLED, 120Hz' },
            { key: 'Storage', value: '256 GB, microSD expandable' },
            { key: 'Battery', value: '10,090 mAh' },
            { key: 'Extras', value: 'S Pen in box, DeX mode' },
        ],
        warrantyMonths: 12,
        isFeatured: true,
    },
    {
        name: 'Xiaomi Pad 7 — Black',
        slug: 'xiaomi-pad-7',
        sold: 137, rating: 4.5, reviews: 58,
        category: 'tablets',
        brand: 'Xiaomi', model: 'Pad 7',
        price: 38900, originalPrice: 44500, stock: 21,
        shortDescription: 'An 11.2" 3.2K 144Hz panel at a mid-range price.',
        description:
            '<p>The panel is the reason to buy this one: 3.2K at 144Hz on an 11.2" screen, which is a specification that normally sits two price brackets higher.</p>'
            + '<ul><li>11.2" 3.2K LCD, 144Hz</li><li>Snapdragon 7+ Gen 3</li><li>8,850 mAh with 45W charging</li></ul>',
        image: photo('xiaomi-pad-7.webp'),
        specifications: [
            { key: 'Display', value: '11.2" 3.2K, 144Hz' },
            { key: 'Processor', value: 'Snapdragon 7+ Gen 3' },
            { key: 'Storage', value: '128 GB' },
            { key: 'Battery', value: '8,850 mAh, 45W' },
        ],
        warrantyMonths: 12,
    },

    /* ── Audio ─────────────────────────────────────────────────────────── */

    {
        name: 'Haylou S30 ANC Headphone — Black',
        slug: 'haylou-s30-anc-headphone',
        sold: 214, rating: 4.4, reviews: 76,
        category: 'audio',
        brand: 'Haylou', model: 'S30',
        price: 4650, originalPrice: 5900, stock: 48,
        shortDescription: 'Over-ear ANC with 60 hours between charges.',
        description:
            '<p>Sixty hours is the headline, and it is the right one — these are for people who forget to charge things. Active noise cancellation takes the edge off a bus or an office without the pressure feeling of the pricier sets.</p>'
            + '<ul><li>Hybrid ANC, up to 35dB</li><li>60 h playback, 10 min for 8 h</li><li>Bluetooth 5.4, multipoint pairing</li></ul>',
        image: photo('haylou-s30-anc-headphone.webp'),
        specifications: [
            { key: 'Type', value: 'Over-ear, closed back' },
            { key: 'ANC', value: 'Hybrid, up to 35 dB' },
            { key: 'Battery', value: '60 h (ANC off)' },
            { key: 'Bluetooth', value: '5.4, multipoint' },
        ],
        warrantyMonths: 12,
    },
    {
        name: 'Haylou S35 ANC Headphone — Purple',
        slug: 'haylou-s35-anc-headphone',
        sold: 129, rating: 4.5, reviews: 44,
        category: 'audio',
        brand: 'Haylou', model: 'S35',
        price: 5900, originalPrice: 7200, stock: 34,
        shortDescription: 'LDAC and 40mm drivers — the pair to buy if the source is lossless.',
        description:
            '<p>LDAC support means a high-bitrate stream actually reaches the drivers rather than being squeezed through SBC first. Worth it only if the phone and the library can feed it; otherwise the S30 is the better buy.</p>'
            + '<ul><li>40 mm dynamic drivers</li><li>LDAC and Hi-Res Audio Wireless</li><li>Hybrid ANC with transparency</li></ul>',
        image: photo('haylou-s35-anc-headphone.webp'),
        specifications: [
            { key: 'Drivers', value: '40 mm dynamic' },
            { key: 'Codecs', value: 'LDAC, AAC, SBC' },
            { key: 'Battery', value: '50 h (ANC off)' },
            { key: 'Weight', value: '265 g' },
        ],
        warrantyMonths: 12,
    },
    {
        name: 'Haylou X1 Pro TWS Earbuds',
        slug: 'haylou-x1-pro-tws-earbuds',
        sold: 302, rating: 4.3, reviews: 118,
        category: 'audio',
        brand: 'Haylou', model: 'X1 Pro',
        price: 2450, originalPrice: 3200, stock: 76,
        shortDescription: 'In-ear ANC and a 45ms game mode, under three thousand.',
        description:
            '<p>The low-latency mode is the part that matters here — 45ms is close enough that footsteps land with the picture, which most buds at this price cannot manage.</p>'
            + '<ul><li>ANC up to 42dB</li><li>45 ms low-latency game mode</li><li>IPX4, 30 h with the case</li></ul>',
        image: photo('haylou-x1-pro-tws-earbuds.avif'),
        specifications: [
            { key: 'Type', value: 'In-ear TWS' },
            { key: 'ANC', value: 'Up to 42 dB' },
            { key: 'Latency', value: '45 ms game mode' },
            { key: 'Battery', value: '30 h with case' },
        ],
        warrantyMonths: 12,
        isFeatured: true,
    },

    /* ── Wearables ─────────────────────────────────────────────────────── */

    {
        name: 'Apple Watch Ultra — Orange Alpine Loop',
        slug: 'apple-watch-ultra-alpine-loop',
        sold: 61, rating: 4.9, reviews: 37,
        category: 'wearables',
        brand: 'Apple', model: 'Watch Ultra',
        price: 98500, originalPrice: 112000, stock: 8,
        shortDescription: 'Titanium, 100m water resistant, and it runs for two days.',
        description:
            '<p>Built for conditions the standard Watch is not: a titanium case, a display bright enough to read in direct sun, and a battery that lasts a long weekend rather than a day. The Alpine Loop has no buckle to work loose.</p>'
            + '<ul><li>49 mm titanium case</li><li>3000 nits, readable in sunlight</li><li>Up to 36 h, 72 h in low power</li></ul>',
        image: photo('apple-watch-ultra-alpine-loop.webp'),
        specifications: [
            { key: 'Case', value: '49 mm titanium' },
            { key: 'Display', value: '3000 nits peak' },
            { key: 'Water resistance', value: '100 m, EN13319' },
            { key: 'Battery', value: '36 h, 72 h low power' },
        ],
        warrantyMonths: 12,
        isFeatured: true,
    },

    /* ── Power & Backup ────────────────────────────────────────────────── */

    {
        name: 'Pure Sine Wave IPS 1200VA',
        slug: 'pure-sine-wave-ips-1200va',
        sold: 58, rating: 4.9, reviews: 34,
        category: 'power-backup',
        brand: 'PowerCore', model: 'PC-1200S',
        price: 18900, originalPrice: 22500, stock: 12,
        shortDescription: 'Clean sine output that fridges and PCs will actually tolerate.',
        description:
            '<p>A square-wave inverter makes a fridge compressor and a desktop PSU run hot and hum. This one puts out a true sine wave, so sensitive loads behave exactly as they do on mains.</p>'
            + '<ul><li>Transfer time under 10 ms</li><li>Overload, short-circuit and deep-discharge protection</li><li>LCD panel showing load and battery state</li></ul>',
        specifications: [
            { key: 'Capacity', value: '1200 VA / 960 W' },
            { key: 'Waveform', value: 'Pure sine' },
            { key: 'Transfer time', value: '< 10 ms' },
            { key: 'Battery support', value: '12 V, external' },
        ],
        warrantyMonths: 24,
        isFeatured: true,
    },
    {
        name: 'Tubular Battery 150Ah',
        slug: 'tubular-battery-150ah',
        sold: 41, rating: 4.6, reviews: 21,
        category: 'power-backup',
        brand: 'PowerCore', model: 'PC-T150',
        price: 21500, originalPrice: null, stock: 9,
        shortDescription: 'Deep-cycle tubular plates built for daily load shedding.',
        description:
            '<p>Tubular plates tolerate being drained and refilled every day, which is what kills a flat-plate battery inside a year. Expect five to six years of daily cycling with the electrolyte topped up.</p>'
            + '<ul><li>Low water loss, topping up roughly twice a year</li><li>Handles deep discharge without plate damage</li><li>Float indicator for electrolyte level</li></ul>',
        specifications: [
            { key: 'Capacity', value: '150 Ah at C20' },
            { key: 'Voltage', value: '12 V' },
            { key: 'Plate type', value: 'Tubular, deep cycle' },
            { key: 'Weight', value: '48 kg' },
        ],
        warrantyMonths: 36,
    },
    {
        name: 'Automatic Voltage Stabiliser 5kVA',
        slug: 'automatic-voltage-stabiliser-5kva',
        sold: 76, rating: 4.5, reviews: 19,
        category: 'power-backup',
        brand: 'PowerCore', model: 'PC-AVR5',
        price: 12400, originalPrice: 14900, stock: 17,
        shortDescription: 'Holds output steady through the sags a weak line delivers.',
        description:
            '<p>Where the incoming line sags to 140 V in the evening and spikes overnight, a stabiliser is what keeps an air conditioner or a refrigerator alive. This one corrects anything from 140 V to 280 V back to a usable output.</p>'
            + '<ul><li>Servo-controlled, ±2% output regulation</li><li>Time-delay restart protects a compressor</li><li>Copper-wound transformer</li></ul>',
        specifications: [
            { key: 'Capacity', value: '5 kVA' },
            { key: 'Input range', value: '140–280 V' },
            { key: 'Output regulation', value: '±2%' },
            { key: 'Cooling', value: 'Natural convection' },
        ],
        warrantyMonths: 24,
    },
];

/**
 * Categories and products this seed used to create and no longer should.
 *
 * Upserting cannot remove anything, so dropping an entry from the lists above
 * would leave it behind in the database forever. Naming it here retires it —
 * and the list stays as a record of what was once seeded, so a future run
 * against an old database still cleans up.
 */
const RETIRED_CATEGORIES = ['lighting', 'fans-cooling', 'wiring-switches'];
const RETIRED_PRODUCTS = [
    'led-ceiling-panel-light-24w', 'smart-wifi-led-bulb-9w-rgb',
    'bldc-ceiling-fan-56-remote', 'rechargeable-table-fan-12',
    'modular-switch-socket-board-6-gang', 'copper-house-wire-1-5mm-100m',
    'circuit-breaker-mcb-32a-single-pole',
];

async function main() {
    await mongoose.connect(config.database_url as string);
    console.log('connected\n');

    // ── Retire what this seed no longer owns ──────────────────────────────
    const droppedProducts = await Product.deleteMany({ slug: { $in: RETIRED_PRODUCTS } });
    const droppedCategories = await Category.deleteMany({ slug: { $in: RETIRED_CATEGORIES } });
    if (droppedProducts.deletedCount || droppedCategories.deletedCount) {
        console.log(`retired   ${droppedProducts.deletedCount} products, ${droppedCategories.deletedCount} categories\n`);
    }

    // ── Categories ────────────────────────────────────────────────────────
    const idBySlug = new Map<string, mongoose.Types.ObjectId>();
    for (const [i, c] of CATEGORIES.entries()) {
        const doc = await Category.findOneAndUpdate(
            { slug: c.slug },
            {
                $set: {
                    name: c.name, slug: c.slug, icon: c.icon, image: c.image,
                    level: 0, order: i, isActive: true, isFeatured: true,
                    showInMenu: true, showInHome: true, isDeleted: false,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        idBySlug.set(c.slug, doc._id as mongoose.Types.ObjectId);
        console.log(`category  ${c.name}`);
    }

    // ── Products ──────────────────────────────────────────────────────────
    // The demo's sale runs from a week ago to a week ahead, recalculated each
    // time this is run, so the catalogue never shows an offer that has expired.
    const DAY = 24 * 60 * 60 * 1000;
    const offerStart = new Date(Date.now() - 7 * DAY);
    const offerEnd = new Date(Date.now() + 7 * DAY);

    let created = 0, updated = 0;
    for (const p of PRODUCTS) {
        const existing = await Product.findOne({ slug: p.slug });
        const discount = p.originalPrice
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
            : 0;

        await Product.findOneAndUpdate(
            { slug: p.slug },
            {
                $set: {
                    name: p.name,
                    slug: p.slug,
                    shortDescription: p.shortDescription,
                    description: p.description,
                    price: p.price,
                    originalPrice: p.originalPrice,
                    discount,
                    costPrice: Math.round(p.price * 0.62),
                    stock: p.stock,
                    thumbnail: p.image ?? art(p.slug),
                    images: [p.image ?? art(p.slug)],
                    category: idBySlug.get(p.category) ?? null,
                    brand: p.brand,
                    model: p.model,
                    specifications: p.specifications,
                    warranty: {
                        hasWarranty: p.warrantyMonths > 0,
                        duration: p.warrantyMonths,
                        durationUnit: 'months',
                        type: 'manufacturer',
                    },
                    // A live offer window, so the discount badges and the flash-sale
                    // countdown have something real to read. Without an end date
                    // getDisplayPrice treats the markdown as a permanent list price
                    // and deliberately shows no discount badge.
                    offerStartDate: discount > 0 ? offerStart : null,
                    offerEndDate: discount > 0 ? offerEnd : null,
                    status: p.stock > 0 ? 'active' : 'out-of-stock',
                    approvalStatus: 'approved',
                    isFeatured: Boolean(p.isFeatured),
                    totalSold: p.sold,
                    rating: p.rating,
                    reviewCount: p.reviews,
                    viewCount: p.sold * 34 + 120,
                    isOnSale: discount > 0,
                    isDeleted: false,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        existing ? updated++ : created++;
        console.log(`product   ${p.name}  ৳${p.price.toLocaleString()}`);
    }

    // Category product counts, so the storefront's category tiles are honest.
    for (const [slug, id] of idBySlug) {
        const count = await Product.countDocuments({ category: id, isDeleted: false });
        await Category.updateOne({ _id: id }, { $set: { productCount: count } });
        console.log(`count     ${slug}: ${count}`);
    }

    console.log(`\ndone — ${created} created, ${updated} updated, ${CATEGORIES.length} categories`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
