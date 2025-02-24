import axios from 'axios';
import mqtt from 'mqtt';
export function applyEndpoints(datahub) {

var app = datahub.app;
var executeCypher = datahub.executeCypher;
 console.log("Params",datahub);
const client = mqtt.connect("mqtt://192.168.178.11:1883");

client.on("connect", () => {
  console.log("Connected to Demonstrator | MQTT-Server")
  client.subscribe("MR4SO/#", (err) => {
    if (!err) {
      console.log("Topic MR4SO/# suscribed")
    } else {
      console.error("Error at subscribing: ", err)
    }
  });
});

client.on("message", async (topic, message) => {
  const value = message.toString();
  console.log("Received: ", topic, value);

  const cypherQuery = "CREATE (d:DemonstratorPlantData {topic : $topic, value: $value }) RETURN d";

  try {
    const result = await executeCypher(cypherQuery, { topic, value });
    const savedNode = result.records[0].get("d").properties;
    console.log("Data saved", savedNode);
  } catch (error) {
    console.error("Error while writing DemonstratorPlantData:", error.message);
  }

});

client.on("error", (error) => {
  console.error("MQTT error:", error);
});

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

