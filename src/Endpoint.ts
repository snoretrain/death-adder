import { Request, Response } from './network';
import { Middleware, MiddlewareExecutor } from './middleware';

export default class Endpoint extends MiddlewareExecutor {
  constructor(middleware: Middleware[] = []) {
    super(middleware);
  }

  get(request: Request, response: Response) {
    response.notFound();
  }

  post(request: Request, response: Response) {
    response.notFound();
  }

  put(request: Request, response: Response) {
    response.notFound();
  }

  delete(request: Request, response: Response) {
    response.notFound();
  }

  patch(request: Request, response: Response) {
    response.notFound();
  }
}
