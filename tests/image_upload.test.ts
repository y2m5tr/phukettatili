import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  slugifyFileName,
  uploadToStorage,
  UPLOAD_MAX_MB,
  UPLOAD_MAX_WIDTH,
} from '../src/lib/imageUpload';

// Not: processImageFile bilinçli olarak burada test edilmiyor — canvas ve
// window.Image gerektirir, vitest ortamı ise 'node'. Bu iki saf/HTTP birimi
// motorun kritik karar mantığını (dosya adı + cloud/fallback) zaten kapsar.

describe('imageUpload — slugifyFileName', () => {
  it('Türkçe karakterleri sadeleştirir', () => {
    expect(slugifyFileName('Çiçekli Ölüdeniz Turu.jpg')).toBe('cicekli-oludeniz-turu');
    // ş→s, ü→u, ğ→g, ö→o, ç→c, İ→i  =>  "suguoci"
    expect(slugifyFileName('şüğüöçİ.png')).toBe('suguoci');
  });

  it('uzantıyı, boşlukları ve özel karakterleri temizler', () => {
    expect(slugifyFileName('Phi Phi  Island!! (2026).webp')).toBe('phi-phi-island-2026');
    expect(slugifyFileName('  bol bosluk   dosya  .jpeg')).toBe('bol-bosluk-dosya');
  });

  it('baş ve sondaki tireleri atar', () => {
    expect(slugifyFileName('---kenar---.jpg')).toBe('kenar');
  });

  it('adı 60 karaktere kırpar', () => {
    const long = 'a'.repeat(200);
    expect(slugifyFileName(`${long}.jpg`)).toHaveLength(60);
  });

  it('temizlenecek hiçbir şey kalmazsa "fotograf" döner', () => {
    expect(slugifyFileName('!!!.jpg')).toBe('fotograf');
    expect(slugifyFileName('.png')).toBe('fotograf');
  });
});

describe('imageUpload — uploadToStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('API başarıyla URL dönerse cloud: true ile public URL verir', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://cdn.supabase.co/bucket/foto.webp' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const blob = new Blob(['x'], { type: 'image/webp' });
    const res = await uploadToStorage(blob, 'foto.webp');

    expect(res).toEqual({ url: 'https://cdn.supabase.co/bucket/foto.webp', cloud: true });
    // İstek doğru uca ve doğru gövdeyle gitmeli
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/upload');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('filename')).toBe('foto.webp');
    expect((init.body as FormData).get('file')).toBeInstanceOf(Blob);
  });

  it('API hata dönerse base64 fallback ile cloud: false verir (site kırılmaz)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    // FileReader node ortamında yok — fallback dalını test etmek için stub
    class MockFileReader {
      onload: (() => void) | null = null;
      result: string | null = null;
      readAsDataURL(blob: Blob) {
        this.result = `data:${blob.type};base64,${Buffer.from('x').toString('base64')}`;
        if (this.onload) this.onload();
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const blob = new Blob(['x'], { type: 'image/webp' });
    const res = await uploadToStorage(blob, 'foto.webp');

    expect(res.cloud).toBe(false);
    expect(res.url).toMatch(/^data:image\/webp;base64,/);
  });

  it('fetch ağ hatası fırlatırsa yine base64 fallback devreye girer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    class MockFileReader {
      onload: (() => void) | null = null;
      result: string | null = null;
      readAsDataURL() {
        this.result = 'data:image/webp;base64,eA==';
        if (this.onload) this.onload();
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const res = await uploadToStorage(new Blob(['x']), 'foto.webp');
    expect(res).toEqual({ url: 'data:image/webp;base64,eA==', cloud: false });
  });

  it('API 200 dönse bile url alanı yoksa fallback devreye girer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    class MockFileReader {
      onload: (() => void) | null = null;
      result: string | null = null;
      readAsDataURL() {
        this.result = 'data:image/webp;base64,eA==';
        if (this.onload) this.onload();
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    const res = await uploadToStorage(new Blob(['x']), 'foto.webp');
    expect(res.cloud).toBe(false);
  });
});

describe('imageUpload — limitler', () => {
  it('belgelenen limitleri korur (handleFileUpload bu sabitlerle doğrular)', () => {
    expect(UPLOAD_MAX_MB).toBe(12);
    expect(UPLOAD_MAX_WIDTH).toBe(1600);
  });
});
