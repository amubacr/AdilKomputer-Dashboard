#!/bin/bash

cat > /opt/adil-dashboard/src/pages/SyncPage.jsx << 'JSEOF'
import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '@/components/layout/PageHeader';
import { RefreshCw, CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const formatDuration = (ms) => {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', { 
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

export default function SyncPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ running: false });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connected, setConnected] = useState(true);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes, statusRes] = await Promise.all([
        axios.get(`${API}/api/sync/log?limit=20`),
        axios.get(`${API}/api/stats`),
        axios.get(`${API}/api/sync/status`),
      ]);
      setLogs(logsRes.data.data || []);
      setStats(statsRes.data.data);
      setSyncStatus(statusRes.data);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post(`${API}/api/sync/trigger`);
      setTimeout(fetchData, 5000);
      setTimeout(fetchData, 30000);
      setTimeout(fetchData, 60000);
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal trigger sync');
    } finally {
      setTimeout(() => setSyncing(false), 5000);
    }
  };

  const lastLog = logs[0];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Kledo Sync — Adil Komputer" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Status Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Kledo Synchronize</h2>
            <button
              onClick={handleSync}
              disabled={syncing || syncStatus.running}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${(syncing || syncStatus.running) ? 'animate-spin' : ''}`} />
              {syncStatus.running ? 'Sync Berjalan...' : syncing ? 'Memulai...' : 'Full Sync Sekarang'}
            </button>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-xl border ${connected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {connected ? <Wifi className="w-5 h-5 text-green-600" /> : <WifiOff className="w-5 h-5 text-red-600" />}
            <div>
              <p className={`text-sm font-semibold ${connected ? 'text-green-700' : 'text-red-700'}`}>
                {connected ? 'Kledo API Connected' : 'Koneksi Terputus'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {connected 
                  ? `Full Sync setiap 6 jam · Last sync: ${formatDate(stats?.last_sync)}`
                  : 'Tidak dapat terhubung ke API'
                }
              </p>
            </div>
          </div>

          {lastLog && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Produk Diperbarui</p>
                <p className="text-xl font-bold text-gray-800">{lastLog.items_updated}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Gambar Diperbarui</p>
                <p className="text-xl font-bold text-gray-800">{lastLog.images_updated || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Durasi Sync</p>
                <p className="text-xl font-bold text-gray-800">{formatDuration(lastLog.duration_ms)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Status Terakhir</p>
                <p className={`text-sm font-semibold mt-1 ${lastLog.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {lastLog.status === 'success' ? '✓ Success' : '✗ Failed'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sync Log Table */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Synchronize Log</h2>
            <span className="text-xs text-gray-400">{logs.length} entri terakhir</span>
          </div>

          {loading ? (
            <div className="p-8 text-center"><div className="w-6 h-6 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Belum ada log sync</p>
              <p className="text-xs text-gray-300 mt-1">Klik "Full Sync Sekarang" untuk memulai</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Waktu</th>
                    <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Tipe</th>
                    <th className="text-left px-3 py-3 text-xs text-gray-500 font-medium">Deskripsi</th>
                    <th className="text-right px-3 py-3 text-xs text-gray-500 font-medium">Item</th>
                    <th className="text-right px-3 py-3 text-xs text-gray-500 font-medium">Durasi</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.created_at)}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium capitalize">{log.type}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 max-w-[300px] truncate">{log.description}</td>
                      <td className="px-3 py-3 text-xs text-right text-gray-600">{log.items_updated}</td>
                      <td className="px-3 py-3 text-xs text-right text-gray-600">{formatDuration(log.duration_ms)}</td>
                      <td className="px-5 py-3 text-right">
                        {log.status === 'success'
                          ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Success</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Failed</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
JSEOF

echo "✅ SyncPage.jsx selesai"
