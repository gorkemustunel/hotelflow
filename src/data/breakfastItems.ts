import type { BreakfastItem } from '@/types';

export const initialBreakfastItems: BreakfastItem[] = [
  { id: 'bf1', name: 'Menemen', description: 'Domates, biber ve yumurta ile geleneksel usul.', allergens: ['Yumurta'], category: 'hot', stock: 'in_stock', available: true, prepStatus: 'ready', addedBy: 'Murat Usta', updatedAt: '2026-07-06T06:30:00' },
  { id: 'bf2', name: 'Sucuklu Yumurta', description: 'Tavada pişirilmiş sucuk ve yumurta.', allergens: ['Yumurta'], category: 'hot', stock: 'in_stock', available: true, prepStatus: 'ready', addedBy: 'Murat Usta', updatedAt: '2026-07-06T06:32:00' },
  { id: 'bf3', name: 'Sigara Böreği', description: 'Peynirli, el açması yufka ile.', allergens: ['Gluten', 'Süt'], category: 'bakery', stock: 'in_stock', available: true, prepStatus: 'preparing', addedBy: 'Murat Usta', updatedAt: '2026-07-06T06:20:00' },
  { id: 'bf4', name: 'Simit', description: 'Susamlı, günlük taze fırından.', allergens: ['Gluten', 'Susam'], category: 'bakery', stock: 'in_stock', available: true, prepStatus: 'ready', addedBy: 'Murat Usta', updatedAt: '2026-07-06T06:00:00' },
  { id: 'bf5', name: 'Peynir Tabağı', description: 'Beyaz peynir, kaşar, tulum ve örgü peyniri.', allergens: ['Süt'], category: 'cold', stock: 'in_stock', available: true, prepStatus: 'ready', addedBy: 'Murat Usta', updatedAt: '2026-07-06T06:10:00' },
  { id: 'bf6', name: 'Zeytin Çeşitleri', description: 'Yeşil ve siyah zeytin, isteğe bağlı otlu.', allergens: [], category: 'cold', stock: 'in_stock', available: true, prepStatus: 'ready', addedBy: 'Murat Usta', updatedAt: '2026-07-06T06:05:00' },
  { id: 'bf7', name: 'Mevsim Meyve Tabağı', description: 'Günlük taze kesilmiş mevsim meyveleri.', allergens: [], category: 'fruit', stock: 'in_stock', available: true, prepStatus: 'ready', addedBy: 'Murat Usta', updatedAt: '2026-07-06T06:15:00' },
  { id: 'bf8', name: 'Türk Kahvesi', description: 'Geleneksel usul, lokum eşliğinde.', allergens: [], category: 'drink', stock: 'in_stock', available: true, prepStatus: 'ready', price: 90, addedBy: 'Zeynep Yıldız', updatedAt: '2026-07-05T09:00:00' },
  { id: 'bf9', name: 'Taze Sıkma Portakal Suyu', description: '100% doğal, günlük taze sıkım.', allergens: [], category: 'drink', stock: 'in_stock', available: true, prepStatus: 'ready', price: 130, addedBy: 'Zeynep Yıldız', updatedAt: '2026-07-05T09:00:00' },
  { id: 'bf10', name: 'Bal & Kaymak', description: 'Ev yapımı kaymak ve çiçek balı.', allergens: ['Süt'], category: 'extra', stock: 'out_of_stock', available: false, prepStatus: 'finished', addedBy: 'Murat Usta', updatedAt: '2026-07-06T07:40:00' },
];
