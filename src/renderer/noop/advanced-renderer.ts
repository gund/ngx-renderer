import { Injectable } from '@angular/core';

import { AdvancedRenderer } from '../advanced-renderer';
import { ExpressionArguments } from '../expression';

@Injectable()
export class AdvancedRendererNoop implements AdvancedRenderer {
  public execute(expression: string, args: ExpressionArguments): Promise<any> {
    return Promise.resolve();
  }
}
