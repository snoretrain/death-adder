import { Request, Response } from '../network';

type AsyncMiddleware = (
  request: Request,
  response: Response
) => Promise<boolean>;
type SyncMiddleware = (
  request: Request,
  response: Response
) => boolean;

export type Middleware = AsyncMiddleware | SyncMiddleware;
