
import mqtt from 'mqtt';
import xvisualConnection from './xvisualConnection.js';
export function applyEndpoints(datahub) {

  //TODO this will simulate changing live data for debugging
  setInterval(async() => {

    const cypherQuery = "MERGE (d:DemonstratorPlantData {topic : $topic }) ON CREATE SET d.value = $value ON MATCH SET d.value = $value RETURN d";
    try {
      const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const result = await executeCypher(cypherQuery, { topic: "ServerTime", value: currentTime });
      const savedNode = result.records[0].get("d").properties;
      console.log("Data saved", savedNode);
    } catch (error) {
      console.error("Error while writing DemonstratorPlantData:", error.message);
    }
  }, 1000);


  var app = datahub.app;
  var executeCypher = datahub.executeCypher;
  const client = mqtt.connect(process.env.MQQTSERVER_IP);

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

    const cypherQuery = "MERGE (d:DemonstratorPlantData {topic : $topic }) ON CREATE SET d.value = $value ON MATCH SET d.value = $value RETURN d";

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

  app.get('/xvforward', async (req, res) => {
    return xvisualConnection.getInstance().ForwardHTTP(req, res);
  });
}

