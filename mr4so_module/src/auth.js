import jwt from "jsonwebtoken";
import {v4 as uuid} from 'uuid';

const users = [
    {username: "mr4b", password: "datahub", role: "admin"},
    {username: "john", password: "jdoe", role: "user"},
];

export const permissions = {
  admin: {
    Query: ['demonstratorPlantData'],
    Mutation: ['triggerPlantDataAction']
  },
  user: {
    Query: ['demonstratorPlantData'],
    Mutation: []
  }
};


const oauth_model = {
    generateAccessToken: (client, user, scope) => {
        // The user object generated in getUser() is passed as user argument.
        // In this example, we attach its content as payload to the jwt:
        return jwt.sign(user, process.env.JWT_SECRET, {algorithm: "HS256", jwtid: uuid(), expiresIn: "1h"});
    },

    getClient: (clientId, clientSecret) => {
        if(clientId != process.env.CLIENT_ID) return
        return {
            id: clientId,
            grants: ["password"],
            // In this example we only accept the deprecated Password Grant authentication method.
            // But you can and should implement other grant types for your model.
            //
            // For details, see: https://oauth.net/2/grant-types/
        }
    },

    getAccessToken(accessToken) {
        // For demonstration, make token expire one hour after it was issued.
        const accessTokenExpiresAt = new Date();
        accessTokenExpiresAt.setHours(accessTokenExpiresAt.getHours() + 1);

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
            user: {username: user.username, role: user.role}
        }
    },

    getUser: async (username, password) => {
        // Validation function for the Password Grant authentication method.
        let user = users.find(u => u.username === username);

        if (!username ||
            !password ||
            // username !== process.env.DEFAULT_USERNAME ||
            // password !== process.env.DEFAULT_PASSWORD
            !user ||
            user.password !== password
            )
            {
                return null;
            }

        return {username: user.username, role: user.role};
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
        accessTokenLifetime: 60 * 60,
    };
}

export const getProtectedEndpoints = (datahub, context) => [...datahub.defaultRestrictedPaths]
// export const getProtectedEndpoints = ({apiEndpoint}) => []