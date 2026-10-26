/**
 * SettingsInclusionLibrarySection render-smoke testi.
 *
 * Merkezi dahil/hariç havuzu ekranı (Ayarlar sekmesi) çökmeden render olmalı,
 * iki havuzu da sayacıyla listelemeli ve callback'ler yokken de (salt-okunur
 * görünüm) ayakta kalmalı. LostFoundModal emsalindeki gibi: tip kontrolü
 * eksik tanımı yakalamayabilir, render testi yakalar.
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { SettingsInclusionLibrarySection } from '../src/components/admin/settings/SettingsInclusionLibrarySection';
import type { OptionLibrary } from '../src/lib/inclusionLibrary';

const library: OptionLibrary = {
  included: ['Otel transfer', 'Öğle yemeği'],
  excluded: ['Kişisel harcamalar'],
};

describe('SettingsInclusionLibrarySection render', () => {
  const render = (props: Record<string, unknown> = {}) =>
    renderToString(
      React.createElement(SettingsInclusionLibrarySection, {
        inclusionLibrary: library,
        onRememberOption: vi.fn(),
        onForgetOption: vi.fn(),
        showToast: vi.fn(),
        ...props,
      })
    );

  it('çökmeden render eder', () => {
    expect(() => render()).not.toThrow();
  });

  it('her iki havuzu başlık ve sayacıyla listeler', () => {
    const html = render();
    expect(html).toContain('Dahil Olanlar');
    expect(html).toContain('Hariç Olanlar');
    // sayaç rozetleri: 2 dahil, 1 hariç
    expect(html).toContain('>2<');
    expect(html).toContain('>1<');
  });

  it('havuz maddelerini gösterir', () => {
    const html = render();
    expect(html).toContain('Otel transfer');
    expect(html).toContain('Öğle yemeği');
    expect(html).toContain('Kişisel harcamalar');
  });

  it('inclusionLibrary verilmezse boş havuzla ayakta kalır', () => {
    expect(() => render({ inclusionLibrary: undefined })).not.toThrow();
    expect(render({ inclusionLibrary: undefined })).toContain('Havuz boş.');
  });

  it('callback olmadan (salt-okunur) çökmez', () => {
    const html = render({ onRememberOption: undefined, onForgetOption: undefined });
    expect(html).toContain('Otel transfer');
  });
});
