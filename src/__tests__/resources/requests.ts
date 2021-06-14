import { Request } from '../../index';

export default class PuppyRequest extends Request {
  puppy: string;

  constructor(socket: any) {
    super(socket);
    this.puppy = 'Labradoodle';
  }
}
