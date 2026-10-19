/**
 * /api/upload — panel medya yüklemelerini Supabase Storage'a yazar.
 *
 * MİMARİ:
 *   Panelde fotoğraf seçilir → tarayıcıda WebP'e işlenir (boyutlandırma
 *   dahil) → FormData ile buraya POST edilir → servis rolü anahtarıyla
 *   `media` bucket'ına yazılır → public URL döner.
 *
 *   localStorage'da artık base64 yerine kısa URL kalır — depolama
 *   dolması sorunu ortadan kalkar. Site <img> etiketlerinden URL'i
 *   doğrudan yükler (bucket public okumalı).
 *
 * GÜVENLİK:
 *   - guardApi(context, 'manager'): oturumsuz istek reddedilir.
 *   - Dosya tipi doğrulanır (yalnızca image/*).
 *   - Boyut limiti: 4 MB (işlenmiş WebP için bol).
 *   - Dosya adı sunucuda yeniden slugify edilir — path traversal yok.
 *
 * UÇLAR:
 *   POST /api/upload  (FormData: file, [filename])
 *   → { ok: true, url: "https://<project>.supabase.co/storage/v1/object/public/media/<slug>.webp" }
 */
import type { APIRoute } from 'astro';
import { guardApi, jsonError, jsonOk } from '../../lib/server/apiGuard';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
} from '../../lib/server/supabaseAdmin';

export const prerender = false;

/** İşlenmiş görsel için üst sınır — WebP çıktısı için fazlasıyla yeterli. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const SLUG_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
  'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
};

function slugifyFileName(name: string): string {
  const base = name.replace(/\.[^/.]+$/, '');
  const slug = base
    .split('')
    .map((ch) => SLUG_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'fotograf';
}

export const POST: APIRoute = async (context) => {
  const guard = guardApi(context, 'manager');
  if (!guard.allowed) return guard.response!;

  let form: FormData;
  try {
    form = await context.request.formData();
  } catch {
    return jsonError(400, 'Geçersiz form gövdesi.');
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return jsonError(400, 'Dosya bulunamadı.');
  }

  if (!file.type.startsWith('image/')) {
    return jsonError(400, 'Sadece görsel dosyası yüklenebilir.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonError(413, `Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). Limit: 4MB.`);
  }

  if (!isSupabaseAdminConfigured()) {
    return jsonError(503, 'Bulut depolama yapılandırılmamış (SUPABASE_SERVICE_ROLE_KEY yok).');
  }
  const db = getSupabaseAdmin();
  if (!db) return jsonError(503, 'Depolama istemcisi oluşturulamadı.');

  // Dosya adı: client'tan gelen öneri veya orijinal ad — her durumda
  // sunucuda slugify edilir, çakışmayı önlemek için timestamp eklenir.
  const wanted = String(form.get('filename') || file.name || 'fotograf');
  const slug = slugifyFileName(wanted);
  const ext = file.type === 'image/webp' ? 'webp'
    : file.type === 'image/png' ? 'png'
    : file.type === 'image/gif' ? 'gif'
    : 'jpg';
  const stamp = Date.now().toString(36);
  const path = `${slug}-${stamp}.${ext}`;

  const { error } = await db.storage
    .from('media')
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    return jsonError(502, 'Yükleme hatası: ' + error.message);
  }

  const { data: publicUrlData } = db.storage.from('media').getPublicUrl(path);

  return jsonOk({
    ok: true,
    url: publicUrlData.publicUrl,
    path,
    size: file.size,
  });
};
