import { Request, Response } from './network';
import { Middleware, MiddlewareExecutor } from './middleware';

export default class Endpoint<
  RequestT extends Request = Request,
  ResponseT extends Response = Response
> extends MiddlewareExecutor {
  constructor(middleware: Middleware[] = []) {
    super(middleware);
  }

  get(request: RequestT, response: ResponseT) {
    response.notFound();
  }

  post(request: RequestT, response: ResponseT) {
    response.notFound();
  }

  put(request: RequestT, response: ResponseT) {
    response.notFound();
  }

  delete(request: RequestT, response: ResponseT) {
    response.notFound();
  }

  patch(request: RequestT, response: ResponseT) {
    response.notFound();
  }
}
