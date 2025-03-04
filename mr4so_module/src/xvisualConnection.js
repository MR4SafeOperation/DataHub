
import axios from 'axios';
async function readStream(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break; result += decoder.decode(value, { stream: true });
    } result += decoder.decode(); // Flush the decoder return result; 
    return result;
}


class XVisualConnection {
    constructor() {
        this.xApiKey = process.env.XVISUAL_API_KEY;
        this.Endpoint = process.env.XVISUAL_ENDPOINT;

        if (!this.xApiKey) {
            console.error('XVisual API Key is missing');
        }
        if (!this.Endpoint) {
            console.error('XVisual Endpoint is missing');
        }
    }

    test() {
        console.log('----------- TEst Test----- ');
    }



    async ResolveXVisualApi(parent, args, context, info) {
        // Check https://reqres.in/ to see the data structure of the fake API.
        // console.log("parent :", parent);
        // console.log("args :", args);
        // console.log("info :", info);
        // console.log("context type", typeof context);
        // console.log("context :", context.req.body);
   
        // console.log("xvisualConnection.XVisualConnectionInstance :",  xvisualConnection.XVisualConnectionInstance);
        // var instance=xvisualConnection.getInstance();
        // instance.test();

        try {
            console.log("Body", context.req.body);
            var rawbody = context.req.body;
            // Parse the JSON string into an object 
            // const jsonObjectBody = JSON.parse(rawbody);
            // // Access the query property c
            // const query = jsonObject.query;
            console.log("ExtractedQuerry", rawbody.query);
            const fullUrl = new URL("api/", this.Endpoint);
            console.log("X-Visual Grapql Endpoint :",fullUrl.href ,fullUrl);
            const response = await fetch(fullUrl.href, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.xApiKey
                }, body: JSON.stringify(context.req.body)
            });

            var bodyResult = await readStream(response.body);
            // The JSON string
            console.log("bodyResult", bodyResult);
            const jsonObject = JSON.parse(bodyResult); // Access the inner list (projects array)
            const projectsList = jsonObject.data.projects;
            console.log("Response body", bodyResult);
            return jsonObject.data[info.fieldName];
        } catch (error) {
            // Handle any errors that occur
            console.error('An error occurred:', error);
        }

    }





    async ForwardHTTP(req, res) {
        try {
            console.log("Querry", res.req.query)
            let relUrl = res.req.query.path;
            const fullUrl = new URL(relUrl, this.Endpoint);

            console.log("forwading target:", fullUrl.href)
            // Make a request to the other REST endpoint
            const response = await axios.get(fullUrl.href, {
                responseType: 'stream',// Set responseType to stream to handle all types of data
                headers: {
                    'X-Api-Key': this.xApiKey
                }
            });

            // Get the content type from the response headers
            const contentType = response.headers['content-type'];

            // Set the appropriate headers for the response
            res.setHeader('Content-Type', contentType);

            // Handle different content types
            if (contentType.includes('application/json')) {
                let data = '';
                response.data.on('data', (chunk) => {
                    data += chunk;
                });
                response.data.on('end', () => {
                    res.json(JSON.parse(data));
                });
            } else {
                // For other types of data, pipe the response directly
                response.data.pipe(res);
            }
        } catch (error) {
            console.error(error);
            // Handle any errors
            res.status(500).send('Error forwarding the response');
        }
    };
}

const XVisualConnectionInstance = (function () {
    let instance;

    function createInstance() {
        return new XVisualConnection();
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

export default XVisualConnectionInstance;