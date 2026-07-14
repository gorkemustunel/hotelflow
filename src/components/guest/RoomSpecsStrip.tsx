import { Icon } from '@/components/common/Icon';
import { ROOM_TYPE_SPECS } from '@/data/rooms';
import type { Room } from '@/types';

interface SpecItemProps {
  icon: string;
  value: string;
  label: string;
  last?: boolean;
}

function SpecItem({ icon, value, label, last }: SpecItemProps) {
  return (
    <div className={`flex flex-col items-center gap-1.5 px-2 py-4 text-center ${last ? '' : 'border-r border-line'}`}>
      <Icon name={icon} className="h-4 w-4 text-gold-600" />
      <p className="font-display text-base font-semibold leading-tight text-navy-900">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-navy-400">{label}</p>
    </div>
  );
}

/** Editorial "specs strip" — bed type / size / bathroom / guest count in a
 * four-column grid with hairline dividers, echoing the fact-strip pattern
 * used on grand-hotel room pages. */
export function RoomSpecsStrip({ room }: { room: Room }) {
  const specs = ROOM_TYPE_SPECS[room.type];
  const guests = room.guestCount ?? specs.maxGuests;

  return (
    <div className="grid grid-cols-4 divide-x-0 rounded-sm border-y border-line bg-cream-50">
      <SpecItem icon="BedDouble" value={specs.bedType} label="Yatak" />
      <SpecItem icon="Maximize" value={`${specs.sizeM2} m²`} label="Büyüklük" />
      <SpecItem icon="ShowerHead" value={String(specs.bathroomCount)} label="Banyo" />
      <SpecItem icon="Users" value={String(guests)} label="Misafir" last />
    </div>
  );
}
