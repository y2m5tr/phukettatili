import { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';

interface EmailPermissionBoxProps {
  /** Kayıt sonrası ilgi etiketi ('honeymoon' | 'family' | 'adventure' | 'vip_luxury'). */
  interest: string;
  /** Quiz / plan özeti — bulutta abonelik kaydına eklenir. */
  planSummary: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * İzin pazarlama kutusu: quiz sonucunu e-postaya göndererek abonelik
 * tohumlar. Ayda iki mektup sözü — spam yok (Handley disiplini).
 */
export default function EmailPermissionBox({ interest, planSummary }: EmailPermissionBoxProps) {
  const [emailInput, setEmailInput] = useState('');
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setEmailError('Lütfen geçerli bir e-posta adresi girin.');
      setEmailState('error');
      return;
    }
    setEmailState('sending');
    setEmailError('');
    try {
      const res = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'quiz', interest, planSummary }),
      });
      const data = (await res.json()) as { subscribed?: boolean; error?: string };
      if (!res.ok || !data.subscribed) {
        throw new Error(data.error || 'Kayıt başarısız.');
      }
      // GA4 / Meta lead eventi (Tracking.astro'daki katmanla uyumlu)
      window.gtag?.('event', 'generate_lead', { source: 'newsletter_quiz', interest });
      window.fbq?.('track', 'Lead', { source: 'newsletter_quiz', interest });
      setEmailState('done');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Bir sorun oluştu, tekrar deneyin.');
      setEmailState('error');
    }
  };

  return (
    <div className="mt-5 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
      {emailState === 'done' ? (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Harika! Phuket planınız ve ayda iki kez gerçek mektuplar gelicek — spam yok, söz.</span>
        </div>
      ) : (
        <>
          <label htmlFor="wizard-email" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Mail className="w-3.5 h-3.5 text-brand-accent" />
            <span>Phuket planınızı e-postanıza gönderelim</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="wizard-email"
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailState('idle');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder="ornek@eposta.com"
              disabled={emailState === 'sending'}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
            />
            <button
              type="button"
              disabled={emailState === 'sending'}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {emailState === 'sending' ? 'Gönderiliyor...' : 'Planı Gönder'}
            </button>
          </div>
          {emailState === 'error' && <p className="text-xs text-red-500 font-medium">{emailError}</p>}
          <p className="text-[11px] text-slate-400">
            Ayda en fazla iki e-posta; tatil planı, mevsim ipuçları ve gerçek misafir hikâyeleri. İstediğinizde tek tıkla çıkabilirsiniz.
          </p>
        </>
      )}
    </div>
  );
}
