import {getResolvers} from './src/resolvers.js';
import {getOAuthServerOptions, getProtectedEndpoints} from "./src/auth.js";
import {applyEndpoints} from "./src/endpoints.js";


export {
    getResolvers,
    getOAuthServerOptions,
    getProtectedEndpoints,
    applyEndpoints as initModule
};
