import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { useAppData } from '@/context/AppDataContext';
import { useOperations } from '@/context/OperationsContext';
import { serviceCategories } from '@/data/serviceCategories';
import clsx from 'clsx';

const DEMO_CATEGORIES = serviceCategories.filter((c) => c.type === 'form' || c.type === 'order');
const MIN_INTERVAL_MS = 45_000;
const MAX_INTERVAL_MS = 90_000;

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Opt-in, off by default: while enabled, periodically creates a random
 * guest request from a random room so the admin/staff panels keep feeling
 * "alive" during a live demo or pitch — without interfering with normal
 * testing when it's switched off. */
export function DemoModeToggle() {
  const [enabled, setEnabled] = useState(false);
  const { createRequest } = useAppData();
  const { rooms } = useOperations();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const scheduleNext = () => {
      const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
      timeoutRef.current = window.setTimeout(() => {
        if (cancelled || rooms.length === 0 || DEMO_CATEGORIES.length === 0) return;
        const room = randomItem(rooms);
        const category = randomItem(DEMO_CATEGORIES);
        const title = category.requestTypeOptions ? randomItem(category.requestTypeOptions) : category.name;
        createRequest({
          roomNumber: room.number,
          categoryId: category.id,
          categorySlug: category.slug,
          categoryName: category.name,
          icon: category.icon,
          title,
          description: `${title} — canlı demo modu tarafından otomatik oluşturuldu.`,
          priority: Math.random() < 0.2 ? 'urgent' : 'normal',
          department: category.department,
          estimatedMinutes: category.estimatedMinutes,
        });
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [enabled, rooms, createRequest]);

  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      className={clsx(
        'flex items-center gap-2 rounded-full px-3.5 py-2.5 text-xs font-semibold transition',
        enabled
          ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30'
          : 'bg-navy-900/5 text-navy-500 ring-1 ring-navy-900/10 hover:bg-navy-900/10',
      )}
    >
      <span className={clsx('h-2 w-2 rounded-full', enabled ? 'animate-pulse bg-emerald-500' : 'bg-navy-400')} />
      <Icon name="Sparkles" className="h-3.5 w-3.5" />
      Canlı Demo Modu {enabled ? 'Açık' : 'Kapalı'}
    </button>
  );
}
