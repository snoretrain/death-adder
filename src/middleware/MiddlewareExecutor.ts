import { Request, Response } from '../network';
import { Middleware } from './Middleware';

export default class MiddlewareExecutor {
  middlewareArray: Middleware[];

  constructor(middlewares: Middleware[]) {
    this.middlewareArray = middlewares;
  }

  async executeMiddleware(
    request: Request,
    response: Response,
    next: Function
  ) {
    for (const middleware of this.middlewareArray) {
      const success = await middleware(request, response);
      if (!success) {
        return;
      }
    }
    await next();
  }

  async iterateMiddlewareExecution(
    request: Request,
    response: Response,
    next: Function,
    middlewares: Middleware[]
  ) {
  }

  addMiddleware(middleware: Middleware) {
    this.middlewareArray.push(middleware);
  }
}
