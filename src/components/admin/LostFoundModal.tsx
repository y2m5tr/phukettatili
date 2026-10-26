import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Package,
} from 'lucide-react';
import {
  type LostFoundItem,
  type LostFoundStatus,
  type LostFoundItemType,
  INITIAL_LOST_FOUND_ITEMS,
  STATUS_LABELS,
  filterLostFoundItems,
} from '../../lib/lostAndFound';
import { readLocalCollection, saveCmsCollection } from '../../lib/cmsSync';
import { LostFoundItemCard } from './lostFound/LostFoundItemCard';
import { LostFoundCreateForm } from './lostFound/LostFoundCreateForm';

interface LostFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}

export default function LostFoundModal({
  isOpen,
  onClose,
  showToast,
}: LostFoundModalProps) {
  const [items, setItems] = useState<LostFoundItem[]>(() => {
    return readLocalCollection<LostFoundItem[]>('lost-found', INITIAL_LOST_FOUND_ITEMS) || INITIAL_LOST_FOUND_ITEMS;
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);

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
  // Yeni kayıt her zaman "şoförde bulundu" durumuyla açılır; ek formda durum
  // seçici bilinçli olarak yoktur — kayıt sonrası liste satırındaki durum
  // menüsünden güncellenir. Bu yüzden state değil sabit.
  const newStatus: LostFoundStatus = 'found_with_driver';

  const counters = useMemo(() => {
    const base = { all: items.length, driver: 0, office: 0, courier: 0, delivered: 0 };
    items.forEach((item) => {
      if (item.status === 'found_with_driver') base.driver++;
      else if (item.status === 'at_central_office') base.office++;
      else if (item.status === 'in_transit_to_hotel') base.courier++;
      else if (item.status === 'returned_to_guest') base.delivered++;
    });
    return base;
  }, [items]);

  const filteredItems = useMemo(
    () => filterLostFoundItems(items, statusFilter, searchQuery),
    [items, statusFilter, searchQuery]
  );

  const handleUpdateStatus = (id: string, nextStatus: LostFoundStatus) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        let updatedLocation = item.storageLocation;
        if (nextStatus === 'at_central_office') updatedLocation = 'Patong Merkez Ofis Çelik Kasa';
        if (nextStatus === 'in_transit_to_hotel') updatedLocation = 'Otele Kurye ile Gönderildi';
        if (nextStatus === 'returned_to_guest') updatedLocation = 'Misafir / Otel Resepsiyonuna Teslim Edildi';

        return { ...item, status: nextStatus, storageLocation: updatedLocation };
      }
      return item;
    });
    setItems(updated);
    void saveCmsCollection('lost-found', updated, (err) => showToast(`⚠️ ${err}`));
    showToast(`📦 Durum güncellendi: ${STATUS_LABELS[nextStatus].label}`);
  };

  const handleCreateItem = (e: React.SyntheticEvent) => {
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

    const next = [newItem, ...items];
    setItems(next);
    void saveCmsCollection('lost-found', next, (err) => showToast(`⚠️ ${err}`));
    setIsAddFormOpen(false);
    showToast(`✅ ${newItem.title} kayıp eşya envanterine kaydedildi ve buluta senkronlandı!`);

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
        <LostFoundCreateForm
          isAddFormOpen={isAddFormOpen}
          setIsAddFormOpen={setIsAddFormOpen}
          onSubmit={handleCreateItem}
          newItemType={newItemType}
          setNewItemType={setNewItemType}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          newDriver={newDriver}
          setNewDriver={setNewDriver}
          newDriverPhone={newDriverPhone}
          setNewDriverPhone={setNewDriverPhone}
          newGuestName={newGuestName}
          setNewGuestName={setNewGuestName}
          newGuestPhone={newGuestPhone}
          setNewGuestPhone={setNewGuestPhone}
          newHotelName={newHotelName}
          setNewHotelName={setNewHotelName}
          newDescription={newDescription}
          setNewDescription={setNewDescription}
          newLocation={newLocation}
          setNewLocation={setNewLocation}
        />

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
            filteredItems.map((item) => (
              <LostFoundItemCard
                key={item.id}
                item={item}
                onUpdateStatus={handleUpdateStatus}
                showToast={showToast}
              />
            ))
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
