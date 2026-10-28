/**
 * Gelişmiş görsel yükleme motoru — AdminDashboard'dan ayrıldı.
 *
 * Tarayıcı tarafında çalışır (canvas / FileReader / window.Image). Bu fonksiyonlar
 * component state'ine dokunmaz; AdminDashboard yalnızca `uploadImageFile`'ı çağırıp
 * sonucu kendi `mediaList` state'ine yazar. Böylece motor test edilebilir ve
 * başka ekranlarda (ör. tur görseli yükleme) yeniden kullanılabilir olur.
 *
 * - Otomatik boyutlandırma (maks 1600px genişlik, oran korunur)
 * - WebP dönüşümü (küçük dosya, site hızı)
 * - Güvenli dosya adı (slugify)
 * - Dosya doğrulama + Türkçe hata mesajları
 * - Boyut limiti: 12MB ham / işlenmiş çıktı çok daha küçük
 */

export const UPLOAD_MAX_MB = 12;
export const UPLOAD_MAX_WIDTH = 1600;

/** Türkçe karakterleri sadeleştirip güvenli bir dosya adı gövdesi üretir. */
export function slugifyFileName(name: string): string {
  const base = name.replace(/\.[^/.]+$/, '');
  const map: Record<string, string> = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','I':'i','İ':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
  return base
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'fotograf';
}

/**
 * Görseli canvas üzerinde boyutlandırır, AVIF'e (desteklenmiyorsa WebP, sonra JPEG) çevirir.
 * Çözümleyemezse Türkçe hata mesajıyla reject eder.
 */
export function processImageFile(
  file: File,
): Promise<{ blob: Blob; url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      // Boyutlandirma hesabi
      const scale = Math.min(1, UPLOAD_MAX_WIDTH / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Tarayıcı görsel işlemeyi desteklemiyor.'));
        return;
      }
      // Beyaz arka plan (transparan PNG webp'te sorun olmamasi icin)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      // Format zinciri: AVIF -> WebP -> JPEG. Modern tarayicilar AVIF uretir,
      // eski tarayicilar WebP'e, hicbiri yoksa JPEG'e duser.
      const tryBlob = (type: string, quality: number, cb: (b: Blob) => void) => {
        canvas.toBlob((b) => {
          if (b && b.size > 0 && b.type === type) cb(b);
          else if (type === 'image/avif') tryBlob('image/webp', 0.85, cb);
          else if (type === 'image/webp') tryBlob('image/jpeg', 0.85, cb);
          else reject(new Error('Görsel dönüştürülemedi.'));
        }, type, quality);
      };
      tryBlob('image/avif', 0.75, (b) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          URL.revokeObjectURL(objectUrl);
          resolve({ blob: b, url: ev.target?.result as string, width: w, height: h });
        };
        reader.readAsDataURL(b);
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Dosya bozuk veya desteklenmeyen görsel formatı.'));
    };
    img.src = objectUrl;
  });
}

/**
 * İşlenmiş WebP blob'unu Supabase Storage'a yükler.
 * Başarılıysa public URL döner; Storage yapılamadıysa (tanımsız/erişilemez)
 * base64 fallback — site hiçbir durumda kırılmaz.
 */
export async function uploadToStorage(
  blob: Blob,
  wantedName: string,
): Promise<{ url: string; cloud: boolean }> {
  try {
    const fd = new FormData();
    fd.append('file', blob, wantedName);
    fd.append('filename', wantedName);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('storage-unavailable');
    const json = (await res.json()) as { url?: string };
    if (!json.url) throw new Error('storage-unavailable');
    return { url: json.url, cloud: true };
  } catch {
    // Fallback: base64 (localStorage riski sürer ama işlev bozulmaz)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string, cloud: false });
      reader.readAsDataURL(blob);
    });
  }
}
