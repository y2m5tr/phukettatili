/**
 * Overview Dispatch Cockpit — Hatırlatma ve Yorum Tetikleme Eylemleri
 */

export async function dispatchT24Reminders(
  showToast?: (msg: string) => void
): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    !window.confirm('Yarınki turların onaylı misafirlerine WhatsApp lobi alınış hatırlatması (T-24) gönderilsin mi?')
  ) {
    return false;
  }
  try {
    const res = await fetch('/api/whatsapp/dispatch-reminders', { method: 'POST' });
    const data = await res.json();
    if (res.ok && data?.ok) {
      showToast?.(`✅ ${data.sentCount} misafire T-24 WhatsApp hatırlatması iletildi!`);
      return true;
    }
    showToast?.(`⚠️ Hatırlatma gönderilemedi: ${data?.error || 'Bilinmeyen hata'}`);
    return false;
  } catch {
    showToast?.('⚠️ Bağlantı hatası, hatırlatmalar gönderilemedi.');
    return false;
  }
}

export async function dispatchReviewReminders(
  showToast?: (msg: string) => void
): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    !window.confirm('Dün turu tamamlanan misafirlere WhatsApp Google yorum ve memnuniyet mesajı (T+24) gönderilsin mi?')
  ) {
    return false;
  }
  try {
    const res = await fetch('/api/whatsapp/review-reminders', { method: 'POST' });
    const data = await res.json();
    if (res.ok && data?.ok) {
      showToast?.(`⭐ ${data.sentCount} misafire T+24 Google yorum daveti iletildi!`);
      return true;
    }
    showToast?.(`⚠️ Yorum daveti gönderilemedi: ${data?.error || 'Bilinmeyen hata'}`);
    return false;
  } catch {
    showToast?.('⚠️ Bağlantı hatası, yorum davetleri gönderilemedi.');
    return false;
  }
}
