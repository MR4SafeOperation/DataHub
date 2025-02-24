import axios from 'axios';
export function applyEndpoints({app}) {
    app.get('/hello_world', (req, res) => {
        res.send('Hello World');
    });

    app.get('/hello_user', (req, res) => {
        res.send('Hello, ' + res.locals?.oauth?.token?.user?.username);
    });
    const xVisualEndpoint = 'http://xvdatahub.azurewebsites.net';
    app.get('/xvforward',async  (req, res) => {
        try {
            console.log("Querry",res.req.query)
            let relUrl =  res.req.query.path;
            const fullUrl = new URL(relUrl, xVisualEndpoint);
       
            console.log("forwading target:",fullUrl.href)
            // Make a request to the other REST endpoint
            const response = await axios.get(fullUrl.href, {
              responseType: 'stream' ,// Set responseType to stream to handle all types of data
              headers: {
                'X-Api-Key': '12D705AEDAFA49B5AAF11EF79766845D'
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
        });
}

