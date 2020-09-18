import { MiddlewareExecutor, Middleware } from './middleware';
import { Request, Response } from './network';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';

export default class StaticResource extends MiddlewareExecutor {
  staticDir: string;
  constructor(directoryPath: string, middleWare: Middleware[] = []) {
    super(middleWare);
    this.staticDir = directoryPath;
  }
  handleRequest(request: Request, response: Response) {
    if (request.method !== 'GET') {
      return response.wrongMethod();
    }
    const extension = request.remainingPath !== '/' ?
      request.remainingPath.slice(1) :
      'index.html';
    const resource = path.join(this.staticDir, extension);
    fs.readFile(resource, 'utf8', (err, data) => {
      if (err) {
        response.notFound();
      } else {
        let contentType = mime.contentType(path.extname(extension));
        if (contentType) {
          response.send(data, contentType);
        } else {
          response.badRequest();
        }
      }
    });
  }
}
