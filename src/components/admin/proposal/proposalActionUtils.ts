import {
  generateCuratedProposalWhatsAppMessage,
  type CuratedProposalData,
  type ProposalFinancials,
} from '../../../lib/curatedProposal';

export function formatSendPhone(raw: string): string {
  let clean = raw.replace(/\D/g, '');
  if (!clean) return '';
  if (clean.startsWith('05')) clean = '90' + clean.slice(1);
  else if (clean.startsWith('5') && clean.length === 10) clean = '90' + clean;
  else if (clean.startsWith('08') || clean.startsWith('09') || clean.startsWith('06')) clean = '66' + clean.slice(1);
  return clean;
}

export function directWhatsAppSend(
  proposal: CuratedProposalData,
  financials: ProposalFinancials,
  sendPhone: string,
  targetPhone: string | undefined,
  setCustomerPhone: (val: string) => void,
  showToast: (msg: string) => void
) {
  const rawNumber = targetPhone !== undefined ? targetPhone : sendPhone;
  const clean = formatSendPhone(rawNumber);
  if (!clean) {
    showToast('⚠️ Lütfen geçerli bir telefon numarası giriniz (Örn: +90 532... veya 08...)');
    return;
  }
  if (rawNumber && rawNumber !== proposal.customerPhone) {
    setCustomerPhone(rawNumber);
  }
  const text = generateCuratedProposalWhatsAppMessage(proposal, financials);
  const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
  showToast('💬 WhatsApp sohbeti başlatılıyor...');
}

export function emailSend(
  proposal: CuratedProposalData,
  financials: ProposalFinancials,
  sendEmail: string,
  targetEmail: string | undefined,
  setCustomerEmail: (val: string) => void,
  showToast: (msg: string) => void
) {
  const emailToUse = (targetEmail !== undefined ? targetEmail : sendEmail).trim();
  if (!emailToUse || !emailToUse.includes('@')) {
    showToast('⚠️ Lütfen geçerli bir e-posta adresi giriniz');
    return;
  }
  if (emailToUse !== proposal.customerEmail) {
    setCustomerEmail(emailToUse);
  }
  const subject = `Phuket Tatili · Özel Seyahat & Tur Teklifiniz (${proposal.proposalNumber}) - ${proposal.customerName}`;
  const body = generateCuratedProposalWhatsAppMessage(proposal, financials);
  const mailtoUrl = `mailto:${encodeURIComponent(emailToUse)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
  showToast('✉️ E-posta istemciniz açılıyor...');
}

export async function nativeShareProposal(
  proposal: CuratedProposalData,
  financials: ProposalFinancials,
  fallbackCopy: () => void,
  showToast: (msg: string) => void
) {
  const text = generateCuratedProposalWhatsAppMessage(proposal, financials);
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Phuket Tatili - ${proposal.packageTitle} (${proposal.customerName})`,
        text: text,
        url: window.location.href,
      });
      showToast('📤 Paylaşım menüsü açıldı');
    } catch {
      // Sessizce geç
    }
  } else {
    fallbackCopy();
  }
}

export function openProposalInNewTab(
  proposal: CuratedProposalData,
  showToast: (msg: string) => void
) {
  const printArea = document.getElementById('curated-proposal-print-area');
  if (!printArea) {
    showToast('⚠️ Belge içeriği bulunamadı');
    return;
  }
  const newWin = window.open('', '_blank');
  if (!newWin) {
    showToast('⚠️ Tarayıcı yeni sekme açılmasını engelledi. Lütfen açılır pencerelere izin verin.');
    return;
  }
  newWin.document.write(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${proposal.proposalNumber} · ${proposal.customerName} · Phuket Tatili Teklif</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .a4-container { box-shadow: none !important; border: none !important; margin: 0 auto !important; }
    }
    body { background-color: #0f172a; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="p-3 sm:p-8 flex flex-col items-center min-h-screen">
  <div class="no-print w-full max-w-[780px] mb-5 p-3.5 bg-slate-900/90 text-white rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between gap-3">
    <div class="flex items-center gap-2 text-xs">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      <span class="font-bold">${proposal.proposalNumber}</span>
      <span class="text-slate-400">·</span>
      <span class="font-medium text-slate-300">${proposal.customerName}</span>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" style="cursor:pointer;" class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition">
        🖨️ A4 PDF İndir / Yazdır
      </button>
      <button onclick="window.close()" style="cursor:pointer;" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
        Kapat
      </button>
    </div>
  </div>
  <div class="a4-container w-full max-w-[780px] bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200">
    ${printArea.innerHTML}
  </div>
</body>
</html>`);
  newWin.document.close();
  showToast('🌐 Teklif belgesi yeni sekmede açıldı!');
}

export function printCuratedProposalDocument(showToast: (msg: string) => void) {
  const printArea = document.getElementById('curated-proposal-print-area');
  if (!printArea) {
    showToast('⚠️ Belge içeriği bulunamadı');
    return;
  }

  const clone = printArea.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.classList.add('document-print-root');

  document.body.appendChild(clone);
  document.body.classList.add('printing-document');

  let fallback = 0;
  const cleanup = () => {
    window.clearTimeout(fallback);
    window.removeEventListener('afterprint', cleanup);
    document.body.classList.remove('printing-document');
    clone.remove();
  };

  window.addEventListener('afterprint', cleanup);
  fallback = window.setTimeout(cleanup, 60_000);

  requestAnimationFrame(() => {
    window.print();
  });
}
