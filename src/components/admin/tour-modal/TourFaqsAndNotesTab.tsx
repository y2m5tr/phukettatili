import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { TourItem } from '../../../data/adminTypes';

interface TourFaqsTabProps {
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
}

export const TourFaqsTab: React.FC<TourFaqsTabProps> = ({ tourFormData, setTourFormData }) => {
  const [tempFaqQ, setTempFaqQ] = useState('');
  const [tempFaqA, setTempFaqA] = useState('');

  const faqList = tourFormData.faq || [];

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
          Tura Özel Sıkça Sorulan Sorular ({faqList.length})
        </span>
        <p className="text-xs text-slate-400 mb-3">
          Misafirlerin bu tur sayfasına özel göreceği sorular ve cevapları.
        </p>
      </div>

      <div className="space-y-3">
        {faqList.map((faqItem, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 relative group"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                S: {faqItem.q}
              </span>
              <button
                type="button"
                onClick={() =>
                  setTourFormData({
                    ...tourFormData,
                    faq: faqList.filter((_, i) => i !== idx),
                  })
                }
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              C: {faqItem.a}
            </p>
          </div>
        ))}
      </div>

      {/* Add FAQ */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
        <span className="text-xs font-bold uppercase text-brand-primary dark:text-brand-accent block">
          + Yeni Soru & Cevap Ekle
        </span>
        <input
          type="text"
          placeholder="Soru: Örn: Turda vejetaryen yemek var mı?"
          value={tempFaqQ}
          onChange={(e) => setTempFaqQ(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
        />
        <textarea
          rows={2}
          placeholder="Cevap: Örn: Evet, rezervasyon sırasında belirtirseniz vejetaryen menü hazırlanmaktadır."
          value={tempFaqA}
          onChange={(e) => setTempFaqA(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            if (tempFaqQ.trim() && tempFaqA.trim()) {
              setTourFormData({
                ...tourFormData,
                faq: [...faqList, { q: tempFaqQ.trim(), a: tempFaqA.trim() }],
              });
              setTempFaqQ('');
              setTempFaqA('');
            }
          }}
          className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold"
        >
          Soruyu Ekle
        </button>
      </div>
    </div>
  );
};

interface TourNotesTabProps {
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
}

export const TourNotesTab: React.FC<TourNotesTabProps> = ({ tourFormData, setTourFormData }) => {
  const [tempRestrictionItem, setTempRestrictionItem] = useState('');
  const restrictionsList = tourFormData.restrictions || [];

  return (
    <div className="space-y-5">
      {/* Restrictions */}
      <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-3">
        <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 block">
          ⚠️ Katılım Kısıtlamaları & Sağlık Uyarıları ({restrictionsList.length})
        </span>

        <div className="space-y-1.5">
          {restrictionsList.map((res, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 text-xs"
            >
              <span className="text-slate-800 dark:text-slate-200">{res}</span>
              <button
                type="button"
                onClick={() =>
                  setTourFormData({
                    ...tourFormData,
                    restrictions: restrictionsList.filter((_, i) => i !== idx),
                  })
                }
                className="text-slate-400 hover:text-red-500 p-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            value={tempRestrictionItem}
            onChange={(e) => setTempRestrictionItem(e.target.value)}
            placeholder="Örn: Hamile misafirler ve 1 yaş altı bebekler için uygun değildir"
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (tempRestrictionItem.trim()) {
                setTourFormData({
                  ...tourFormData,
                  restrictions: [...restrictionsList, tempRestrictionItem.trim()],
                });
                setTempRestrictionItem('');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0"
          >
            + Ekle
          </button>
        </div>
      </div>

      {/* Body Text */}
      <div>
        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
          Tur Detay Yazısı (Açıklama / Markdown)
        </label>
        <textarea
          rows={6}
          value={tourFormData.body || ''}
          onChange={(e) => setTourFormData({ ...tourFormData, body: e.target.value })}
          placeholder="Tur hakkında ayrıntılı açıklama yazısı..."
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
        />
      </div>
    </div>
  );
};
