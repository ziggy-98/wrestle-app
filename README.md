# Express server with typescript boilerplate
This is a simple boilerplate environment setup for implementing an express server using typescript and jest to run unit tests.

This boilerplate could be used as a base for creating api servers or full stack applications.

## Components
This is a basic boilerplate, with a couple of key components being used:

- `src/server/createServer.ts`: this file will create an express server with one route at `/health` for checking the server is working.
- `tsconfig.json`: this is set up so that any code in the src directory will be compiled when `tsc` is executed. Any tests in this directory will be ignored. by running `npm run dev` you can execute your code using `ts-node`, allowing running the code without compilation.
- `jest.config.json`: this is set up to run jest tests written using ts. Tests are matched by being contained in a `__tests__` directory, and having the extension `.test.ts`

This boilerplate does not implement any middleware as different middlewares may be useful for different environments.
The goal of this boilerplate is only to implement a running server using typescript and configured with unit tests.

## Getting started
There are two ways of starting this app; using `ts-node` or building with `tsc` and running with standard node.

### Prerequisites
**This app has only been tested with node v22.14.0 currently. Other versions of node might work, but haven't been supported currently**

Before using this app, make sure you have:
- node v22.14.0
- npm >=v10

### with ts-node
- run `npm install`
- run `npm run dev`

That's it! The code written in `index.ts` should then be executed

### with node
- run `npm install`
- run `npm run build`
- run `npm start`

This will compile the code in the `src` directory to js into the `dist` directory, and then execute this code using node

## Test driven development
The structure of this boilerplate has been specifically designed to encourage a test driven development (TDD) style of programming.
No extra implementation is required, by adding tests in `__tests__` directories using standard jest practices you can start adding tests for your apps.

The concept of TDD is that you write your tests first to help guide how you should implement your code. So given a task,
write a unit test for the most basic implementation of how that task can succeed, and then gradually build up and write more unit tests
to get a clearer idea for the best way for each component to be written.

### Testing
The config for jest is very basic for the time being, allowing for implementing basic unit tests. To write and run your tests:
- Add your unit tests to a `__tests__` directory, using the file extension `.test.ts`. Generally I feel it's cleaner to keep your tests close to the code they're testing, so create new `__tests__` directories wherever it feels natural
- Once you've written your tests, run `npm test` to execute jest.

this will give you a breakdown of which tests passed and failed, as well as a breakdown of how well covered your code is.

### supertest
The demo test written in `src/__tests__/index.test.ts` contains a very rudimentary implementation of `supertest`.
Using `supertest` you can test the responses from certain routes in your application. This can be useful for a number of scenarios:
- You want to test that a route responds with a specific error code when given an erroneous request
- You want to test the body that's returned from a specific api route
- You want to test the accessibility of a view that has been returned by a route

It's strongly recommended to implement at least basic unit testing on your routes when you create them.