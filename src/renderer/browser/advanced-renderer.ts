import { Injectable, Provider } from '@angular/core/core';

import { AdvancedRenderer, AdvancedRendererMethod, RendererGlobalTarget } from '../advanced-renderer';
import {
  AllExpressions,
  ExpressionArguments,
  isCallExpression,
  isElementExpression,
  isExpression,
  isLiteralExpression,
} from '../expression';

@Injectable()
export class AdvancedRendererImpl extends AdvancedRenderer {
  execute(expression: string, args?: ExpressionArguments): Promise<any> {
    const { argNames, argsResolved } = this._resolveArgs(args);
    const fn = new Function(argNames.join(','), expression);
    return Promise.resolve().then(() => fn(...argsResolved));
  }

  invokeElementMethod(element: any, method: string, args: any[]): Promise<any> {
    return this.execute(`return element.${method}.apply(element, args)`, { element, args });
  }

  invokeGlobalTargetMethod(target: RendererGlobalTarget, method: string, args: any[]): Promise<any> {
    return this.execute(`return ${target}.${method}.apply(${target}, args)`, { args });
  }

  setGlobalTargetPropery(target: RendererGlobalTarget, prop: string, value: any): void {
    this.execute(`${target}.${prop} = value`, { value });
  }

  getGlobalTargetProperty(target: RendererGlobalTarget, prop: string): Promise<any> {
    return this.execute(`return ${target}.${prop}`);
  }

  private _resolveArgs(args: ExpressionArguments = {}) {
    const argNames = Object.keys(args);
    const argsResolved = this._resolveArgsArray(argNames.map(name => args[name]));
    return { argNames, argsResolved };
  }

  private _resolveArgsArray(args: AllExpressions[]): any[] {
    return args.map(arg => this._resolveExpression(arg));
  }

  private _resolveExpression(expr: AllExpressions): any {
    if (isExpression(expr)) {
      if (isLiteralExpression(expr) || isElementExpression(expr)) {
        return expr.value;
      }
      if (isCallExpression(expr)) {
        return this.getMethod(expr.method)(...this._resolveArgsArray(expr.args));
      }
      throw Error(`Unknown expression type '${expr.__expr_type}'`);
    } else {
      return expr;
    }
  }
}

export const ADVANCED_RENDERER_PROVIDERS: Provider[] = [
  { provide: AdvancedRenderer, useClass: AdvancedRendererImpl },
];
