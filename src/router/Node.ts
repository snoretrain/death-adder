import Endpoint from '../Endpoint';
import { PathSegment } from '../path';
import { Router } from './internal';

export type Handler = Router | Endpoint | typeof Endpoint;

export type Validator = (param: string) => boolean;

export default class Node {
  nextState: number;

  variableName: string;

  handler: Handler;

  validator: Validator;

  constructor(
    pathSegment?: PathSegment,
    nextState?: number,
    handler?: Handler
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
