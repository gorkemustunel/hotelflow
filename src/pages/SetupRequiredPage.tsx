import { Icon } from '@/components/common/Icon';

/**
 * Rendered instead of the whole app when `VITE_SUPABASE_URL` /
 * `VITE_SUPABASE_ANON_KEY` aren't set. HotelFlow moved from a
 * localStorage/demo-data fallback to requiring a real Supabase project (see
 * `supabase/schema.sql` and the README's "Backend kurulumu" section) — this
 * screen exists so a missing `.env` fails with a clear next step instead of
 * a blank page or scattered "Supabase is not configured" console errors.
 */
export function SetupRequiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 bg-deco-pattern px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-cream-50 p-8 shadow-card ring-1 ring-navy-900/5">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-ruby-500/10 text-ruby-600">
          <Icon name="DatabaseZap" className="h-5 w-5" />
        </div>
        <h1 className="font-display text-xl font-semibold text-navy-900">Backend yapılandırması eksik</h1>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          HotelFlow artık gerçek bir Supabase projesine bağlanacak şekilde çalışıyor — yerel/mock veri modu kaldırıldı.
          Uygulamanın çalışması için:
        </p>
        <ol className="mt-4 space-y-2.5 text-sm text-navy-700">
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900/10 text-[11px] font-bold">1</span>
            <span>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="font-semibold text-gold-600 underline underline-offset-2">
                supabase.com
              </a>{' '}
              üzerinde ücretsiz bir proje oluştur.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900/10 text-[11px] font-bold">2</span>
            <span>Proje kökündeki <code className="rounded bg-cream-200 px-1.5 py-0.5 font-mono text-[12px]">supabase/schema.sql</code> dosyasının tamamını Supabase Dashboard → SQL Editor'a yapıştırıp çalıştır.</span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900/10 text-[11px] font-bold">3</span>
            <span><code className="rounded bg-cream-200 px-1.5 py-0.5 font-mono text-[12px]">.env.example</code> dosyasını <code className="rounded bg-cream-200 px-1.5 py-0.5 font-mono text-[12px]">.env</code> olarak kopyala, Project Settings → API'den URL ve anon key'i yapıştır.</span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900/10 text-[11px] font-bold">4</span>
            <span><code className="rounded bg-cream-200 px-1.5 py-0.5 font-mono text-[12px]">node scripts/seed-auth-users.mjs</code> ile yönetici/personel giriş hesaplarını oluştur.</span>
          </li>
          <li className="flex gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-900/10 text-[11px] font-bold">5</span>
            <span>Geliştirme sunucusunu yeniden başlat: <code className="rounded bg-cream-200 px-1.5 py-0.5 font-mono text-[12px]">npm run dev</code></span>
          </li>
        </ol>
        <p className="mt-5 text-xs text-navy-400">Detaylı adımlar için README.md → "Backend kurulumu" bölümüne bak.</p>
      </div>
    </div>
  );
}
