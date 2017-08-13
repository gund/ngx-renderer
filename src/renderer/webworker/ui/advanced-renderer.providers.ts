import { PLATFORM_INITIALIZER, Provider } from '@angular/core';

import { ADVANCED_RENDERER_PROVIDERS } from '../../browser/advanced-renderer';
import { AdvancedRendererUi } from './advanced-renderer';

export function initUiRenderer(renderer: AdvancedRendererUi) {
  return () => renderer.setup();
}

export const ADVANCED_RENDERER_UI_PROVIDERS: Provider[] = [
  ADVANCED_RENDERER_PROVIDERS,
  AdvancedRendererUi,
  { provide: PLATFORM_INITIALIZER, useFactory: initUiRenderer, deps: [AdvancedRendererUi], multi: true },
];
