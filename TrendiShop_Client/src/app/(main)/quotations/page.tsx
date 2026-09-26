import RequestQuotationPage from '@/components/home/RequestQuotationPage';

export const metadata = {
    title: 'Request a Product',
    description: "Can't find it in our store? Upload a photo and we'll source any product for you and quote the best price.",
    alternates: { canonical: '/quotations' },
};

export default function Quotations() {
    return <RequestQuotationPage />;
}
