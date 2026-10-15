/**
 * Blog / Rehber Yazısı ekleme/düzenleme modalı — AdminDashboard'tan ayrıldı.
 * Form state'i parent'ta kalır (handleSubmitBlog zinciri orada).
 */
import { Upload } from 'lucide-react';

interface BlogModalProps {
  editingBlog: { id: string } | null;
  blogFormData: Record<string, unknown>;
  setBlogFormData: (next: Record<string, unknown>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  /** Görsel URL çözümleyici ve Base64 yükleme — AdminDashboard'tan geçer. */
  getImageUrl: (img?: string) => string;
  handleFileUpload: (file: File, cb: (url: string) => void) => void;
  /** Select'te sunulacak görsel seçenekleri (sistem + yüklenen). */
  allImageOptions: string[];
}

export default function BlogModal({
  editingBlog,
  blogFormData,
  setBlogFormData,
  onSubmit,
  onClose,
  getImageUrl,
  handleFileUpload,
  allImageOptions,
}: BlogModalProps) {
  const fd = blogFormData as {
    title?: string;
    excerpt?: string;
    author?: string;
    date?: string;
    cover_image?: string;
    featured?: boolean;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold font-serif mb-4">
          {editingBlog ? 'Yazıyı Düzenle' : 'Yeni Blog / Rehber Yazısı'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Yazı Başlığı *</label>
            <input
              type="text"
              required
              value={fd.title || ''}
              onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Kısa Özet *</label>
            <textarea
              rows={3}
              required
              value={fd.excerpt || ''}
              onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Yazar</label>
              <input
                type="text"
                value={fd.author || ''}
                onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Tarih</label>
              <input
                type="date"
                value={fd.date || ''}
                onChange={(e) => setBlogFormData({ ...blogFormData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Kapak Görseli
              </label>
              <label className="cursor-pointer px-3 py-1 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Görsel Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, (url) => {
                        setBlogFormData({ ...blogFormData, cover_image: url });
                      });
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={fd.cover_image || 'pileh.webp'}
                onChange={(e) => setBlogFormData({ ...blogFormData, cover_image: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              >
                {allImageOptions.map((img) => (
                  <option key={img} value={img}>
                    {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="veya direkt görsel URL'si girin..."
                value={fd.cover_image || ''}
                onChange={(e) => setBlogFormData({ ...blogFormData, cover_image: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />
            </div>

            {fd.cover_image && (
              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src={getImageUrl(fd.cover_image)}
                  alt="Blog Kapak"
                  className="w-16 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/pileh.webp';
                  }}
                />
                <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
                  {fd.cover_image}
                </span>
              </div>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fd.featured || false}
                onChange={(e) => setBlogFormData({ ...blogFormData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-accent"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Öne çıkarılan yazı yap ⭐
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
