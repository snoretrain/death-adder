import { Request, Response, Endpoint } from '../../index';

export class CatEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.send('Cat');
  }
}
export class DogEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.send('Dog');
  }
}
export class FooEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.send('Foo');
  }
}
export class BarEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.send('Bar');
  }
}
export class HelloEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.send(request.params.hello);
  }
}
export class WorldEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.send('get');
  }

  post(request: Request, response: Response) {
    response.created();
  }

  put(request: Request, response: Response) {
    response.send('put');
  }

  delete(request: Request, response: Response) {
    response.send('delete');
  }

  patch(request: Request, response: Response) {
    response.send('patch');
  }
}
export class ErrorEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    throw Error('Forcing error');
  }
}
export class JSONEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.json({ hello: 'world' });
  }
}

export class ForbiddenEndpoint extends Endpoint {
  get(request: Request, response: Response) {
    response.forbidden();
  }
}
