import { Request, Response } from '../network';

type AsyncMiddleware = (
  request: Request,
  response: Response
) => Promise<boolean>;

type SyncMiddleware = (
  request: Request,
  response: Response
) => Boolean;

export type BooleanMiddleware = AsyncMiddleware | SyncMiddleware;

export type CallbackMiddleware = (
  request: Request,
  response: Response,
  callback: (val: Boolean) => void
) => void;

export type Middleware = BooleanMiddleware | CallbackMiddleware;
