import { ServerResponse } from 'http';

export default class Response extends ServerResponse {
  send(text: string, contentType: string = 'text/plain') {
    this.writeHead(200, { 'Content-Type': contentType });
    this.write(text);
    this.end();
  }

  json(data: object) {
    this.writeHead(200, { 'Content-Type': 'application/json' });
    this.write(JSON.stringify(data));
    this.end();
  }

  created() {
    this.writeHead(201, { 'Content-Type': 'text/plain' });
    this.write('Created');
    this.end();
  }

  badRequest() {
    this.writeHead(400, { 'Content-Type': 'text/plain' });
    this.write('Bad Request');
    this.end();
  }

  unauthorized() {
    this.writeHead(401);
    this.write('Not Authorized');
    this.end();
  }

  forbidden() {
    this.writeHead(403);
    this.write('Forbidden');
    this.end();
  }

  notFound() {
    this.writeHead(404, { 'Content-Type': 'text/plain' });
    this.write('Not Found');
    this.end();
  }

  error() {
    this.writeHead(500, { 'Content-Type': 'text/plain' });
    this.write('Internal Server Error');
    this.end();
  }

  wrongMethod() {
    this.writeHead(405, { 'Content-Type': 'text/plain' });
    this.write('Method Not Allowed');
    this.end();
  }
}
