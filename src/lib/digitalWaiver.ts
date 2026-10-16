/**
 * Phuket Tatili - Dijital Tur Sigortası & Sağlık Feragatnamesi (Fast Digital Waiver)
 * Tayland Turizm Bakanlığı (TAT) mevzuatına uygun misafir sağlık beyanı,
 * kaza sigortası kaydı ve dijital onay motoru.
 */

export interface WaiverFormInput {
  bookingId: string;
  passengerName: string;
  passportNumber?: string;
  nationality?: string;
  hasHeartCondition: boolean;
  isPregnant: boolean;
  hasBackNeckSurgery: boolean;
  hasSevereAllergy: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  acceptedLiability: boolean;
}

export type WaiverStatus = 'approved' | 'flagged_medical' | 'rejected';

export interface WaiverRecord extends WaiverFormInput {
  id: string;
  signedAt: string;
  status: WaiverStatus;
  riskWarnings: string[];
}

/**
 * Sağlık ve güvenlik beyanını analiz ederek risk durumunu belirler
 */
export function evaluateWaiverHealthRisk(input: WaiverFormInput): {
  status: WaiverStatus;
  riskWarnings: string[];
} {
  const riskWarnings: string[] = [];

  if (input.isPregnant) {
    riskWarnings.push(
      '🤰 Hamilelik Durumu: Sürat teknesinde kesinlikle burun (pruva) koltuğuna oturamaz! Arka korumalı oturma grubuna alınmalıdır.'
    );
  }

  if (input.hasHeartCondition) {
    riskWarnings.push(
      '❤️ Kalp Rahatsızlığı: Yüksek adrenalinli zipline (Hanuman World) ve tüplü dalış aktiviteleri kısıtlanmalıdır.'
    );
  }

  if (input.hasBackNeckSurgery) {
    riskWarnings.push(
      '🦴 Bel / Boyun Fıtığı veya Cerrahi: Dalgalı sürat teknesi sarsıntısına maruz bırakılmamalıdır.'
    );
  }

  if (input.hasSevereAllergy) {
    riskWarnings.push(
      '🦐 Ciddi Alerji: Tekne mutfağı ve rehber balık sosu / fıstık konusunda bilgilendirilmelidir.'
    );
  }

  if (!input.acceptedLiability) {
    return { status: 'rejected', riskWarnings: ['Feragatname şartları kabul edilmedi.'] };
  }

  if (riskWarnings.length > 0) {
    return { status: 'flagged_medical', riskWarnings };
  }

  return { status: 'approved', riskWarnings: [] };
}

/**
 * Dijital feragatname kaydı oluşturur
 */
export function createWaiverRecord(input: WaiverFormInput): WaiverRecord {
  const evaluation = evaluateWaiverHealthRisk(input);

  return {
    ...input,
    id: `WAV-${Date.now().toString().slice(-6)}`,
    signedAt: new Date().toISOString(),
    status: evaluation.status,
    riskWarnings: evaluation.riskWarnings,
  };
}

/**
 * Misafire dijital feragatname doldurma linki ileten WhatsApp mesajı
 */
export function generateWaiverRequestWhatsApp(params: {
  guestName: string;
  bookingId: string;
  tourTitle: string;
  waiverUrl: string;
}): string {
  const { guestName, tourTitle, waiverUrl } = params;

  return `İyi günler ${guestName},

Phuket Tatili ile katılacağınız "${tourTitle}" için Tayland Turizm Bakanlığı (TAT) zorunlu kaza sigortası kaydınız oluşturulmaktadır. 🇹🇭🛡️

Kişi başı seyahat sigortanızın geçerli olabilmesi için lütfen aşağıdaki 30 saniyelik dijital formu onaylayınız:

👉 *Hızlı Dijital Onay Linkiniz:*
${waiverUrl}

(Herhangi bir evrak yazdırmanıza gerek yoktur; cep telefonunuzdan tek dokunuşla sağlık beyanınızı onaylayabilirsiniz).

Güvenli ve keyifli bir tatil dileriz! 🌴🌊
Phuket Tatili Operasyon Ekibi`;
}

/**
 * Onay belgesi WhatsApp özet metni
 */
export function generateWaiverConfirmationWhatsApp(record: WaiverRecord): string {
  const isSafe = record.status === 'approved';

  return `✅ DİJİTAL SİGORTA & FERAGATNAME ONAYLANDI
══════════════════════════════════════
📄 Belge No: ${record.id}
👤 Katılımcı: ${record.passengerName}
🛂 Pasaport: ${record.passportNumber || 'Belirtilmedi'}
📞 Acil Durum: ${record.emergencyContactName} (${record.emergencyContactPhone})
🛡️ Sigorta Kapsamı: Tayland TAT Seyahat Sigortası Aktif
📅 Onay Tarihi: ${new Date(record.signedAt).toLocaleString('tr-TR')}
══════════════════════════════════════
${
  !isSafe
    ? `⚠️ MEDİKAL DİKKAT NOTLARI:\n${record.riskWarnings.map((w) => `• ${w}`).join('\n')}\n══════════════════════════════════════\n`
    : '✨ Sağlık ve güvenlik beyanınız standart turlara uygundur.\n'
}İyi tatiller dileriz! Phuket Tatili`;
}

/**
 * WhatsApp URL yardımcısı
 */
export function getWaiverWhatsAppUrl(phone?: string, text?: string): string {
  if (!text) return '#';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}
