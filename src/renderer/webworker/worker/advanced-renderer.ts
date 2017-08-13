import { Injectable } from '@angular/core';
import { ClientMessageBrokerFactory, FnArg, SerializerTypes, UiArguments } from '@angular/platform-webworker';

import { AdvancedRenderer, AdvancedRendererMethod, RendererGlobalTarget } from '../../advanced-renderer';
import { elementExpression, ExpressionArguments } from '../../expression';
import { RENDERER_CALL_TASK, RENDERER_CHANNEL } from '../shared/advanced-renderer';

@Injectable()
export class AdvancedRendererWorker extends AdvancedRenderer {
  private broker = this.brokerFactory.createMessageBroker(RENDERER_CHANNEL, false);

  constructor(
    private brokerFactory: ClientMessageBrokerFactory,
  ) { super() }

  execute(expression: string, args?: ExpressionArguments): Promise<any> {
    return this._callTask(AdvancedRendererMethod.execute, [expression, args]);
  }

  invokeElementMethod(element: any, method: string, args?: any[]): Promise<any> {
    return this._callTask(AdvancedRendererMethod.invokeElementMethod, [elementExpression(element), method, args]);
  }

  invokeGlobalTargetMethod(target: RendererGlobalTarget, method: string, args?: any[]): Promise<any> {
    return this._callTask(AdvancedRendererMethod.invokeGlobalTargetMethod, [target, method, args]);
  }

  setGlobalTargetPropery(target: RendererGlobalTarget, prop: string, value: any): void {
    this._callTask(AdvancedRendererMethod.setGlobalTargetPropery, [target, prop, value]);
  }

  getGlobalTargetProperty(target: RendererGlobalTarget, prop: string): Promise<any> {
    return this._callTask(AdvancedRendererMethod.getGlobalTargetProperty, [target, prop]);
  }

  private _callTask(task: AdvancedRendererMethod, args?: any[]): Promise<any> {
    const taskArg = new FnArg(task, SerializerTypes.PRIMITIVE);
    const argsArg = new FnArg(args, SerializerTypes.PRIMITIVE);
    const uiArgs = new UiArguments(RENDERER_CALL_TASK, [taskArg, argsArg]);
    return this.broker.runOnService(uiArgs, SerializerTypes.PRIMITIVE);
  }
}
