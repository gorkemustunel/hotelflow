import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ServiceCategory } from '@/types';
import type { ServiceItemWithGroup } from '@/data/serviceItems';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { QuantityStepper } from '@/components/common/QuantityStepper';
import { TextArea } from '@/components/common/FormField';
import { formatCurrency } from '@/utils/format';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';

export function MenuOrder({ category, items }: { category: ServiceCategory; items: ServiceItemWithGroup[] }) {
  const { roomNumber = '' } = useParams();
  const navigate = useNavigate();
  const { createRequest } = useAppData();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [roomNote, setRoomNote] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, ServiceItemWithGroup[]>();
    items.forEach((item) => {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    });
    return Array.from(map.entries());
  }, [items]);

  const cartItems = useMemo(
    () => Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ item: items.find((i) => i.id === id)!, qty })),
    [cart, items],
  );
  const totalCount = cartItems.reduce((sum, c) => sum + c.qty, 0);
  const totalPrice = cartItems.reduce((sum, c) => sum + c.item.price * c.qty, 0);

  const setQty = (id: string, qty: number) => setCart((prev) => ({ ...prev, [id]: qty }));

  const handleSubmit = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      createRequest({
        roomNumber,
        categoryId: category.id,
        categorySlug: category.slug,
        categoryName: category.name,
        icon: category.icon,
        title: `${category.name} siparişi (${totalCount} ürün)`,
        description: cartItems.map((c) => `${c.qty}x ${c.item.name}`).join(', '),
        priority: 'normal',
        department: category.department,
        estimatedMinutes: category.estimatedMinutes,
        guestNote: roomNote || undefined,
        items: cartItems.map((c) => ({ serviceItemId: c.item.id, name: c.item.name, price: c.item.price, quantity: c.qty })),
        totalPrice,
      });
      setSubmitting(false);
      setSubmitted(true);
      setCartOpen(false);
      showToast('Siparişiniz alındı, hazırlanmaya başlanacak.', 'success');
    }, 800);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-cream-50 px-6 py-12 text-center shadow-card">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <Icon name="CheckCircle2" className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="font-display text-xl font-semibold text-navy-900">Siparişiniz Alındı</h2>
        <p className="mt-2 max-w-xs text-sm text-navy-500">Toplam {formatCurrency(totalPrice)} tutarındaki siparişiniz hazırlanıyor.</p>
        <div className="mt-6 flex w-full flex-col gap-2.5">
          <Button fullWidth onClick={() => navigate(`/guest/room/${roomNumber}/requests`)} icon={<Icon name="ClipboardList" className="h-4 w-4" />}>
            Siparişimi Takip Et
          </Button>
          <Button fullWidth variant="secondary" onClick={() => navigate(`/guest/room/${roomNumber}`)}>
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-24">
      {groups.map(([group, groupItems]) => (
        <section key={group}>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-navy-400">{group}</h3>
          <div className="space-y-3">
            {groupItems.map((item) => {
              const qty = cart[item.id] ?? 0;
              return (
                <div key={item.id} className={clsx('flex items-start gap-3 rounded-2xl bg-cream-50 p-3.5 shadow-card ring-1 ring-navy-900/5', !item.available && 'opacity-60')}>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-2xl">{item.image}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-navy-900">{item.name}</p>
                      <p className="shrink-0 text-sm font-bold text-navy-900">{formatCurrency(item.price)}</p>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-navy-400">{item.description}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      {item.available ? (
                        <span className="text-[11px] font-medium text-emerald-600">Stokta var</span>
                      ) : (
                        <span className="text-[11px] font-medium text-ruby-500">Stokta yok</span>
                      )}
                      {item.available && (
                        qty > 0 ? (
                          <QuantityStepper value={qty} onChange={(v) => setQty(item.id, v)} />
                        ) : (
                          <button
                            onClick={() => setQty(item.id, 1)}
                            className="flex items-center gap-1 rounded-full bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
                          >
                            <Icon name="Plus" className="h-3 w-3" />
                            Sepete Ekle
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {totalCount > 0 && (
        <div className="floating-bar-offset fixed inset-x-0 z-20 mx-auto w-full max-w-lg px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-navy-950 px-5 py-4 text-white shadow-lifted transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">{totalCount}</span>
              Sepeti Görüntüle
            </span>
            <span className="font-display text-base font-bold">{formatCurrency(totalPrice)}</span>
          </button>
        </div>
      )}

      <Modal open={cartOpen} onClose={() => setCartOpen(false)} title="Sipariş Özeti">
        <div className="space-y-3">
          {cartItems.map(({ item, qty }) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{item.image}</span>
                <div>
                  <p className="text-sm font-medium text-navy-800">{item.name}</p>
                  <p className="text-xs text-navy-400">{formatCurrency(item.price)} / adet</p>
                </div>
              </div>
              <QuantityStepper value={qty} onChange={(v) => setQty(item.id, v)} />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-navy-800">Odaya Not Bırak</label>
          <TextArea rows={2} placeholder="Örn. Kapıyı çalmadan bırakabilirsiniz…" value={roomNote} onChange={(e) => setRoomNote(e.target.value)} />
        </div>

        <div className="mt-4 flex justify-between border-t border-navy-900/10 pt-3 text-sm font-bold text-navy-900">
          <span>Toplam</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>

        <Button fullWidth size="lg" className="mt-4" onClick={handleSubmit} disabled={submitting} icon={submitting ? <Icon name="Loader2" className="h-5 w-5 animate-spin" /> : <Icon name="Send" className="h-5 w-5" />}>
          {submitting ? 'Gönderiliyor…' : 'Siparişi Gönder'}
        </Button>
      </Modal>
    </div>
  );
}
