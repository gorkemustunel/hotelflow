import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { RequestForm } from '@/components/guest/RequestForm';
import { MenuOrder } from '@/components/guest/MenuOrder';
import { getCategoryBySlug } from '@/data/serviceCategories';
import { getItemsByCategory } from '@/data/serviceItems';
import { HotelInfoContent } from '@/components/guest/HotelInfoContent';
import { EmergencyContent } from '@/components/guest/EmergencyContent';
import { useViewMode } from '@/context/ViewModeContext';
import clsx from 'clsx';

export function CategoryDetail() {
  const { roomNumber, slug = '' } = useParams();
  const navigate = useNavigate();
  const { isDesktop } = useViewMode();
  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <EmptyState
        icon="SearchX"
        title="Hizmet bulunamadı"
        description="Aradığınız hizmet kategorisi mevcut değil."
        action={
          <button onClick={() => navigate(`/guest/room/${roomNumber}/services`)} className="text-sm font-semibold text-gold-600">
            Hizmetlere Dön
          </button>
        }
      />
    );
  }

  const items = getItemsByCategory(category.id);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50 shadow-soft ring-1 ring-navy-900/5 transition hover:bg-cream-100"
        >
          <Icon name="ChevronLeft" className="h-5 w-5 text-navy-700" />
        </button>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${category.color}1a`, color: category.color }}>
            <Icon name={category.icon} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-navy-900">{category.name}</h1>
            <p className="mt-0.5 text-xs text-navy-500">{category.description}</p>
          </div>
        </div>
      </div>

      <div className={clsx(isDesktop && (category.type === 'form' || category.type === 'order' || category.type === 'emergency') && 'mx-auto w-full max-w-xl')}>
        {category.type === 'form' && <RequestForm category={category} />}
        {category.type === 'order' && <MenuOrder category={category} items={items} />}
        {category.type === 'info' && <HotelInfoContent />}
        {category.type === 'emergency' && <EmergencyContent />}
      </div>
    </div>
  );
}
