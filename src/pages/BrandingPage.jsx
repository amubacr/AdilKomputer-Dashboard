import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '@/components/layout/PageHeader';
import { Save, Loader2, CheckCircle, Eye } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const Field = ({ label, name, value, onChange, type = 'text', placeholder = '', hint = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {type === 'toggle' ? (
      <button type="button" onClick={() => onChange({ target: { name, value: value === 'true' ? 'false' : 'true' } })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value === 'true' ? 'bg-red-700' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    ) : type === 'select' ? null : (
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

const ImagePreview = ({ url, label }) => (
  url ? (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
      <img src={url} alt={label} className="h-10 object-contain" onError={e => e.target.style.display='none'} />
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
        <Eye className="w-3 h-3" /> Preview
      </a>
    </div>
  ) : null
);

export default function BrandingPage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/config`).then(r => setConfig(r.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const keys = ['brand_logo_main', 'brand_logo_footer', 'brand_favicon', 'brand_tagline',
        'brand_watermark_enabled', 'brand_watermark_url', 'brand_watermark_position', 'brand_watermark_opacity'];
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
      <PageHeader title="Branding — Adil Komputer" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </div>

        <Section title="Logo & Identitas">
          <Field label="Tagline" name="brand_tagline" value={config.brand_tagline || ''} onChange={handleChange}
            placeholder="Urusan PC, Beresnya di Wak Adi" />
          <div>
            <Field label="Logo Utama (URL)" name="brand_logo_main" value={config.brand_logo_main || ''} onChange={handleChange}
              placeholder="https://..." hint="Logo yang muncul di navbar katalog" />
            <ImagePreview url={config.brand_logo_main} label="Logo Utama" />
          </div>
          <div>
            <Field label="Logo Footer (URL)" name="brand_logo_footer" value={config.brand_logo_footer || ''} onChange={handleChange}
              placeholder="https://..." hint="Logo yang muncul di footer, kosongkan untuk pakai logo utama" />
            <ImagePreview url={config.brand_logo_footer} label="Logo Footer" />
          </div>
          <div>
            <Field label="Favicon (URL)" name="brand_favicon" value={config.brand_favicon || ''} onChange={handleChange}
              placeholder="https://..." hint="Ikon yang muncul di tab browser (format .svg atau .ico)" />
            <ImagePreview url={config.brand_favicon} label="Favicon" />
          </div>
        </Section>

        <Section title="Watermark Gambar Produk">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Aktifkan Watermark</p>
              <p className="text-xs text-gray-400">Tambahkan watermark Wak Adi di setiap gambar produk</p>
            </div>
            <Field label="" name="brand_watermark_enabled" value={config.brand_watermark_enabled || 'false'} onChange={handleChange} type="toggle" />
          </div>

          {config.brand_watermark_enabled === 'true' && (
            <>
              <div>
                <Field label="URL Gambar Watermark" name="brand_watermark_url" value={config.brand_watermark_url || ''} onChange={handleChange}
                  placeholder="https://..." hint="URL gambar PNG transparan (rekomendasi: Wak Adi logo)" />
                <ImagePreview url={config.brand_watermark_url} label="Watermark" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Posisi Watermark</label>
                <select name="brand_watermark_position" value={config.brand_watermark_position || 'bottom-right'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200">
                  <option value="bottom-right">Bawah Kanan</option>
                  <option value="bottom-left">Bawah Kiri</option>
                  <option value="top-right">Atas Kanan</option>
                  <option value="top-left">Atas Kiri</option>
                  <option value="center">Tengah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Opacity: {Math.round((parseFloat(config.brand_watermark_opacity) || 0.7) * 100)}%
                </label>
                <input type="range" name="brand_watermark_opacity" min="0.1" max="1" step="0.1"
                  value={config.brand_watermark_opacity || '0.7'} onChange={handleChange}
                  className="w-full accent-red-700" />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 Watermark diterapkan sebagai overlay CSS di katalog — tidak mengubah file gambar asli dari Kledo.
                  Untuk watermark permanen pada file gambar, gunakan fitur export di roadmap berikutnya.
                </p>
              </div>
            </>
          )}
        </Section>

      </div>
    </div>
  );
}
