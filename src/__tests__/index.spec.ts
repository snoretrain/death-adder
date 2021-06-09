import got from 'got';
import {
  Server,
  Request,
  Response,
  Endpoint,
  Router
} from '../index';
import {
  CatEndpoint,
  DogEndpoint,
  FooEndpoint,
  BarEndpoint,
  HelloEndpoint,
  WorldEndpoint,
  ErrorEndpoint,
  JSONEndpoint,
  ForbiddenEndpoint
} from './resources/endpoints';

describe('Integration', () => {
  const server: Server = new Server();
  beforeAll(() => {
    server.listen(3000);
  });
  describe('Router', () => {
    it('maps to the null or slash path', async () => {
      const router: Router = new Router();
      router.addHandler('/', CatEndpoint);
      server.setRouter(router);

      let result = await got('http://localhost:3000/');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Cat');
      result = await got('http://localhost:3000');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Cat');

      const routerWithNull: Router = new Router();
      routerWithNull.addHandler('', CatEndpoint);
      server.setRouter(routerWithNull);

      result = await got('http://localhost:3000/');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Cat');
      result = await got('http://localhost:3000');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Cat');
    });
    it('maps within one router at single level', async () => {
      const router: Router = new Router();
      router.addHandler('/dog', DogEndpoint);
      router.addHandler('/cat', CatEndpoint);
      server.setRouter(router);
      let result = await got('http://localhost:3000/cat');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Cat');
      result = await got('http://localhost:3000/dog');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Dog');
      server.setRouter(router);
    });
    it('distributes to nested routers', async () => {
      const router: Router = new Router();
      const nestedRouter: Router = new Router();
      nestedRouter.addHandler('/cat', CatEndpoint);
      nestedRouter.addHandler('/dog', DogEndpoint);
      router.addHandler('/nested', nestedRouter);
      server.setRouter(router);

      let result = await got('http://localhost:3000/nested/cat');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Cat');
      result = await got('http://localhost:3000/nested/dog');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Dog');
    });
    it('allows additional router to match lower specificity', async () => {
      const router: Router = new Router();
      const nestedRouter: Router = new Router();
      nestedRouter.addHandler('/dog', DogEndpoint);
      nestedRouter.addHandler('else/dog', DogEndpoint);
      router.addHandler('/foo', nestedRouter);
      router.addHandler('/foo/bar', BarEndpoint);
      server.setRouter(router);

      let result = await got('http://localhost:3000/foo/dog');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Dog');
      result = await got('http://localhost:3000/foo/else/dog');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Dog');
      result = await got('http://localhost:3000/foo/bar');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Bar');
    });
    it('returns 404 on non existent endpoint', async () => {
      const router: Router = new Router();
      router.addHandler('/cat', CatEndpoint);
      router.addHandler('/dog', DogEndpoint);
      server.setRouter(router);
      const result = await got('http://localhost:3000/notfound', {
        throwHttpErrors: false
      });
      expect(result.statusCode).toEqual(404);
    });
    it('matches most specific path', async () => {
      const router: Router = new Router();
      router.addHandler('/foo', FooEndpoint);
      router.addHandler('/foo/bar', BarEndpoint);
      server.setRouter(router);
      const result = await got('http://localhost:3000/foo/bar');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Bar');
    });
    it('matches path with variables and adds parameters', async () => {
      const router: Router = new Router();
      router.addHandler('/foo/:hello', HelloEndpoint);
      router.addHandler('/foo/bar/:hello/extra/stuff', HelloEndpoint);
      router.addHandler('/foo/:hello/extra', HelloEndpoint);
      router.addHandler('/foo/stuff/:hello', HelloEndpoint);
      server.setRouter(router);
      let result = await got('http://localhost:3000/foo/world');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('world');
      result = await got(
        'http://localhost:3000/foo/bar/world/extra/stuff'
      );
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('world');
      result = await got('http://localhost:3000/foo/world/extra');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('world');
      result = await got('http://localhost:3000/foo/stuff/world');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('world');
    });
    it('sends 400 on bad request param validation', async () => {
      const router: Router = new Router();
      const validator = (param: string) => {
        if (/^-{0,1}\d+$/.test(param)) {
          return true;
        }
        return false;
      };
      router.addHandler('/foo/:hello', HelloEndpoint, validator);
      server.setRouter(router);
      const result = await got('http://localhost:3000/foo/world', {
        throwHttpErrors: false
      });
      expect(result.statusCode).toEqual(400);
    });
    it('matches correct request type to correct Endpoint method', async () => {
      const router: Router = new Router();
      router.addHandler('/hello/world', WorldEndpoint);
      server.setRouter(router);
      let result = await got('http://localhost:3000/hello/world');
      expect(result.body).toEqual('get');
      result = await got.post('http://localhost:3000/hello/world');
      expect(result.body).toEqual('Created');
      result = await got.put('http://localhost:3000/hello/world');
      expect(result.body).toEqual('put');
      result = await got.delete('http://localhost:3000/hello/world');
      expect(result.body).toEqual('delete');
      result = await got.patch('http://localhost:3000/hello/world');
      expect(result.body).toEqual('patch');
    });
    it('takes instance of Endpoint or Endpoint class definition', async () => {
      const router: Router = new Router();
      router.addHandler('/cat', CatEndpoint);
      const dog: DogEndpoint = new DogEndpoint();
      router.addHandler('/dog', dog);
      server.setRouter(router);
      let result = await got('http://localhost:3000/cat');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Cat');
      result = await got('http://localhost:3000/dog');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Dog');
    });
    it('adds a less specific path if more specific one exists', async () => {
      const router: Router = new Router();
      router.addHandler('/foo/bar', BarEndpoint);
      router.addHandler('/foo', FooEndpoint);
      router.addHandler('/something/cat', new Router());
      router.addHandler('/something/cat/dog', DogEndpoint);
      server.setRouter(router);
      let result = await got('http://localhost:3000/foo');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Foo');
      result = await got('http://localhost:3000/something/cat', {
        throwHttpErrors: false
      });
      expect(result.statusCode).toEqual(404);
    });
    it('allows paths to include trailing slash or no prefix slash', async () => {
      const router: Router = new Router();
      router.addHandler('some/dog/', DogEndpoint);
      server.setRouter(router);
      const result = await got('http://localhost:3000/some/dog');
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('Dog');
    });
    it('overwrites previous endpoint on same path', async () => {
      const router: Router = new Router();
      router.addHandler('/check', CatEndpoint);
      router.addHandler('/check', DogEndpoint);
      server.setRouter(router);
      const result = await got('http://localhost:3000/check');
      expect(result.body).toEqual('Dog');
    });
  });
  describe('Endpoint', () => {
    it('base Endpoint class returns 404 status codes', async () => {
      const router: Router = new Router();
      router.addHandler('/hello', Endpoint);
      server.setRouter(router);
      const noThrow = { throwHttpErrors: false };
      const url = 'http://localhost:3000/hello';
      let result = await got(url, noThrow);
      expect(result.statusCode).toEqual(404);
      result = await got.post(url, noThrow);
      expect(result.statusCode).toEqual(404);
      result = await got.put(url, noThrow);
      expect(result.statusCode).toEqual(404);
      result = await got.delete(url, noThrow);
      expect(result.statusCode).toEqual(404);
      result = await got.patch(url, noThrow);
      expect(result.statusCode).toEqual(404);
    });
    it('returns 500 when endpoint throws error', async () => {
      const router: Router = new Router();
      router.addHandler('/error', ErrorEndpoint);
      server.setRouter(router);
      const result = await got('http://localhost:3000/error', {
        throwHttpErrors: false,
        retry: 0
      });
      expect(result.statusCode).toEqual(500);
    });
    it('gives JSON with correct header when using json', async () => {
      const router: Router = new Router();
      router.addHandler('/json', JSONEndpoint);
      server.setRouter(router);
      const result = await got('http://localhost:3000/json');
      expect(result.headers['content-type']).toEqual(
        'application/json'
      );
      expect(JSON.parse(result.body).hello).toEqual('world');
    });
    it('gives forbidden when endpoint sends forbidden', async () => {
      const router: Router = new Router();
      router.addHandler('/', ForbiddenEndpoint);
      server.setRouter(router);
      const result = await got('http://localhost:3000/', {
        throwHttpErrors: false,
        retry: 0
      });
      expect(result.statusCode).toEqual(403);
    });
  });
  describe('Middleware', () => {
    it('breaks or continues execution on value of middleware', async () => {
      const router: Router = new Router();
      const hello: HelloEndpoint = new HelloEndpoint();
      hello.addMiddleware((request: Request, response: Response) => {
        if (request.headers.authorization !== 'authorized') {
          response.unauthorized();
          return false;
        }
        return true;
      });
      router.addMiddleware((request: Request, response: Response) => {
        if (request.params.hello !== 'tester') {
          response.unauthorized();
          return false;
        }
        return true;
      });
      router.addHandler('/name/:hello', hello);
      server.setRouter(router);
      let result = await got('http://localhost:3000/name/someone', {
        throwHttpErrors: false
      });
      expect(result.statusCode).toEqual(401);
      result = await got('http://localhost:3000/name/tester', {
        throwHttpErrors: false
      });
      expect(result.statusCode).toEqual(401);
      const options = { headers: { authorization: 'authorized' } };
      result = await got(
        'http://localhost:3000/name/tester',
        options
      );
      expect(result.statusCode).toEqual(200);
      expect(result.body).toEqual('tester');
    });
    it('returns 500 when error thrown from middleware', async () => {
      const router: Router = new Router();
      router.addHandler('/any', BarEndpoint);
      router.addMiddleware(() => {
        throw Error('Forced error');
      });
      server.setRouter(router);
      const result = await got('http://localhost:3000/any', {
        throwHttpErrors: false,
        retry: 0
      });
      expect(result.statusCode).toEqual(500);
    });
  });
  describe('Server', () => {
    it('can be started with a different port', async () => {
      const router: Router = new Router();
      router.addHandler('/dog', DogEndpoint);
      server.terminate();
      server.listen(4000);
      server.setRouter(router);
      const result = await got('http://localhost:4000/dog');
      expect(result.statusCode).toEqual(200);
    });
    afterEach(() => {
      server.terminate();
      server.setPort(3000);
      server.listen();
    });
  });
  afterAll(() => {
    server.terminate();
  });
});
