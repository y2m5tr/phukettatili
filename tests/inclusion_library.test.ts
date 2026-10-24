import { describe, it, expect } from 'vitest';
import {
  normalizeOptionLibrary,
  rememberOption,
  forgetOption,
  mergeOptionSources,
  EMPTY_OPTION_LIBRARY,
  type OptionLibrary,
} from '../src/lib/inclusionLibrary';

/**
 * Dahil/hariç havuzu regresyon koruması.
 *
 * HATA BUYDU: tur kayıtlarındaki dahil/hariç maddeleri her turda tek tek
 * saklanıyordu; bir turda yazılan seçenek başka turda önerilmiyordu ve
 * yeni bir tur açan operatör aynı maddeleri yeniden yazmak zorundaydı.
 * Havuz artık turlardan bağımsız kalıcı bir CMS koleksiyonu
 * ('inclusion-library') olarak tutulur.
 */

const lib = (over: Partial<OptionLibrary> = {}): OptionLibrary => ({
  included: [],
  excluded: [],
  ...over,
});

describe('Dahil/Hariç seçenek havuzu', () => {
  it('bozuk kaydı boş havuza düşürür, çökmez', () => {
    expect(normalizeOptionLibrary(null)).toEqual(EMPTY_OPTION_LIBRARY);
    expect(normalizeOptionLibrary(undefined)).toEqual(EMPTY_OPTION_LIBRARY);
    expect(normalizeOptionLibrary('bozuk')).toEqual(EMPTY_OPTION_LIBRARY);
    expect(normalizeOptionLibrary([1, 2, 3])).toEqual(EMPTY_OPTION_LIBRARY);
    expect(normalizeOptionLibrary({ included: 'string-değil', excluded: 42 })).toEqual(
      EMPTY_OPTION_LIBRARY
    );
  });

  it('boşlukları kırpar, tekrarları ve boş maddeleri atar', () => {
    const result = normalizeOptionLibrary({
      included: ['  Öğle yemeği ', 'Öğle yemeği', '', '   ', 'Transfer'],
      excluded: ['Milli park', null, 'Milli park'],
    });
    expect(result.included).toEqual(['Öğle yemeği', 'Transfer']);
    expect(result.excluded).toEqual(['Milli park']);
  });

  it('yeni seçeneği havuza ekler', () => {
    const next = rememberOption(lib(), 'included', 'Şnorkel ekipmanı');
    expect(next.included).toEqual(['Şnorkel ekipmanı']);
    expect(next.excluded).toEqual([]);
  });

  it('aynı seçeneği ikinci kez eklemez ve referansı korur', () => {
    const start = lib({ included: ['Transfer'] });
    const same = rememberOption(start, 'included', '  Transfer  ');
    expect(same).toBe(start);
    expect(same.included).toEqual(['Transfer']);
  });

  it('boş veya yalnızca boşluk olan maddeyi yok sayar', () => {
    const start = lib();
    expect(rememberOption(start, 'included', '')).toBe(start);
    expect(rememberOption(start, 'included', '   ')).toBe(start);
  });

  it('dahil ve hariç listelerini ayrı tutar', () => {
    let library = rememberOption(lib(), 'included', 'Aynı madde');
    library = rememberOption(library, 'excluded', 'Aynı madde');
    expect(library.included).toEqual(['Aynı madde']);
    expect(library.excluded).toEqual(['Aynı madde']);
  });

  it('seçeneği havuzdan siler, yoksa referansı korur', () => {
    const start = lib({ included: ['Transfer', 'Öğle yemeği'] });
    const after = forgetOption(start, 'included', 'Transfer');
    expect(after.included).toEqual(['Öğle yemeği']);
    const unchanged = forgetOption(after, 'included', 'Olmayan');
    expect(unchanged).toBe(after);
  });

  it('tur kaydından madde çıkarmak havuzu silmez', () => {
    // Havuz kalıcı; turdan çıkarma işlemi bu modülden geçmez.
    const library = rememberOption(lib(), 'included', 'Öğle yemeği');
    const tourAfterRemoval = { included: [], excluded: [] };
    const merged = mergeOptionSources(library, 'included', [], [tourAfterRemoval]);
    expect(merged).toEqual(['Öğle yemeği']);
  });

  it('şablon, havuz ve tur kaynaklarını tekrarsız birleştirir', () => {
    const library = lib({ included: ['Havuz maddesi'] });
    const merged = mergeOptionSources(
      library,
      'included',
      ['Şablon maddesi'],
      [{ included: ['Tur maddesi', 'Havuz maddesi'] }]
    );
    expect(merged).toEqual(['Şablon maddesi', 'Havuz maddesi', 'Tur maddesi']);
  });

  it('aynı seçeneği farklı turlarda önerir', () => {
    const library = rememberOption(lib(), 'excluded', 'Milli park girişi');
    const merged = mergeOptionSources(library, 'excluded', [], [
      { excluded: [] },
      { excluded: ['Milli park girişi'] },
    ]);
    expect(merged).toEqual(['Milli park girişi']);
  });
});
