import { ExpressionArguments } from './expression';

export abstract class AdvancedRenderer {
  abstract execute(expression: string, args?: ExpressionArguments): Promise<any>;
}

export enum AdvancedRendererMethod {
  execute,
}
