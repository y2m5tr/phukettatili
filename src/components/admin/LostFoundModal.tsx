import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Package,
  Phone,
  Car,
  Hotel,
  ShieldCheck,
  Send,
  MessageCircle,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  type LostFoundItem,
  type LostFoundStatus,
  type LostFoundItemType,
  INITIAL_LOST_FOUND_ITEMS,
  ITEM_TYPE_LABELS,
  STATUS_LABELS,
  generateGuestFoundWhatsApp,
  generateDriverInquiryWhatsApp,
  generateHotelDeliveryWhatsApp,
  getLostFoundWhatsAppUrl,
  filterLostFoundItems,
} from '../../lib/lostAndFound';

interface LostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'phuket_tatili_lost_found_v1';

export default function LostFoundModal({
  isOpen,
  onClose,
  showToast,
}: LostFoundModalProps) {
  const [items, setItems] = useState<LostFoundItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_LOST_FOUND_ITEMS;
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [driverInquiryModalItem, setDriverInquiryModalItem] = useState<LostFoundItem | null>(null);

  // New item form state
  const [newTitle, setNewTitle] = useState('');
  const [newItemType, setNewItemType] = useState<LostFoundItemType>('other');
  const [newDescription, setNewDescription] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newHotelName, setNewHotelName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newLocation, setNewLocation] = useState('Araç Torpido Gözü / Şoförde');
  const [newStatus, setNewStatus] = useState<LostFoundStatus>('found_with_driver');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // storage quota
      }
    }
  }, [items]);

  const filteredItems = useMemo(() => {
    return filterLostFoundItems(items, statusFilter, searchQuery);
  }, [items, statusFilter, searchQuery]);

  // Status counters
  const counters = useMemo(() => {
    return {
      all: items.length,
      driver: items.filter((i) => i.status === 'found_with_driver').length,
      office: items.filter((i) => i.status === 'at_central_office').length,
      courier: items.filter((i) => i.status === 'in_transit_to_hotel').length,
      delivered: items.filter((i) => i.status === 'returned_to_guest').length,
    };
  }, [items]);

  const handleUpdateStatus = (id: string, nextStatus: LostFoundStatus) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let updatedLocation = item.storageLocation;
          if (nextStatus === 'at_central_office') updatedLocation = 'Patong Merkez Ofis Çelik Kasa';
          if (nextStatus === 'in_transit_to_hotel') updatedLocation = 'Otele Kurye ile Gönderildi';
          if (nextStatus === 'returned_to_guest') updatedLocation = 'Misafir / Otel Resepsiyonuna Teslim Edildi';

          return { ...item, status: nextStatus, storageLocation: updatedLocation };
        }
        return item;
      })
    );
    showToast(`📦 Durum güncellendi: ${STATUS_LABELS[nextStatus].label}`);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('⚠️ Lütfen eşya adını yazın.');
      return;
    }

    const newItem: LostFoundItem = {
      id: `LF-${Date.now().toString().slice(-4)}`,
      reportedAt: new Date().toISOString(),
      itemType: newItemType,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Açıklama belirtilmedi',
      vehicleOrTour: newVehicle.trim() || 'Belirtilmedi',
      driverOrGuideName: newDriver.trim() || 'Nöbetçi Operasyon',
      driverPhone: newDriverPhone.trim() || undefined,
      guestName: newGuestName.trim() || undefined,
      guestPhone: newGuestPhone.trim() || undefined,
      hotelName: newHotelName.trim() || undefined,
      roomNumber: newRoomNumber.trim() || undefined,
      status: newStatus,
      storageLocation: newLocation.trim() || 'Merkez Ofis',
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddFormOpen(false);
    showToast(`✅ ${newItem.title} kayıp eşya envanterine kaydedildi!`);

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewVehicle('');
    setNewDriver('');
    setNewDriverPhone('');
    setNewGuestName('');
    setNewGuestPhone('');
    setNewHotelName('');
    setNewRoomNumber('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-surface-1 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-surface-2/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Kayıp Eşya Masası & Bagaj Güvenlik Protokolü
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider">
                  Lost & Found
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                VIP Van ve teknelerde unutulan eşyalar, şoför koordinasyonu ve misafire teslimat takibi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Eşya Kaydı</span>
              <span className="sm:hidden">Yeni</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Counters Strip */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            Tümü ({counters.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('found_with_driver')}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'found_with_driver'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
            }`}
          >
            <span>🚗 Şoförde / Araçta</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600/30 text-white font-mono">
              {counters.driver}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('at_central_office')}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'at_central_office'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 dark:text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            <span>🏢 Merkez Ofis Kasasında</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-700/30 text-white font-mono">
              {counters.office}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_transit_to_hotel')}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'in_transit_to_hotel'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 dark:text-purple-400 hover:bg-purple-500/10'
            }`}
          >
            <span>🛵 Otele Kuryede</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-700/30 text-white font-mono">
              {counters.courier}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('returned_to_guest')}
            className={`px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'returned_to_guest'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <span>✅ Teslim Edildi</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700/30 text-white font-mono">
              {counters.delivered}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-surface-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Eşya adı, misafir, otel, araç plakası veya şoför ara..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* New Item Form (Inline expandable) */}
        {isAddFormOpen && (
          <form
            onSubmit={handleCreateItem}
            className="p-5 border-b border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-3.5 animate-in slide-in-from-top duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Yeni Kayıp / Unutulan Eşya Kaydı</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Vazgeç
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Eşya Türü</label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as LostFoundItemType)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.icon} {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Eşya Başlığı / Marka Model *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Siyah Ray-Ban Güneş Gözlüğü, iPhone 15 Pro, Mavi Plaj Çantası"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Araç / Tekne / Tur</label>
                <input
                  type="text"
                  placeholder="Örn: VIP Van 35-1249 veya Phi Phi Speedboat"
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Şoför / Rehber & Tel</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Şoför Adı (Örn: Somchai)"
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="w-2/3 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="+66..."
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-1/3 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Misafir Adı</label>
                <input
                  type="text"
                  placeholder="Misafir Ad Soyad"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Misafir Tel (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="+90 532..."
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Otel & Oda No</label>
                <input
                  type="text"
                  placeholder="Örn: Amari Patong (Oda 412)"
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Eşya Detayı / Nerede Bulundu</label>
                <input
                  type="text"
                  placeholder="Örn: Arka koltuk cebinde unutulmuş, çizik yok"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Muhafaza Konumu</label>
                <input
                  type="text"
                  placeholder="Örn: Araç Torpido Gözü / Patong Ofis Kasa"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Eşyayı Sisteme Kaydet</span>
              </button>
            </div>
          </form>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <Package className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-semibold">Bu filtreye uygun kayıtlı kayıp eşya bulunamadı.</p>
              <p className="text-xs opacity-75 mt-0.5">
                Yeni bir unutulan eşya bildirmek için &apos;Yeni Eşya Kaydı&apos; butonunu kullanabilirsiniz.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemType = ITEM_TYPE_LABELS[item.itemType] || ITEM_TYPE_LABELS.other;
              const status = STATUS_LABELS[item.status];
              const guestWhatsAppText = generateGuestFoundWhatsApp(item);
              const guestWhatsAppUrl = getLostFoundWhatsAppUrl(item.guestPhone, guestWhatsAppText);
              const hotelWhatsAppText = generateHotelDeliveryWhatsApp(item);
              const hotelWhatsAppUrl = getLostFoundWhatsAppUrl(item.guestPhone, hotelWhatsAppText);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-surface-2/60 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-500/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                        {itemType.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.id}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            {item.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${status.badgeClass}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <label htmlFor={`status-select-${item.id}`} className="text-[10px] uppercase font-bold text-slate-400">Durum:</label>
                      <select
                        id={`status-select-${item.id}`}
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as LostFoundStatus)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                      >
                        <option value="found_with_driver">🚗 Şoförde / Araçta</option>
                        <option value="at_central_office">🏢 Merkez Ofis Kasasında</option>
                        <option value="in_transit_to_hotel">🛵 Otele Kuryede</option>
                        <option value="returned_to_guest">✅ Misafire Teslim Edildi</option>
                      </select>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        <strong>Araç:</strong> {item.vehicleOrTour} ({item.driverOrGuideName})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Hotel className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">
                        <strong>Misafir:</strong> {item.guestName || 'Bilinmiyor'}
                        {item.hotelName ? ` - ${item.hotelName}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">
                        <strong>Konum:</strong> {item.storageLocation}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Guest WhatsApp Button */}
                    {item.guestPhone ? (
                      <a
                        href={guestWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                        title="Misafire eşyanın bulunduğunu müjdele"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Misafire Müjde Ver (WhatsApp)</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(guestWhatsAppText);
                          showToast('📋 Misafir bildirim mesajı panoya kopyalandı!');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Mesajı Kopyala</span>
                      </button>
                    )}

                    {/* Driver Inquiry Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const thaiMsg = generateDriverInquiryWhatsApp({
                          driverName: item.driverOrGuideName,
                          vehicleOrTour: item.vehicleOrTour,
                          missingItemDesc: item.title,
                          guestName: item.guestName,
                          hotelName: item.hotelName,
                        });
                        if (item.driverPhone) {
                          const url = getLostFoundWhatsAppUrl(item.driverPhone, thaiMsg);
                          window.open(url, '_blank');
                        } else {
                          navigator.clipboard.writeText(thaiMsg);
                          showToast('🇹🇭 Tayca şoför sorgulama metni panoya kopyalandı!');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                      title="Şoföre Tayca ve İngilizce eşyayı sor"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>🇹🇭 Şoföre Tayca Sor</span>
                    </button>

                    {/* Hotel Delivery Confirmation Button */}
                    {item.status === 'in_transit_to_hotel' && (
                      <a
                        href={hotelWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                      >
                        <Hotel className="w-3.5 h-3.5" />
                        <span>Otele Teslim Edildi Bildir</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-2/30 flex items-center justify-between text-xs text-slate-500">
          <span>
            💡 Phuket Tatili Saha Protokolü: Bulunan eşyalar 90 gün boyunca merkez ofis kasasında sigortalı olarak saklanır.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
