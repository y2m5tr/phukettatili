import type { Booking, PaymentRecord } from '../../data/adminInitialData';
import OutstandingPanel from './finance/OutstandingPanel';
import DriverHandoverPanel from './finance/DriverHandoverPanel';
import VaultPanel from './finance/VaultPanel';
import CollectPaymentModal from './finance/CollectPaymentModal';
import ExpenseModal from './finance/ExpenseModal';
import VirmanModal from './finance/VirmanModal';
import ExpensesPanel from './finance/ExpensesPanel';
import LedgerPanel from './finance/LedgerPanel';
import FinanceKpiCards from './finance/FinanceKpiCards';
import FinanceToolbar from './finance/FinanceToolbar';
import { useFinanceTab } from './finance/useFinanceTab';

import { VAULT_ACCOUNTS, type VaultAccountId, type VirmanRecord } from './finance/vaultTypes';
// Geriye dönük uyumluluk: bu tipleri FinanceTab'dan import eden olabilir.
export { VAULT_ACCOUNTS, type VaultAccountId, type VirmanRecord };

interface FinanceTabProps {
  bookings: Booking[];
  payments: PaymentRecord[];
  onAddPayment: (record: Omit<PaymentRecord, 'id' | 'collectedAt'>) => void;
  onUpdateBooking: (booking: Booking) => void;
  showToast: (msg: string) => void;
  setVoucherBooking: (b: Booking) => void;
}

export default function FinanceTab({
  bookings,
  payments,
  onAddPayment,
  onUpdateBooking,
  showToast,
  setVoucherBooking,
}: FinanceTabProps) {
  const {
    subTab, setSubTab, settledDrivers, setSettledDrivers,
    searchQuery, setSearchQuery, methodFilter, setMethodFilter, dateFilter, setDateFilter,
    isCollectModalOpen, setIsCollectModalOpen,
    selectedBookingId, setSelectedBookingId,
    collectAmount, setCollectAmount, collectMethod, setCollectMethod,
    collectLocation, setCollectLocation, collectedBy, setCollectedBy,
    collectNote, setCollectNote,
    virmans, isVirmanModalOpen, setIsVirmanModalOpen,
    virmanSource, setVirmanSource, virmanTarget, setVirmanTarget,
    virmanAmount, setVirmanAmount, virmanDate, setVirmanDate,
    virmanBy, setVirmanBy, virmanNote, setVirmanNote,
    isExpenseModalOpen, setIsExpenseModalOpen, expenses,
    financialBreakdown, filteredPayments, outstandingBookings,
    methodTotals, vaultBalances, driverCashGroups,
    totalRevenue, totalCollected, totalOutstanding, collectionRate,
    totalCost, netProfit, profitMargin,
    handleSaveVirman, handleDeleteVirman, handleDeleteExpense,
    handleOpenCollect, handleSubmitCollect, handleExportCSV,
    handleQuickCollect, persistExpense,
  } = useFinanceTab({ bookings, payments, onAddPayment, onUpdateBooking, showToast });

  return (
    <div className="space-y-6">
      <FinanceKpiCards
        totalRevenue={totalRevenue}
        totalCollected={totalCollected}
        collectionRate={collectionRate}
        totalOutstanding={totalOutstanding}
        outstandingCount={outstandingBookings.length}
        cashThb={methodTotals.cash_thb || 0}
        promptpayThb={methodTotals.promptpay || 0}
        netProfit={netProfit}
        profitMargin={profitMargin}
        totalCost={totalCost}
        onOpenOutstanding={() => setSubTab('outstanding')}
      />

      <FinanceToolbar
        subTab={subTab}
        setSubTab={setSubTab}
        ledgerCount={filteredPayments.length}
        outstandingCount={outstandingBookings.length}
        expenseCount={expenses.length}
        onExportCSV={handleExportCSV}
        onQuickCollect={handleQuickCollect}
      />

      {/* ==================================================== */}
      {/* 3. GÖRÜNÜM A: KASA DEFTERİ / TAHSİLAT HAREKETLERİ */}
      {/* ==================================================== */}
      {subTab === 'ledger' && (
        <LedgerPanel
          filteredPayments={filteredPayments}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          methodFilter={methodFilter}
          setMethodFilter={setMethodFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />
      )}

      {/* ==================================================== */}
      {/* 4. GÖRÜNÜM B: OTELDE / SAHADA TAHSİL EDİLECEK BAKİYELER */}
      {/* ==================================================== */}
      {subTab === 'outstanding' && (
        <OutstandingPanel
          outstandingBookings={outstandingBookings}
          totalOutstanding={totalOutstanding}
          onOpenCollect={handleOpenCollect}
          setVoucherBooking={setVoucherBooking}
        />
      )}

      {/* ==================================================== */}
      {/* 5. GÖRÜNÜM C: ÇOKLU KASA & BANKA HESAPLARI YÖNETİMİ (VAULT ENGINE) */}
      {/* ==================================================== */}
      {subTab === 'accounts' && (
        <VaultPanel
          vaultBalances={vaultBalances}
          virmans={virmans}
          methodTotals={methodTotals}
          payments={payments}
          setIsVirmanModalOpen={setIsVirmanModalOpen}
          setVirmanSource={setVirmanSource}
          onDeleteVirman={handleDeleteVirman}
        />
      )}

      {/* ==================================================== */}
      {/* 5.5 ŞOFÖR KASA KAPATMA & Z-RAPORU (DRIVER HANDOVER) */}
      {/* ==================================================== */}
      {subTab === 'driver_handover' && (
        <DriverHandoverPanel
          driverCashGroups={driverCashGroups}
          settledDrivers={settledDrivers}
          setSettledDrivers={setSettledDrivers}
          onAddPayment={onAddPayment}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* 5.6 AKILLI GİDER & YAKIT TAKİBİ (OPERATING EXPENSES) */}
      {/* ==================================================== */}
      {subTab === 'expenses' && (
        <ExpensesPanel
          financialBreakdown={financialBreakdown}
          expenses={expenses}
          setIsExpenseModalOpen={setIsExpenseModalOpen}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {/* ==================================================== */}
      {/* 6. HIZLI TAHSİLAT AL MODALI */}
      {/* ==================================================== */}
      {isCollectModalOpen && (
        <CollectPaymentModal
          bookings={bookings}
          selectedBookingId={selectedBookingId}
          setSelectedBookingId={setSelectedBookingId}
          collectAmount={collectAmount}
          setCollectAmount={setCollectAmount}
          collectMethod={collectMethod}
          setCollectMethod={setCollectMethod}
          collectLocation={collectLocation}
          setCollectLocation={setCollectLocation}
          collectedBy={collectedBy}
          setCollectedBy={setCollectedBy}
          collectNote={collectNote}
          setCollectNote={setCollectNote}
          onSubmit={handleSubmitCollect}
          onClose={() => setIsCollectModalOpen(false)}
          showToast={showToast}
        />
      )}

      {/* ==================================================== */}
      {/* MODAL: HESAPLAR ARASI VİRMAN TRANSFERİ */}
      {/* ==================================================== */}
      {isVirmanModalOpen && (
        <VirmanModal
          virmanSource={virmanSource}
          setVirmanSource={setVirmanSource}
          virmanTarget={virmanTarget}
          setVirmanTarget={setVirmanTarget}
          virmanAmount={virmanAmount}
          setVirmanAmount={setVirmanAmount}
          virmanDate={virmanDate}
          setVirmanDate={setVirmanDate}
          virmanBy={virmanBy}
          setVirmanBy={setVirmanBy}
          virmanNote={virmanNote}
          setVirmanNote={setVirmanNote}
          onSubmit={handleSaveVirman}
          onClose={() => setIsVirmanModalOpen(false)}
        />
      )}

      {/* ==================================================== */}
      {/* 8. YENİ HARCAMA / GİDER FİŞİ GİRİŞ MODALI */}
      {/* ==================================================== */}
      {isExpenseModalOpen && (
        <ExpenseModal
          showToast={showToast}
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={persistExpense}
        />
      )}
    </div>
  );
}
