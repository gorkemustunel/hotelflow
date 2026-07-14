import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { MetricCard } from '@/components/common/MetricCard';
import { useAppData } from '@/context/AppDataContext';
import { useOperations } from '@/context/OperationsContext';
import { DEPARTMENT_LABELS, type Department } from '@/types';
import { formatCurrency } from '@/utils/format';
import { downloadCsv } from '@/utils/csv';
import { addDays, todayIso } from '@/utils/reservations';

const TREND_DAYS = 14;

interface TrendDatum {
  day: string;
  fullDay: string;
  revenue: number;
  rate: number;
}

function dayShortLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

function RevenueTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload as TrendDatum | undefined;
  if (!datum) return null;
  return (
    <div className="rounded-xl border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs shadow-lifted">
      <p className="font-semibold text-navy-900">{datum.fullDay}</p>
      <p className="mt-0.5 text-navy-500">{formatCurrency(datum.revenue)}</p>
    </div>
  );
}

function OccupancyTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0]?.payload as TrendDatum | undefined;
  if (!datum) return null;
  return (
    <div className="rounded-xl border border-navy-900/10 bg-cream-50 px-3 py-2 text-xs shadow-lifted">
      <p className="font-semibold text-navy-900">{datum.fullDay}</p>
      <p className="mt-0.5 text-navy-500">%{datum.rate} doluluk</p>
    </div>
  );
}

export function ReportsPage() {
  const { requests } = useAppData();
  const { rooms, reservations, staffMembers } = useOperations();

  const today = todayIso();
  const days = useMemo(() => Array.from({ length: TREND_DAYS }, (_, i) => addDays(today, i - (TREND_DAYS - 1))), [today]);

  const trend: TrendDatum[] = useMemo(() => {
    return days.map((day) => {
      const revenue = requests
        .filter((r) => r.status !== 'cancelled' && r.totalPrice && r.createdAt.slice(0, 10) === day)
        .reduce((sum, r) => sum + (r.totalPrice ?? 0), 0);
      const occupiedRoomNumbers = new Set(
        reservations.filter((r) => !r.cancelled && r.checkIn <= day && day < r.checkOut).map((r) => r.roomNumber),
      );
      const rate = rooms.length ? Math.round((occupiedRoomNumbers.size / rooms.length) * 100) : 0;
      return { day: dayShortLabel(day), fullDay: day, revenue, rate };
    });
  }, [days, requests, reservations, rooms.length]);

  const totalRevenue = trend.reduce((sum, d) => sum + d.revenue, 0);
  const avgOccupancy = trend.length ? Math.round(trend.reduce((sum, d) => sum + d.rate, 0) / trend.length) : 0;

  const departmentStats = useMemo(() => {
    const byDept = new Map<Department, typeof staffMembers>();
    staffMembers.forEach((s) => {
      if (!byDept.has(s.department)) byDept.set(s.department, []);
      byDept.get(s.department)!.push(s);
    });
    return Array.from(byDept.entries())
      .map(([department, members]) => {
        const completedToday = members.reduce((sum, m) => sum + m.completedToday, 0);
        const activeTasks = members.reduce((sum, m) => sum + m.activeTasks, 0);
        const avgRating = members.reduce((sum, m) => sum + m.rating, 0) / members.length;
        const resolutionSamples = members.filter((m) => m.avgResolutionMinutes > 0);
        const avgResolution = resolutionSamples.length
          ? Math.round(resolutionSamples.reduce((sum, m) => sum + m.avgResolutionMinutes, 0) / resolutionSamples.length)
          : 0;
        return { department, memberCount: members.length, completedToday, activeTasks, avgRating, avgResolution };
      })
      .sort((a, b) => b.completedToday - a.completedToday);
  }, [staffMembers]);

  const handleExportCsv = () => {
    const rows: (string | number)[][] = [
      ['Oda', 'Kategori', 'Durum', 'Öncelik', 'Oluşturulma', 'Tamamlanma', 'Tutar (TRY)', 'Personel'],
      ...requests.map((r) => [
        r.roomNumber,
        r.categoryName,
        r.status,
        r.priority,
        r.createdAt,
        r.status === 'completed' ? r.updatedAt : '',
        r.totalPrice ?? '',
        r.assignedStaffName ?? '',
      ]),
    ];
    downloadCsv(`hotelflow-talepler-${today}.csv`, rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 print:hidden sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Raporlar</h1>
          <p className="mt-1 text-sm text-navy-500">Son {TREND_DAYS} günlük gelir, doluluk ve departman performansı</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" icon={<Icon name="FileDown" className="h-4 w-4" />} onClick={handleExportCsv}>
            CSV Dışa Aktar
          </Button>
          <Button size="sm" variant="secondary" icon={<Icon name="Printer" className="h-4 w-4" />} onClick={() => window.print()}>
            Yazdır / PDF Kaydet
          </Button>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="font-display text-xl font-bold text-navy-900">HotelFlow — Operasyon Raporu</h1>
        <p className="text-xs text-navy-500">Oluşturulma: {new Date().toLocaleString('tr-TR')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label={`${TREND_DAYS} Günlük Gelir`} value={formatCurrency(totalRevenue)} icon="Wallet" tone="gold" />
        <MetricCard label="Ort. Doluluk" value={`%${avgOccupancy}`} icon="DoorClosed" tone="default" />
        <MetricCard label="Toplam Oda" value={rooms.length} icon="Building2" />
        <MetricCard label="Aktif Personel" value={staffMembers.filter((s) => s.active).length} icon="Users" tone="success" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900">Gelir Trendi</h3>
            <Icon name="TrendingUp" className="h-4 w-4 text-navy-400" />
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#0f1f3812" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7ba0' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7ba0' }} tickLine={false} axisLine={false} width={40} />
                <Tooltip cursor={{ stroke: '#c39a4e', strokeWidth: 1 }} content={RevenueTooltip} />
                <Line type="monotone" dataKey="revenue" stroke="#a8823f" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-navy-900">Doluluk Oranı</h3>
            <Icon name="DoorClosed" className="h-4 w-4 text-navy-400" />
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#0f1f3812" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7ba0' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7ba0' }} tickLine={false} axisLine={false} width={36} domain={[0, 100]} />
                <Tooltip cursor={{ stroke: '#0f1f38', strokeWidth: 1 }} content={OccupancyTooltip} />
                <Line type="monotone" dataKey="rate" stroke="#0f1f38" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-4 font-display text-base font-semibold text-navy-900">Departman Performansı</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-900/5 text-xs uppercase tracking-wide text-navy-400">
                <th className="px-3 py-2.5 font-semibold">Departman</th>
                <th className="px-3 py-2.5 font-semibold">Personel</th>
                <th className="px-3 py-2.5 font-semibold">Bugün Tamamlanan</th>
                <th className="px-3 py-2.5 font-semibold">Aktif Görev</th>
                <th className="px-3 py-2.5 font-semibold">Ort. Çözüm</th>
                <th className="px-3 py-2.5 font-semibold">Ort. Puan</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((d) => (
                <tr key={d.department} className="border-b border-navy-900/5 last:border-0">
                  <td className="px-3 py-2.5 font-semibold text-navy-900">{DEPARTMENT_LABELS[d.department]}</td>
                  <td className="px-3 py-2.5 text-navy-600">{d.memberCount}</td>
                  <td className="px-3 py-2.5 text-navy-600">{d.completedToday}</td>
                  <td className="px-3 py-2.5 text-navy-600">{d.activeTasks}</td>
                  <td className="px-3 py-2.5 text-navy-600">{d.avgResolution > 0 ? `${d.avgResolution} dk` : '—'}</td>
                  <td className="px-3 py-2.5 text-navy-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-gold-600">
                      <Icon name="Star" className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                      {d.avgRating.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
