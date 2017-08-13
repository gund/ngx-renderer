import { Injectable } from '@angular/core';
import { SerializerTypes, ServiceMessageBrokerFactory } from '@angular/platform-webworker';
import { Serializer } from '@angular/platform-webworker/src/web_workers/shared/serializer';

import { AdvancedRenderer, AdvancedRendererMethod } from '../../advanced-renderer';
import { AllExpressions, isElementExpression } from '../../expression';
import { RENDERER_CALL_TASK, RENDERER_CHANNEL } from '../shared/advanced-renderer';

@Injectable()
export class AdvancedRendererUi {
  private broker = this.brokerFactory.createMessageBroker(RENDERER_CHANNEL, false);

  constructor(
    private brokerFactory: ServiceMessageBrokerFactory,
    private renderer: AdvancedRenderer,
    private serializer: Serializer,
  ) { }

  setup() {
    this.broker.registerMethod(
      RENDERER_CALL_TASK,
      [SerializerTypes.PRIMITIVE, SerializerTypes.PRIMITIVE],
      this._callTask.bind(this),
      SerializerTypes.PRIMITIVE);
  }

  private _callTask(task: AdvancedRendererMethod, args: any[]): any {
    return this.renderer.getMethod(task)(...this._deserializeArgs(args));
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
