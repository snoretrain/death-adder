import http from 'http';
import Router from '../router';
import Request from './Request';
import Response from './Response';

export default class Server {
  server: http.Server;

  router: Router;

  port: number;

  constructor(router?: Router, port?: number) {
    this.router = router;
    this.requestDispatcher = this.requestDispatcher.bind(this);
    this.port = port || 3000;
  }

  requestDispatcher(request: Request, response: Response) {
    request.initRemainingPath();
    let data = '';
    request.on('data', (chunk) => {
      data += chunk.toString();
    });
    request.on('end', async () => {
      if (data) {
        if (request.headers['content-type'] === 'application/json') {
          request.json = JSON.parse(data);
        } else {
          request.body = data;
        }
      }
      try {
        await this.router.handleRequest(request, response);
      } catch (e) {
        response.error();
      }
    });
  }

  setRouter(router: Router) {
    this.router = router;
  }

  listen(port?: number) {
    this.server = http.createServer(
      {
        ServerResponse: Response,
        IncomingMessage: Request
      },
      this.requestDispatcher
    );
    this.server.listen(port || this.port);
  }

  terminate() {
    this.server.close();
  }

  setPort(port: number) {
    this.port = port;
  }
}
