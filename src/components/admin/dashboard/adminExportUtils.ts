import type { Booking, TourItem, FaqItem, TestimonialItem } from '../../../data/adminInitialData';

export function exportBookingsCsv(bookings: Booking[]): void {
  const headers = ['ID,Musteri,Telefon,Otel,Oda,Turlar,Tarihler,Yetiskin,Cocuk,ToplamTHB,OdenenTHB,KalanTHB,Durum\n'];
  const rows = bookings.map((b) => {
    const toursSummary = (b.tours || [{ tourTitle: b.tourTitle, tourDate: b.tourDate }])
      .map((t) => `${t.tourTitle} (${t.tourDate})`)
      .join(' + ');
    const datesSummary = (b.tours || [{ tourDate: b.tourDate }]).map((t) => t.tourDate).join('; ');
    return `"${b.id}","${b.customerName}","${b.phone}","${b.hotel}","${b.roomNumber || ''}","${toursSummary}","${datesSummary}",${b.adultCount},${b.childCount},${b.totalPriceThb},${b.paidAmountThb},${b.remainingAmountThb},"${b.status}"\n`;
  });
  const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `phuket_tatili_rezervasyonlar_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSiteJson(
  tours: TourItem[],
  faqs: FaqItem[],
  testimonials: TestimonialItem[],
  homeSettings: any
): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    tours,
    faqs,
    testimonials,
    homeSettings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `phuket-cms-data-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
