export interface CannedResponseItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  text: string;
}

export const CANNED_RESPONSES: CannedResponseItem[] = [
  {
    id: 'bank_info',
    title: '🏦 Banka & Havale / PromptPay Bilgileri',
    category: 'Finans',
    badge: 'Ödeme',
    text: `🌴 *PHUKET TATİLİ — BANKA VE ÖDEME BİLGİLERİ* 🌴

Sayın Misafirimiz,
Rezervasyonunuzu kesinleştirmek için ön ödemenizi aşağıdaki hesaplarımıza iletebilirsiniz:

🇹🇷 *TÜRK LİRASI (TRY) HAVALE / FAST:*
Banka: Garanti BBVA
Hesap Sahibi: Phuket Tatili Seyahat
IBAN: TR33 0006 2000 0001 2345 6789 01
Açıklama: Adınız Soyadınız - Tur Tarihi

🇹🇭 *TAYLAND BAHTI (THB) PROMPTPAY:*
PromptPay ID: 0828950665
Hesap Adı: Phuket Tatili Operations

Ödemenizi tamamladıktan sonra dekontu buradan iletmeniz yeterlidir. Biletiniz ve resmi voucher belgeniz anında düzenlenecektir. Keyifli tatiller dileriz! ✨`,
  },
  {
    id: 'weather_status',
    title: '🌦️ Canlı Hava Durumu & Deniz Sakinliği',
    category: 'Operasyon',
    badge: 'Güvenlik',
    text: `☀️ *PHUKET TATİLİ — HAVA VE DENİZ GÜVENLİK BİLGİSİ* ☀️

Merhaba! Phuket hava durumu hakkında bilgi vermek isteriz:

Phuket tropikal bir adadır; internet hava durumu uygulamaları tropik iklim gereği çoğu zaman yağmur simgesi gösterse de, yağışlar genellikle akşam saatlerinde 20-30 dakika sürer ve ardından güneş açar.

🛥️ *Deniz Durumu & Tur Güvenliği:*
Tüm ada turlarımız Tayland Liman Başkanlığı (Marine Department) ve Sahil Güvenlik onaylı radar takibi ile gerçekleştirilir. Denize çıkış bayrağı yeşil olduğu sürece turlarımız planlandığı gibi güvenle yapılmaktadır.

Herhangi bir hava muhalefetinde misafirlerimizin güvenliği 1. önceliğimizdir; böyle bir durumda tur ücretsiz ertelenir veya %100 kesintisiz ücret iadeniz sağlanır. İçiniz rahat olsun! 🌊🇹🇭`,
  },
  {
    id: 'insurance_passport',
    title: '📄 Zorunlu Deniz Sigortası & Pasaport Kaydı',
    category: 'Emniyet',
    badge: 'Yasal',
    text: `📋 *PHUKET TATİLİ — ZORUNLU DENİZ SİGORTASI KAYDI* 📋

Sayın Misafirimiz,
Tayland Turizm Bakanlığı (TAT) ve Denizcilik İdaresi mevzuatı gereği, katıldığınız tura ait seyahat ve kaza sigortanız şirketimiz tarafından ÜCRETSİZ olarak karşılanmaktadır.

Kayıt işlemlerinizin limana gitmeden önce tamamlanabilmesi için:
• Tura katılacak her misafirimizin pasaport fotoğraflı sayfasını bu WhatsApp hattımıza fotoğraf olarak iletmenizi rica ederiz.

Bilgileriniz yalnızca resmi sigorta manifestosu için kullanılır ve üçüncü taraflarla paylaşılmaz. Desteğiniz için teşekkür ederiz! 🛡️🌴`,
  },
  {
    id: 'lobby_delay',
    title: '⏰ Tur Sabahı Lobi Bekleme / Gecikme Uyarısı',
    category: 'Acil',
    badge: 'Lobi Uyarısı',
    text: `🚐 *PHUKET TATİLİ — LOBİ ACİL BİLGİLENDİRME* 🚐

Sayın Misafirimiz,
Transfer aracımız şu anda otelinizin ana lobisinde sizi beklemektedir. Diğer misafirlerimizin ve iskeledeki teknemizin kalkış saatini aksatmamak adına lütfen ivedilikle ana lobiye geçiş yapabilir misiniz?

Şoförümüzün elinde isminizin yazılı olduğu pano bulunmaktadır. Lobiye ulaştığınızda bize haber vermenizi rica ederiz: +66 82 895 0665.

İyi turlar dileriz! 🇹🇭✨`,
  },
  {
    id: 'thai_visa_info',
    title: '🇹🇭 Tayland Vizesi & Giriş Bilgileri',
    category: 'Genel',
    badge: 'Vize Rehberi',
    text: `🌴 *PHUKET TATİLİ — TAYLAND GİRİŞ VE VİZE REHBERİ* 🌴

Merhaba! Tayland seyahatiniz öncesi bilmeniz gereken temel kurallar:

1. *Vize Durumu:* Bordo (Umuma Mahsus), Yeşil ve Gri pasaport sahibi Türk vatandaşları Tayland'a 60 güne kadar VİZESİZ giriş yapabilir.
2. *Pasaport Süresi:* Pasaportunuzun Tayland'a giriş tarihinizden itibaren en az 6 ay geçerlilik süresi olmalıdır.
3. *Gerekli Belgeler:* Geliş-dönüş uçak biletiniz ve otel rezervasyon çıktınızın telefonunuzda bulunması tavsiye edilir.
4. *Döviz Tavsiyesi:* Yanınızda getireceğiniz Dolar veya Euro'yu ada içerisindeki resmi banka döviz bürolarında güvenle Tay Bahtı'na (THB) çevirebilirsiniz. (100$'lık banknotların yeni basım ve yırtıksız olması tavsiye edilir).

Phuket'te harika anılar biriktirmeniz dileğiyle! 🇹🇭✨`,
  },
];
