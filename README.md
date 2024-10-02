# Node.js API Template

This repository provides a Node.js API template to help developers set up an API quickly using TypeScript. It leverages modern tools like **Express**, **Inversify**, and **Prisma ORM** for a clean, modular, and high-performance design.

## Key Features

- **Express**: A robust HTTP server/router.
- **Express Validator**: Middleware for validating and sanitizing request data.
- **Express FileUpload**: Middleware for handling file uploads.
- **Body-Parser**: Middleware for parsing incoming request bodies.
- **Inversify**: Dependency injection for managing application services in a clean and maintainable way.
- **Inversify-Express-Utils**: Helps organize routes and controllers using class-based structure.
- **Winston**: A flexible logging library.
- **JSON Web Token (JWT)**: Secure authentication using JWT tokens.
- **Prisma ORM**: A powerful, type-safe ORM with a preset `UserRepository`.
- **UUID**: Utility for generating unique identifiers.
- **Bcrypt.js**: For hashing passwords.

## Table of Contents

- [Getting Started](#getting-started)
- [NPM commands](#npm-commands)
- [Controllers](#controllers)
- [Distributed Process ID](#distributed-process-id)
- [Repositories](#repositories)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Logging](#logging)
- [Contributing](#contributing)

## Getting Started

To get started, clone the repository and install dependencies:

```bash
git clone git@github.com:irfanh94/nodejs-api-template.git
cd nodejs-api-template
npm install
npm run build
```

## Setup Database
The template uses Prisma for database management. Before running the project, configure your Prisma connection in the .env file:

```dotenv
DATABASE_URL="mysql://user:password@localhost:3306/db"
DATABASE_CONNECTION_LIMIT=1
```
Run the following command to apply database migrations:

```bash
npm run db:migration:migrate
```

## Start the application

Once the dependencies are installed and the database is configured, you can run the application:

```bash
npm run start:app
```

## NPM Commands
 - `npm run build` - build application and prisma models
 - `npm run start:app` - application will start on defined `APP_HTTP_PORT` environment variable
 - `npm run db:models:generate` - generate prisma models
 - `npm run db:migration:create` - create new migration file based on differences between database and schema.prisma file
 - `npm run db:migration:migrate` - execute database migrations

## Dependency Injection

We use Inversify to handle dependency injection, which allows for clean separation of concerns and easy testing. The `src/Kernel/Container.ts` file contains the service container configuration.

### How does it work?

Create new service `src/Service/NewService.ts`

```typescript
import {injectable} from "inversify";

@injectable()
export class NewService {
}
```

Register new service in `src/Kernel/Containers.ts`
```typescript
container.bind(NewService).toSelf()
```

Inject service in another class

```typescript
import {inject, injectable} from "inversify";

@injectable
export class NewClass {
    constructor(
        @inject(NewService) private readonly newService: NewService
    ) {}
}
```

More about InverisfyJS can be fount at: https://www.npmjs.com/package/inversify

## Controllers
This template includes two preset controllers:

 - **AccountController**: Fetches account information using the current JWT token.
 - **AuthenticateController**: Generates a JWT based on the provided email and password. 

Both controllers are organized using inversify-express-utils, allowing for clean, class-based routing.

### Creating new controller?

Let's create a file `src/Http/Controller/NewController.ts`

Now we want to export main controller class, so the content of the file would be:

```typescript
import {BaseHttpController, controller, httpGet} from "inversify-express-utils";

@controller("/new-controller")
export class NewController extends BaseHttpController {

    @httpGet("/new-route")
    public newRoute() {
        return {foo: "bar"};
    }

}
```

After creating new controller now we need to register it in `src/Kernel/Container.ts` by adding:

```typescript
container.bind(NewController).toSelf();
```

### How to validate request data?
It's pretty easy by using [express-validator](https://express-validator.github.io/docs)

Example:
```typescript
@httpPost(
    "/new-route",
    body("email").isEmail().withMessage("email must be valid"),
    body("password").isString().isLength({min: 3,}),
    RequestValidatorMiddleware
)
public register(request: Request) {
    return request.body;
}
```

## Distributed Process ID

This template includes a distributed `processId` that can be found in the `express.Request` object. The process ID is set in the `src/Kernel/Http.ts` file.

If the `process-id` header is not present in the incoming request, a new `processId` is generated using `uuid.v4()`.

This ensures that each request has a unique identifier, which can be useful for logging and tracing purposes across distributed systems.

## Repositories

We utilize Prisma ORM with a UserRepository that provides basic user management operations. You can easily extend the repository for additional models and queries.

More about Prisma can be found at: https://www.prisma.io/docs/getting-started/quickstart

## Authentication
Authentication is based on JSON Web Tokens (JWT). The AuthenticateController provides an endpoint to generate a JWT after validating the user's email and password.

To protect routes, use any of: @httpGet, @httpPost, @httpPut, @httpDelete decorators with a middleware to validate the JWT.

Example route protection:

```typescript
@httpGet('/account', JwtAuthenticationMiddleware)
public getAccountInfo(request: Request): AccountInfo {
  // Your logic here
}
```

## Environment Variables

The application requires the following environment variables configured in a .env file:
```dotenv
APP_ENV=dev # application environment
APP_NAME=nodejs-template # application name - can be used for logging or other purposes
APP_SECRET=da4zjgk0i1g7y8ve5h71z0xbubu6c4v4 # application secret - used mainily for jwt
APP_HTTP_PORT=3000
APP_HTTP_BODY_LIMIT=10mb # request size limit
APP_HTTP_CORS=* # used for "cors" package to allow requests from specific domains

DATABASE_URL=mysql://root:dd29a8da323685e91634c15e3c4fc486c39dbb34e063a29c@localhost:3306/test_db
DATABASE_CONNECTION_LIMIT=1 # db connection limit - comes in handy when scaling the application
```

## Logging
We use Winston for flexible logging and its configuration is editable under `src/Service/Logger.ts` file.

Default log levels: debug, info, error.

Logs are written to the console but can be configured to write to files or external services.

## Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcomed.

1. Fork the repository
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -m 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request