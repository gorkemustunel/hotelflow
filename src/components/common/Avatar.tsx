export function Avatar({ initials, color, size = 'md' }: { initials: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
  return (
    <div
      className={`flex ${sizes[size]} shrink-0 items-center justify-center rounded-full font-bold text-white shadow-soft`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
