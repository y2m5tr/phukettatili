/**
 * Müşteri Yorumu ekleme/düzenleme modalı — AdminDashboard'tan ayrıldı.
 *
 * Form state'i bilinçli olarak PARENT'ta kalır (testiFormData +
 * handleSubmitTesti): saveTestimonials zinciri bulut senkronu ve
 * toast akışı orada. Buraya yalnızca JSX + props geçer.
 * Davranış birebir aynıdır (FleetManager deseni).
 */
interface TestimonialModalProps {
  editingTesti: { id: string; name: string } | null;
  testiFormData: Record<string, unknown>;
  setTestiFormData: (next: Record<string, unknown>) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onClose: () => void;
}

export default function TestimonialModal({
  editingTesti,
  testiFormData,
  setTestiFormData,
  onSubmit,
  onClose,
}: TestimonialModalProps) {
  const fd = testiFormData as {
    name?: string;
    type?: string;
    tour?: string;
    stars?: number;
    text?: string;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold font-serif mb-4">
          {editingTesti ? 'Yorumu Düzenle' : 'Yeni Müşteri Yorumu'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">İsim *</label>
              <input
                type="text"
                required
                value={fd.name || ''}
                onChange={(e) => setTestiFormData({ ...testiFormData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Tip (Çift / Aile...)</label>
              <input
                type="text"
                value={fd.type || ''}
                onChange={(e) => setTestiFormData({ ...testiFormData, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Hangi Tur</label>
              <input
                type="text"
                value={fd.tour || ''}
                onChange={(e) => setTestiFormData({ ...testiFormData, tour: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Puan (1-5)</label>
              <select
                value={fd.stars || 5}
                onChange={(e) => setTestiFormData({ ...testiFormData, stars: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} Yıldız</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Yorum Metni *</label>
            <textarea
              rows={4}
              required
              value={fd.text || ''}
              onChange={(e) => setTestiFormData({ ...testiFormData, text: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
