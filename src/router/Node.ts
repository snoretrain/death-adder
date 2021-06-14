import Endpoint from '../Endpoint';
import { PathSegment } from '../path';
import { Router } from './internal';
import { Request, Response } from '../network';

export type Handler<R extends Request, S extends Response> =
  | Router<R, S>
  | Endpoint<R, S>
  | (new () => Endpoint<R, S>);

export type Validator = (param: string) => boolean;

export default class Node<R extends Request, S extends Response> {
  nextState: number;

  variableName: string;

  handler: Handler<R, S>;

  validator: Validator;

  constructor(
    pathSegment?: PathSegment,
    nextState?: number,
    handler?: Handler<R, S>
  ) {
    this.handler = handler;
    if (pathSegment.isVariable()) {
      this.variableName = pathSegment.variableName;
    }
    this.nextState = handler ? 0 : nextState;
  }

  isRouter(): boolean {
    return this.handler instanceof Router;
  }

  isEndpoint(): boolean {
    if (!this.handler) {
      return false;
    }
    return (
      this.handler instanceof Endpoint ||
      typeof this.handler === 'function'
    );
  }

  addValidator(validator: Validator) {
    this.validator = validator;
  }
}
