
import type { Booking, PassengerItem } from '../../data/adminInitialData';
import QrScannerModal from './QrScannerModal';
import BoardingPassModal from '../shared/BoardingPassModal';
import WhatsAppTemplatesModal from '../shared/WhatsAppTemplatesModal';
import MarinePoliceManifestModal from '../shared/MarinePoliceManifestModal';

export interface FieldModalsHostProps {
  isQrScannerOpen: boolean;
  onCloseQrScanner: () => void;
  onQrScanSuccess: (scannedBookingId: string, tourIndex: number) => void;
  boardingPassModalItem: { booking: Booking; tourIndex: number } | null;
  onCloseBoardingPassModal: () => void;
  managerPhone: string;
  whatsAppModalItem: Booking | null;
  onCloseWhatsAppModal: () => void;
  isPoliceManifestOpen: boolean;
  onClosePoliceManifest: () => void;
  selectedDate: string;
  bookings: Booking[];
  onUpdatePassengers: (bookingId: string, passengers: PassengerItem[]) => void;
}

export function FieldModalsHost({
  isQrScannerOpen,
  onCloseQrScanner,
  onQrScanSuccess,
  boardingPassModalItem,
  onCloseBoardingPassModal,
  managerPhone,
  whatsAppModalItem,
  onCloseWhatsAppModal,
  isPoliceManifestOpen,
  onClosePoliceManifest,
  selectedDate,
  bookings,
  onUpdatePassengers,
}: FieldModalsHostProps) {
  return (
    <>
      {/* QR Kod Tarayıcı Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={onCloseQrScanner}
        onScanResult={onQrScanSuccess}
      />

      {/* Biniş Kartı & QR Voucher Modal */}
      {boardingPassModalItem && (
        <BoardingPassModal
          booking={boardingPassModalItem.booking}
          tourIndex={boardingPassModalItem.tourIndex}
          managerPhone={managerPhone}
          onClose={onCloseBoardingPassModal}
        />
      )}

      {/* WhatsApp Otomasyon Şablonları & Hazır Mesaj Motoru */}
      {whatsAppModalItem && (
        <WhatsAppTemplatesModal
          booking={whatsAppModalItem}
          managerPhone={managerPhone}
          onClose={onCloseWhatsAppModal}
        />
      )}

      {/* Tayland Deniz Polisi & Millî Park Yolcu Manifestosu */}
      {isPoliceManifestOpen && (
        <MarinePoliceManifestModal
          date={selectedDate}
          bookings={bookings.filter(
            (b) =>
              b.tourDate === selectedDate ||
              b.tours?.some((t) => t.tourDate === selectedDate)
          )}
          onUpdatePassengers={onUpdatePassengers}
          onClose={onClosePoliceManifest}
        />
      )}
    </>
  );
}
