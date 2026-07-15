# HotelFlow

**QR kod tabanlı dijital resepsiyon ve otel içi operasyon yönetim sistemi.**

Misafirler odalarındaki QR kodu tarayarak resepsiyonu aramadan temizlik, oda servisi, teknik destek, spa ve daha fazlasını talep eder. Yönetici ve personel panelleri bu talepleri gerçek zamanlı takip eder, rezervasyon takvimini yönetir ve operasyonel raporları görüntüler.

`React 19` · `TypeScript` · `Tailwind CSS v4` · `Vite` · `React Router v7` · `Supabase` (Postgres + Auth + Realtime) — gerçek bir backend'e bağlı, çoklu cihaz arasında canlı senkronize olan bir demo/prototip (bkz. [Mimari](#mimari)).

---

## İçindekiler

- [Özellikler](#özellikler)
- [Mimari](#mimari)
- [Klasör yapısı](#klasör-yapısı)
- [Kurulum](#kurulum)
- [Backend kurulumu](#backend-kurulumu)
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
- İzin bazlı erişim kontrolü (8 rol × 18 yetki)
- Şifreyle giriş (Supabase Auth) — yönetici paneline sadece `super_admin`/`hotel_manager` rolleri, diğer tüm roller personel paneline erişebilir
- **Canlı Demo Modu** — açıldığında otomatik simüle misafir talepleri üretir

### Personel paneli
- Departmana özel görev listesi, göreve başlama/tamamlama, not ekleme, "misafir odada yok" işaretleme
- Aşçı rolü için ayrıca kahvaltı yönetim ekranı

## Mimari

Uygulama artık gerçek bir Supabase projesine bağlı çalışıyor (Postgres + Row Level Security + Auth + Realtime) — localStorage/mock-data modu tamamen kaldırıldı, `.env` yapılandırılmadan uygulama açılmaz (bkz. [Backend kurulumu](#backend-kurulumu)).

- **Repository katmanı** (`src/services`) — Her veri alanı (talepler, odalar, personel, roller, rezervasyonlar, kahvaltı, QR token'ları, bildirimler) kendi repository modülü arkasında soyutlanır; component'ler doğrudan Supabase client'ı bilmez. Talepler `RequestsRepository` arayüzü + `ApiRequestsRepository` (Supabase + Realtime); geri kalan alanlar `opsRepository.ts` / `notificationsRepository.ts` altında toplanır. Realtime abonelikleri sayesinde bir cihazda yapılan değişiklik (oda durumu, rezervasyon, kahvaltı stoku, QR yenileme) diğer açık sekmelerde/cihazlarda anında görünür.
- **Gerçek kimlik doğrulama** — Yönetici ve personel girişleri Supabase Auth (`signInWithPassword`) üzerinden gerçek hesaplarla yapılır (bkz. `scripts/seed-auth-users.mjs`). `user_metadata.role`/`staffId` alanları hangi panele erişebileceğini ve hangi personel kaydına bağlı olduğunu belirler. Misafir tarafı kimlik doğrulama gerektirmez — QR token'ı yeterlidir.
- **State yönetimi** — React Context + `useState` (6 provider: `AppData`, `Operations`, `Notifications`, `Toast`, `ViewMode`, `Theme`). Küçük/orta ölçekli bir demo için Redux benzeri bir kütüphane yerine bilinçli olarak tercih edildi; ilk yüklemede tüm operasyonel veri Supabase'den çekilene kadar `AppGate` bir yükleme ekranı gösterir.
- **Türetilmiş durum, saklanan durum değil** — Rezervasyon durumu (`upcoming`/`active`/`completed`/`cancelled`) hiçbir yerde state olarak tutulmaz; her render'da tarihlerden hesaplanır (`utils/reservations.ts`), böylece asla senkron dışı kalamaz. Tarih aritmetiği bilinçli olarak UTC'ye sabitlendi (İstanbul'un UTC+3 farkının gün kaymasına yol açmaması için).
- **İzin sistemi** — Rol → yetki eşlemesi çalışma zamanında düzenlenebilir (`OperationsContext.toggleRolePermission`); UI, `PermissionGate` ile yetkisiz ekranlarda kırık görünüm yerine anlaşılır bir "erişim yok" durumu gösterir.
- **Karanlık mod** — Ayrı bir `dark:` sınıf seti yazılmadı. Tailwind v4'ün `@theme` bloğu renk token'larını gerçek CSS custom property'lerine derliyor; `[data-theme="dark"]` altında bu değişkenleri (kağıt/mürekkep rollerini takas ederek) yeniden tanımlamak tüm uygulamayı — misafir, yönetici, personel panelleri dahil — tek yerden yeniden temalıyor.
- **Rota bazlı code-splitting** — Her sayfa `React.lazy` ile yükleniyor; örneğin Recharts sadece Dashboard/Raporlar sayfasına girildiğinde indirilir.
- **PWA** — `vite-plugin-pwa` ile service worker + manifest; iOS/Android'e ana ekrana eklenebilir (ayrıca `capacitor.config.ts` ile native Android/iOS kabuğu da mevcut).

## Klasör yapısı

```
src/
├── auth/            # useSession (Supabase Auth), RequireAuth route guard, demo credential yardımcıları
├── components/
│   ├── admin/        common/        guest/        staff/
├── context/          # AppData, Operations, Notifications, Toast, ViewMode, Theme
├── data/             # Statik referans veri (rol etiketleri, oda tipi spec'leri, demo personel listesi)
├── layouts/          # GuestLayout, AdminLayout, StaffLayout
├── pages/            # Rol bazlı sayfalar (guest/, admin/, staff/) + SetupRequiredPage
├── services/         # Supabase client + repository katmanı (requests, ops, notifications, mappers)
├── types/            # Paylaşılan TypeScript tipleri (tek dosya, backend şemasına yakın)
└── utils/            # concierge, reservations, sla, csv, analytics, permissions, format, time
supabase/
└── schema.sql        # Tüm tablolar + RLS politikaları + seed data (tek seferde çalıştırılır)
scripts/
└── seed-auth-users.mjs  # Demo admin/personel Supabase Auth hesaplarını oluşturur
```

## Kurulum

```bash
npm install
```

Uygulama gerçek bir Supabase projesine ihtiyaç duyar — `npm run dev` çalıştırmadan önce [Backend kurulumu](#backend-kurulumu) adımlarını tamamla. `.env` yoksa uygulama çalışır ama boş bir "yapılandırma eksik" ekranı gösterir (kod hatası değildir).

```bash
npm run dev
```

Diğer komutlar:

```bash
npm run build     # Production build (tsc -b && vite build)
npm run preview   # Build'i yerelde önizle
npm run lint       # oxlint ile statik analiz
npm test           # Vitest ile birim testleri çalıştır
```

## Backend kurulumu

1. [supabase.com](https://supabase.com/dashboard) üzerinde ücretsiz bir proje oluştur.
2. Supabase Dashboard → **SQL Editor**'a git, `supabase/schema.sql` dosyasının tamamını yapıştırıp çalıştır. Bu tek adım tüm tabloları, RLS politikalarını, realtime yayınlarını ve mevcut demo verisiyle birebir aynı seed data'yı oluşturur.
3. `.env.example` dosyasını `.env` olarak kopyala; Project Settings → API'den **Project URL** ve **anon public key**'i `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` alanlarına yapıştır.
4. Project Settings → API'den **service_role** key'ini kopyala (bu anahtarı `.env`'e KOYMA — sadece bir sonraki komutta geçici olarak kullanılır) ve demo giriş hesaplarını oluştur:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-auth-users.mjs
   ```
   Bu, 8 demo personayı (2 yönetici + 6 personel) `<kullanıcı-adı>@hotelflow.demo` / `1234` bilgileriyle Supabase Auth'a ekler — aynı bilgiler giriş ekranlarındaki "Demo giriş bilgileri" panelinde de gösterilir.
5. `npm run dev` (veya canlıya deploy ediyorsan Netlify/Vercel ortam değişkenlerine aynı `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` çiftini ekle).

Script'i tekrar çalıştırmak güvenlidir — var olan hesaplar atlanır.

## Demo akışı

Üç yüzey birbirinden tamamen bağımsız URL'lerde yaşar ve hiçbiri diğerine link vermez — gerçek bir otelde misafir, yönetici ve personelin birbirinin giriş ekranını hiç görmemesi gibi:

- **Misafir** — `/` adresi doğrudan oda seçim ekranını açar (gerçekte QR kod misafiri doğrudan `/guest/room/:roomNumber`'a yönlendirir; token doğrulaması dahildir). Giriş gerektirmez.
- **Yönetici Paneli** — `/admin-select`'te şifreyle giriş yapılır (sadece `super_admin`/`hotel_manager` hesapları), ardından `/admin`: dashboard, talep/rezervasyon/rapor yönetimi, oda & QR yönetimi, personel, hizmet/menü yönetimi, ayarlar.
- **Personel Paneli** — `/staff`'ta şifreyle giriş yapılır (diğer tüm roller, resepsiyon dahil), ardından o personele/departmanına özel görev listesi.

Demo giriş bilgileri her iki giriş ekranındaki "Demo giriş bilgileri" panelinde gösterilir (hesapları oluşturmak için bkz. [Backend kurulumu](#backend-kurulumu)). `/admin-select` ve `/staff`'a ana sayfadan bir link yok — gerçek üründe bu URL'ler sadece ilgili ekibe bilinir; demoyu sunarken adres çubuğuna doğrudan yazman gerekir.

Uçtan uca test etmek için: misafir tarafında bir talep oluşturun → yönetici panelinde bildirimi görün, personele atayın → personel panelinde göreve başlayıp tamamlayın → misafir tarafında durumun güncellendiğini gözlemleyin. "Canlı Demo Modu"nu açarak bu döngüyü otomatik simüle taleplerle de izleyebilirsiniz.

## Tasarım sistemi

**"Editorial Alpine"** — açık, ferah, serif başlıklı bir alpine otel editoryal sitesinden ilham alan; koyu "SaaS lüks" görünümünden bilinçli olarak uzak duran bir tasarım dili. Kağıt tonu krem yüzeyler, gerçek mürekkep siyahı metin, ince çizgiler ve antika pirinç vurgular. Karanlık mod aynı kimliği tersine çevirerek korur.

## Yol haritası

- [x] QR tabanlı misafir erişimi + token yenileme
- [x] Rezervasyon takvimi, SLA takibi, raporlama
- [x] AI Concierge, karanlık mod
- [x] Gerçek Supabase backend (Postgres + RLS + Realtime) — oda, personel, rezervasyon, kahvaltı, QR, bildirim
- [x] Gerçek kimlik doğrulama (Supabase Auth) — rol bazlı panel erişimi
- [x] Roller/izinler, fiyat & aktivite logları, onay talepleri, otel ayarları ve menü kataloğunu da Supabase'e taşımak — sistem artık uçtan uca gerçek backend'e bağlı
- [ ] Çoklu dil desteği (TR/EN)
- [ ] Misafir memnuniyet/puanlama akışı

---

*Bu proje bir portföy/demo çalışmasıdır. Tüm otel, misafir ve talep verileri örnek amaçlıdır.*
