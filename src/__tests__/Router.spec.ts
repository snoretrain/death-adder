import Router from '../router';
import { Request, Response } from '../network';
import { VARIABLE } from '../path';
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
  it('adds a parameter validator to appropriate node', () => {
    const router: Router = new Router();
    const validator = (param: string) => {
      if (/^-{0,1}\d+$/.test(param)) {
        return true;
      }
      return false;
    };

    router.addHandler('/hello/:world', Endpoint, validator);
    expect(router.graph.dfa[1][VARIABLE].validator).toEqual(
      validator
    );
  });
  it('calls the validator when getting associated handler', () => {
    const router: Router = new Router();
    const validator = jest.fn(() => {
      return true;
    });

    router.addHandler('/hello/:world', Endpoint, validator);
    router.getAssociatedHandler('/hello/thing');
    expect(validator).toHaveBeenCalled();
  });
  it('returns a 404 error when validator fails', async (done) => {
    const router: Router = new Router();
    const validator = jest.fn(() => {
      return false;
    });

    router.addHandler('/hello/:world', Endpoint, validator);
    const res = {
      badRequest: () => {}
    } as Response;
    const spyResponse = jest.spyOn(res, 'badRequest');
    await router.handleRequest(
      { remainingPath: '/hello/thing' } as Request,
      res
    );
    expect(spyResponse).toHaveBeenCalled();
    done();
  });
  it('takes multiple validator functions', () => {
    const router: Router = new Router();
    const firstValidator = jest.fn(() => {
      return true;
    });
    const secondValidator = jest.fn(() => {
      return true;
    });
    const validators = [firstValidator, secondValidator];
    router.addHandler('/hello/:world/:foo/bar', Endpoint, validators);
    expect(router.graph.dfa[1][VARIABLE].validator).toEqual(
      firstValidator
    );
    expect(router.graph.dfa[2][VARIABLE].validator).toEqual(
      secondValidator
    );

    router.getAssociatedHandler('/hello/thing/stuff/bar');
    expect(firstValidator).toHaveBeenCalled();
    expect(secondValidator).toHaveBeenCalled();
  });
});
