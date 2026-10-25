import type { PartnerAgent } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';
import { EMPTY_AGENT_STATS, type AgentStats } from './types';

// WhatsApp Hakediş Ekstresi Metni Üret (PartnersTab'ten birebir taşındı)
export function generateStatementText(
  agent: PartnerAgent,
  agentStats: Record<string, AgentStats>,
  managerPhone: string,
): string {
  const s = agentStats[agent.id] || EMPTY_AGENT_STATS;
  const balance = Math.max(0, s.earnedCommissionThb - (agent.totalPaidCommissionThb || 0));

  const lines = [
    `📊 *PHUKET TATİLİ - ACENTA KOMİSYON VE MUTABAKAT EKSTRESİ*`,
    `🏢 *Acenta:* ${agent.name} (${agent.code})`,
    `👤 *Yetkili:* ${agent.contactPerson} (${agent.phone})`,
    `📅 *Rapor Tarihi:* ${new Date().toLocaleDateString('tr-TR')}`,
    `───────────────────────────────`,
    `👥 *Toplam Misafir:* ${s.paxCount} Kişi (${s.bookingCount} Rezervasyon)`,
    `💵 *Toplam Satış Cirosu:* ${fmtMoney(s.totalRevenueThb)} THB`,
    `📈 *Hak Edilen Toplam Komisyon:* ${fmtMoney(s.earnedCommissionThb)} THB`,
    `✅ *Daha Önce Ödenen:* ${fmtMoney((agent.totalPaidCommissionThb || 0))} THB`,
    `⚠️ *Kalan Ödenecek Bakiye:* *${fmtMoney(balance)} THB*`,
    `───────────────────────────────`,
    `📋 *Rezervasyon Detayları:*`,
    ...s.bookingList.map(
      (b, idx) =>
        `${idx + 1}. ${b.tourDate} · ${b.customerName} · ${b.tourTitle} (${b.adultCount}Y) · Ciro: ${fmtMoney(b.totalPriceThb)} ฿`
    ),
    `───────────────────────────────`,
    `📞 Sorularınız ve ödeme dekontları için: +${managerPhone}`,
  ];

  return lines.join('\n');
}

// Yazdır / A4 PDF Mutabakat Bordrosu (PartnersTab'ten birebir taşındı)
export function printStatement(
  agent: PartnerAgent,
  agentStats: Record<string, AgentStats>,
  managerPhone: string,
): void {
  const text = generateStatementText(agent, agentStats, managerPhone);
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${agent.name} - Komisyon ve Mutabakat Bordrosu</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
        .sub { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 2px; }
        .meta { font-size: 12px; color: #475569; text-align: right; }
        .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; white-space: pre-wrap; line-height: 1.65; }
        .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">PHUKET TATİLİ TRAVEL CO., LTD.</div>
          <div class="sub">B2B Partner Acenta Komisyon & Mutabakat Bordrosu</div>
        </div>
        <div class="meta">
          <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
          <div><strong>Acenta Kodu:</strong> ${agent.code}</div>
        </div>
      </div>
      <div class="box">${text}</div>
      <div class="footer">
        Phuket Tatili Travel Co., Ltd. · 24/7 B2B Destek & Muhasebe: +${managerPhone} · www.phukettatili.com
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  win.document.close();
}
