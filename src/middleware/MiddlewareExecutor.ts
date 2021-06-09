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
    
  }

  async iterateMiddlewareExecution(
    request: Request,
    response: Response,
    next: Function,
    middlewares: Middleware[]
  ) {
    if (middlewares.length < 1) {
      await next();
    }
    const call = middlewares[0](request, response, () => {

    })
    if (call instanceof Promise) {
      const status: Boolean = await call;
      if (status) {
        this.iterateMiddlewareExecution(request, response, () => {}, middlewares.slice(1));
      }
    }
  }

  addMiddleware(middleware: Middleware) {
    this.middlewareArray.push(middleware);
  }
}
