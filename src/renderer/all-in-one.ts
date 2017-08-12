import { Injectable, NgModule, PLATFORM_INITIALIZER, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  bootstrapWorkerUi,
  ClientMessageBrokerFactory,
  FnArg,
  SerializerTypes,
  ServiceMessageBrokerFactory,
  UiArguments,
  WorkerAppModule,
} from '@angular/platform-webworker';
import { Serializer } from '@angular/platform-webworker/src/web_workers/shared/serializer';

// Interfaces

export abstract class AdvancedRenderer {
  abstract execute(expression: string, args?: ExpressionArguments): Promise<any>;
}

export enum AdvancedRendererMethod {
  execute,
}

export interface ExpressionArguments {
  [argName: string]: AllExpressions;
}

export enum ExpressionType {
  Abstract,
  Literal,
  Call,
  Element,
}

export interface ExpressionArgument {
  __expr_type: ExpressionType.Abstract;
}

export interface LiteralExpression<T> {
  __expr_type: ExpressionType.Literal;
  value: T;
}

export interface ElementExpression {
  __expr_type: ExpressionType.Element;
  value: any;
}

export interface CallExpression {
  __expr_type: ExpressionType.Call;
  method: AdvancedRendererMethod;
  args?: AllExpressions[];
}

export type PrimitiveType = object | string | number | boolean | null | undefined;
export type Expression = LiteralExpression<any> | CallExpression | ElementExpression | ExpressionArgument;
export type AllExpressions = Expression | PrimitiveType;
export type AssertExpression<T extends Expression> = (expr: Expression) => expr is T;

export function literalExpression<T>(value: T): LiteralExpression<T> {
  return { __expr_type: ExpressionType.Literal, value };
}

export function elementExpression(element: any): ElementExpression {
  return { __expr_type: ExpressionType.Element, value: element };
}

export function callExpression<T>(method: AdvancedRendererMethod, args?: AllExpressions[]): CallExpression {
  return { __expr_type: ExpressionType.Call, method, args };
}

export function isExpression(obj: AllExpressions | any): obj is Expression {
  return obj && (<Expression>obj).__expr_type !== undefined;
}

export function isExpressionOfType<T extends Expression>(type: ExpressionType, expr: Expression): expr is T {
  return expr && expr.__expr_type === type;
}

export const isLiteralExpression = isExpressionOfType.bind(null, ExpressionType.Literal) as AssertExpression<LiteralExpression<any>>;
export const isElementExpression = isExpressionOfType.bind(null, ExpressionType.Element) as AssertExpression<ElementExpression>;
export const isCallExpression = isExpressionOfType.bind(null, ExpressionType.Call) as AssertExpression<CallExpression>;

// Implementation

export class AdvancedRendererImpl implements AdvancedRenderer {
  execute(expression: string, args?: ExpressionArguments): Promise<any> {
    const { argNames, argsResolved } = this._resolveArgs(args);
    const fn = new Function(argNames.join(','), expression);
    return Promise.resolve().then(() => fn(...argsResolved));
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
        const method = AdvancedRendererMethod[expr.method];
        return this[method](...this._resolveArgsArray(expr.args));
      }
      throw Error(`Unknown expression type '${expr.__expr_type}'`);
    } else {
      return expr;
    }
  }
}

/**
 * Main implementation providers of Advanced Renderer
 */
export const ADVANCED_RENDERER_PROVIDERS: Provider[] = [
  { provide: AdvancedRenderer, useClass: AdvancedRendererImpl },
];

/**
 * Module to use in Browser as a single-threaded app
 */
@NgModule({
  providers: ADVANCED_RENDERER_PROVIDERS
})
export class AdvancedRendererModule { }

export const RENDERER_CHANNEL = 'RENDERER_CHANNEL';
export const RENDERER_CALL_TASK = 'RENDERER_CALL_TASK';

// Worker Thread (./worker.ts)

@Injectable()
export class AdvancedRendererWorker implements AdvancedRenderer {
  private broker = this.brokerFactory.createMessageBroker(RENDERER_CHANNEL, false);

  constructor(
    private brokerFactory: ClientMessageBrokerFactory,
  ) { }

  execute(expression: string, args?: ExpressionArguments): Promise<any> {
    return this._callTask('execute', [expression, args]);
  }

  private _callTask(task: string, args?: any[]): Promise<any> {
    const taskArg = new FnArg(task, SerializerTypes.PRIMITIVE);
    const argsArg = new FnArg(args, SerializerTypes.PRIMITIVE);
    const uiArgs = new UiArguments(RENDERER_CALL_TASK, [taskArg, argsArg]);
    return this.broker.runOnService(uiArgs, SerializerTypes.PRIMITIVE);
  }
}

/**
 * Module to use in Webworker application (on worker thread)
 */
@NgModule({
  providers: [
    { provide: AdvancedRenderer, useClass: AdvancedRendererWorker },
  ]
})
export class AdvancedRendererWorkerModule { }

// UI Thread

@Injectable()
export class AdvancedRendererUi {
  private broker = this.brokerFactory.createMessageBroker(RENDERER_CHANNEL, false);

  constructor(
    private brokerFactory: ServiceMessageBrokerFactory,
    private renderer: AdvancedRenderer,
    private serializer: Serializer
  ) { }

  setup() {
    this.broker.registerMethod(
      RENDERER_CALL_TASK,
      [SerializerTypes.PRIMITIVE, SerializerTypes.PRIMITIVE],
      this._callTask.bind(this),
      SerializerTypes.PRIMITIVE);
  }

  private _callTask(task: string, args: any[]): any {
    return this.renderer[task](...this._deserializeArgs(args));
  }

  private _deserializeArgs(arg: AllExpressions | any): any {
    if (Array.isArray(arg)) {
      return arg.map(a => this._deserializeArgs(a));
    } else if (typeof arg === 'object') {
      if (isElementExpression(arg)) {
        arg.value = this.serializer.deserialize(arg.value, SerializerTypes.RENDER_STORE_OBJECT);
      } else {
        Object.keys(arg || {}).forEach(key => arg[key] = this._deserializeArgs(arg[key]));
      }
    }
    return arg;
  }
}

export function initUiRenderer(renderer: AdvancedRendererUi) {
  return () => renderer.setup();
}

/**
 * Providers to import on UI side of application
 */
export const ADVANCED_RENDERER_UI_PROVIDERS: Provider[] = [
  ADVANCED_RENDERER_PROVIDERS,
  AdvancedRendererUi,
  { provide: PLATFORM_INITIALIZER, useFactory: initUiRenderer, deps: [AdvancedRendererUi], multi: true },
];

// Usage Example

// On UI side

bootstrapWorkerUi('/worker.js', ADVANCED_RENDERER_UI_PROVIDERS);

// On Worker side (somewhere in ./worker.ts)

@NgModule({
  imports: [
    WorkerAppModule,
    AdvancedRendererWorkerModule,
  ]
})
export class AppInWorkerModule {
  constructor(renderer: AdvancedRenderer) {
    const x = Math.random() * 100;
    renderer
      .execute('return y.then(y => x * 2 + y)', {
        x: literalExpression(x),
        y: callExpression(AdvancedRendererMethod.execute, ['return performance.now()']),
      })
      .then(res => console.log(res));
  }
}

// Without Web Worker

@NgModule({
  imports: [
    BrowserModule,
    AdvancedRendererModule,
  ]
})
export class AppModule {
  constructor(renderer: AdvancedRenderer) {
    const x = Math.random() * 100;
    renderer
      .execute('return y.then(y => x * 2 + y)', {
        x: literalExpression(x),
        y: callExpression(AdvancedRendererMethod.execute, ['return performance.now()']),
      })
      .then(res => console.log(res));
  }
}
