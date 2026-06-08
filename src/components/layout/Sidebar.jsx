import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, Tag, RefreshCw, Store, Palette,
  LogOut, ChevronRight, ShoppingBag, Settings
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

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="w-56 min-h-screen bg-gray-900 flex flex-col text-white">
      <div className="px-4 py-4 border-b border-gray-700 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-red-400" />
        <span className="text-sm font-bold text-white">ADMIN DASHBOARD</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'section') return (
            <p key={i} className="text-xs text-gray-500 uppercase tracking-wider px-3 pt-4 pb-1 font-medium">{item.label}</p>
          );
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to}
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
          <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-white text-sm font-bold">
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
