import mqtt from 'mqtt';

let executeCypherRef;
let client;

export function initCypherExecutor(executor) {
  executeCypherRef = executor;
}

export function initMQTTClient(){
  client = mqtt.connect(process.env.MQQTSERVER_IP);

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
}


export async function deleteNodes({ type, key = null, value = null }) {
  let cypherQuery;
  let params = {};

  if (key && value) {
    cypherQuery = `MATCH (n:${type} {${key}: $value}) DETACH DELETE n`;
    params = { value };
  } else {
    cypherQuery = `MATCH (n:${type}) DETACH DELETE n`;
  }

  try {
    await executeCypherRef(cypherQuery, params);
    console.log(`Deleted ${key ? `nodes of type '${type}' where ${key} = '${value}'` : `ALL nodes of type '${type}'`}`);
  } catch (error) {
    console.error("Error deleting nodes:", error.message);
  }
}

export async function saveDemonstratorPlantData(topic, value, lastUpdated) {
  const cypherQuery = `
    MERGE (d:DemonstratorPlantData {topic: $topic})
    ON CREATE SET d.value = $value, d.lastUpdated = $lastUpdated
    ON MATCH SET d.value = $value, d.lastUpdated = $lastUpdated
    RETURN d
  `;

  try {
    const result = await executeCypherRef(cypherQuery, { topic, value, lastUpdated });
    const savedNode = result.records[0].get("d").properties;
    console.log("Data saved", savedNode);
  } catch (error) {
    console.error("Error saving DemonstratorPlantData:", error.message);
  }
}

export async function saveServerStatus(method, lastUpdatedTime) {
  const cypherQuery = `
    MERGE (d:ServerStatus {id: 'current'})
    ON CREATE SET d.serverTime = $serverTime, d.lastUpdated = $lastUpdated, d.method = $method
    ON MATCH SET d.serverTime = $serverTime, d.lastUpdated = $lastUpdated, d.method = $method
    RETURN d
  `;

  const serverTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

  try {
    const result = await executeCypherRef(cypherQuery, {
      id: 'current',
      serverTime,
      lastUpdated: lastUpdatedTime,
      method,
    });
    const savedNode = result.records[0].get("d").properties;
    //console.log("ServerStatus saved", savedNode);
  } catch (error) {
    console.error("Error saving ServerStatus:", error.message);
  }
}

export async function deleteServerStatusesExcept(id = 'current') {
  const cypherQuery = `
    MATCH (s:ServerStatus)
    WHERE s.id <> $id OR s.id IS NULL
    DETACH DELETE s
  `;

  try {
    await executeCypherRef(cypherQuery, { id });
    console.log(`Deleted ServerStatus nodes not matching id = '${id}'`);
  } catch (error) {
    console.error("Error deleting ServerStatus nodes:", error.message);
  }
}

export async function publishMessage(topic, message) {
  return new Promise((resolve, reject) => {
    if(!client){
      return reject(new Error("MQTT client not connected!"));
    }
    client.publish(topic, message, (err) => {
      if(err){
        reject(err);
      }else{
        resolve();
      }
    })
  })  
}