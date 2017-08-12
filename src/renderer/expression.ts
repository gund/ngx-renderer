import { AdvancedRendererMethod } from './advanced-renderer';

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
