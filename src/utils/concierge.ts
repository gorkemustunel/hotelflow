// ---------------------------------------------------------------------------
// AI Concierge — lightweight keyword/intent matcher.
// No external LLM call: this is a demo-friendly rule engine that scores
// candidate intents by keyword overlap and returns a canned-but-contextual
// reply, optionally with a deep link into the relevant guest screen.
// ---------------------------------------------------------------------------

import { hotelInfo } from '@/data/hotelInfo';
import { serviceCategories } from '@/data/serviceCategories';

export interface ConciergeAction {
  label: string;
  href: string;
}

export interface ConciergeReply {
  text: string;
  action?: ConciergeAction;
}

interface Intent {
  id: string;
  keywords: string[];
  reply: (roomNumber: string) => ConciergeReply;
}

const norm = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

const categoryHref = (roomNumber: string, slug: string) => `/guest/room/${roomNumber}/category/${slug}`;

const INTENTS: Intent[] = [
  {
    id: 'wifi',
    keywords: ['wifi', 'wi-fi', 'internet', 'sifre', 'kablosuz'],
    reply: () => ({
      text: `Wi-Fi ağ adı **${hotelInfo.wifiName}**, şifre **${hotelInfo.wifiPassword}**. Bağlanamazsanız Teknik Destek'e talep açabilirim.`,
      action: { label: 'Bilgiler sayfasını aç', href: '/guest/room/:room/info' },
    }),
  },
  {
    id: 'breakfast',
    keywords: ['kahvalti', 'breakfast'],
    reply: () => ({
      text: `Kahvaltı saatleri **${hotelInfo.breakfastHours}** arasında, restoran katında hizmet veriyor. Odanıza servis de isteyebilirsiniz.`,
      action: { label: 'Restoran menüsünü aç', href: 'cat-restaurant' },
    }),
  },
  {
    id: 'pool',
    keywords: ['havuz', 'pool'],
    reply: () => ({ text: `Havuz **${hotelInfo.poolHours}** saatleri arasında açık. Havlu kullanımı zorunludur.` }),
  },
  {
    id: 'spa',
    keywords: ['spa', 'masaj', 'sauna', 'wellness'],
    reply: () => ({
      text: `Spa & Wellness **${hotelInfo.spaHours}** saatleri arasında hizmet veriyor. Randevu oluşturmamı ister misiniz?`,
      action: { label: 'Spa randevusu oluştur', href: 'cat-spa' },
    }),
  },
  {
    id: 'checkin',
    keywords: ['checkin', 'check-in', 'giris saati', 'ne zaman giris'],
    reply: () => ({ text: `Check-in saati **${hotelInfo.checkInTime}**. Erken giriş için resepsiyonla iletişime geçebilirim.` }),
  },
  {
    id: 'checkout',
    keywords: ['checkout', 'check-out', 'cikis saati', 'gec cikis'],
    reply: () => ({
      text: `Standart check-out saati **${hotelInfo.checkOutTime}**. Geç çıkış talebi oluşturmamı ister misiniz?`,
      action: { label: 'Geç çıkış talebi oluştur', href: 'cat-late-checkout' },
    }),
  },
  {
    id: 'parking',
    keywords: ['otopark', 'park', 'vale', 'arac'],
    reply: () => ({ text: hotelInfo.parkingInfo }),
  },
  {
    id: 'taxi',
    keywords: ['taksi', 'transfer', 'havalimani'],
    reply: () => ({
      text: 'Sizin için taksi veya transfer talebi oluşturabilirim.',
      action: { label: 'Taksi / transfer talebi oluştur', href: 'cat-taxi' },
    }),
  },
  {
    id: 'cleaning',
    keywords: ['temizlik', 'oda temizle', 'cop', 'housekeeping'],
    reply: () => ({
      text: 'Oda temizliği talebinizi hemen kat hizmetlerine iletebilirim.',
      action: { label: 'Temizlik talebi oluştur', href: 'cat-housekeeping' },
    }),
  },
  {
    id: 'towels',
    keywords: ['havlu', 'nevresim', 'yastik', 'battaniye'],
    reply: () => ({
      text: 'Ekstra havlu, nevresim veya yastık talebinizi oluşturabilirim.',
      action: { label: 'Havlu / nevresim talebi oluştur', href: 'cat-towels' },
    }),
  },
  {
    id: 'technical',
    keywords: ['klima', 'televizyon', 'tv', 'elektrik', 'ariza', 'kart anahtar', 'kilit', 'isinmiyor', 'calismiyor'],
    reply: () => ({
      text: 'Teknik bir sorun için hemen ilgili ekibe talep açabilirim.',
      action: { label: 'Teknik destek talebi oluştur', href: 'cat-technical' },
    }),
  },
  {
    id: 'roomservice',
    keywords: ['oda servisi', 'yemek', 'siparis', 'restoran', 'menu', 'acim'],
    reply: () => ({
      text: 'Restoran menüsünü açıp doğrudan sipariş vermenizi sağlayabilirim.',
      action: { label: 'Restoran menüsünü aç', href: 'cat-restaurant' },
    }),
  },
  {
    id: 'minibar',
    keywords: ['mini bar', 'minibar'],
    reply: () => ({ text: 'Mini bar ürünlerini yeniden doldurma veya sipariş talebinizi oluşturabilirim.', action: { label: 'Mini bar talebi oluştur', href: 'cat-minibar' } }),
  },
  {
    id: 'wakeup',
    keywords: ['uyandirma', 'alarm'],
    reply: () => ({ text: 'Uyandırma servisi talebinizi oluşturabilirim.', action: { label: 'Uyandırma talebi oluştur', href: 'cat-wakeup' } }),
  },
  {
    id: 'baby',
    keywords: ['bebek yatagi', 'port bebe', 'ek yatak'],
    reply: () => ({ text: 'Bebek yatağı veya ek yatak talebinizi oluşturabilirim.', action: { label: 'Bebek yatağı / ek yatak talebi', href: 'cat-baby' } }),
  },
  {
    id: 'emergency',
    keywords: ['acil', 'yardim', 'itfaiye', 'ambulans', 'polis', 'doktor', 'hasta'],
    reply: () => ({
      text: `Acil bir durum mu var? Resepsiyon 7/24 **${hotelInfo.emergencyNumbers[0].number}** numarasından ulaşılabilir. Acil durum ekranını açıyorum.`,
      action: { label: 'Acil durum ekranını aç', href: '/guest/room/:room/emergency' },
    }),
  },
  {
    id: 'rules',
    keywords: ['kural', 'sigara', 'evcil hayvan', 'sessiz saat'],
    reply: () => ({ text: hotelInfo.hotelRules.join(' ') }),
  },
  {
    id: 'address',
    keywords: ['adres', 'nerede', 'konum'],
    reply: () => ({ text: `${hotelInfo.hotelName}, ${hotelInfo.address} adresinde yer alıyor.` }),
  },
  {
    id: 'complaint',
    keywords: ['sikayet', 'memnun degil', 'kotu', 'oneri'],
    reply: () => ({
      text: 'Deneyiminizle ilgili görüşünüzü doğrudan yönetime iletebilirim.',
      action: { label: 'Şikayet / öneri formu aç', href: 'cat-complaint' },
    }),
  },
  {
    id: 'thanks',
    keywords: ['tesekkur', 'sagol', 'harika', 'super'],
    reply: () => ({ text: 'Rica ederim! Başka bir konuda yardımcı olabilirim.' }),
  },
  {
    id: 'greeting',
    keywords: ['merhaba', 'selam', 'iyi gunler', 'iyi aksamlar'],
    reply: () => ({ text: `Merhaba! ${hotelInfo.hotelName}'a hoş geldiniz. Size nasıl yardımcı olabilirim?` }),
  },
];

const FALLBACK: ConciergeReply = {
  text: 'Bunu tam olarak anlayamadım, ama sizi doğru ekrana yönlendirebilirim. Aşağıdaki hızlı sorulardan birini deneyebilir ya da resepsiyonla doğrudan görüşebilirsiniz.',
  action: { label: 'Resepsiyon ile iletişime geç', href: 'cat-reception' },
};

/** Resolve a raw action href (which may reference a category id as shorthand,
 * or contain a ":room" placeholder) into a real route for the given room. */
function resolveHref(href: string, roomNumber: string): string {
  if (href.startsWith('/')) return href.replace(':room', roomNumber);
  const category = serviceCategories.find((c) => c.id === href);
  return category ? categoryHref(roomNumber, category.slug) : `/guest/room/${roomNumber}`;
}

export function getConciergeReply(message: string, roomNumber: string): ConciergeReply {
  const text = norm(message);
  let best: { intent: Intent; score: number } | null = null;

  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((acc, kw) => (text.includes(norm(kw)) ? acc + kw.length : acc), 0);
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }

  const raw = best ? best.intent.reply(roomNumber) : FALLBACK;
  return raw.action ? { ...raw, action: { ...raw.action, href: resolveHref(raw.action.href, roomNumber) } } : raw;
}

export const SUGGESTED_QUESTIONS = ['Wi-Fi şifresi nedir?', 'Kahvaltı saatleri?', 'Geç çıkış istiyorum', 'Taksi çağırabilir misiniz?', 'Klimam çalışmıyor'];
