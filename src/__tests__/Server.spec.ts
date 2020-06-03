import got from 'got';
import { Server, Request, Response } from '../network';
import Router from '../router';
import { TestRouter, ErrorRouter } from './resources/routers';

describe('Server', () => {
  it('instantiates with correct router and port', () => {
    const server: Server = new Server();
    expect(server.port).toEqual(3000);
    expect(server.router).toBeFalsy();
    const router: Router = new Router();
    const port: number = 4000;
    const serverWithOptions: Server = new Server(router, port);
    expect(serverWithOptions.router).toBe(router);
    expect(serverWithOptions.port).toBe(port);
  });
  describe('Networked', () => {
    let server: Server;
    beforeAll(() => {
      server = new Server();
      server.listen(3005);
    });
    it('calls handle request of router from requestDispatcher', async (done) => {
      const router: TestRouter = new TestRouter();
      const spy = jest.spyOn(router, 'handleRequest');
      server.setRouter(router);
      await got('http://localhost:3005/');
      expect(spy).toHaveBeenCalled();
      done();
    });
    it('returns 500 when handleRequest throws', async (done) => {
      const router: ErrorRouter = new ErrorRouter();
      const spy = jest.spyOn(router, 'handleRequest');
      server.setRouter(router);
      const options = { throwHttpErrors: false, retry: 0 };
      const response = await got('http://localhost:3005/', options);
      expect(spy).toHaveBeenCalled();
      expect(response.statusCode).toEqual(500);
      done();
    });
    it('attaches the body of incoming messages', async (done) => {
      const router: Router = new TestRouter();
      const body = { hello: 'world' };
      router.handleRequest = jest
        .fn()
        .mockImplementation(
          async (request: Request, response: Response) => {
            if (
              request.headers['content-type'] === 'application/json'
            ) {
              expect(request.json).toEqual(body);
            } else {
              expect(request.body).toEqual(JSON.stringify(body));
            }
            response.send('OK');
          }
        );
      server.setRouter(router);
      await got.post('http://localhost:3005/', {
        headers: {
          'content-type': 'application/json'
        },
        json: body
      });

      await got.post('http://localhost:3005/', {
        body: JSON.stringify(body)
      });
      done();
    });
    afterAll(() => {
      server.terminate();
    });
  });
});
