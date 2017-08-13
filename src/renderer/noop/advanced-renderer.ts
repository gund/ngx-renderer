import { Injectable } from '@angular/core';

import { AdvancedRenderer, RendererGlobalTarget } from '../advanced-renderer';
import { ExpressionArguments } from '../expression';

@Injectable()
export class AdvancedRendererNoop extends AdvancedRenderer {
  execute(expression: string, args: ExpressionArguments): Promise<any> {
    return Promise.resolve();
  }

  invokeElementMethod(element: any, method: string, args: any[]): Promise<any> {
    return Promise.resolve();
  }

  invokeGlobalTargetMethod(target: RendererGlobalTarget, method: string, args: any[]): Promise<any> {
    return Promise.resolve();
  }

  setGlobalTargetPropery(target: RendererGlobalTarget, prop: string, value: any): void { }

  getGlobalTargetProperty(target: RendererGlobalTarget, prop: string): Promise<any> {
    return Promise.resolve();
  }
}
