import { serviceCategories } from '@/data/serviceCategories';
import { CategoryCard } from '@/components/guest/CategoryCard';
import { useViewMode } from '@/context/ViewModeContext';
import clsx from 'clsx';

export function ServicesList() {
  const categories = serviceCategories.filter((c) => c.type !== 'emergency');
  const { isDesktop } = useViewMode();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">Otel Hizmetleri</h1>
        <p className="mt-1 text-sm text-navy-500">İhtiyacınız olan hizmeti seçin, birkaç adımda talebinizi iletin.</p>
      </div>
      <div className={clsx('grid gap-3', isDesktop ? 'grid-cols-3' : 'grid-cols-2')}>
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
