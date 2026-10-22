import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import PublicErrorBoundary from '../src/components/ui/PublicErrorBoundary';

describe('PublicErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const html = renderToString(
      React.createElement(
        PublicErrorBoundary,
        null,
        React.createElement('div', null, 'Güvenli İçerik')
      )
    );
    expect(html).toContain('Güvenli İçerik');
  });

  it('renders fallback when state hasError is true', () => {
    class FailingComponent extends PublicErrorBoundary {
      constructor(props: any) {
        super(props);
        this.state = { hasError: true, error: new Error('Simulated error') };
      }
    }

    const html = renderToString(
      React.createElement(
        FailingComponent,
        { fallbackTitle: 'Hata Yakalandı' },
        React.createElement('div', null, 'Gizli')
      )
    );
    expect(html).toContain('Hata Yakalandı');
    expect(html).not.toContain('Gizli');
  });
});
