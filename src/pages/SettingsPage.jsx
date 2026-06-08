import { useState, useEffect } from 'react';
import axios from 'axios';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Loader2, CheckCircle, Plus, Trash2, ToggleLeft, ToggleRight, Shield, Key, Users } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
      <Icon className="w-4 h-4 text-red-700" />
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  // Change Password state
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState(null);

  // User Management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [addingUser, setAddingUser] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) fetchUsers();
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      const r = await axios.get(`${API}/api/users`);
      setUsers(r.data.data || []);
    } catch {} finally { setUsersLoading(false); }
  };

  const handlePassChange = (e) => setPassForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm_password) {
      setPassMsg({ type: 'error', text: 'Password baru tidak cocok' }); return;
    }
    setPassSaving(true);
    setPassMsg(null);
    try {
      await axios.put(`${API}/api/auth/change-password`, {
        current_password: passForm.current_password,
        new_password: passForm.new_password,
      });
      setPassMsg({ type: 'success', text: 'Password berhasil diubah' });
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (e) {
      setPassMsg({ type: 'error', text: e.response?.data?.message || 'Gagal mengubah password' });
    } finally { setPassSaving(false); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      await axios.post(`${API}/api/users`, newUser);
      setNewUser({ name: '', email: '', password: '', role: 'admin' });
      setShowAddForm(false);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menambah user');
    } finally { setAddingUser(false); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Hapus user "${name}"?`)) return;
    try {
      await axios.delete(`${API}/api/users/${id}`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal menghapus user');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await axios.put(`${API}/api/users/${id}/toggle`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal mengubah status');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PageHeader title="Settings — Adil Komputer" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Info User */}
        <div className="bg-red-800 rounded-xl p-5 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-red-200">{user?.email}</p>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1 inline-block capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Change Password */}
        <Section title="Ganti Password" icon={Key}>
          <form onSubmit={handleChangePassword} className="space-y-3">
            {passMsg && (
              <div className={`text-sm px-3 py-2 rounded-lg ${passMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {passMsg.text}
              </div>
            )}
            {[
              { label: 'Password Lama', name: 'current_password' },
              { label: 'Password Baru', name: 'new_password' },
              { label: 'Konfirmasi Password Baru', name: 'confirm_password' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                <input type="password" name={f.name} value={passForm[f.name]} onChange={handlePassChange} required minLength={f.name !== 'current_password' ? 8 : 1}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="••••••••" />
              </div>
            ))}
            <button type="submit" disabled={passSaving}
              className="flex items-center gap-2 px-5 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
              {passSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {passSaving ? 'Menyimpan...' : 'Ganti Password'}
            </button>
          </form>
        </Section>

        {/* User Management - superadmin only */}
        {isSuperAdmin && (
          <Section title="Manajemen User" icon={Users}>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">{users.length} user terdaftar</p>
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Tambah User
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddUser} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700">User Baru</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nama', name: 'name', type: 'text' },
                    { label: 'Email', name: 'email', type: 'email' },
                    { label: 'Password', name: 'password', type: 'password' },
                  ].map(f => (
                    <div key={f.name} className={f.name === 'name' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                      <input type={f.type} value={newUser[f.name]} onChange={e => setNewUser(prev => ({ ...prev, [f.name]: e.target.value }))} required
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                    <select value={newUser.role} onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200">
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={addingUser}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-700 text-white text-xs rounded-lg hover:bg-red-600 disabled:opacity-50">
                    {addingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Tambah
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Batal
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-gray-100">
              {usersLoading ? (
                <div className="py-6 text-center"><div className="w-5 h-5 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
              ) : users.map(u => (
                <div key={u.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${u.is_active ? 'bg-red-700' : 'bg-gray-400'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">{u.name}</p>
                        {u.role === 'superadmin' && <Shield className="w-3.5 h-3.5 text-red-600" />}
                        {!u.is_active && <span className="text-xs text-gray-400">(nonaktif)</span>}
                      </div>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  {u.id !== user?.id && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleUser(u.id)} title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        className="text-gray-400 hover:text-gray-600 transition-colors">
                        {u.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleDeleteUser(u.id, u.name)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {u.id === user?.id && <span className="text-xs text-gray-400 italic">Akun kamu</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {!isSuperAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Manajemen user hanya bisa diakses oleh Superadmin.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
