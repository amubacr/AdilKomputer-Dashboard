import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '@/components/layout/PageHeader';
import { Save, Loader2, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const Field = ({ label, name, value, onChange, type = 'text', placeholder = '', hint = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {type === 'textarea' ? (
      <textarea
        name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200 resize-none font-mono"
      />
    ) : type === 'toggle' ? (
      <button type="button" onClick={() => onChange({ target: { name, value: value === 'true' ? 'false' : 'true' } })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value === 'true' ? 'bg-red-700' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    ) : (
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200"
      />
    )}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
    <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">{title}</h2>
    {children}
  </div>
);

export default function StoreConfigPage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/config`).then(r => {
      setConfig(r.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const keys = [
        'store_name', 'store_wa_number', 'store_wa_order_template', 'store_wa_stock_template',
        'store_instagram', 'store_shopee', 'store_maps', 'store_address',
        'announcement_enabled', 'announcement_text', 'maintenance_mode'
      ];
      const payload = {};
      keys.forEach(k => { if (config[k] !== undefined) payload[k] = config[k]; });
      await axios.put(`${API}/api/config`, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Store & Whatsapp — Adil Komputer" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </div>

        <Section title="Informasi Toko">
          <Field label="Nama Toko" name="store_name" value={config.store_name || ''} onChange={handleChange} />
          <Field label="Alamat" name="store_address" value={config.store_address || ''} onChange={handleChange} />
        </Section>

        <Section title="WhatsApp">
          <Field label="Nomor WhatsApp" name="store_wa_number" value={config.store_wa_number || ''} onChange={handleChange}
            hint="Format: 628xxxxxxxxxx (tanpa +, tanpa spasi)" placeholder="628591069..." />
          <Field label="Template Pesan Order" name="store_wa_order_template" value={config.store_wa_order_template || ''} onChange={handleChange}
            type="textarea" hint="Gunakan {product_name} dan {price} sebagai placeholder" />
          <Field label="Template Tanya Stok" name="store_wa_stock_template" value={config.store_wa_stock_template || ''} onChange={handleChange}
            type="textarea" hint="Gunakan {product_name} sebagai placeholder" />
        </Section>

        <Section title="Media Sosial & Link">
          <Field label="Instagram" name="store_instagram" value={config.store_instagram || ''} onChange={handleChange} placeholder="https://instagram.com/..." />
          <Field label="Shopee" name="store_shopee" value={config.store_shopee || ''} onChange={handleChange} placeholder="https://shopee.co.id/..." />
          <Field label="Google Maps" name="store_maps" value={config.store_maps || ''} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." />
        </Section>

        <Section title="Pengumuman">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Aktifkan Pengumuman</p>
              <p className="text-xs text-gray-400">Tampilkan bar pengumuman di atas navbar katalog</p>
            </div>
            <Field label="" name="announcement_enabled" value={config.announcement_enabled || 'false'} onChange={handleChange} type="toggle" />
          </div>
          {config.announcement_enabled === 'true' && (
            <Field label="Teks Pengumuman" name="announcement_text" value={config.announcement_text || ''} onChange={handleChange}
              placeholder="Contoh: Promo Harbolnas! Diskon 10% untuk semua produk..." />
          )}
        </Section>

        <Section title="Maintenance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Mode Maintenance</p>
              <p className="text-xs text-gray-400">Tampilkan halaman under construction di katalog</p>
            </div>
            <Field label="" name="maintenance_mode" value={config.maintenance_mode || 'false'} onChange={handleChange} type="toggle" />
          </div>
          {config.maintenance_mode === 'true' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700 font-medium">⚠️ Katalog sedang dalam mode maintenance. Pengunjung akan melihat halaman under construction.</p>
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}
