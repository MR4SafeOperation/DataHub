const FAKE_API_URL = 'https://reqres.in/api/users';

/**
 * Example resolver for data transformation.
 */
function GenerateExternalUser(parent, args, context, info) {
    const {firstName, lastName} = args.userInfo;
    return {
        id: -1,
        first_name: firstName,
        last_name: lastName,
    }
}

/**
 * Example resolver for reading data from custom config variable
 */
function GetEnvironmentTestVariable(parent, args, context, info) {
    return process.env.TEST_VAR || "(not set)";
}

/**
 * Example resolver for fetching data from an external data source
 */
async function externalUsers(parent, args, context, info) {
    // Our fake API uses a page-based pagination system whereas GraphQL uses offset-based pagination.
    // We need to convert the offset-based pagination to page-based pagination.
    // Check https://reqres.in/ to see the data structure of the fake API.

    let {limit, offset} = args.options;
    limit = limit || 10;
    offset = offset || 0;

    let res = await fetch(FAKE_API_URL);
    let {per_page, total } = await res.json();

    if(offset > total || offset < 0) {
        return [];
    }

    // Determine required pages
    const pageOffset = Math.floor(offset / per_page) + 1;
    const pageLimit = Math.ceil((offset + limit) / per_page);

    // Fetch required pages
    const pagePromises = [];
    for(let i = pageOffset; i <= pageLimit; i++) {
        pagePromises.push(fetch(FAKE_API_URL + "?page=" + i));
    }
    const pageResponses = await Promise.all(pagePromises);
    const pageData = await Promise.all(pageResponses.map(res => res.json()));

    // Flatten data
    const allData = pageData.reduce((acc, page) => acc.concat(page.data), []);

    // Return data
    return allData.slice(offset % per_page, (offset % per_page) + limit);
}


/**
 * Example resolver for counting data from an external data source.
 * The Headless CMS requires the total count of available items provided by this resolver
 * in order to dynamically generate the tables.
 */
async function externalUsersAggregate(parent, args, context, info) {
    const res = await fetch(FAKE_API_URL);
    const resJson = await res.json();
    return {count: resJson.total};
}


const resolvers = {
    Query: {
        GenerateExternalUser,
        GetEnvironmentTestVariable,

        // The following two overwrite the auto-generated resolvers for the `ExternalUser` type
        externalUsers,
        externalUsersAggregate

    },
}

export const getResolvers = () => resolvers;