import { Icon } from './Icon';
import clsx from 'clsx';

export function Spinner({ className }: { className?: string }) {
  return <Icon name="Loader2" className={clsx('animate-spin', className)} />;
}

export function FullPageLoader({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-navy-500">
      <Spinner className="h-7 w-7" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
