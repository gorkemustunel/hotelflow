import type { HotelInfo } from '@/types';

export const hotelInfo: HotelInfo = {
  hotelName: 'HotelFlow Bosphorus Residence',
  tagline: 'Boğaz manzaralı premium konaklama deneyimi',
  wifiName: 'HotelFlow-Guest',
  wifiPassword: 'bosphorus2026',
  breakfastHours: '07:00 – 10:30',
  poolHours: '08:00 – 20:00',
  spaHours: '09:00 – 21:00',
  restaurantHours: '12:00 – 23:00',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  parkingInfo: 'Vale hizmeti otel girişinde ücretsizdir. Açık otopark B1 katındadır, 7/24 güvenlik kamerası ile izlenir.',
  emergencyNumbers: [
    { label: 'Resepsiyon (7/24)', number: '0212 555 01 00' },
    { label: 'Otel Güvenliği', number: '0212 555 01 01' },
    { label: 'Doktor Çağrısı', number: '0212 555 01 02' },
    { label: 'İtfaiye', number: '110' },
    { label: 'Ambulans', number: '112' },
    { label: 'Polis', number: '155' },
  ],
  hotelRules: [
    'Check-in saati 14:00, check-out saati 12:00\'dir.',
    'Odalarda sigara içilmesi yasaktır; ihlal durumunda temizlik ücreti uygulanır.',
    'Evcil hayvan kabulü sadece belirli odalarda ve ön onay ile mümkündür.',
    'Sessiz saatler 23:00 – 07:00 arasıdır.',
    'Havuz ve spa alanlarında havlu kullanımı zorunludur.',
  ],
  floorPlanNote: 'Asansörler lobiden 1-7. katlara hizmet verir. Yangın merdivenleri her katın koridor sonunda yeşil tabela ile işaretlidir. Spa ve havuz alanı zemin kata, restoran ise 1. kata konumlanmıştır.',
  address: 'Sahil Cd. No:42, Beşiktaş, İstanbul',
  heritageTitle: 'Boğaziçi’nde Bir Miras',
  heritageParagraphs: [
    'HotelFlow Bosphorus Residence, yüzyıllık yalıların art arda sıralandığı bir sahil şeridinde, 1920’lerin zarafetini modern konaklama anlayışıyla buluşturur. Mermer lobiden odalara uzanan her detay, Boğaz’ın sakin ritmine eşlik edecek şekilde tasarlandı.',
    'Kat hizmetlerinden concierge ekibine kadar her personel, misafirlerin taleplerini dakikalar içinde karşılamak üzere eğitildi — dijital resepsiyon deneyiminin arkasında hâlâ insan dokunuşu var.',
  ],
};
