import url from 'url';
import { IncomingMessage } from 'http';

export default class Request extends IncomingMessage {
  remainingPath: string;

  params: { [key: string]: string };

  body?: any;

  json?: { [key: string]: any };

  attachments?: { [key: string]: any };

  constructor(socket: any) {
    super(socket);
    this.params = {};
  }

  initRemainingPath() {
    const parsedUrl = url.parse(this.url);
    this.remainingPath = parsedUrl.pathname;
  }

  setRemainingPath(path: string) {
    this.remainingPath = path;
  }

  updateParams(params: { [key: string]: string }) {
    Object.assign(this.params, params);
  }
}
