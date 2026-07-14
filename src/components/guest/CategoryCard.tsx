import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common/Icon';
import type { ServiceCategory } from '@/types';

export function CategoryCard({ category, compact = false }: { category: ServiceCategory; compact?: boolean }) {
  const { roomNumber } = useParams();
  const navigate = useNavigate();

  if (compact) {
    return (
      <button
        onClick={() => navigate(`/guest/room/${roomNumber}/category/${category.slug}`)}
        className="flex min-w-[84px] flex-col items-center gap-2 rounded-2xl bg-cream-50 px-2 py-3.5 shadow-card ring-1 ring-navy-900/5 transition active:scale-95"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${category.color}1a`, color: category.color }}>
          <Icon name={category.icon} className="h-5 w-5" />
        </span>
        <span className="text-center text-[11px] font-semibold leading-tight text-navy-800">{category.name}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate(`/guest/room/${roomNumber}/category/${category.slug}`)}
      className="group flex flex-col items-start gap-3 rounded-2xl bg-cream-50 p-4 text-left shadow-card ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-lifted active:scale-[0.98]"
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        style={{ backgroundColor: `${category.color}1a`, color: category.color }}
      >
        <Icon name={category.icon} className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-navy-900">{category.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-navy-400">{category.description}</p>
      </div>
    </button>
  );
}
