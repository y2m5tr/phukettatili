import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import LostFoundModal from '../src/components/admin/LostFoundModal';

/**
 * Kayıp & Bulunan modalı render regresyonu.
 *
 * HATA BUYDU: modal JSX'i `counters` ve `filteredItems` değerlerini okuyordu
 * ama ikisi de hiçbir yerde tanımlı değildi. Derleme bunu yakalamadı çünkü
 * `astro check` bu dosyayı hatasız sayıyordu; modal panelde açılınca
 * `ReferenceError` ile çöküyordu. Bu test, bileşenin en az bir kayıtla
 * render edilebildiğini ve sayaç şeridini ürettiğini kilitler.
 */

describe('LostFoundModal render', () => {
  const render = () =>
    renderToString(
      React.createElement(LostFoundModal, {
        isOpen: true,
        onClose: vi.fn(),
        showToast: vi.fn(),
      })
    );

  it('çökmeden render eder', () => {
    expect(() => render()).not.toThrow();
  });

  it('durum sayaç şeridini üretir', () => {
    const html = render();
    expect(html).toContain('Tümü (');
    expect(html).toContain('Şoförde / Araçta');
    expect(html).toContain('Merkez Ofis Kasasında');
    expect(html).toContain('Otele Kuryede');
    expect(html).toContain('Teslim Edildi');
  });

  it('arama alanını ve kayıt listesini gösterir', () => {
    const html = render();
    expect(html).toContain('Eşya adı, misafir, otel, araç plakası veya şoför ara');
    expect(html).toContain('Yeni Eşya Kaydı');
  });

  it('isOpen false iken hiçbir şey render etmez', () => {
    const html = renderToString(
      React.createElement(LostFoundModal, {
        isOpen: false,
        onClose: vi.fn(),
        showToast: vi.fn(),
      })
    );
    expect(html).toBe('');
  });
});
