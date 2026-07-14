import type { GuestRequest } from '@/types';
import { getStaffById } from './staff';

// Timestamps are generated relative to "now" so the demo always looks live,
// regardless of when it is opened.
const NOW = Date.now();
const minutesAgo = (mins: number) => new Date(NOW - mins * 60000).toISOString();

const staffName = (id?: string) => (id ? getStaffById(id)?.name : undefined);

function withHistory(req: Omit<GuestRequest, 'history' | 'assignedStaffName'>): GuestRequest {
  const history: GuestRequest['history'] = [
    { status: 'received', timestamp: req.createdAt, actor: 'Misafir' },
  ];
  if (req.status !== 'received') {
    history.push({ status: 'assigned', timestamp: minutesAgo(Math.max(0, (NOW - new Date(req.createdAt).getTime()) / 60000 - 4)), actor: staffName(req.assignedStaffId) ?? 'Sistem' });
  }
  if (['preparing', 'on_the_way', 'arrived', 'completed'].includes(req.status)) {
    history.push({ status: 'preparing', timestamp: minutesAgo(Math.max(0, (NOW - new Date(req.createdAt).getTime()) / 60000 - 2)), actor: staffName(req.assignedStaffId) });
  }
  if (['on_the_way', 'arrived', 'completed'].includes(req.status)) {
    history.push({ status: 'on_the_way', timestamp: minutesAgo(Math.max(0, (NOW - new Date(req.createdAt).getTime()) / 60000 - 1)), actor: staffName(req.assignedStaffId) });
  }
  if (req.status === 'completed') {
    history.push({ status: 'completed', timestamp: req.updatedAt, actor: staffName(req.assignedStaffId) });
  }
  if (req.status === 'cancelled') {
    history.push({ status: 'cancelled', timestamp: req.updatedAt, actor: 'Misafir' });
  }
  return { ...req, assignedStaffName: staffName(req.assignedStaffId), history };
}

export const initialRequests: GuestRequest[] = [
  withHistory({
    id: 'req-seed-1', roomNumber: '305', categoryId: 'cat-towels', categorySlug: 'havlu-nevresim',
    categoryName: 'Havlu / Nevresim', icon: 'Layers', title: 'Ekstra havlu talebi',
    description: '2 kişilik ekstra banyo havlusu ve bir plaj havlusu rica ediyoruz.',
    priority: 'normal', status: 'assigned', department: 'housekeeping',
    createdAt: minutesAgo(22), updatedAt: minutesAgo(18), assignedStaffId: 's1',
    estimatedMinutes: 12, callBeforeArrival: false,
  }),
  withHistory({
    id: 'req-seed-2', roomNumber: '201', categoryId: 'cat-technical', categorySlug: 'teknik-destek',
    categoryName: 'Teknik Destek', icon: 'Wrench', title: 'Klima çalışmıyor',
    description: 'Klima açılıyor ama soğutma yapmıyor, oda çok sıcak.',
    priority: 'urgent', status: 'preparing', department: 'technical',
    createdAt: minutesAgo(35), updatedAt: minutesAgo(9), assignedStaffId: 's3',
    estimatedMinutes: 30, callBeforeArrival: true, staffNote: 'Kompresör kontrol ediliyor, yedek parça alınıyor.',
  }),
  withHistory({
    id: 'req-seed-3', roomNumber: '712', categoryId: 'cat-restaurant', categorySlug: 'restoran-menu',
    categoryName: 'Restoran Menü', icon: 'UtensilsCrossed', title: 'Oda servisi siparişi',
    description: '2 adet Dana Bonfile, 1 adet Fıstıklı Cheesecake, 2 adet Filtre Kahve.',
    priority: 'normal', status: 'on_the_way', department: 'room_service',
    createdAt: minutesAgo(28), updatedAt: minutesAgo(4), assignedStaffId: 's6',
    estimatedMinutes: 30, callBeforeArrival: false,
    items: [
      { serviceItemId: 'm8', name: 'Dana Bonfile', price: 780, quantity: 2 },
      { serviceItemId: 'm10', name: 'Fıstıklı Cheesecake', price: 260, quantity: 1 },
      { serviceItemId: 'm4', name: 'Filtre Kahve', price: 110, quantity: 2 },
    ],
    totalPrice: 780 * 2 + 260 + 110 * 2,
  }),
  withHistory({
    id: 'req-seed-4', roomNumber: '102', categoryId: 'cat-late-checkout', categorySlug: 'gec-cikis',
    categoryName: 'Geç Çıkış Talebi', icon: 'Clock', title: 'Geç çıkış talebi — 15:00',
    description: 'Uçuşumuz akşam olduğu için 15:00’a kadar odada kalmak istiyoruz.',
    priority: 'normal', status: 'received', department: 'reception',
    createdAt: minutesAgo(6), updatedAt: minutesAgo(6),
    estimatedMinutes: 5, callBeforeArrival: false,
  }),
  withHistory({
    id: 'req-seed-5', roomNumber: '401', categoryId: 'cat-minibar', categorySlug: 'mini-bar',
    categoryName: 'Mini Bar', icon: 'Wine', title: 'Minibar eksik ürün bildirimi',
    description: 'Su ve kuruyemiş bitmiş, yeniden doldurulmasını rica ederiz.',
    priority: 'normal', status: 'assigned', department: 'room_service',
    createdAt: minutesAgo(15), updatedAt: minutesAgo(11), assignedStaffId: 's6',
    estimatedMinutes: 15, callBeforeArrival: false,
    items: [
      { serviceItemId: 'mb3', name: 'Su (Cam Şişe)', price: 60, quantity: 4 },
      { serviceItemId: 'mb1', name: 'Karışık Kuruyemiş', price: 140, quantity: 2 },
    ],
    totalPrice: 60 * 4 + 140 * 2,
  }),
  withHistory({
    id: 'req-seed-6', roomNumber: '103', categoryId: 'cat-housekeeping', categorySlug: 'temizlik',
    categoryName: 'Temizlik', icon: 'Sparkles', title: 'Oda temizliği talebi',
    description: 'Standart oda temizliği ve havlu değişimi rica ederiz.',
    priority: 'normal', status: 'completed', department: 'housekeeping',
    createdAt: minutesAgo(140), updatedAt: minutesAgo(95), assignedStaffId: 's2',
    estimatedMinutes: 25, callBeforeArrival: false, staffNote: 'Oda temizlendi, minibar kontrol edildi.',
  }),
  withHistory({
    id: 'req-seed-7', roomNumber: '502', categoryId: 'cat-spa', categorySlug: 'spa-masaj',
    categoryName: 'Spa / Masaj', icon: 'Flower2', title: 'İsveç Masajı (50 dk) rezervasyonu',
    description: '2 kişi için bugün saat 17:00 civarı uygun olur mu?',
    priority: 'normal', status: 'received', department: 'spa',
    createdAt: minutesAgo(3), updatedAt: minutesAgo(3),
    estimatedMinutes: 50, callBeforeArrival: false,
  }),
  withHistory({
    id: 'req-seed-8', roomNumber: '202', categoryId: 'cat-complaint', categorySlug: 'sikayet-oneri',
    categoryName: 'Şikayet / Öneri', icon: 'MessageSquareWarning', title: 'Koridordan gelen gürültü',
    description: 'Gece geç saatte koridordan gelen sesler nedeniyle rahatsız olduk.',
    priority: 'urgent', status: 'assigned', department: 'management',
    createdAt: minutesAgo(50), updatedAt: minutesAgo(40), assignedStaffId: 's8',
    estimatedMinutes: 10, callBeforeArrival: true,
  }),
  withHistory({
    id: 'req-seed-9', roomNumber: '601', categoryId: 'cat-wakeup', categorySlug: 'uyandirma',
    categoryName: 'Uyandırma Servisi', icon: 'AlarmClock', title: 'Uyandırma — 07:00',
    description: 'Yarın sabah 07:00’de uyandırma çağrısı rica ederiz.',
    priority: 'normal', status: 'completed', department: 'reception',
    createdAt: minutesAgo(200), updatedAt: minutesAgo(190), assignedStaffId: 's5',
    estimatedMinutes: 2,
  }),
  withHistory({
    id: 'req-seed-10', roomNumber: '305', categoryId: 'cat-taxi', categorySlug: 'arac-taksi',
    categoryName: 'Araç / Taksi Çağırma', icon: 'Car', title: 'Taksi çağrısı',
    description: 'Havalimanına gitmek için taksi rica ederiz.',
    priority: 'normal', status: 'cancelled', department: 'reception',
    createdAt: minutesAgo(70), updatedAt: minutesAgo(60),
    cancelReason: 'Misafir kendi aracını kullanmaya karar verdi.',
  }),
];
