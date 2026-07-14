import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { MetricCard } from '@/components/common/MetricCard';
import { DemoModeToggle } from '@/components/admin/DemoModeToggle';
import { Card } from '@/components/common/Card';
import { Icon } from '@/components/common/Icon';
import { StatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import { Avatar } from '@/components/common/Avatar';
import { useAppData } from '@/context/AppDataContext';
import { useOperations } from '@/context/OperationsContext';
import { computeDashboardMetrics, computeStaffPerformance } from '@/utils/analytics';
import { isOverdue } from '@/utils/sla';
import { formatCurrency } from '@/utils/format';
import { formatElapsed, formatDateTime } from '@/utils/time';
import { OCCUPANCY_LABELS, type OccupancyStatus } from '@/types';

const OCCUPANCY_DOT: Record<OccupancyStatus, string> = {
  occupied: 'bg-navy-700',
  vacant: 'bg-emerald-500',
  reserved: 'bg-gold-500',
};

interface CategoryChartDatum {
  shortName: string;
  fullName: string;
  count: number;
}

/** Custom tooltip: the axis only ever shows the shortened label, but the
 * tooltip must always surface the full, untruncated category name. */
function CategoryTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload as CategoryChartDatum | undefined;
  if (!datum) return null;
  return (
    <div className="rounded-xl border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs shadow-lifted">
      <p className="font-semibold text-navy-900">{datum.fullName}</p>
      <p className="mt-0.5 text-navy-500">{datum.count} talep</p>
    </div>
  );
}

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function Dashboard() {
  const navigate = useNavigate();
  const { requests, staff } = useAppData();
  const { rooms, breakfastItems, approvalRequests, priceChangeLogs, activityLog, approveRequest, rejectRequest, has } = useOperations();
  const metrics = computeDashboardMetrics(requests);
  const performance = computeStaffPerformance(requests, staff)
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 5);

  const chartData: CategoryChartDatum[] = metrics.topCategories;

  const occupiedCount = rooms.filter((r) => (r.occupancy ?? (r.status === 'occupied' ? 'occupied' : 'vacant')) === 'occupied').length;
  const vacantCount = rooms.filter((r) => (r.occupancy ?? (r.status === 'occupied' ? 'occupied' : 'vacant')) === 'vacant').length;
  const reservedCount = rooms.filter((r) => r.occupancy === 'reserved').length;
  const dirtyCount = rooms.filter((r) => (r.cleaningStatus ?? (r.status === 'cleaning' ? 'dirty' : 'clean')) === 'dirty').length;
  const maintenanceCount = rooms.filter((r) => (r.technicalStatus ?? (r.status === 'maintenance' ? 'maintenance' : 'ok')) === 'maintenance').length;

  const outOfStockBreakfast = breakfastItems.filter((b) => b.stock === 'out_of_stock').length;
  const prepSummary = {
    preparing: breakfastItems.filter((b) => b.prepStatus === 'preparing').length,
    ready: breakfastItems.filter((b) => b.prepStatus === 'ready').length,
    finished: breakfastItems.filter((b) => b.prepStatus === 'finished').length,
  };

  const overdueCount = requests.filter((r) => isOverdue(r)).length;
  const pendingApprovals = approvalRequests.filter((a) => a.status === 'pending');
  const priceChangedToday = priceChangeLogs.filter((p) => isToday(p.timestamp)).length;
  const canResolveApprovals = has('edit_prices');

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Yönetim Paneli</h1>
          <p className="mt-1 text-sm text-navy-500">Bugünkü otel operasyonlarına genel bakış</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemoModeToggle />
          <button
            onClick={() => navigate('/admin/requests')}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-navy-800"
          >
            <Icon name="ClipboardList" className="h-4 w-4" />
            Tüm Talepleri Gör
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Bugün Toplam" value={metrics.totalToday} icon="ClipboardList" />
        <MetricCard label="Açık Talep" value={metrics.open} icon="Loader2" tone="default" />
        <MetricCard label="Acil Talep" value={metrics.urgent} icon="Zap" tone="urgent" />
        <MetricCard label="Geciken Talep" value={overdueCount} icon="AlarmClockOff" tone={overdueCount > 0 ? 'urgent' : 'default'} />
        <MetricCard label="Tamamlanan" value={metrics.completedToday} icon="CheckCircle2" tone="success" />
        <MetricCard label="Ort. Çözüm" value={`${metrics.avgResolution} dk`} icon="Timer" />
        <MetricCard label="Servis Geliri" value={formatCurrency(metrics.revenue)} icon="Wallet" tone="gold" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Dolu Oda" value={occupiedCount} icon="DoorClosed" tone="default" />
        <MetricCard label="Boş Oda" value={vacantCount} icon="DoorOpen" tone="success" />
        <MetricCard label="Rezerve" value={reservedCount} icon="CalendarClock" tone="gold" />
        <MetricCard label="Kirli Oda" value={dirtyCount} icon="Sparkles" tone="urgent" />
        <MetricCard label="Bakımda" value={maintenanceCount} icon="Wrench" tone="urgent" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Kahvaltı Tükendi" value={outOfStockBreakfast} icon="XCircle" tone="urgent" />
        <MetricCard label="Bekleyen Onay" value={pendingApprovals.length} icon="Hourglass" tone={pendingApprovals.length > 0 ? 'urgent' : 'default'} />
        <MetricCard label="Bugün Fiyat Değişen" value={priceChangedToday} icon="TrendingUp" tone="gold" />
        <MetricCard label="Kahvaltı Hazır" value={`${prepSummary.ready}/${breakfastItems.length}`} icon="Coffee" tone="success" />
      </div>

      {pendingApprovals.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900">Onay Bekleyen İşlemler</h3>
            <span className="rounded-full bg-ruby-500/10 px-2.5 py-1 text-xs font-semibold text-ruby-600">{pendingApprovals.length} bekliyor</span>
          </div>
          <div className="space-y-2.5">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream-50 p-3.5 ring-1 ring-navy-900/5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900">{req.itemName} · Fiyat Değişikliği</p>
                  <p className="text-xs text-navy-500">{req.oldValue}₺ → {req.newValue}₺ · Talep eden: {req.requestedByName}</p>
                  <p className="text-[11px] text-navy-400">{formatDateTime(req.createdAt)}</p>
                </div>
                {canResolveApprovals ? (
                  <div className="flex gap-2">
                    <button onClick={() => approveRequest(req.id)} className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/20">
                      Onayla
                    </button>
                    <button onClick={() => rejectRequest(req.id)} className="rounded-lg bg-ruby-500/10 px-3 py-1.5 text-[11px] font-semibold text-ruby-600 hover:bg-ruby-500/20">
                      Reddet
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-navy-400">Yönetici onayı bekleniyor</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900">En Çok Talep Edilen Hizmetler</h3>
            <Icon name="BarChart3" className="h-4 w-4 text-navy-400" />
          </div>
          <div className="h-60 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 8 }}>
                <CartesianGrid vertical={false} stroke="#0f1f3812" />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 10, fill: '#6b7ba0' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6b7ba0' }} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                <Tooltip cursor={{ fill: '#0f1f3808' }} content={CategoryTooltip} />
                <Bar dataKey="count" fill="#c39a4e" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-navy-900">Öne Çıkanlar</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-600">
                <Icon name="Flame" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-navy-400">En Yoğun Oda</p>
                <p className="text-sm font-bold text-navy-900">{metrics.busiestRoom ? `Oda ${metrics.busiestRoom.room} · ${metrics.busiestRoom.count} talep` : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900/10 text-navy-700">
                <Icon name="Star" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-navy-400">En Popüler Hizmet</p>
                <p className="text-sm font-bold text-navy-900">{metrics.topCategories[0]?.fullName ?? '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <Icon name="DoorOpen" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-navy-400">Dolu / Toplam Oda</p>
                <p className="text-sm font-bold text-navy-900">{occupiedCount} / {rooms.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900">Son Gelen Talepler</h3>
            <button onClick={() => navigate('/admin/requests')} className="text-xs font-semibold text-gold-600">Tümü</button>
          </div>
          <div className="space-y-1">
            {metrics.recent.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate('/admin/requests')}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-cream-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-200 text-navy-700">
                    <Icon name={r.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">Oda {r.roomNumber} · {r.categoryName}</p>
                    <p className="text-xs text-navy-400">{formatElapsed(r.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={r.priority} size="sm" />
                  <StatusBadge status={r.status} size="sm" />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-navy-900">Personel Performansı</h3>
          <div className="space-y-3.5">
            {performance.map(({ staff: s, completedCount, activeCount }) => (
              <div key={s.id} className="flex items-center gap-3">
                <Avatar initials={s.initials} color={s.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900">{s.name}</p>
                  <p className="text-xs text-navy-400">{completedCount} tamamlandı · {activeCount} aktif</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gold-600">
                  <Icon name="Star" className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                  {s.rating}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900">Oda Durumları</h3>
            <button onClick={() => navigate('/admin/rooms')} className="text-xs font-semibold text-gold-600">Oda Yönetimi</button>
          </div>
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-9">
            {rooms.map((room) => {
              const occ = room.occupancy ?? (room.status === 'occupied' ? 'occupied' : 'vacant');
              return (
                <div key={room.id} className="flex flex-col items-center gap-1.5 rounded-xl bg-cream-50 py-3 ring-1 ring-navy-900/5">
                  <span className="font-display text-sm font-bold text-navy-900">{room.number}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${OCCUPANCY_DOT[occ]}`} />
                  <span className="text-[9px] font-medium text-navy-400">{OCCUPANCY_LABELS[occ]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-navy-900">Son İşlemler</h3>
          <div className="space-y-3">
            {activityLog.length === 0 && <p className="text-xs text-navy-400">Henüz kayıtlı işlem yok.</p>}
            {activityLog.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900/5">
                  <Icon name="History" className="h-3 w-3 text-navy-500" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-navy-800">{entry.description}</p>
                  <p className="text-[10px] text-navy-400">{entry.actorName} · {formatElapsed(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
