import { NgModule } from '@angular/core';

import { AdvancedRenderer } from '../advanced-renderer';
import { AdvancedRendererNoop } from './advanced-renderer';

@NgModule({
  providers: [
    { provide: AdvancedRenderer, useClass: AdvancedRendererNoop },
  ]
})
export class AdvancedRendererNoopModule { }
