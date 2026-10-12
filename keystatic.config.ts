import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: process.env.NODE_ENV === 'development' 
    ? { kind: 'local' } 
    : {
        kind: 'github',
        repo: 'y2m5tr/phukettatili2'
      },
  ui: {
    brand: {
      name: 'Phuket Tatili Yönetim Paneli',
    },
    navigation: {
      '📊 Müşteri & Rezervasyon Takibi': ['customers'],
      '🏝️ Turizm & İçerik Yönetimi': ['tours', 'blog', 'services'],
      '⚙️ Site Ayarları & Sayfalar': ['siteSettings', 'homeFaq', 'testimonials'],
    },
  },
  collections: {
    /* ----------------------------------------------------
       1. MÜŞTERİ, REZERVASYON VE ÜCRET TAKİBİ (CRM PANELİ)
       ---------------------------------------------------- */
    customers: collection({
      label: 'Müşteri & Rezervasyon Kayıtları',
      slugField: 'customerName',
      path: 'src/content/customers/*',
      format: { data: 'json' },
      schema: {
        customerName: fields.slug({
          name: { label: 'Müşteri Adı Soyadı (Örn: Ahmet Yılmaz)' }
        }),
        phone: fields.text({
          label: 'Telefon / WhatsApp Numarası (Örn: +90 532 ...)'
        }),
        email: fields.text({
          label: 'E-posta Adresi (İsteğe bağlı)'
        }),
        hotel: fields.text({
          label: 'Konakladığı Otel & Bölge (Örn: Amari Phuket / Patong)'
        }),
        roomNumber: fields.text({
          label: 'Oda Numarası'
        }),
        status: fields.select({
          label: 'Rezervasyon Durumu',
          options: [
            { label: '🟡 Talep Alındı / Teklif Aşamasında', value: 'inquiry' },
            { label: '🟢 Kesinleşti / Onaylandı', value: 'confirmed' },
            { label: '🔵 Tamamlandı (Tur Bitti)', value: 'completed' },
            { label: '🔴 İptal Edildi', value: 'cancelled' },
          ],
          defaultValue: 'confirmed',
        }),
        tourDate: fields.date({
          label: 'Tur / Hizmet Tarihi'
        }),
        bookedTours: fields.array(
          fields.text({ label: 'Tur Adı veya Kodu' }),
          {
            label: 'Alınan Turlar ve Hizmetler',
            itemLabel: props => props.value,
          }
        ),
        adultCount: fields.integer({
          label: 'Yetişkin Sayısı',
          defaultValue: 2,
        }),
        childCount: fields.integer({
          label: 'Çocuk Sayısı (0 ise boş bırakın)',
          defaultValue: 0,
        }),
        totalPriceThb: fields.integer({
          label: 'Toplam Tur Ücreti (THB)',
          defaultValue: 0,
        }),
        paidAmountThb: fields.integer({
          label: 'Alınan Ön Ödeme / Kapora (THB)',
          defaultValue: 0,
        }),
        remainingAmountThb: fields.integer({
          label: 'Kalan Tahsil Edilecek Tutar (THB)',
          defaultValue: 0,
        }),
        paymentStatus: fields.select({
          label: 'Ödeme Durumu',
          options: [
            { label: '⏳ Ödeme Bekleniyor (Ödenmedi)', value: 'unpaid' },
            { label: '💳 Kısmi Ödeme Alındı (Kapora Var)', value: 'partial' },
            { label: '✅ Tamamı Ödendi', value: 'paid' },
            { label: '🔄 İade Edildi', value: 'refunded' },
          ],
          defaultValue: 'partial',
        }),
        specialNotes: fields.text({
          label: 'Yöneticiye Özel Önemli Notlar (Uçuş saatleri, transfer saati, özel istekler, alerjiler vb.)',
          multiline: true,
        }),
      },
    }),

    /* ----------------------------------------------------
       2. TURLAR KOLEKSİYONU
       ---------------------------------------------------- */
    tours: collection({
      label: 'Turlar (Tours)',
      slugField: 'title',
      path: 'src/content/tours/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Başlık' } }),
        category: fields.select({
          label: 'Kategori',
          options: [
            { label: 'Ada Turları (island-tours)', value: 'island-tours' },
            { label: 'Macera & Doğa (adventure-tours)', value: 'adventure-tours' },
            { label: 'Kültür & Sahne Şovları (entertainment-tours)', value: 'entertainment-tours' },
            { label: 'Özel Kiralama & VIP Yat (private-charters)', value: 'private-charters' },
          ],
          defaultValue: 'island-tours',
        }),
        subcategory: fields.text({ label: 'Alt Kategori (İsteğe Bağlı)' }),
        category_label: fields.text({ label: 'Kategori Etiketi (Örn: Ada Turları)' }),
        excerpt: fields.text({ label: 'Kısa Açıklama', multiline: true }),
        image: fields.text({ label: 'Kapak Fotoğrafı Adı (Örn: pileh.webp veya assets/ klasöründen)' }),
        gallery: fields.array(
          fields.text({ label: 'Galeri Fotoğraf Adı (Örn: maya_bay.webp)' }),
          { label: 'Tur İçi Fotoğraf Galerisi', itemLabel: props => props.value }
        ),
        price_type: fields.text({ label: 'Fiyat Tipi (Örn: quote)' }),
        price_thb: fields.integer({ label: 'Fiyat (THB) - 0 ise "Fiyat Teklifi Alın" görünür' }),
        duration: fields.text({ label: 'Süre (Örn: Tam Gün, 08:00 - 17:00)' }),
        featured: fields.checkbox({ label: 'Ana Sayfada Öne Çıkarılsın mı?', defaultValue: false }),
        order: fields.integer({ label: 'Sıralama Önceliği (Küçük sayılar önce çıkar)', defaultValue: 100 }),
        
        program: fields.array(
          fields.text({ label: 'Program Adımı (Örn: 07:30 - Otelden Alınış)' }),
          { label: 'Tur Programı (Zaman Çizelgesi)', itemLabel: props => props.value }
        ),
        
        included: fields.array(
          fields.text({ label: 'Dahil Olan Madde' }),
          { label: 'Fiyata Dahil Olanlar (Yeşil Tikler)', itemLabel: props => props.value }
        ),
        
        excluded: fields.array(
          fields.text({ label: 'Dahil Olmayan Madde' }),
          { label: 'Fiyata Dahil Olmayanlar (Kırmızı Çarpılar)', itemLabel: props => props.value }
        ),
        
        faq: fields.array(
          fields.object({
            q: fields.text({ label: 'Soru' }),
            a: fields.text({ label: 'Cevap', multiline: true }),
          }),
          { label: 'Tura Özel Sıkça Sorulan Sorular', itemLabel: props => props.fields.q.value }
        ),
        
        restrictions: fields.array(
          fields.text({ label: 'Kısıtlama / Sağlık Uyarısı' }),
          { label: 'Kısıtlamalar (Restrictions)', itemLabel: props => props.value }
        ),
        age_min: fields.text({ label: 'Minimum Yaş' }),
        source_status: fields.text({ label: 'Kaynak Durumu' }),
        verification_status: fields.text({ label: 'Doğrulama Durumu' }),
        verified_by: fields.text({ label: 'Doğrulayan' }),

        content: fields.markdoc({
          label: 'Tur Detaylı Açıklama Metni (Markdown)',
          extension: 'md',
        }),
      },
    }),

    /* ----------------------------------------------------
       3. BLOG & REHBER KOLEKSİYONU
       ---------------------------------------------------- */
    blog: collection({
      label: 'Blog & Gezi Rehberi',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Yazı Başlığı' } }),
        excerpt: fields.text({ label: 'Kısa Özet (Google Arama & Kart Açıklaması)', multiline: true }),
        cover_image: fields.text({ label: 'Kapak Görseli Adı (Örn: pileh.webp)' }),
        date: fields.date({ label: 'Yayın Tarihi' }),
        author: fields.text({ label: 'Yazar Adı', defaultValue: 'Phuket Tatili Ekibi' }),
        featured: fields.checkbox({ label: 'Öne Çıkarılsın mı?', defaultValue: false }),
        related_tour: fields.text({ label: 'İlgili Tur ID (Örn: phi-phi-maya-ve-bamboo-adasi)' }),
        content: fields.markdoc({
          label: 'Blog Yazı İçeriği (Markdown)',
          extension: 'md',
        }),
      },
    }),

    /* ----------------------------------------------------
       4. HİZMETLER (SERVICES) KOLEKSİYONU
       ---------------------------------------------------- */
    services: collection({
      label: 'Hizmetler (Transfer, Otel, VIP)',
      slugField: 'slug',
      path: 'src/content/services/*',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Hizmet Başlığı' }),
        slug: fields.slug({ name: { label: 'Sayfa URL (Slug)' } }),
        menu_label: fields.text({ label: 'Menü Etiketi' }),
        eyebrow: fields.text({ label: 'Üst Başlık Rozeti (Örn: Havalimanı · Otel)' }),
        heading: fields.text({ label: 'Büyük Başlık' }),
        intro: fields.text({ label: 'Giriş Açıklaması', multiline: true }),
        media: fields.text({ label: 'Kapak Görseli (Örn: longtail.webp)' }),
        media_alt: fields.text({ label: 'Görsel Açıklaması (Alt text)' }),
        options: fields.array(
          fields.object({
            title: fields.text({ label: 'Seçenek Başlığı' }),
            text: fields.text({ label: 'Açıklama', multiline: true }),
          }),
          { label: 'Hizmet Seçenekleri / Paketleri', itemLabel: props => props.fields.title.value }
        ),
        questions: fields.array(
          fields.text({ label: 'Soru / Talep Bilgisi' }),
          { label: 'Müşteriden İstenen Bilgiler', itemLabel: props => props.value }
        ),
        order: fields.integer({ label: 'Sıralama Önceliği', defaultValue: 10 }),
      },
    }),
  },

  singletons: {
    siteSettings: singleton({
      label: 'Site Genel Ayarları & İletişim',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        siteTitle: fields.text({ label: 'Site Marka Başlığı', defaultValue: 'Phuket Tatili' }),
        whatsappNumber: fields.text({ label: 'WhatsApp Numarası (Ülke koduyla, örn: 66828950665)', defaultValue: '66828950665' }),
        email: fields.text({ label: 'İletişim E-posta Adresi', defaultValue: 'info@phukettatili.com' }),
        instagramUrl: fields.text({ label: 'Instagram Profil Linki', defaultValue: 'https://instagram.com/phukettatili' }),
        facebookUrl: fields.text({ label: 'Facebook Sayfa Linki' }),
      },
    }),

    homeFaq: singleton({
      label: 'Ana Sayfa SSS (FAQ)',
      path: 'src/content/settings/faq',
      format: { data: 'json' },
      schema: {
        faq: fields.array(
          fields.object({
            question: fields.text({ label: 'Soru' }),
            answer: fields.text({ label: 'Cevap', multiline: true }),
          }),
          {
            label: 'Sıkça Sorulan Sorular Listesi',
            itemLabel: props => props.fields.question.value,
          }
        ),
      },
    }),

    testimonials: singleton({
      label: 'Müşteri Yorumları (Testimonials)',
      path: 'src/content/settings/testimonials',
      format: { data: 'json' },
      schema: {
        testimonials: fields.array(
          fields.object({
            name: fields.text({ label: 'Misafir Adı / Çift Adı (Örn: Ayşe & Burak)' }),
            type: fields.text({ label: 'Misafir Tipi (Örn: Balayı Çifti, Aile)' }),
            tour: fields.text({ label: 'Katıldığı Tur (Örn: Phi Phi & Maya Bay)' }),
            stars: fields.integer({ label: 'Puan / Yıldız (1-5)', defaultValue: 5 }),
            text: fields.text({ label: 'Yorum Metni', multiline: true }),
          }),
          {
            label: 'Müşteri Yorumları Listesi',
            itemLabel: props => `${props.fields.name.value} (${props.fields.tour.value})`,
          }
        ),
      },
    }),
  },
});
