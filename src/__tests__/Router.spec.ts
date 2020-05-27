import Router from '../router';
import { Request, Response } from '../network';
import Endpoint from '../Endpoint';

describe('Router', () => {
  it('calls notFound when not given correct http method', () => {
    const router: Router = new Router();
    const res = {
      notFound: () => {}
    } as Response;
    const spyResponse = jest.spyOn(res, 'notFound');
    const req = { method: 'OTHER' } as Request;
    router.executeEndpointMethod({} as Endpoint, req, res);
    expect(spyResponse).toHaveBeenCalled();
  });
  it('returns a new handler on the null endpoint', () => {
    const router: Router = new Router();
    expect(router.getAssociatedHandler('').handler).toEqual(
      new Endpoint()
    );
  });
});
