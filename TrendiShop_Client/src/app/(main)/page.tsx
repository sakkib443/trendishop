import { Suspense } from 'react';
import type { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import HeroBackdrop from '@/components/home/HeroBackdrop';
import CategoryExpertise from '@/components/home/CategoryExpertise';
import NewHomePage from '@/components/home/NewHomePage';

// No title or description here: the homepage uses exactly what the super admin sets
// under Digital marketing → SEO (see the root layout's generateMetadata).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The hero and the category row sit outside the Suspense boundary on purpose.
//
// NewHomePage reads useSearchParams(), which opts its whole subtree out of the
// prerender — so with everything inside the boundary the server sent the
// fallback and nothing else, and the page stayed blank until the JS bundle had
// downloaded, hydrated and its API calls had returned.
//
// Neither of these two reads the search params, and both render without data:
// the hero falls back to its default banner, the category row to its built-in
// list. Hoisting them means the banner is in the HTML and starts downloading
// immediately, instead of waiting on hydration. The product rows below still
// stream in behind the boundary.
export default function Home() {
  return (
    <div
      className="relative isolate min-h-screen"
      style={{
        background:
          'radial-gradient(60% 50% at 90% -5%, rgba(250, 204, 21, 0.06), transparent 70%),' +
          'radial-gradient(50% 42% at 0% 18%, rgba(245, 158, 11, 0.035), transparent 72%),' +
          'linear-gradient(180deg, #FFFFFF 0%, #FFFEF9 55%, #FFFCF2 100%)',
      }}
    >
      <HeroBackdrop />
      <HeroSection />
      <CategoryExpertise />
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <NewHomePage />
      </Suspense>
    </div>
  );
}
