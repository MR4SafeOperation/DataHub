let executeCypherRef; 

export function initCypherExecutor(executor) {
  executeCypherRef = executor;
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