import { ServerResponse } from 'http';

export default class Response extends ServerResponse {
  unauthorized() {
    this.writeHead(401);
    this.write('Not Authorized');
    this.end();
  }

  send(text: string) {
    this.writeHead(200, { 'Content-Type': 'text/plain' });
    this.write(text);
    this.end();
  }

  json(data: object) {
    this.writeHead(200, { 'Content-Type': 'application/json' });
    this.write(JSON.stringify(data));
    this.end();
  }

  error() {
    this.writeHead(500, { 'Content-Type': 'text/plain' });
    this.write('Internal Server Error');
    this.end();
  }

  notFound() {
    this.writeHead(404, { 'Content-Type': 'text/plain' });
    this.write('Not Found');
    this.end();
  }
}
