import mqtt from 'mqtt';
import xvisualConnection from './xvisualConnection.js';
import {
  initCypherExecutor,
  deleteNodes,
  saveDemonstratorPlantData,
  saveServerStatus,
  deleteServerStatusesExcept
} from './mqttClient.js';

export function applyEndpoints(datahub) {
  const app = datahub.app;
  const executeCypher = datahub.executeCypher; //executeCypher is a function to execute cypher queries in the database,
                                               //  which is passed from the datahub to the endpoints.js file, 
                                               // and will be passed to the mqttClient.js file

  // this is to send the executeCypher to the mqttClient.js to be used in the functions in there
  initCypherExecutor(executeCypher);

  const client = mqtt.connect(process.env.MQQTSERVER_IP);

  client.on("connect", () => {
    console.log("Connected to Demonstrator | MQTT-Server");
    client.subscribe("MR4SO/#", (err) => {
      if (!err) {
        console.log("Topic MR4SO/# subscribed");
      } else {
        console.error("Error at subscribing: ", err);
      }
    });
  });

  let lastReceivedMethod = null;
  let lastUpdatedTime = null;

  client.on("message", async (topic, message) => {
    const value = message.toString();
    const lastUpdated = new Date().toLocaleTimeString('en-GB', { hour12: false });
    lastReceivedMethod = topic;
    lastUpdatedTime = lastUpdated;

    console.log("Received:", topic, value, lastUpdated);
    await saveDemonstratorPlantData(topic, value, lastUpdated);
  });

  // Initial cleanup (run the next line if you want to delete nodes in the database)
  //deleteNodes({ type: "DemonstratorPlantData" });

  setInterval(async () => {
    await saveServerStatus(lastReceivedMethod, lastUpdatedTime);
    //await deleteServerStatusesExcept("current");
  }, 1000);

  client.on("error", (error) => {
    console.error("MQTT error:", error);
  });

  // Endpoints
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