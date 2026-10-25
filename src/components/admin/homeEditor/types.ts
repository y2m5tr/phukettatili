import type { Dispatch, SetStateAction } from 'react';

// HomeEditorTab alt sekmelerinin ortak prop sözleşmesi. Her panel yalnızca
// kullandığı alanları destructure eder; fazladan prop zararsızdır.
export interface HomeEditorPanelProps {
  homeSettings: any;
  setHomeSettings: Dispatch<SetStateAction<any>>;
  getImageUrl: (img?: string) => string;
  openPicker: (title: string, currentValue: string, onSelect: (url: string) => void) => void;
}
