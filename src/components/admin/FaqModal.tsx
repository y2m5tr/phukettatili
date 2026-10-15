/**
 * SSS (FAQ) ekleme/düzenleme modalı — AdminDashboard'tan ayrıldı.
 * Form state'i parent'ta kalır (handleSubmitFaq zinciri orada);
 * davranış birebir aynıdır.
 */
interface FaqModalProps {
  editingFaq: { id: string } | null;
  faqFormData: Record<string, unknown>;
  setFaqFormData: (next: Record<string, unknown>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function FaqModal({
  editingFaq,
  faqFormData,
  setFaqFormData,
  onSubmit,
  onClose,
}: FaqModalProps) {
  const fd = faqFormData as { question?: string; answer?: string };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold font-serif mb-4">
          {editingFaq ? 'Soruyu Düzenle' : 'Yeni SSS Sorusu'}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Soru *</label>
            <input
              type="text"
              required
              value={fd.question || ''}
              onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Cevap *</label>
            <textarea
              rows={4}
              required
              value={fd.answer || ''}
              onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
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
