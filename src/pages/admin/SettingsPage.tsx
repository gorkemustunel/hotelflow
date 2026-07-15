import { useEffect, useState } from 'react';
import { Icon } from '@/components/common/Icon';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { FieldLabel, TextArea, TextInput, Toggle } from '@/components/common/FormField';
import { Segmented } from '@/components/common/Segmented';
import { useOperations } from '@/context/OperationsContext';
import { useToast } from '@/context/ToastContext';

export function SettingsPage() {
  const { hotelInfo, updateHotelInfo } = useOperations();
  const [info, setInfo] = useState(hotelInfo);
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [notifSound, setNotifSound] = useState(true);
  const [notifUrgentOnly, setNotifUrgentOnly] = useState(false);
  const { showToast } = useToast();

  // Keep the draft in sync if hotelInfo changes elsewhere (e.g. another
  // admin editing it concurrently, reflected via Supabase Realtime).
  useEffect(() => setInfo(hotelInfo), [hotelInfo]);

  const set = <K extends keyof typeof info>(key: K, value: (typeof info)[K]) => setInfo((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateHotelInfo(info);
    showToast('Otel ayarları kaydedildi.', 'success');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Otel Ayarları</h1>
          <p className="mt-1 text-sm text-navy-500">Misafir uygulamasında görünen genel bilgileri düzenleyin</p>
        </div>
        <Button icon={<Icon name="Save" className="h-4 w-4" />} onClick={handleSave}>Kaydet</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h3 className="font-display text-base font-semibold text-navy-900">Genel Bilgiler</h3>
          <div>
            <FieldLabel>Otel Adı</FieldLabel>
            <TextInput value={info.hotelName} onChange={(e) => set('hotelName', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Slogan</FieldLabel>
            <TextInput value={info.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Adres</FieldLabel>
            <TextInput value={info.address} onChange={(e) => set('address', e.target.value)} />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h3 className="font-display text-base font-semibold text-navy-900">Wi-Fi</h3>
          <div>
            <FieldLabel>Ağ Adı</FieldLabel>
            <TextInput value={info.wifiName} onChange={(e) => set('wifiName', e.target.value)} />
          </div>
          <div>
            <FieldLabel>Şifre</FieldLabel>
            <TextInput value={info.wifiPassword} onChange={(e) => set('wifiPassword', e.target.value)} />
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h3 className="font-display text-base font-semibold text-navy-900">Tesis Saatleri</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Kahvaltı</FieldLabel>
              <TextInput value={info.breakfastHours} onChange={(e) => set('breakfastHours', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Havuz</FieldLabel>
              <TextInput value={info.poolHours} onChange={(e) => set('poolHours', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Spa</FieldLabel>
              <TextInput value={info.spaHours} onChange={(e) => set('spaHours', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Restoran</FieldLabel>
              <TextInput value={info.restaurantHours} onChange={(e) => set('restaurantHours', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Check-in</FieldLabel>
              <TextInput value={info.checkInTime} onChange={(e) => set('checkInTime', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Check-out</FieldLabel>
              <TextInput value={info.checkOutTime} onChange={(e) => set('checkOutTime', e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <h3 className="font-display text-base font-semibold text-navy-900">Otel Kuralları</h3>
          <TextArea rows={6} value={info.hotelRules.join('\n')} onChange={(e) => set('hotelRules', e.target.value.split('\n'))} />
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Icon name="Languages" className="h-5 w-5 text-gold-500" />
            <h3 className="font-display text-base font-semibold text-navy-900">Dil Ayarları</h3>
          </div>
          <p className="text-xs text-navy-500">Misafir uygulaması çok dilli yapıya hazırdır. Varsayılan dili seçin.</p>
          <Segmented
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'tr', label: 'Türkçe' },
              { value: 'en', label: 'English' },
            ]}
          />
        </Card>

        <Card className="space-y-3 p-5">
          <h3 className="font-display text-base font-semibold text-navy-900">Bildirim Tercihleri</h3>
          <Toggle checked={notifSound} onChange={setNotifSound} label="Bildirim sesi" description="Yeni talep geldiğinde ses çal" />
          <Toggle checked={notifUrgentOnly} onChange={setNotifUrgentOnly} label="Sadece acil talepler" description="Push bildirimlerini acil taleplerle sınırla" />
        </Card>
      </div>
    </div>
  );
}
