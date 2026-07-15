import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { useOperations } from '@/context/OperationsContext';
import { ADMIN_ROLE_IDS, credentialsFor, DEMO_PASSWORD, emailFor, usernameFor } from '@/auth/credentials';
import { supabase } from '@/services/supabaseClient';
import { getDemoSwitchUsers } from '@/data/staff';

const STAFF_STAFF_IDS = getDemoSwitchUsers()
  .filter((u) => !ADMIN_ROLE_IDS.includes(u.roleId))
  .map((u) => u.id);

export function StaffSelectPage() {
  const navigate = useNavigate();
  const { switchUser } = useOperations();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const credentials = credentialsFor(STAFF_STAFF_IDS);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError('');
    const email = emailFor(usernameFor(username.trim()));
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    const role = data.user?.user_metadata?.role;
    const staffId = data.user?.user_metadata?.staffId as string | undefined;
    if (authError || !data.user || role !== 'staff' || !staffId) {
      if (data.user && (role !== 'staff' || !staffId)) await supabase.auth.signOut();
      setError('Kullanıcı adı veya şifre hatalı.');
      return;
    }
    switchUser(staffId);
    navigate(`/staff/${staffId}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 bg-deco-pattern px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Static brand mark, not a link — this login screen deliberately
            doesn't expose a way back to the guest/admin surfaces. */}
        <div className="mx-auto mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 ring-1 ring-gold-400/30">
            <Icon name="Gem" className="h-5 w-5 text-gold-600" />
          </div>
          <div className="text-left">
            <p className="font-display text-sm font-semibold leading-tight text-navy-900">HotelFlow</p>
            <p className="text-[10px] uppercase tracking-widest text-gold-600">Personel Girişi</p>
          </div>
        </div>

        <div className="rounded-3xl bg-cream-50 p-7 shadow-card ring-1 ring-navy-900/5">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
            <Icon name="Lock" className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-semibold text-navy-900">Personel Girişi</h1>
          <p className="mt-1 text-sm text-navy-500">Departmanınıza atanan görevleri görmek için giriş yapın.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy-700">Kullanıcı adı</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="örn. ayse"
                autoComplete="username"
                className="w-full rounded-xl bg-cream-100 px-3.5 py-2.5 text-sm text-navy-900 outline-none ring-1 ring-line transition focus:ring-gold-400/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy-700">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                autoComplete="current-password"
                className="w-full rounded-xl bg-cream-100 px-3.5 py-2.5 text-sm text-navy-900 outline-none ring-1 ring-line transition focus:ring-gold-400/60"
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-ruby-600">
                <Icon name="AlertCircle" className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
            <Button type="submit" fullWidth variant="success" disabled={submitting} icon={<Icon name="LogIn" className="h-4 w-4" />}>
              {submitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </Button>
          </form>

          <button
            onClick={() => setShowHint((v) => !v)}
            className="mt-5 flex w-full items-center justify-between text-xs font-semibold text-navy-400 hover:text-navy-600"
          >
            Demo giriş bilgileri
            <Icon name={showHint ? 'ChevronUp' : 'ChevronDown'} className="h-3.5 w-3.5" />
          </button>
          {showHint && (
            <div className="mt-2.5 space-y-1.5 rounded-xl bg-cream-100 p-3">
              {credentials.map((c) => (
                <div key={c.staffId} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-navy-600">{c.name}</span>
                  <span className="font-mono font-semibold text-navy-900">
                    {c.username} / {DEMO_PASSWORD}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
