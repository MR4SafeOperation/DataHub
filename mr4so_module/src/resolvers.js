const FAKE_API_URL = 'https://reqres.in/api/users';

import xvisualConnection from './xvisualConnection.js';
/**
* Resolver for fetching RoesbergData with custom fields from an external data source.
*/
async function roesbergData(parent, args, context, info) {
    let { limit, offset } = args.options;
    limit = limit || 10;
    offset = offset || 0;

    let res = await fetch(FAKE_API_URL);
    let { per_page, total } = await res.json();

    if (offset > total || offset < 0) {
        return [];
    }

    const pageOffset = Math.floor(offset / per_page) + 1;
    const pageLimit = Math.ceil((offset + limit) / per_page);

    const pagePromises = [];
    for (let i = pageOffset; i <= pageLimit; i++) {
        pagePromises.push(fetch(FAKE_API_URL + "?page=" + i));
    }

    const pageResponses = await Promise.all(pagePromises);
    const pageData = await Promise.all(pageResponses.map(res => res.json()));

    const allData = pageData.reduce((acc, page) => acc.concat(page.data), []);

    // Function to generate a 6-character random string
    const generateRandomString = () => Math.random().toString(36).substring(2, 8);

    // Map data to fit RoesbergData type with custom fields
    const roesbergData = allData.slice(offset % per_page, (offset % per_page) + limit).map(user => ({
        id: user.id,
        formData: generateRandomString(),
        contact: `${user.first_name.charAt(0)}.${user.last_name}`
    }));

    return roesbergData;
}

/**
 * Example resolver for counting data from an external data source.
 * The Headless CMS requires the total count of available items provided by this resolver
 * in order to dynamically generate the tables.
 */
async function roesbergDataAggregate(parent, args, context, info) {
    const res = await fetch(FAKE_API_URL);
    const resJson = await res.json();
    return { count: resJson.total };
}

///XVisual Resolver 



async function ResolveXVisualApi(parent, args, context, info) {
    return xvisualConnection.getInstance().ResolveXVisualApi(parent, args, context, info);
}




const resolvers = {
    Query: {
        // The following two overwrite the auto-generated resolvers for the `ExternalUser` type
        roesbergData,
        roesbergDataAggregate,

        status: () => { return "Online" },

        //xvisualSchema
        projects: ResolveXVisualApi,
        drawing: ResolveXVisualApi,
        drawingSVG: ResolveXVisualApi,

        automationStep: ResolveXVisualApi,

    },
}

export const getResolvers = () => resolvers;


