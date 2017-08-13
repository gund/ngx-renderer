import { Injectable } from '@angular/core';
import { ClientMessageBrokerFactory, FnArg, SerializerTypes, UiArguments } from '@angular/platform-webworker';

import { AdvancedRenderer } from '../../advanced-renderer';
import { ExpressionArguments } from '../../expression';
import { RENDERER_CALL_TASK, RENDERER_CHANNEL } from '../shared/advanced-renderer';

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
