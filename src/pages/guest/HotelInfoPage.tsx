import { HotelInfoContent } from '@/components/guest/HotelInfoContent';

export function HotelInfoPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Otel Bilgileri</h1>
        <p className="mt-1 text-sm text-navy-500">Konaklamanız boyunca ihtiyaç duyabileceğiniz tüm bilgiler burada.</p>
      </div>
      <HotelInfoContent />
    </div>
  );
}
