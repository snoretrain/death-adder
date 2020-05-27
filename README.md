# Death Adder

A web application library for Node.js

## Goals
Death Adder aims to be a a simple and lightweight library for building
web applications, specifically RESTful APIs, with a simple and readable
interface. Death Adder favors minimizing dependencies and keeping the
feature set narrow.

## Installation
To add Death Adder to your project, simply install it

with npm:
```
npm install death-adder
```
or yarn:
```
yarn add death-adder
```

## Usage

The use of Death Adder consists of three primary components. A `Server`
is responsible for listening to network requests and dispatching them
to a `Router`. The `Router` is responsible for associating the path
of the request to a specific web resource. An `Endpoint` handles
responding to network requests with a specific resource. 

In code, the pattern looks like the following:

```javascript
// Using ES6 Imports
import { Server, Router, Endpoint } from 'death-adder';

// Using require
const { Server, Router, Endpoint } = require('death-adder');


// Create the definitions for your Endpoints
class SquirtleEndpoint extends Endpoint {
  get(request, response) {
    response.send('Squirtle');
  }
}

class CharmanderEndpoint extends Endpoint {
  get(request, response) {
    const charmander = { name: 'Charmander', type: 'fire' };
    response.json(charmander);
  }
}

const router = new Router();
// Added with an endpoint definition
router.addHandler('/squirtle', SquirtleEndpoint);

// Although it is not as recommended because of the ability
// to store state in an instance and cause side effects, it
// is also possible to add an instance of an Endpoint
router.addHandler('/charmander', new CharmanderEndpoint());

const server = new Server(router);

server.listen(3000);

/**
 * Alternatively one could do:
 * 
 * const server = new Server(router, 3000);
 * server.listen();
 * 
 * or:
 * 
 * const server = new Server();
 * server.setRouter(router);
 * server.listen(3000);
 * 
 */
```


The use of middleware allows the selective administration of
certain actions based on the path or requested resource. In order
to use Death Adder middlewares, add a middleware function to an
`Endpoint` or instance of `Router`. Importantly, the return value
of a middleware determines if the application will continue
attempting to handle the request. A return value of false immediately
ends the execution of any further request handling. It is up to the
request terminating middleware to send the response to the client.
Middleware can also be asynchronous, and continued execution will
await the resolution of a `Promise` .
 

```javascript
import { Server, Router, Endpoint } from 'death-adder';

class EndpointWithMiddleware extends Endpoint {
  constructor() {
    // A naive middleware for validating the request is from
    // localhost
    this.middleware.push(
      (request, response) => {
        if (request.ip !== '127.0.0.1') {
          // Return a 401 and terminate execution
          response.unauthorized();
          return false;
        }
        return true;
      }
    );
  }
  get(request, response) {
    response.send(
      'Request to the Endpoint With Middleware was allowed'
    );
  }
}

class TypicalEndpoint extends Endpoint {
  get(request, response) {
    response.send('Request to the Typical Endpoint was allowed');
  }
}

const apiRouter = new Router();
router.addMiddleware(
  (request, response) => {
    if (!request.headers['authorization']) {
      response.unauthorized();
      return false;
    }
    return true;
  }
)
apiRouter.addHandler('/third', EndpointWithMiddleware);
apiRouter.addHandler('/second', TypicalEndpoint);

const baseRouter = new Router();
baseRouter.addHandler('/api', apiRouter);
baseRouter.addHandler('/first', TypicalEndpoint);

const server = new Server(baseRouter, 3000);

server.listen();
```

In this example, requests to `http://localhost:3000/first` will
resolve without any additional requirements, while requests to
`http://localhost:3000/api/second` will require the `Authorization`
header to be set. Furthermore, requests to
`http://localhost:3000/api/third` will require the `Authorization`
header to be set as well as be from `localhost`.