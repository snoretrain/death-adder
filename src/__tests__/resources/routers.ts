import { Router } from '../../index';

export class TestRouter extends Router {
  async handleRequest(request: any, response: any) {
    response.send('Finished');
  }
}
export class ErrorRouter extends Router {
  async handleRequest(request: any, response: any) {
    throw Error('Forced');
  }
}
