/**
 * Kurumsal kasa/banka hesabı (Multi-Account Vault) tipleri ve sabitleri.
 * FinanceTab ve onun alt panelleri (VaultPanel, gider/virman modalları)
 * tarafından paylaşılır. Döngüsel import'u önlemek için ayrı modülde.
 */
export type VaultAccountId = 'kbank' | 'office_cash' | 'tr_bank' | 'wise';

export interface VirmanRecord {
  id: string;
  sourceAccount: VaultAccountId;
  targetAccount: VaultAccountId;
  amountThb: number;
  date: string;
  transferredBy: string;
  note: string;
}

export const VAULT_ACCOUNTS: Record<
  VaultAccountId,
  { name: string; icon: string; detail: string; currency: string }
> = {
  kbank: {
    name: 'K-Bank (Kasikorn Thai QR)',
    icon: '🏦',
    detail: 'PromptPay / K-Bank Phuket No: 142-8-39281-0',
    currency: 'THB',
  },
  office_cash: {
    name: 'Merkez Ofis Nakit Kasası',
    icon: '💵',
    detail: 'Patong Ana Ofis Fiziksel Çelik Kasa',
    currency: 'THB',
  },
  tr_bank: {
    name: 'TR Banka Hesabı (Havale/EFT)',
    icon: '🇹🇷',
    detail: 'Garanti BBVA TR & USD Hesabı',
    currency: 'TRY / USD',
  },
  wise: {
    name: 'Wise & Uluslararası Hesap',
    icon: '🌐',
    detail: 'Wise Multi-Currency & Stripe POS',
    currency: 'Multi',
  },
};
