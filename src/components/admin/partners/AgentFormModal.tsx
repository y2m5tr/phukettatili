import React, { useState } from 'react';
import { Building, Percent, X } from 'lucide-react';
import type { AgentCommissionType, PartnerAgent } from '../../../data/adminInitialData';

export interface AgentFormModalProps {
  editingAgent: PartnerAgent | null;
  onClose: () => void;
  onSave: (form: Partial<PartnerAgent>) => void;
}

// MODAL: YENİ / DÜZENLE PARTNER ACENTA (PartnersTab'ten birebir taşındı).
// Form durumu artık bu bileşende tutulur: modal her açılışta (koşullu
// render) yeniden monte olduğu için alanlar editingAgent'tan tazelenir —
// eski kabuk davranışıyla aynı (kabukta form her açılışta sıfırlanıyordu).
export default function AgentFormModal({ editingAgent, onClose, onSave }: AgentFormModalProps) {
  const [agentForm, setAgentForm] = useState<Partial<PartnerAgent>>(
    editingAgent
      ? { ...editingAgent }
      : { commissionType: 'percentage', commissionRate: 15, active: true }
  );

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onSave(agentForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAgent ? 'Acenta Bilgilerini Düzenle' : 'Yeni Partner Acenta / Satıcı Ekle'}
              </h3>
              <p className="text-xs text-slate-400">
                B2B alt acenta veya otel tur satış temsilcisi tanımlayın
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Acenta / Satıcı Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: İstanbul Tour Partner"
                value={agentForm.name || ''}
                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Acenta Kodu (Kısa) *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: IST-TRV"
                value={agentForm.code || ''}
                onChange={(e) => setAgentForm({ ...agentForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Şirket Resmi Unvanı (Varsa)
            </label>
            <input
              type="text"
              placeholder="Örn: İstanbul Seyahat ve Turizm A.Ş."
              value={agentForm.companyTitle || ''}
              onChange={(e) => setAgentForm({ ...agentForm, companyTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Yetkili / İletişim Kişisi *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Serkan Bey"
                value={agentForm.contactPerson || ''}
                onChange={(e) => setAgentForm({ ...agentForm, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp / Telefon *
              </label>
              <input
                type="text"
                required
                placeholder="+90 532 999 11 22"
                value={agentForm.phone || ''}
                onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Şehir / Bölge
              </label>
              <input
                type="text"
                placeholder="Örn: İstanbul / TR veya Patong"
                value={agentForm.cityOrZone || ''}
                onChange={(e) => setAgentForm({ ...agentForm, cityOrZone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                E-posta (Opsiyonel)
              </label>
              <input
                type="email"
                placeholder="b2b@acenta.com"
                value={agentForm.email || ''}
                onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Komisyon Modeli */}
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40 space-y-3">
            <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              Komisyon Hesaplama Modeli
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Komisyon Tipi
                </label>
                <select
                  value={agentForm.commissionType || 'percentage'}
                  onChange={(e) =>
                    setAgentForm({
                      ...agentForm,
                      commissionType: e.target.value as AgentCommissionType,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-xs focus:outline-none font-medium"
                >
                  <option value="percentage">Yüzde (%) Ciro Üzerinden</option>
                  <option value="fixed_per_pax">Sabit Tutar (THB / Kişi Başı)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Oran / Tutar
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder={agentForm.commissionType === 'percentage' ? '%15' : '300 THB'}
                  value={agentForm.commissionRate || ''}
                  onChange={(e) =>
                    setAgentForm({ ...agentForm, commissionRate: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="agentActiveCheck"
              checked={agentForm.active ?? true}
              onChange={(e) => setAgentForm({ ...agentForm, active: e.target.checked })}
              className="w-4 h-4 rounded text-brand-primary"
            />
            <label htmlFor="agentActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bu partner acenta şu an aktif (yeni rezervasyonlara atanabilir)
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-primary/90"
            >
              ✓ {editingAgent ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
