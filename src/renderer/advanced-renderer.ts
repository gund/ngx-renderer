import { ExpressionArguments } from './expression';

export type RendererGlobalTarget = 'window' | 'document';

export enum AdvancedRendererMethod {
  execute,
  invokeElementMethod,
  invokeGlobalTargetMethod,
  setGlobalTargetPropery,
  getGlobalTargetProperty,
}

export abstract class AdvancedRenderer {
  abstract execute(expression: string, args?: ExpressionArguments): Promise<any>;
  abstract invokeElementMethod(element: any, method: string, args?: any[]): Promise<any>;
  abstract invokeGlobalTargetMethod(target: RendererGlobalTarget, method: string, args?: any[]): Promise<any>;
  abstract setGlobalTargetPropery(target: RendererGlobalTarget, prop: string, value: any): void;
  abstract getGlobalTargetProperty(target: RendererGlobalTarget, prop: string): Promise<any>;

  getMethod(method: AdvancedRendererMethod): (...args: any[]) => any {
    switch (method) {
      case AdvancedRendererMethod.execute: return this.execute;
      case AdvancedRendererMethod.getGlobalTargetProperty: return this.getGlobalTargetProperty;
      case AdvancedRendererMethod.invokeElementMethod: return this.invokeElementMethod;
      case AdvancedRendererMethod.invokeGlobalTargetMethod: return this.invokeGlobalTargetMethod;
      case AdvancedRendererMethod.setGlobalTargetPropery: return this.setGlobalTargetPropery;
      default: throw Error(`AdvancedRenderer: Unkown method [${method}]`);
    }
  }
}
