/**
 * Ekip Üyeleri sekmesi — üyelik sistemi yönetimi (YALNIZCA owner'a görünür).
 *
 * Bu sekme AdminDashboard'a yalnızca oturum rolü 'owner' olduğunda
 * eklenir (render tarafında filtre). API (/api/auth/users) tarafında da
 * owner-only guard çalışır — UI gizlemesi kozmetik, gerçek sınır API'de.
 *
 * İşlemler: kullanıcı listesi, yeni üye ekleme, rol değiştirme,
 * aktif/pasif切换, şifre sıfırlama, silme.
 */
import { useCallback, useEffect, useState } from 'react';
import { Plus, Shield, ShieldOff, KeyRound, Trash2, Users, UserCog } from 'lucide-react';

export interface OpsUser {
  id: string;
  username: string;
  full_name: string;
  role: 'owner' | 'manager' | 'guide' | 'driver';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

const ROLE_LABELS: Record<OpsUser['role'], string> = {
  owner: '👑 Yönetici',
  manager: '🧭 Müdür',
  guide: '🗣️ Rehber',
  driver: '🚐 Şoför',
};

const ROLE_DESCRIPTIONS: Record<OpsUser['role'], string> = {
  owner: 'Her şey: kullanıcı yönetimi, silme, ayarlar, tüm sekmeler',
  manager: 'Admin paneli ve CMS yazma; kullanıcı yönetimi ve kalıcı silme yok',
  guide: 'Saha paneli (tam): manifest, tahsilat, hızlı satış',
  driver: 'Saha paneli (sade): günün transfer listesi',
};

type FormMode = 'closed' | 'create' | 'edit' | 'reset-password';

interface NewUserForm {
  username: string;
  fullName: string;
  password: string;
  role: OpsUser['role'];
}

interface UsersTabProps {
  showToast: (msg: string) => void;
}

export default function UsersTab({ showToast }: UsersTabProps) {
  const [users, setUsers] = useState<OpsUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>('closed');
  const [editingUser, setEditingUser] = useState<OpsUser | null>(null);
  const [form, setForm] = useState<NewUserForm>({ username: '', fullName: '', password: '', role: 'guide' });
  const [resetPassword, setResetPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (!res.ok) {
        showToast('⚠️ Kullanıcı listesi alınamadı.');
        return;
      }
      const data = (await res.json()) as { users?: OpsUser[] };
      setUsers(data.users ?? []);
    } catch {
      showToast('⚠️ Kullanıcı listesi alınamadı (ağ).');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setForm({ username: '', fullName: '', password: '', role: 'guide' });
    setEditingUser(null);
    setMode('create');
  };

  const openEdit = (u: OpsUser) => {
    setEditingUser(u);
    setMode('edit');
  };

  const openResetPassword = (u: OpsUser) => {
    setEditingUser(u);
    setResetPassword('');
    setMode('reset-password');
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, fullName: form.fullName, password: form.password, role: form.role }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Kullanıcı oluşturulamadı.'}`);
        return;
      }
      showToast('✅ Yeni üye oluşturuldu.');
      setMode('closed');
      void load();
    } catch {
      showToast('⚠️ Ağ hatası — üye oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, role: form.role }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Rol güncellenemedi.'}`);
        return;
      }
      showToast('✅ Rol güncellendi.');
      setMode('closed');
      void load();
    } catch {
      showToast('⚠️ Ağ hatası — rol güncellenemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, newPassword: resetPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Şifre sıfırlanamadı.'}`);
        return;
      }
      showToast('✅ Şifre sıfırlandı.');
      setMode('closed');
    } catch {
      showToast('⚠️ Ağ hatası — şifre sıfırlanamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (u: OpsUser) => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, isActive: !u.is_active }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Güncellenemedi.'}`);
        return;
      }
      showToast(u.is_active ? 'Üye pasifleştirildi.' : 'Üye aktifleştirildi.');
      void load();
    } catch {
      showToast('⚠️ Ağ hatası.');
    }
  };

  const deleteUser = async (u: OpsUser) => {
    if (!window.confirm(`"${u.full_name}" (${u.username}) kalıcı olarak silinsin mi?`)) return;
    try {
      const res = await fetch(`/api/auth/users?id=${encodeURIComponent(u.id)}`, { method: 'DELETE' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Silinemedi.'}`);
        return;
      }
      showToast('✅ Üye silindi.');
      void load();
    } catch {
      showToast('⚠️ Ağ hatası.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-accent" />
            Ekip Üyeleri ({users.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Yönetici, müdür, rehber ve şoför hesapları. Rol, üyenin giriş sonrası görebildiği paneli belirler.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Üye Ekle</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-surface-2 p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 text-sm">
          Yükleniyor…
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className={`bg-white dark:bg-surface-2 p-5 rounded-2xl border ${
                u.is_active
                  ? 'border-slate-200/80 dark:border-slate-800'
                  : 'border-slate-200/80 dark:border-slate-800 opacity-60'
              } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{u.full_name}</span>
                  <span className="font-mono text-[11px] text-slate-400">@{u.username}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                    {ROLE_LABELS[u.role]}
                  </span>
                  {!u.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
                      Pasif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {ROLE_DESCRIPTIONS[u.role]}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {u.last_login_at
                    ? `Son giriş: ${new Date(u.last_login_at).toLocaleString('tr-TR')}`
                    : 'Hiç giriş yapmamış'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setForm({ ...form, role: u.role });
                    openEdit(u);
                  }}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                  title="Rolü Değiştir"
                >
                  <UserCog className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openResetPassword(u)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white transition-colors"
                  title="Şifre Sıfırla"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={() => void toggleActive(u)}
                  className={`p-2 rounded-xl transition-colors ${
                    u.is_active
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                  }`}
                  title={u.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                >
                  {u.is_active ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => void deleteUser(u)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yeni üye modalı */}
      {mode === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold font-serif mb-4">Yeni Ekip Üyesi</h2>
            <form onSubmit={submitCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="ör: elif.kaya"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">3-32 karakter, küçük harf/rakam/._-</span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="ör: Elif Kaya"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Rol *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as OpsUser['role'] })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                >
                  {(Object.keys(ROLE_LABELS) as OpsUser['role'][]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">{ROLE_DESCRIPTIONS[form.role]}</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Geçici Şifre *</label>
                <input
                  type="text"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Üyeye ileteceğin şifre (en az 10 karakter, harf+rakam)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Üye ilk girişten sonra kendi şifresini değiştirebilir.
                </span>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setMode('closed')} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold disabled:opacity-50">
                  {isSubmitting ? 'Oluşturuluyor…' : 'Üyeyi Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rol değiştirme modalı */}
      {mode === 'edit' && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold font-serif mb-1">Rolü Değiştir</h2>
            <p className="text-xs text-slate-500 mb-4">{editingUser.full_name} (@{editingUser.username})</p>
            <form onSubmit={submitRoleChange} className="space-y-4">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as OpsUser['role'] })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              >
                {(Object.keys(ROLE_LABELS) as OpsUser['role'][]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">{ROLE_DESCRIPTIONS[form.role]}</p>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setMode('closed')} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold disabled:opacity-50">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Şifre sıfırlama modalı */}
      {mode === 'reset-password' && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold font-serif mb-1">Şifre Sıfırla</h2>
            <p className="text-xs text-slate-500 mb-4">{editingUser.full_name} (@{editingUser.username})</p>
            <form onSubmit={submitResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Yeni Şifre *</label>
                <input
                  type="text"
                  required
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="En az 10 karakter, harf + rakam"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setMode('closed')} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold disabled:opacity-50">
                  {isSubmitting ? 'Sıfırlanıyor…' : 'Şifreyi Sıfırla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
