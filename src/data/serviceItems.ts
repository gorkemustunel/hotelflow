import type { ServiceItem } from '@/types';

// group is a display sub-heading inside the order screen (e.g. restaurant menu groups)
export interface ServiceItemWithGroup extends ServiceItem {
  group: string;
}

export const restaurantItems: ServiceItemWithGroup[] = [
  { id: 'm1', categoryId: 'cat-restaurant', group: 'Kahvaltı', name: 'Serpme Kahvaltı Tabağı', description: 'Peynir çeşitleri, zeytin, reçel, bal, kaymak, taze ekmek sepeti.', price: 420, currency: 'TRY', image: '🍳', available: true, stock: 'in_stock', prepTimeMinutes: 25, department: 'room_service' },
  { id: 'm2', categoryId: 'cat-restaurant', group: 'Kahvaltı', name: 'Omlet Tabağı', description: 'Peynirli, mantarlı veya sade omlet, yanında patates ve marul.', price: 220, currency: 'TRY', image: '🍽️', available: true, stock: 'in_stock', prepTimeMinutes: 15, department: 'room_service' },
  { id: 'm3', categoryId: 'cat-restaurant', group: 'Sıcak İçecekler', name: 'Türk Kahvesi', description: 'Geleneksel usul, lokum eşliğinde.', price: 90, currency: 'TRY', image: '☕', available: true, stock: 'in_stock', prepTimeMinutes: 8, department: 'room_service' },
  { id: 'm4', categoryId: 'cat-restaurant', group: 'Sıcak İçecekler', name: 'Filtre Kahve', description: 'Taze demlenmiş filtre kahve.', price: 110, currency: 'TRY', image: '☕', available: true, stock: 'in_stock', prepTimeMinutes: 8, department: 'room_service' },
  { id: 'm5', categoryId: 'cat-restaurant', group: 'Soğuk İçecekler', name: 'Taze Sıkma Portakal Suyu', description: '100% doğal, günlük taze sıkım.', price: 130, currency: 'TRY', image: '🍊', available: true, stock: 'in_stock', prepTimeMinutes: 6, department: 'room_service' },
  { id: 'm6', categoryId: 'cat-restaurant', group: 'Soğuk İçecekler', name: 'Soğuk Limonata', description: 'Nane yapraklı ev yapımı limonata.', price: 100, currency: 'TRY', image: '🍋', available: true, stock: 'in_stock', prepTimeMinutes: 6, department: 'room_service' },
  { id: 'm7', categoryId: 'cat-restaurant', group: 'Ana Yemekler', name: 'Izgara Somon', description: 'Sebzeli pilav eşliğinde, limon soslu.', price: 620, currency: 'TRY', image: '🐟', available: true, stock: 'in_stock', prepTimeMinutes: 30, department: 'room_service' },
  { id: 'm8', categoryId: 'cat-restaurant', group: 'Ana Yemekler', name: 'Dana Bonfile', description: 'Közlenmiş sebze ve patates püresi ile.', price: 780, currency: 'TRY', image: '🥩', available: true, stock: 'in_stock', prepTimeMinutes: 35, department: 'room_service' },
  { id: 'm9', categoryId: 'cat-restaurant', group: 'Ana Yemekler', name: 'Truf Mantarlı Risotto', description: 'Parmesan ve beyaz truf yağı ile.', price: 480, currency: 'TRY', image: '🍚', available: false, stock: 'out_of_stock', prepTimeMinutes: 28, department: 'room_service' },
  { id: 'm10', categoryId: 'cat-restaurant', group: 'Tatlılar', name: 'Fıstıklı Cheesecake', description: 'Ev yapımı, Antep fıstıklı sos ile.', price: 260, currency: 'TRY', image: '🍰', available: true, stock: 'in_stock', prepTimeMinutes: 10, department: 'room_service' },
  { id: 'm11', categoryId: 'cat-restaurant', group: 'Tatlılar', name: 'Sıcak Çikolatalı Sufle', description: 'Vanilyalı dondurma eşliğinde.', price: 240, currency: 'TRY', image: '🍫', available: true, stock: 'in_stock', prepTimeMinutes: 18, department: 'room_service' },
];

export const minibarItems: ServiceItemWithGroup[] = [
  { id: 'mb1', categoryId: 'cat-minibar', group: 'Atıştırmalık', name: 'Karışık Kuruyemiş', description: '50g, tuzsuz karışık kuruyemiş.', price: 140, currency: 'TRY', image: '🥜', available: true, stock: 'in_stock', prepTimeMinutes: 10, department: 'room_service' },
  { id: 'mb2', categoryId: 'cat-minibar', group: 'Atıştırmalık', name: 'Çikolata Çeşitleri', description: 'Bitter / sütlü çikolata seçenekleri.', price: 120, currency: 'TRY', image: '🍫', available: true, stock: 'in_stock', prepTimeMinutes: 10, department: 'room_service' },
  { id: 'mb3', categoryId: 'cat-minibar', group: 'İçecek', name: 'Su (Cam Şişe)', description: '750ml doğal kaynak suyu.', price: 60, currency: 'TRY', image: '💧', available: true, stock: 'in_stock', prepTimeMinutes: 10, department: 'room_service' },
  { id: 'mb4', categoryId: 'cat-minibar', group: 'İçecek', name: 'Meşrubat Çeşitleri', description: 'Kola, gazoz, soda (33cl).', price: 90, currency: 'TRY', image: '🥤', available: true, stock: 'in_stock', prepTimeMinutes: 10, department: 'room_service' },
  { id: 'mb5', categoryId: 'cat-minibar', group: 'Alkollü İçecek', name: 'Yerli Bira (33cl)', description: 'Soğuk servis.', price: 160, currency: 'TRY', image: '🍺', available: true, stock: 'in_stock', prepTimeMinutes: 10, department: 'room_service' },
  { id: 'mb6', categoryId: 'cat-minibar', group: 'Alkollü İçecek', name: 'Mini Şarap Şişesi (187ml)', description: 'Kırmızı veya beyaz.', price: 280, currency: 'TRY', image: '🍷', available: false, stock: 'out_of_stock', prepTimeMinutes: 10, department: 'room_service' },
];

export const spaItems: ServiceItemWithGroup[] = [
  { id: 'sp1', categoryId: 'cat-spa', group: 'Masaj', name: 'İsveç Masajı (50 dk)', description: 'Tüm vücut rahatlatıcı masaj.', price: 1400, currency: 'TRY', image: '💆', available: true, stock: 'in_stock', prepTimeMinutes: 50, department: 'spa' },
  { id: 'sp2', categoryId: 'cat-spa', group: 'Masaj', name: 'Derin Doku Masajı (50 dk)', description: 'Kas gerginliğine odaklı yoğun masaj.', price: 1600, currency: 'TRY', image: '💆‍♂️', available: true, stock: 'in_stock', prepTimeMinutes: 50, department: 'spa' },
  { id: 'sp3', categoryId: 'cat-spa', group: 'Bakım', name: 'Aydınlatıcı Yüz Bakımı', description: 'Cilt tipine özel bakım seti.', price: 1200, currency: 'TRY', image: '🧖', available: true, stock: 'in_stock', prepTimeMinutes: 45, department: 'spa' },
  { id: 'sp4', categoryId: 'cat-spa', group: 'Isıtma & Buhar', name: 'Sauna & Buhar Odası (60 dk)', description: 'Özel seans rezervasyonu.', price: 700, currency: 'TRY', image: '🧖‍♀️', available: true, stock: 'in_stock', prepTimeMinutes: 60, department: 'spa' },
];

export const allServiceItems: ServiceItemWithGroup[] = [...restaurantItems, ...minibarItems, ...spaItems];

export const getItemsByCategory = (categoryId: string) => allServiceItems.filter((i) => i.categoryId === categoryId);
