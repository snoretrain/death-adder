import Endpoint from '../Endpoint';
import { PathSegment } from '../path';
import { Router } from './internal';
import { StaticResource } from '../index';

export type Handler = Router | Endpoint | typeof Endpoint | StaticResource;

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

  isNonEndpointHandler(): boolean {
    return (
      this.handler instanceof Router ||
      this.handler instanceof StaticResource
    );
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
