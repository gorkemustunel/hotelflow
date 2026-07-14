# HotelFlow

**QR kod tabanlı dijital resepsiyon ve otel içi operasyon yönetim sistemi.**

Misafirler odalarındaki QR kodu tarayarak resepsiyonu aramadan temizlik, oda servisi, teknik destek, spa ve daha fazlasını talep eder. Yönetici ve personel panelleri bu talepleri gerçek zamanlı takip eder, rezervasyon takvimini yönetir ve operasyonel raporları görüntüler.

`React 19` · `TypeScript` · `Tailwind CSS v4` · `Vite` · `React Router v7` — tamamen istemci tarafında çalışan bir sistem

---

## İçindekiler

- [Özellikler](#özellikler)
- [Mimari](#mimari)
- [Klasör yapısı](#klasör-yapısı)
- [Kurulum](#kurulum)
- [Demo akışı](#demo-akışı)
- [Tasarım sistemi](#tasarım-sistemi)
- [Yol haritası](#yol-haritası)

## Özellikler

### Misafir deneyimi
- QR kod ile oda bazlı, girişsiz erişim (her odanın kendine ait, yenilenebilir tokenı var)
- 13 hizmet kategorisi: temizlik, oda servisi, restoran menüsü, mini bar, teknik destek, spa, taksi/transfer, geç çıkış, uyandırma servisi, bebek yatağı, şikayet/öneri, otel bilgileri, acil durum
- Sipariş sepeti akışı (restoran/mini bar) ve form akışı (diğer talepler)
- Talep durumu takibi (Alındı → Atandı → Hazırlanıyor → Yolda → Tamamlandı)
- **AI Concierge** — Wi-Fi, kahvaltı saatleri, geç çıkış, taksi gibi sık sorulan konularda anında yanıt veren, ilgili ekrana yönlendiren sohbet asistanı (bkz. `src/utils/concierge.ts`)
- Bildirim merkezi, karanlık mod, masaüstü/mobil responsive görünüm

### Yönetici paneli
- Dashboard: günlük metrikler, en çok talep edilen hizmetler grafiği, personel performansı, oda durumu özeti, son işlemler
- Talep yönetimi (kart/tablo görünüm, filtreleme, personel atama, durum güncelleme)
- Oda durumu yönetimi (doluluk / temizlik / teknik durum — birbirinden bağımsız izlenir)
- **Rezervasyon takvimi** — Gantt görünümlü haftalık takvim, oda bazlı check-in/check-out planlama
- **Raporlar** — gelir/doluluk trend grafiği, departman performansı, CSV dışa aktarım, yazdırılabilir görünüm
- **SLA/gecikme takibi** — tahmini süresini aşan talepler otomatik işaretlenir
- Personel, menü/fiyat, kahvaltı ve rol/yetki yönetimi; fiyat değişikliklerinde onay akışı
- İzin bazlı erişim kontrolü (8 rol × 18 yetki), demo kullanıcı değiştirici
- **Canlı Demo Modu** — açıldığında otomatik simüle misafir talepleri üretir

### Personel paneli
- Departmana özel görev listesi, göreve başlama/tamamlama, not ekleme, "misafir odada yok" işaretleme
- Aşçı rolü için ayrıca kahvaltı yönetim ekranı

## Mimari

Gerçek bir backend olmadan "gerçekmiş gibi hissettiren" bir demo hedeflendi; bu yüzden mimari kararların çoğu ileride gerçek bir API'ye geçişi tek noktadan kolaylaştıracak şekilde alındı:

- **Repository katmanı** (`src/services`) — Talep verisi `RequestsRepository` arayüzü arkasında soyutlanır. Bugün `LocalRequestsRepository` (localStorage) kullanılıyor; `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` tanımlanırsa aynı arayüzü uygulayan `ApiRequestsRepository` (Supabase + Realtime) otomatik devreye girer. Hiçbir component hangisinin aktif olduğunu bilmez.
- **State yönetimi** — React Context + `useState` (6 provider: `AppData`, `Operations`, `Notifications`, `Toast`, `ViewMode`, `Theme`). Küçük/orta ölçekli bir demo için Redux benzeri bir kütüphane yerine bilinçli olarak tercih edildi.
- **Türetilmiş durum, saklanan durum değil** — Rezervasyon durumu (`upcoming`/`active`/`completed`/`cancelled`) hiçbir yerde state olarak tutulmaz; her render'da tarihlerden hesaplanır (`utils/reservations.ts`), böylece asla senkron dışı kalamaz. Tarih aritmetiği bilinçli olarak UTC'ye sabitlendi (İstanbul'un UTC+3 farkının gün kaymasına yol açmaması için).
- **İzin sistemi** — Rol → yetki eşlemesi çalışma zamanında düzenlenebilir (`OperationsContext.toggleRolePermission`); UI, `PermissionGate` ile yetkisiz ekranlarda kırık görünüm yerine anlaşılır bir "erişim yok" durumu gösterir.
- **Karanlık mod** — Ayrı bir `dark:` sınıf seti yazılmadı. Tailwind v4'ün `@theme` bloğu renk token'larını gerçek CSS custom property'lerine derliyor; `[data-theme="dark"]` altında bu değişkenleri (kağıt/mürekkep rollerini takas ederek) yeniden tanımlamak tüm uygulamayı — misafir, yönetici, personel panelleri dahil — tek yerden yeniden temalıyor.
- **Rota bazlı code-splitting** — Her sayfa `React.lazy` ile yükleniyor; örneğin Recharts sadece Dashboard/Raporlar sayfasına girildiğinde indirilir.
- **PWA** — `vite-plugin-pwa` ile service worker + manifest; iOS/Android'e ana ekrana eklenebilir (ayrıca `capacitor.config.ts` ile native Android/iOS kabuğu da mevcut).

## Klasör yapısı

```
src/
├── auth/            # Route guard iskeleti (demo: her istek açık, gerçek login src/auth/* değişikliğiyle eklenir)
├── components/
│   ├── admin/        common/        guest/        staff/
├── context/          # AppData, Operations, Notifications, Toast, ViewMode, Theme
├── data/             # Mock veri: oteller, odalar, personel, roller, rezervasyonlar, hizmetler
├── layouts/          # GuestLayout, AdminLayout, StaffLayout
├── pages/            # Rol bazlı sayfalar (guest/, admin/, staff/)
├── services/         # RequestsRepository arayüzü + local/Supabase implementasyonları
├── types/            # Paylaşılan TypeScript tipleri (tek dosya, backend şemasına yakın)
└── utils/            # concierge, reservations, sla, csv, analytics, permissions, format, time
```

## Kurulum

```bash
npm install
npm run dev
```

> Not: Bu proje demo/prototip amaçlıdır. Backend bağlanmadığı sürece tüm veriler `src/data` altındaki mock dosyalarından gelir; talepler tarayıcının `localStorage`'ında tutulur. Gerçek zamanlı çoklu-cihaz senkronizasyonu için `.env` dosyasına Supabase kimlik bilgileri eklenebilir (bkz. `src/services/supabaseClient.ts`).

Diğer komutlar:

```bash
npm run build     # Production build (tsc -b && vite build)
npm run preview   # Build'i yerelde önizle
npm run lint       # oxlint ile statik analiz
npm test           # Vitest ile birim testleri çalıştır
```

## Demo akışı

Uygulama `/` adresinde üç rol arasında geçiş sunar:

- **Misafir Demo** — Örnek bir oda seçip `/guest/room/:roomNumber` deneyimini açar (gerçekte QR kod bu linke yönlendirir; token doğrulaması dahildir).
- **Yönetici Paneli** — `/admin`: dashboard, talep/rezervasyon/rapor yönetimi, oda & QR yönetimi, personel, hizmet/menü yönetimi, ayarlar.
- **Personel Paneli** — `/staff`: personel seçimi ve o personele/departmanına özel görev listesi.

Uçtan uca test etmek için: misafir tarafında bir talep oluşturun → yönetici panelinde bildirimi görün, personele atayın → personel panelinde göreve başlayıp tamamlayın → misafir tarafında durumun güncellendiğini gözlemleyin. "Canlı Demo Modu"nu açarak bu döngüyü otomatik simüle taleplerle de izleyebilirsiniz.

## Tasarım sistemi

**"Editorial Alpine"** — açık, ferah, serif başlıklı bir alpine otel editoryal sitesinden ilham alan; koyu "SaaS lüks" görünümünden bilinçli olarak uzak duran bir tasarım dili. Kağıt tonu krem yüzeyler, gerçek mürekkep siyahı metin, ince çizgiler ve antika pirinç vurgular. Karanlık mod aynı kimliği tersine çevirerek korur.

## Yol haritası

- [x] QR tabanlı misafir erişimi + token yenileme
- [x] Rezervasyon takvimi, SLA takibi, raporlama
- [x] AI Concierge, karanlık mod
- [ ] Çoklu dil desteği (TR/EN)
- [ ] Misafir memnuniyet/puanlama akışı
- [ ] Gerçek zamanlı çoklu-cihaz senkronizasyonu için tam Supabase entegrasyonu

---

*Bu proje bir portföy/demo çalışmasıdır. Tüm otel, misafir ve talep verileri örnek amaçlıdır.*
