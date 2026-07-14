import type { ServiceCategory } from '@/types';

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'cat-reception', slug: 'resepsiyon', name: 'Resepsiyon', nameEn: 'Reception',
    description: 'Genel sorular, bilgi talepleri ve resepsiyon ile doğrudan iletişim.',
    icon: 'ConciergeBell', type: 'form', department: 'reception', color: '#0f1f38',
    requestTypeOptions: ['Genel bilgi talebi', 'Rezervasyon değişikliği', 'Fatura sorusu', 'Diğer'],
    estimatedMinutes: 5,
  },
  {
    id: 'cat-housekeeping', slug: 'temizlik', name: 'Temizlik', nameEn: 'Housekeeping',
    description: 'Oda temizliği, çöp alma ve genel düzen talepleri.',
    icon: 'Sparkles', type: 'form', department: 'housekeeping', color: '#c39a4e',
    requestTypeOptions: ['Oda temizliği', 'Çöp alma', 'Banyo yenileme', 'Genel düzen'],
    estimatedMinutes: 20,
  },
  {
    id: 'cat-towels', slug: 'havlu-nevresim', name: 'Havlu / Nevresim', nameEn: 'Towels & Linen',
    description: 'Ek havlu, nevresim ve yatak takımı değişimi.',
    icon: 'Layers', type: 'form', department: 'housekeeping', color: '#a67f3a',
    requestTypeOptions: ['Ekstra havlu', 'Nevresim değişimi', 'Yastık ekleme', 'Battaniye'],
    estimatedMinutes: 12,
  },
  {
    id: 'cat-room-service', slug: 'oda-servisi', name: 'Oda Servisi', nameEn: 'Room Service',
    description: 'Odanıza özel servis talepleri için hızlı çağrı hattı.',
    icon: 'BellRing', type: 'form', department: 'room_service', color: '#17805a',
    requestTypeOptions: ['Genel oda servisi çağrısı', 'Masa/servis kurulumu', 'Ekipman talebi'],
    estimatedMinutes: 15,
  },
  {
    id: 'cat-restaurant', slug: 'restoran-menu', name: 'Restoran Menü', nameEn: 'Restaurant Menu',
    description: 'Odanıza sıcak yemek, tatlı ve içecek siparişi verin.',
    icon: 'UtensilsCrossed', type: 'order', department: 'room_service', color: '#c39a4e',
    estimatedMinutes: 30,
  },
  {
    id: 'cat-minibar', slug: 'mini-bar', name: 'Mini Bar', nameEn: 'Mini Bar',
    description: 'Mini bar ürünlerini yeniden doldurtun veya sipariş verin.',
    icon: 'Wine', type: 'order', department: 'room_service', color: '#a67f3a',
    estimatedMinutes: 15,
  },
  {
    id: 'cat-technical', slug: 'teknik-destek', name: 'Teknik Destek', nameEn: 'Technical Support',
    description: 'Klima, televizyon, aydınlatma ve diğer teknik arızalar.',
    icon: 'Wrench', type: 'form', department: 'technical', color: '#26456f',
    requestTypeOptions: ['Klima arızası', 'Televizyon sorunu', 'Elektrik / aydınlatma', 'İnternet / Wi-Fi', 'Kilit / kart anahtar', 'Diğer'],
    estimatedMinutes: 25,
  },
  {
    id: 'cat-spa', slug: 'spa-masaj', name: 'Spa / Masaj', nameEn: 'Spa & Massage',
    description: 'Spa, masaj ve wellness randevusu oluşturun.',
    icon: 'Flower2', type: 'form', department: 'spa', color: '#d4af6a',
    requestTypeOptions: ['İsveç masajı (50 dk)', 'Derin doku masajı (50 dk)', 'Çift masajı (50 dk)', 'Yüz bakımı', 'Sauna & buhar odası rezervasyonu'],
    estimatedMinutes: 50,
  },
  {
    id: 'cat-taxi', slug: 'arac-taksi', name: 'Araç / Taksi Çağırma', nameEn: 'Taxi / Transfer',
    description: 'Taksi, transfer aracı veya vale hizmeti talep edin.',
    icon: 'Car', type: 'form', department: 'reception', color: '#0f1f38',
    requestTypeOptions: ['Taksi çağır', 'Havalimanı transferi', 'Vale / araç getir'],
    estimatedMinutes: 10,
  },
  {
    id: 'cat-late-checkout', slug: 'gec-cikis', name: 'Geç Çıkış Talebi', nameEn: 'Late Check-out',
    description: 'Standart çıkış saatinden sonra kalmak için talepte bulunun.',
    icon: 'Clock', type: 'form', department: 'reception', color: '#0f1f38',
    requestTypeOptions: ['13:00’a kadar', '15:00’a kadar', '18:00’a kadar', 'Özel saat talebi'],
    estimatedMinutes: 5,
  },
  {
    id: 'cat-wakeup', slug: 'uyandirma', name: 'Uyandırma Servisi', nameEn: 'Wake-up Call',
    description: 'Belirlediğiniz saatte uyandırma çağrısı planlayın.',
    icon: 'AlarmClock', type: 'form', department: 'reception', color: '#0f1f38',
    requestTypeOptions: ['Tek seferlik uyandırma', 'Her gün aynı saatte'],
    estimatedMinutes: 2,
  },
  {
    id: 'cat-baby', slug: 'bebek-yatak', name: 'Bebek Yatağı / Ek Yatak', nameEn: 'Baby Cot / Extra Bed',
    description: 'Odanıza bebek yatağı veya ek yatak ekletin.',
    icon: 'Baby', type: 'form', department: 'housekeeping', color: '#c39a4e',
    requestTypeOptions: ['Bebek yatağı (port bebe)', 'Ek tek kişilik yatak', 'Ek yastık seti'],
    estimatedMinutes: 20,
  },
  {
    id: 'cat-complaint', slug: 'sikayet-oneri', name: 'Şikayet / Öneri', nameEn: 'Complaint & Feedback',
    description: 'Deneyiminizle ilgili görüşlerinizi doğrudan yönetime iletin.',
    icon: 'MessageSquareWarning', type: 'form', department: 'management', color: '#d94848',
    requestTypeOptions: ['Şikayet', 'Öneri', 'Teşekkür'],
    estimatedMinutes: 10,
  },
  {
    id: 'cat-info', slug: 'otel-bilgileri', name: 'Otel Bilgileri', nameEn: 'Hotel Information',
    description: 'Wi-Fi, saatler, kurallar ve tesis bilgileri.',
    icon: 'Info', type: 'info', department: 'reception', color: '#0f1f38',
  },
  {
    id: 'cat-emergency', slug: 'acil-durum', name: 'Acil Durum', nameEn: 'Emergency',
    description: 'Acil durum numaraları ve yönlendirmeleri.',
    icon: 'ShieldAlert', type: 'emergency', department: 'reception', color: '#d94848',
  },
];

export const getCategoryBySlug = (slug: string) => serviceCategories.find((c) => c.slug === slug);
export const getCategoryById = (id: string) => serviceCategories.find((c) => c.id === id);

// Quick actions shown prominently on the guest home screen
export const quickActionSlugs = ['temizlik', 'havlu-nevresim', 'restoran-menu', 'teknik-destek', 'gec-cikis', 'arac-taksi'];
