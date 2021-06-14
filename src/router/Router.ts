import Endpoint from '../Endpoint';
import { Request, Response } from '../network';
import ResourceGraph from './ResourceGraph';
import Path, { VARIABLE } from '../path';
import { Middleware, MiddlewareExecutor } from '../middleware';
import { Node, Handler, Validator } from './internal';

type HandlerInfo<R extends Request, S extends Response> = {
  remainingPath: string;
  handler: Handler<R, S>;
  params?: { [key: string]: string };
};

type ValidatorArg = Validator | Validator[];

export default class Router<
  RequestT extends Request = Request,
  ResponseT extends Response = Response
> extends MiddlewareExecutor {
  graph: ResourceGraph<Node<RequestT, ResponseT>>;

  variableName: string;

  constructor(middlewares: Middleware[] = []) {
    super(middlewares);
    this.graph = new ResourceGraph<Node<RequestT, ResponseT>>();
  }

  /**
   * This function will add a handler for a given path, allowing
   * for variable path matching as well.
   *
   * @param path The path for the resource location
   * @param handler The handler for requests to that location
   */
  addHandler(
    path: string,
    handler: Handler<RequestT, ResponseT>,
    validators?: ValidatorArg
  ): void {
    const resourcePath: Path = new Path(path);
    let state: number = 0;
    let validatorIndex: number = 0;
    let validatorArray: [Validator] | [] = [];
    if (validators && !Array.isArray(validators)) {
      // Only a single validator
      validatorArray = [validators];
    } else if (validators) {
      validatorArray = <[Validator]>validators;
    }
    const getNode = (pathSegment: any, nextState: number) => {
      const node =
        nextState === 0
          ? new Node(pathSegment, nextState, handler)
          : new Node(pathSegment, nextState);
      if (
        pathSegment.isVariable() &&
        validatorArray[validatorIndex]
      ) {
        node.addValidator(validatorArray[validatorIndex]);
        validatorIndex += 1;
      }
      return node;
    };
    for (const [index, pathSegment] of resourcePath.entries()) {
      const segmentString: string = pathSegment.toString();
      if (!this.graph.transitionExists(state, segmentString)) {
        // If no transition exists, create a new one
        if (resourcePath.isEnd(index)) {
          // If this is the end of the path, add the handler to the graph
          const node = getNode(pathSegment, 0);
          this.graph.addTransition(state, segmentString, node);
          break;
        }
        // Otherwise, add a state transition for the next path segment
        const stateCount = this.graph.numStates();
        const node = getNode(pathSegment, stateCount);
        this.graph.addTransition(state, segmentString, node);
        state = stateCount;
      } else if (this.isHandler(state, segmentString)) {
        // If this is the end, overwrite the handler and return
        if (resourcePath.isEnd(index)) {
          const node = getNode(pathSegment, 0);
          this.graph.addTransition(state, segmentString, node);
          break;
        }
        // There is a handler at the destination, create a unified state transition
        const prevNode: Node<
          RequestT,
          ResponseT
        > = this.graph.getTransition(state, segmentString);
        const stateCount = this.graph.numStates();
        const node = getNode(pathSegment, stateCount);
        this.graph.addTransition(state, segmentString, node);
        this.graph.addTransition(
          stateCount,
          resourcePath.getSeparator(),
          prevNode
        );
        state = stateCount;
      } else if (resourcePath.isEnd(index)) {
        // There is a more specific path that could match, write the / path
        const { nextState } = this.graph.getTransition(
          state,
          pathSegment.toString()
        );
        const node = getNode(pathSegment, 0);
        this.graph.addTransition(
          nextState,
          resourcePath.getSeparator(),
          node
        );
        break;
      } else {
        state = this.graph.getTransition(state, segmentString)
          .nextState;
      }
    }
  }

  /**
   * This function retrieves the associated handler from the graph for a specific path.
   *
   * @param path A path to retrive the relevant handler for.
   */
  getAssociatedHandler(
    path: string
  ): HandlerInfo<RequestT, ResponseT> {
    const resourcePath: Path = new Path(path);
    let state = 0;
    let node: Node<RequestT, ResponseT>;
    const params: { [key: string]: string } = {};
    for (const [index, pathSegment] of resourcePath.entries()) {
      let pathChunk = pathSegment.toString();
      node = this.graph.getTransition(state, pathChunk);
      if (!node) {
        node = this.graph.getTransition(state, VARIABLE);
        if (node) {
          if (node.validator && !node.validator(pathChunk)) {
            return {
              remainingPath: '/',
              handler: null
            };
          }
          params[node.variableName] = pathChunk;
          pathChunk = VARIABLE;
        } else {
          if (this.isRouter(state, '/')) {
            node = this.graph.getTransition(state, '/');
          }
          return {
            remainingPath: resourcePath.getPathPortion(
              index,
              resourcePath.length()
            ),
            handler: (node && node.handler) || new Endpoint(),
            params
          };
        }
      }
      if (node.isRouter()) {
        return {
          remainingPath: resourcePath.getPathPortion(
            index + 1,
            resourcePath.length()
          ),
          handler: node.handler,
          params
        };
      }
      state = node.nextState;
    }
    if (!node.isEndpoint() && node.nextState) {
      node = this.graph.getTransition(node.nextState, '/');
    }
    const handler = node.isEndpoint() ? node.handler : new Endpoint();
    return {
      remainingPath: '/',
      handler,
      params
    };
  }

  async handleRequest(request: RequestT, response: ResponseT) {
    const path = request.remainingPath;
    const {
      handler,
      remainingPath,
      params
    } = this.getAssociatedHandler(path);
    if (!handler) {
      response.badRequest();
      return;
    }
    request.updateParams(params);
    const next = async () => {
      if (handler instanceof Router) {
        request.setRemainingPath(remainingPath);
        await handler.handleRequest(request, response);
      } else {
        const endpoint: Endpoint =
          typeof handler === 'function' ? new handler() : handler;
        await endpoint.executeMiddleware(request, response, () => {
          this.executeEndpointMethod(endpoint, request, response);
        });
      }
    };
    await this.executeMiddleware(request, response, next);
  }

  executeEndpointMethod(
    endpoint: Endpoint,
    request: RequestT,
    response: ResponseT
  ) {
    switch (request.method) {
      case 'GET':
        endpoint.get(request, response);
        break;
      case 'POST':
        endpoint.post(request, response);
        break;
      case 'PUT':
        endpoint.put(request, response);
        break;
      case 'DELETE':
        endpoint.delete(request, response);
        break;
      case 'PATCH':
        endpoint.patch(request, response);
        break;
      default:
        response.notFound();
    }
  }

  isHandler(state: number, key: string): boolean {
    const { handler } = this.graph.getTransition(state, key);
    return (
      handler instanceof Router ||
      handler instanceof Endpoint ||
      typeof handler === 'function'
    );
  }

  isRouter(state: number, key: string): boolean {
    const node: Node<RequestT, ResponseT> = this.graph.getTransition(
      state,
      key
    );
    if (!node) {
      return false;
    }
    const { handler } = node;
    return handler instanceof Router;
  }
}
