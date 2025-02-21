import jwt from "jsonwebtoken";
import {v4 as uuid} from 'uuid';

const oauth_model = {
    generateAccessToken: (client, user, scope) => {
        // The user object generated in getUser() is passed as user argument.
        // In this example, we attach its content as payload to the jwt:
        return jwt.sign(user, process.env.JWT_SECRET, {algorithm: "HS256", jwtid: uuid(), expiresIn: "1y"});
    },

    getClient: (clientId, clientSecret) => {
        return {
            id: "any-app",         // Accept all client types in this example
            grants: ["password"],
            // In this example we only accept the deprecated Password Grant authentication method.
            // But you can and should implement other grant types for your model.
            //
            // For details, see: https://oauth.net/2/grant-types/
        }
    },

    getAccessToken(accessToken) {
        // For demonstration, make token expire one year after it was issued.
        const accessTokenExpiresAt = new Date();
        accessTokenExpiresAt.setFullYear(accessTokenExpiresAt.getFullYear() + 1);

        let user;
        try {
            user =jwt.verify(accessToken, process.env.JWT_SECRET);
        } catch (e) {
            return null;
        }

        if(!user)
            return null;

        return {
            accessToken,
            accessTokenExpiresAt,
            user: {username: user.username}
        }
    },

    getUser: async (username, password) => {
        // Validation function for the Password Grant authentication method.

        if (
            !username ||
            !password ||
            username !== process.env.DEFAULT_USERNAME ||
            password !== process.env.DEFAULT_PASSWORD
        )
            //TODO: Replace with actual validation of credentials
            return null;

        return {username}; // dummy user Object, TODO: Create your custom user object
    },

    saveToken: (token, client, user) => {
        // for this example we do not use refresh tokens:
        delete token.refreshToken;
        delete token.refreshTokenExpiresAt;

        return {...token, client, user};
    },
}

export async function getOAuthServerOptions({executeCypher}) {
    const cypher = `
        RETURN "Test: Cypher statement successfully executed in getOAuthServerOptions()"
    `;

    const {records} = await executeCypher(cypher, {});
    console.log(records[0].get(0));

    return {
        model: oauth_model,
        accessTokenLifetime: 60 * 60 * 24 * 365,
    };
}


// export const getProtectedEndpoints = ({apiEndpoint}) => [apiEndpoint, '/hello_user']
export const getProtectedEndpoints = ({apiEndpoint}) => []