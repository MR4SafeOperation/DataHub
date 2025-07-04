import xvisualConnection from './xvisualConnection.js';
import {initCypherExecutor, initMQTTClient} from './mqttClient.js';


export function applyEndpoints(datahub) {
  const app = datahub.app;
  const executeCypher = datahub.executeCypher; //executeCypher is a function to execute cypher queries in the database,
                                               //  which is passed from the datahub to the endpoints.js file, 
                                               // and will be passed to the mqttClient.js file

  // this is to send the executeCypher to the mqttClient.js to be used in the functions in there
  initCypherExecutor(executeCypher);
  initMQTTClient();

  app.get('/hello_world', (req, res) => {
    res.send('Hello World');
  });

  app.get('/hello_user', (req, res) => {
    res.send('Hello, ' + res.locals?.oauth?.token?.user?.username);
  });

  app.get('/xvforward', async (req, res) => {
    return xvisualConnection.getInstance().ForwardHTTP(req, res);
  });
}