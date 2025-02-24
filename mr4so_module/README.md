# MR4B DataHub Server Example Module

This is an example module for the MR4B DataHub. This module demonstrate how to create a module for the MR4B DataHub
including the GraphQL Schema and custom resolvers.

This file explains how to build your own custom module for the MR4B DataHub Server.

## GraphQL Schema

The GraphQL Schema (including types, queries and mutations) must be defined in `*.graphql` files in the `schemas`
folder. See the README in the `schemas` folder for more information.

## JavaScript Module

The JavaScript part of the module contains the following (all optional) customizable abilities:

* **Custom Resolvers**
* **Authentication**
* **Custom REST Endpoints / Initialization**

To define all these components, you need to create a `module.js` JavaScript file in the root of the module folder.

The following sections describe the **callback functions**, which `module.js` needs to export to define these
components.

### Common Context

All the callback functions described in the following sections will be called with two parameters:

- `datahub: object` - a constant object, which contains functions and values for interacting with the DataHub server
  backend.
- `context: object` - a mutable, initially empty object, which can be used to carry on custom data between the different
  callback functions.

The `datahub` object contains the following properties:

* `executeCypher: (statement : string, parameters : object) => Promise<EagerResult>` - A function for executing Cypher
  statements (queries and mutations) on the connected Neo4j database. This is a wrapper around the [executeCypher()](https://neo4j.com/docs/api/javascript-driver/current/class/lib6/result-eager.js~EagerResult.html) function of the Neo4j driver, but with lacking `config` parameter, which gets injected from the datahub backend. See more details about the [EagerResult](https://neo4j.com/docs/api/javascript-driver/current/class/lib6/result-eager.js~EagerResult.html) in the driver reference. 
* `ogm: OGM` - An initialized  **[Neo4j GraphQL OGM](https://neo4j.com/docs/graphql/current/ogm/reference/) instance**
  for accessing the connected Neo4j database using the Object-Graph Mapping (OGM) API.
* `typeDefs: string` - The GraphQL schema as a string
* `defaultRestrictedPaths: [string]` - An array containing the paths, which are protected with authentication by
  default.
* `app: Express` - The Express.js application object
* `apolloServer: ApolloServer` - The [Apollo Server](https://www.apollographql.com/docs/apollo-server/) instance. *Caution*: Do **not** use the `executeOperation()` method of this instance to execute GraphQL operations! This will only produce empty results on auto-generated resolvers. Use the following `execGql()` method instead:
* `execGql: async (query, variables={}, req={}, res={})` - you can use this async method to execute GraphQL requests. It is a wrapper around the Apollo Server's [`executeOperation` method](https://www.apollographql.com/docs/apollo-server/api/apollo-server#executeoperation), which is called with an added `contextValue` enabling it to properly interact with the Neo4j GraphQL library. The method returns the result of the operation. All parameters except `query` are optional. You can provide the `req` and `res` objects, if you want to integrate the call into the Express middleware chain and protect the requests with implicit authentication and authorization.
* `getFullBaseUrl: (req) => string` - A helper method, which generates the full base URL used by the client to access
  the backend instance, including the protocol scheme, port, baseUrl and also resolving the Reverse Proxy.
  Example: `https://my-backend.example.com:443`. Requires Express request object as parameter, which is available in the
  context of the REST endpoints or the GraphQL resolvers.
* `config: object` - An object containing all configuration parameters active for the current DataHub Backend instance

#### Code Structure

We recommend to use the callback functions in the `module.js` file only as main entrypoints and mostly use them to
trigger externally defined methods to keep the file as simple as possible. For implementing the actual, possibly complex
business logic, we recommend to define a separate module for the business logic and to import the module in
the `module.js` file.

You should use the prepared `src` folder to define the business logic modules.

### Custom Resolvers

The GraphQL schema is interpreted by the Neo4j GraphQL library, which auto-generates resolvers for the schema (unless
otherwise specified using `@query` or `@mutation` directives). However, in many situations you may want to define custom
resolvers for certain fields in the schema, especially for realizing connections to external interfaces, databases or
APIs.

To define the custom resolvers, you need to export the **following method** in the `module.js` file, which must return a
object containing all the custom **resolvers**, that maps the custom resolvers to the corresponding GraphQL Schema types
and fields:

```javascript
export async function getResolvers(datahub, context) { ...
}
```

#### Examples

```javascript
export const getResolvers = () => ({
    Query: {
        // Custom resolver for the `hello` query
        hello: (obj, args, context, info) => {
            return 'Hello, World!';
        }
    },
    // Custom resolver for the `hello` field on the `User` type (using the @customResolver directive)
    User: {
        hello: (obj, args, context, info) => {
            return `Hello, ${obj.name}!`;
        }
    }
});

```

This example defines a custom resolver for the `hello` query and the `hello` field on the `User` type.

You can also define custom resolvers that implement business logic. For example, you could define a custom resolver that
fetches data from an external API and returns the result.

```javascript
export const getResolvers = () => ({
    Query: {
        // Custom resolver for the `externalData` query
        externalData: async (obj, args, context, info) => {
            const response = await fetch('https://api.example.com/data');
            const data = await response.json();
            return data;
        }
    }
});

```

### Authentication (OAuth 2)

Currently MR4B DataHub supports authentication using [**OAuth 2.0**](https://oauth.net/2/). Under the hood the DataHub
uses the [express-oauth-server](https://github.com/oauthjs/express-oauth-server) library, which itself is built upon
the [oauth2-server](https://github.com/oauthjs/node-oauth2-server) library, which provides a secure and spec-conform way
of handling the authentication process.

To define the OAuth 2.0 configuration and all the required callbacks, you need to export the following method in
the `module.js` file.

```javascript
export async function getOAuthServerOptions(datahub, context) { ...
}
```

The method can be optionally async.

It must return an object defining all authentication handlers and configurations in the proper form of
a `OAuth2Server(options)` constructor's `options` parameter, including the OAuth 2 **model**. [**Find the full
documentation here**](https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html).

### Context Initialization / Custom REST Endpoints

You can define initialization logic for the module by exporting one or both of the following methods from
the `module.js` file:

```javascript
export async function preInitModule(datahub, context) { ...
}

export async function initModule(datahub, context) { ...
}
```

For your initialization (initialize `context` and/pr define custom early middleware), you should use the `preInitModule()` method, which is called before all other callbacks. This means, it is called **before** the OAuth 2.0 authentication is set up and before the Apollo Server is initialized. Therefore `datahub.apolloServer` object is still `undefined` in this callback.

You should use the `initModule()` method, if you wish to add custom REST endpoints to the Express
application *after* the datahub middlewares or to do initializations that depend on `datahub.apolloServer`. This method will be called **after** the OAuth 2.0 authentication has
been set up and after the Apollo Server was started and API and CMS endpoints are defined.

You can define custom middleware through the `datahub.app` object, which is the ExrepssJs App object, which is documented
here: https://expressjs.com/en/4x/api.html#app. 

The following example demonstrates how to define a custom REST endpoint, which runs a Cypher statement on the local
Neo4j database and also shows how to access auth information:

```javascript
export const initModule = async ({executeCypher}, context) => {
    app.get('/custom-endpoint', async (req, res) => {
        res.send('Hello, World!');
        const statement = `
    CREATE (hwc:HelloWorldCall {
        timestamp: datetime(),
        username: $username
        }) RETURN hwc
        `
        await executeCypher(statement, {username: res.locals?.oauth?.token?.user?.username});
    });
};
```

#### Restricted Endpoints

By default, the GraphQL API endpoint (default: /api) and the file service endpoints (default: /files) are protected by
the OAuth 2.0 authentication. If you want to
protect additional endpoints, you can implement and export the following method in the `module.js` file, returning an
array of endpoint paths that should be protected by the OAuth 2.0 authentication:

```javascript
export async function getProtectedEndpoints(datahub, context): string[] { ...
}
```

If this method is defined, **only** the paths in the returned array will be protected with OAuth 2.0 authentication.
If it returns an empty array, authentication will be fully disabled (can be helpful during development).

To re-include the protection of the default paths when implementing a custom `getProtectedEndpoints` callback function,
you need to include the paths defined in
the `datahub.defaultRestrictedPaths` property in the returned array:

```javascript
export function getProtectedEndpoints(datahub, context): string[] {
    const myAdditionalRestrictedPaths = [
        "/protected_path1",
        "/protected_path2"
    ];

    return [
        ...datahub.defaultRestrictedPaths, // includes paths to GraphQL API and file service
        ...myAdditionalRestrictedPaths
    ]
}
```

## Third-Party Libraries

You can use third-party libraries for the development of the DataHub Module. However, you should be aware that the MR4B
DataHub is a shared environment and that the use of third-party libraries can have an impact on the performance and
stability of the system. Therefore, you should only use third-party libraries if they are necessary and if they are
well-maintained and have a good reputation.

As you see in this example, there is a package.json file in the root of the module folder. You can use this file to
define the third-party libraries that you want to use in the `resolvers.js` file. You can then run `npm install`
command (or `yarn install` if you prefer Yarn) inside the module directory to install the module-specific libraries.

Make sure that `type` in the `package.json` file is set to `module` to enable the use of ES6 modules which is the format
required by the DataHub Backend application:

```json
{
  ...
  "type": "module",
  "dependencies": {
    "node-fetch": "^2.6.1"
  },
  ...
}
```

## Configuration

The backend server requires some configuration to be usable withing your production or development environment.

The following variables are available:

| Variable Name              | Description                                                                                                                                                                                                                                                                                                                                                                                                            | Default Value*                                                 |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| `DH_DB_URL`                | The *bolt* URL for accessing the Neo4j database                                                                                                                                                                                                                                                                                                                                                                        | `bolt://neo4j:7687`                                            |
| `DH_DB_USER`               | The Neo4j Database User                                                                                                                                                                                                                                                                                                                                                                                                | `gql_user`                                                     |
| `DH_DB_PASSWORD`           | The Neo4j Database Password                                                                                                                                                                                                                                                                                                                                                                                            | `{PASSWORD}`                                                   |
| `DH_DB_DATABASE`           | The Neo4j Database Name                                                                                                                                                                                                                                                                                                                                                                                                | `playground`                                                   |
| `DH_SERVER_HOST`           | The host this backend server is listening for.                                                                                                                                                                                                                                                                                                                                                                         | `localhost`   / Docker**: `0.0.0.0`                            |
| `DH_SERVER_PORT`           | The port this backend server is litening on.                                                                                                                                                                                                                                                                                                                                                                           | `8111`  / Docker**: `8000`                                     |
| `DH_MODULE_PATH`           | The path to the MR4B DataHub Module directory (relative or absolute). <br/><br/>*Note:* If you want PM2 to watch for changes inside the module, you must specify an absolute path here.                                                                                                                                                                                                                                | `./modules/example_module`  / Docker**: `/module`              |
| `DH_API_ENDPOINT`          | The endpoint on which the GraphQL server is to be found.                                                                                                                                                                                                                                                                                                                                                               | `/api`                                                         |
| `DH_OAUTH2_TOKEN_ENDPOINT` | The endpoint used for OAuth 2.0 token acquisition.                                                                                                                                                                                                                                                                                                                                                                     | `/token`                                                       |
| `DH_CMS_ENDPOINT`          | The endpoint used for accessing the GraphQL Frontend CMS web application.                                                                                                                                                                                                                                                                                                                                              | `/`                                                            |
| `DH_CMS_PATH`              | The path to the to GraphQL Frontend `dist` directory.                                                                                                                                                                                                                                                                                                                                                                  | `/var/www/graphql-frontend` / Docker**: `/cms`                 |
| `DH_BASE_PATH`             | An optional base path, **all** endpoints are prefixed with  (e.g. `/app`                                                                                                                                                                                                                                                                                                                                               | *(unset)*                                                      |
| `DH_ALLOW_ORIGIN`          | Set to `*` or to a list of specific hosts to allow API access from other origins than the only from the same host, also in production mode. (`*` is always used in development mode!) This sets the value of `Access-Control-Allow-Origin` header for the API endpoint. If unset, the header remains unset, too, defaulting to only allowing connections from same host (recommend for web-apps provided on same host) | *(unset)*                                                      |
| `NODE_ENV`                 | Unset to enable dev mode and the GraphQL Sandbox.                                                                                                                                                                                                                                                                                                                                                                      | *(unset or defined by runtime)*  /<br/> Docker**: `production` |
| `DH_FILES_...`             | Configuration Variables for the `File Service`.<br/>See the [Configuration Section in the FILESERVICE.md](FILESERVICE.md#configuration) for the full overview.                                                                                                                                                                                                                                                         | *...*                                                          |

&ast; These are the very default values provided by the datahub backend. Please check the `.env.default` file in
this `example_module` folder. There might already be some overriding values.

&ast;&ast; You will most likely run the MR4B DataHub server backend via Docker, so this is the relevant value. The other
value is only applied when the backend server is run directly from the sources and is only kept here for reference.

### Prioritized Settings

There are three different options how to set the configuration variables:

1. **Environment Variables**: You can set the configuration variables as environment variables in your shell or in your
   Docker container to override the default settings.
2. **Module-specific default configuration**: You can create a `.env.default` file in the root directory of your module.
   The file should
   contain the default configuration values in the format `VARIABLE_NAME=value` or `VARIABLE_NAME="value"`.Comments can
   be added starting with `#`, also in-line. This file has precedence over the `.env.default` file. This file
   is meant to be checked in into VCS.

   Please note the `.env.default` file has precedence over the environment variables!

3. **Module-specific local configuration**: You can create a `.env` file in the root directory of a module to override
   the default settings. This file has precedence over the `.env.default` file and the environment variables. This file
   is meant to be used for local overrides and should **not** be checked in into VCS.

You can also add your custom module-specific settings. All settings you define in the `.env` or `.env.default` files
will also be available in the `process.env` object in your module code.

# File Service

The MR4B DataHub Server provides a **File Service**, which consists of several pre-defined REST endpoints for uploading,
deleting and serving files.

Pleases see the [File Service Documentation](FILESERVICE.md) for more information about the File Service and how to use
and configure it.