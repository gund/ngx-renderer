import { NgModule } from '@angular/core';

import { AdvancedRenderer } from '../../advanced-renderer';
import { AdvancedRendererWorker } from './advanced-renderer';

@NgModule({
  providers: [
    { provide: AdvancedRenderer, useClass: AdvancedRendererWorker },
  ]
})
export class AdvancedRendererWorkerModule { }
