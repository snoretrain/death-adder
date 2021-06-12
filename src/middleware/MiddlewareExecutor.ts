import { Request, Response } from '../network';
import { BooleanMiddleware, Middleware } from './Middleware';

export default class MiddlewareExecutor {
  middlewareArray: Middleware[];

  constructor(middlewares: Middleware[]) {
    this.middlewareArray = middlewares;
  }

  async executeMiddleware(
    request: Request,
    response: Response,
    next: Function,
    middlewares: Middleware[] = this.middlewareArray
  ): Promise<void> {
    if (middlewares.length < 1) {
      return next();
    }
    if (middlewares[0].length === 3) {
      return this.executeCallbackMiddleware(
        request,
        response,
        next,
        middlewares
      );
    }
    const success = await (<BooleanMiddleware>middlewares[0])(
      request,
      response
    );
    if (!success) {
      return Promise.resolve();
    }
    return this.executeMiddleware(
      request,
      response,
      next,
      middlewares.slice(1)
    );
  }

  async executeCallbackMiddleware(
    request: Request,
    response: Response,
    next: Function,
    middlewares: Middleware[]
  ): Promise<void> {
    return new Promise((resolve) => {
      middlewares[0](request, response, async (success) => {
        if (success) {
          await this.executeMiddleware(
            request,
            response,
            next,
            middlewares.slice(1)
          );
        }
        resolve();
      });
    });
  }

  addMiddleware(middleware: Middleware) {
    this.middlewareArray.push(middleware);
  }
}
