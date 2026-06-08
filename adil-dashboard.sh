#!/bin/bash
cd /opt/adil-dashboard

# 1. Update DashboardLayout - tambah mobile sidebar state
cat > src/components/layout/DashboardLayout.jsx << 'JSEOF'
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out lg:static lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-red-800 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="text-sm font-bold">Admin Dashboard</span>
        </div>
        {children}
      </div>
    </div>
  );
}
JSEOF

echo "✅ DashboardLayout.jsx updated"

# 2. Update Sidebar - tambah close button di mobile
cat > src/components/layout/Sidebar.jsx << 'JSEOF'
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, Tag, RefreshCw, Store, Palette,
  LogOut, ShoppingBag, Settings, X
} from 'lucide-react';

const navItems = [
  { label: 'HOME', type: 'section' },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Product', to: '/products', icon: Package },
  { label: 'Category', to: '/categories', icon: Tag },
  { label: 'SYNCHRONIZATION', type: 'section' },
  { label: 'Kledo Sync', to: '/sync', icon: RefreshCw },
  { label: 'CONFIGURATION', type: 'section' },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Store & Whatsapp', to: '/config/store', icon: Store },
  { label: 'Branding', to: '/config/branding', icon: Palette },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="w-56 min-h-screen bg-gray-900 flex flex-col text-white">
      <div className="px-4 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-red-400" />
          <span className="text-sm font-bold text-white">ADMIN DASHBOARD</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'section') return (
            <p key={i} className="text-xs text-gray-500 uppercase tracking-wider px-3 pt-4 pb-1 font-medium">{item.label}</p>
          );
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-red-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors w-full">
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </div>
  );
}
JSEOF

echo "✅ Sidebar.jsx updated"

# 3. Update PageHeader - hide di mobile (sudah ada mobile header di Layout)
cat > src/components/layout/PageHeader.jsx << 'JSEOF'
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, onAdd, addLabel = 'Produk Baru' }) {
  const now = new Date();
  const timeStr = format(now, 'HH.mm', { locale: id });
  const dateStr = format(now, 'EEE, dd MMM yyyy', { locale: id });

  return (
    <div className="bg-red-800 text-white px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
      <h1 className="text-sm font-semibold truncate">{title}</h1>
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <span className="hidden sm:block text-xs text-red-200">live {timeStr} | {dateStr}</span>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{addLabel}</span>
            <span className="sm:hidden">+</span>
          </button>
        )}
      </div>
    </div>
  );
}
JSEOF

echo "✅ PageHeader.jsx updated"

npm run build && systemctl restart adil-dashboard && echo "✅ Build selesai"
