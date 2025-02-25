[For the English documentation click here](#english)

---

# Anleitung zur Erstellung eines MR4B DataHub Moduls

## Inhaltsverzeichnis
1. [Einleitung](#1-einleitung)
2. [Voraussetzungen](#2-voraussetzungen)
   - [Installation von Docker](#21-installation-von-docker)
   - [Node.js](#22-nodejs)
   - [MR4B DataHub](#23-mr4b-datahub)
3. [Grundlagen zu Erstellung eines Moduls](#3-grundlagen-zu-erstellung-eines-moduls)
   - [GraphQL Schema](#31-graphql-schema)
   - [JavaScript](#32-javascript)
   - [File Service](#33-file-service)
   - [MQTT Integration](#34-mqtt-integration)
4. [Modulerstellung](#4-modulerstellung)
   - [Kopie eines Moduls erstellen](#41-kopie-eines-moduls-erstellen)
   - [Anpassen der Datei package.json](#42-anpassen-der-datei-packagejson)
   - [Anpassen der Datei docker-compose.yml](#43-anpassen-der-datei-docker-composeyml)
   - [Einfügen eines neuen Datentyps](#44-einfügen-eines-neuen-datentyps)
   - [Daten von REST API verwenden](#45-daten-von-rest-api-verwenden)
   - [Die Datei queries.graphql](#46-die-datei-queriesgraphql)
   - [Die Datei module.js](#47-die-datei-modulejs)
   - [Testen](#48-testen)

## 1 Einleitung

Der MR4B DataHub Server ist ein auf GraphQL basierender Server-Application-Stack, der eine flexible und skalierbare Datenverwaltung bietet.

Um eine Backend-Anwendung vom MR4B DataHub Server-Backend erzeugen zu lassen, wird ein entsprechendes MR4B DataHub Modul benötigt. Das grundlegende Setup von Datenbank, Webserver usw. muss dabei nicht vorbereitet werden, sondern wird vom DataHub Server bereit gestellt.

## 2 Voraussetzungen

Folgende Voraussetzungen müssen erfüllt sein:

### 2.1 Installation von Docker

https://docs.docker.com/desktop/setup/install/windows-install/

**Hinweise:**
- Beim ersten Start lassen sich die meisten Fragen oben rechts mit "Skip" überspringen.
- Docker installiert sich mit dem Windows Installer automatisch auf C:. Dort muss genügend Speicherplatz frei sein.
- Mindestens 20 GB freier Speicherplatz sind zu empfehlen.

### 2.2 Node.js

https://nodejs.org/en/download/prebuilt-installer

**Hinweis:** Standard Installation, aktuell müssen keine Optionen geändert oder zusätzlich ausgewählt werden.

### 2.3 MR4B DataHub

Download Zip-Datei von:
https://github.com/foprs/datahub-mr4b?tab=readme-ov-file

Projektinformationen sind unter folgender URL auf GitHub zu finden:
https://github.com/foprs/datahub-mr4b

## 3 Grundlagen zu Erstellung eines Moduls

Bei der Erstellung eines eigenen MR4B DataHub Moduls sind folgende Bereiche zu berücksichtigen:

### 3.1 GraphQL Schema

Im Ordner schemas werden types, queries und mutations in Dateien mit Dateiendung graphql definiert.

### 3.2 JavaScript

Mit JavaScript lassen sich optional folgende Funktionalitäten individualisieren:
- Individuelle Resolver
- Authentifizierung
- Individuelle REST Endpunkte / Initialisierung

Für die Nutzung von JavaScript muss die Datei module.js im Verzeichnis des neuen Moduls vorhanden sein. Die module.js Datei sollte lediglich als Einstiegspunkt dienen und extern definierte Methoden aufrufen. Für die Entwicklung eigener Business-Logik wird empfohlen, entsprechende Dateien im Unterordner src abzulegen und mit import-Anweisungen in der module.js-Datei nutzbar zu machen.

#### 3.2.1 Individuelle Resolver

Mit individuellen Resolvern können Felder im Schema definiert werden, insbesondere um Verbindungen zu externen Schnittstellen, Datenbanken oder APIs zu realisieren.
Um die individuellen Resolver zu definieren, muss die folgende Methode in der module.js-Datei exportiert werden:

```javascript
export async function getResolvers(datahub, context) { ... }
```

#### 3.2.2 Authentifizierung

MR4B DataHub unterstützt aktuell OAuth 2.0 zur Authentifizierung.
Um die OAuth 2.0 Konfiguration und benötigte callbacks zu definieren, muss folgende Methode in der module.js Datei exportiert werden:

```javascript
export async function getOAuthServerOptions(datahub, context) { ... }
```

Weitere Informationen zu OAuth:
https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html

#### 3.2.3 Individuelle REST Endpunkte / Initialisierung

Für Module kann eine Initialisierungs-Logik definiert werden, indem in der module.js Datei eine oder beide der folgenden Methoden exportiert werden:

```javascript
export async function preInitModule(datahub, context) { ... }
export async function initModule(datahub, context) { ... }
```

Die Methode `preInitModule()` wird vor allen anderen callbacks inklusive Authentifizierung (OAuth 2.0) und Initialisierung des GraphQL-Servers (Apollo) ausgeführt und eignet sich daher für frühe eigene Initialisierungen.

Die Methode `initModule()` sollte für individuelle REST Endpunkte genutzt werden, oder für Initialisierungen, die die DataHub middleware benötigen. Diese Methode wird aufgerufen, nachdem die OAuth 2.0-Authentifizierung eingerichtet wurde, der Apollo Server gestartet wurde und die API- und CMS-Endpunkte definiert sind.

### 3.3 File Service

Der MR4B DataHub stellt einen FileService zur Verfügung, welcher aus vordefinierten REST Endpunkten zum Hochladen, Löschen und Herunterladen von Dateien besteht.

#### 3.3.1 Upload

Folgende Endpunkte können zum Hochladen verwendet werden:
- POST /file/upload (multipart/form-data)
- PUT /file/upload (multipart/form-data)
- PUT /file/upload/{:identifier} (multipart/form-data)

#### 3.3.2 Löschen

Zum Löschen von Dateien kann folgender Endpunkt genutzt werden:
- DELETE /file/{:identifier}

#### 3.3.3 Herunterladen

Es gibt zwei Möglichkeiten, eine Datei herunterzuladen:
- Mit Authentifizierungs-Header: Der Client sendet eine GET-Anfrage mit einem Authentifizierungs-Header.
  `GET /file/{:identifier}`
- Ohne Authentifizierungs-Header: Der Client sendet eine GET-Anfrage mit einem temporären JWT-Token, welches als URL-Pfadparameter angefügt ist.
  `GET /file/get_token/{:identifier}`

Weitere Informationen zum File Service:
https://github.com/foprs/datahub-mr4b/blob/main/server/example_module/FILESERVICE.md

### 3.4 MQTT Integration

Der MR4B DataHub bietet die Möglichkeit, Daten über MQTT (Message Queuing Telemetry Transport) zu empfangen und in der Datenbank zu speichern. MQTT ist ein leichtgewichtiges Nachrichtenprotokoll, das für IoT-Anwendungen und die Machine-to-Machine (M2M) Kommunikation optimiert ist.

#### 3.4.1 Konfiguration der MQTT-Verbindung

Um MQTT in einem Modul zu integrieren, muss zunächst die MQTT-Client-Bibliothek installiert werden:

```bash
npm install mqtt --save
```

Dann kann die Verbindung zum MQTT-Broker in der Datei endpoints.js im src-Unterverzeichnis konfiguriert werden:

```javascript
import mqtt from 'mqtt';

export function applyEndpoints(datahub) {
  var app = datahub.app;
  var executeCypher = datahub.executeCypher;
  
  // MQTT-Client mit der Broker-Adresse initialisieren
  const client = mqtt.connect("mqtt://[BROKER-ADRESSE]:[PORT]");
  
  // Event-Handler für erfolgreiche Verbindung
  client.on("connect", () => {
    console.log("Verbunden mit MQTT-Broker");
    // Themen abonnieren
    client.subscribe("[THEMA]/#", (err) => {
      if (!err) {
        console.log("Thema abonniert");
      } else {
        console.error("Fehler beim Abonnieren:", err);
      }
    });
  });
  
  // Event-Handler für eingehende Nachrichten
  client.on("message", async (topic, message) => {
    const value = message.toString();
    console.log("Empfangen:", topic, value);
    
    // Speichern der Daten in der Datenbank mittels Cypher-Query
    const cypherQuery = "CREATE (d:IhrDatenTyp {topic: $topic, value: $value}) RETURN d";
    try {
      const result = await executeCypher(cypherQuery, { topic, value });
      const savedNode = result.records[0].get("d").properties;
      console.log("Daten gespeichert", savedNode);
    } catch (error) {
      console.error("Fehler beim Speichern der Daten:", error.message);
    }
  });
  
  // Event-Handler für Fehler
  client.on("error", (error) => {
    console.error("MQTT-Fehler:", error);
  });
}
```

#### 3.4.2 Anwendungsbeispiel: Demonstrator-Anlagendaten

Im folgenden Beispiel wird eine Integration für einen Anlagendemonstrator implementiert:

```javascript
import mqtt from 'mqtt';
export function applyEndpoints(datahub) {
  var app = datahub.app;
  var executeCypher = datahub.executeCypher;
  
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
}
```

Das entsprechende GraphQL-Schema für den neuen Datentyp in der Datei types.graphql sieht wie folgt aus:

```graphql
type DemonstratorPlantData {
  topic: String!
  value: String!
}
```

#### 3.4.3 Integration in die Modulkonfiguration

Um die MQTT-Integration zu aktivieren, muss die applyEndpoints-Funktion in der module.js exportiert werden:

```javascript
import {getResolvers} from './src/resolvers.js';
import {applyEndpoints} from "./src/endpoints.js";

export {
    getResolvers,
    applyEndpoints as initModule
};
```

Der DataHub-Server ruft diese Funktion automatisch während der Initialisierung auf und übergibt dabei Zugriff auf die Express-App (`app`) und die Datenbank-Funktionen, wie z.B. `executeCypher` für Neo4j-Datenbankabfragen.

## 4 Modulerstellung

Ein neues Modul kann z.B. in folgenden Schritten durch Kopieren und Bearbeiten eines vorhandenen Moduls, wie z.B. des mitgelieferten example_module, erstellt werden.

### 4.1 Kopie eines Moduls erstellen

Zunächst wird eine Kopie eines vorhandenen Moduls erstellt, z.B. durch Kopieren des Ordners example_module im Verzeichnis server. In diesem Beispiel nennen wir die Kopie roesberg_module.

### 4.2 Anpassen der Datei package.json

Im Verzeichnis roesberg_module (im Verzeichnis server) befindet sich die Datei package.json. Diese Datei mit einem Texteditor öffnen und name, version und description anpassen, z.B.:

```json
{
  "name": "roesberg_datahub_module",
  "version": "1.0.0",
  "description": "Roesberg DataHub module"
}
```

### 4.3 Anpassen der Datei docker-compose.yml

Im Verzeichnis server befindet sich die Datei docker-compose.yml. Diese Datei mit einem Texteditor öffnen und den Bereich backend anpassen, um z.B. das neue Modul roesberg_module als Backend zu verwenden. Unter volumes muss das neue Modulverzeichnis gefolgt von :/module angegeben sein. Außerdem sollte der container_name angepasst werden, z.B. in datahub-roesberg-backend:

```yaml
backend:
  depends_on:
    cms:
      condition: service_completed_successfully
    neo4j:
      condition: service_healthy
  image: ris088/datahub-backend
  container_name: datahub-roesberg-backend
  volumes:
    - ./roesberg_module:/module
    - ./cms:/cms
  ports:
```

### 4.4 Einfügen eines neuen Datentyps

Als einfaches Beispiel fügen wir einen neuen Typ "RoesbergData" zu den im Modul vorhandenen Typen hinzu. Dazu muss in der Datei types.graphql im Unterverzeichnis schemas des Modulverzeichnisses z.B. Folgendes eingefügt werden:

```graphql
type RoesbergData
@mutation(operations: []) # Make this type read-only
{
    id: Int!
    formData: String!
    contact: String!
}
```

Damit wäre der neue Typ bereits verfügbar und z.B. im GraphQL Frontend sichtbar, zunächst ohne Daten:

![grafik](https://github.com/user-attachments/assets/2401db14-76b1-44a8-b499-d82b45cfb310)


### 4.5 Daten von REST API verwenden

Als einfaches Beispiel greifen wir auf Daten aus einer REST API zu und erzeugen damit Einträge des neuen Typs RoesbergData. Dazu kann die Datei resolvers.js im Unterverzeichnis src des Modulverzeichnisses angepasst werden.
Es wird zum einen eine Funktion benötigt, die Daten aus externer Quelle, wie z.B. über eine REST API, holen kann. Im Beispiel für den Typ RoesbergData ist die z.B. die Funktion roesbergData, die im folgenden Code-Beispiel zu sehen ist.
Zum anderen wird für das Headless CMS eine Funktion benötigt, die die Anzahl der Elemente ermittelt, die von diesem Resolver zur Verfügung gestellt wird. Im Beispiel ist dies die Funktion roesbergDataAggregate. 
Abschließend muss die resolvers-Query angepasst werden, so dass die beiden zuvor genannten Funktionen genutzt werden.
Die resolvers.js kann z.B. so aufgebaut werden:

```javascript
const FAKE_API_URL = 'https://reqres.in/api/users';

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
    return {count: resJson.total};
}

const resolvers = {
    Query: {
        // The following two overwrite the auto-generated resolvers for the `RoesbergData` type
        roesbergData,
        roesbergDataAggregate
    },
}

export const getResolvers = () => resolvers;
```

### 4.6 Die Datei queries.graphql

Im Modul-Unterordner schemas befindet sich die Datei queries.graphql, der im Block type Query für unser Beispiel folgende Zeile hinzugefügt werden sollte:

```graphql
GenerateRoesbergData(userInfo: UserKnownInfo): RoesbergData
```

### 4.7 Die Datei module.js

In der Datei module.js, welche im Modulordner liegt, also im Beispiel in roesberg_module. muss die angepasste resolvers.js aus dem Unterverzeichnis src importiert werden. Der Inhalt der module.js könnte dann z.B. so aussehen:

```javascript
import {getResolvers} from './src/resolvers.js';
import {getOAuthServerOptions, getProtectedEndpoints} from "./src/auth.js";
import {applyEndpoints} from "./src/endpoints.js";

export {
    getResolvers,
    getOAuthServerOptions,
    getProtectedEndpoints,
    applyEndpoints as initModule
};
```

### 4.8 Testen

1. Zum Testen des neuen Moduls in dessen Unterverzeichnis server folgenden Befehl ausführen:
```bash
docker compose up -d
```

![grafik](https://github.com/user-attachments/assets/bdcbe6bb-7637-4f1b-80ec-2abc88f7c013)

2. Nach einigen Sekunden sollte das neue backend Modul erfolgreich gestartet sein.

3. Anschließend im Webbrowser folgenden Link aufrufen, um das Modul mit den Daten im GraphQL-Frontend zu sehen:
```
http://localhost:8000
```

Nun sollten im Frontend für den neuen Typ Einträge auf Basis der Daten aus der REST-API sichtbar sein:

![grafik](https://github.com/user-attachments/assets/af9b1d3c-6f85-41d7-9106-d3cf5209778f)

---
---

# Guide to Creating an MR4B DataHub Module

## Table of Contents
1. [Introduction](#1-introduction)
2. [Prerequisites](#2-prerequisites)
   - [Docker Installation](#21-docker-installation)
   - [Node.js](#22-nodejs)
   - [MR4B DataHub](#23-mr4b-datahub)
3. [Module Creation Basics](#3-module-creation-basics)
   - [GraphQL Schema](#31-graphql-schema)
   - [JavaScript](#32-javascript)
   - [File Service](#33-file-service)
   - [MQTT Integration](#34-mqtt-integration)
4. [Module Creation](#4-module-creation)
   - [Creating a Module Copy](#41-creating-a-module-copy)
   - [Modifying package.json](#42-modifying-packagejson)
   - [Modifying docker-compose.yml](#43-modifying-docker-composeyml)
   - [Adding a New Data Type](#44-adding-a-new-data-type)
   - [Using Data from REST API](#45-using-data-from-rest-api)
   - [The queries.graphql File](#46-the-queriesgraphql-file)
   - [The module.js File](#47-the-modulejs-file)
   - [Testing](#48-testing)

## 1 Introduction

The MR4B DataHub Server is a GraphQL-based server application stack that provides flexible and scalable data management.

To generate a backend application from the MR4B DataHub Server backend, a corresponding MR4B DataHub module is required. The basic setup of database, web server, etc., does not need to be prepared as it is provided by the DataHub Server.

## 2 Prerequisites

The following prerequisites must be met:

### 2.1 Docker Installation

https://docs.docker.com/desktop/setup/install/windows-install/

**Notes:**
- During first startup, most questions in the top right can be skipped using "Skip".
- Docker automatically installs on C: drive with the Windows installer. Sufficient storage space must be available there.
- At least 20 GB of free storage space is recommended.

### 2.2 Node.js

https://nodejs.org/en/download/prebuilt-installer

**Note:** Standard installation, currently no options need to be changed or additionally selected.

### 2.3 MR4B DataHub

Download ZIP file from:
https://github.com/foprs/datahub-mr4b?tab=readme-ov-file

Project information can be found at the following URL on GitHub:
https://github.com/foprs/datahub-mr4b

## 3 Module Creation Basics

When creating your own MR4B DataHub module, the following areas need to be considered:

### 3.1 GraphQL Schema

Types, queries, and mutations are defined in files with the .graphql extension in the schemas folder.

### 3.2 JavaScript

JavaScript can optionally be used to customize the following functionalities:
- Custom Resolvers
- Authentication
- Custom REST Endpoints / Initialization

To use JavaScript, the module.js file must exist in the directory of the new module. The module.js file should only serve as an entry point and call externally defined methods. For developing custom business logic, it is recommended to store corresponding files in the src subdirectory and make them usable in the module.js file using import statements.

#### 3.2.1 Custom Resolvers

Custom resolvers allow fields to be defined in the schema, particularly to implement connections to external interfaces, databases, or APIs.
To define custom resolvers, the following method must be exported in the module.js file:

```javascript
export async function getResolvers(datahub, context) { ... }
```

#### 3.2.2 Authentication

MR4B DataHub currently supports OAuth 2.0 for authentication.
To define the OAuth 2.0 configuration and required callbacks, the following method must be exported in the module.js file:

```javascript
export async function getOAuthServerOptions(datahub, context) { ... }
```

More information about OAuth:
https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html

#### 3.2.3 Custom REST Endpoints / Initialization

Modules can define initialization logic by exporting one or both of the following methods in the module.js file:

```javascript
export async function preInitModule(datahub, context) { ... }
export async function initModule(datahub, context) { ... }
```

The `preInitModule()` method is executed before all other callbacks including authentication (OAuth 2.0) and GraphQL server (Apollo) initialization, making it suitable for early custom initializations.

The `initModule()` method should be used for custom REST endpoints or initializations that require the DataHub middleware. This method is called after OAuth 2.0 authentication is set up, the Apollo Server is started, and the API and CMS endpoints are defined.

### 3.3 File Service

The MR4B DataHub provides a FileService consisting of predefined REST endpoints for uploading, deleting, and downloading files.

#### 3.3.1 Upload

The following endpoints can be used for uploading:
- POST /file/upload (multipart/form-data)
- PUT /file/upload (multipart/form-data)
- PUT /file/upload/{:identifier} (multipart/form-data)

#### 3.3.2 Delete

The following endpoint can be used for deleting files:
- DELETE /file/{:identifier}

#### 3.3.3 Download

There are two ways to download a file:
- With Authentication Header: The client sends a GET request with an authentication header.
  `GET /file/{:identifier}`
- Without Authentication Header: The client sends a GET request with a temporary JWT token appended as a URL path parameter.
  `GET /file/get_token/{:identifier}`

More information about the File Service:
https://github.com/foprs/datahub-mr4b/blob/main/server/example_module/FILESERVICE.md

### 3.4 MQTT Integration

The MR4B DataHub offers the capability to receive data via MQTT (Message Queuing Telemetry Transport) and store it in the database. MQTT is a lightweight messaging protocol optimized for IoT applications and Machine-to-Machine (M2M) communication.

#### 3.4.1 Configuring the MQTT Connection

To integrate MQTT in a module, first install the MQTT client library:

```bash
npm install mqtt --save
```

Then, the connection to the MQTT broker can be configured in the endpoints.js file in the src subdirectory:

```javascript
import mqtt from 'mqtt';

export function applyEndpoints(datahub) {
  var app = datahub.app;
  var executeCypher = datahub.executeCypher;
  
  // Initialize MQTT client with broker address
  const client = mqtt.connect("mqtt://[BROKER-ADDRESS]:[PORT]");
  
  // Event handler for successful connection
  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    // Subscribe to topics
    client.subscribe("[TOPIC]/#", (err) => {
      if (!err) {
        console.log("Topic subscribed");
      } else {
        console.error("Error subscribing:", err);
      }
    });
  });
  
  // Event handler for incoming messages
  client.on("message", async (topic, message) => {
    const value = message.toString();
    console.log("Received:", topic, value);
    
    // Store data in the database using Cypher query
    const cypherQuery = "CREATE (d:YourDataType {topic: $topic, value: $value}) RETURN d";
    try {
      const result = await executeCypher(cypherQuery, { topic, value });
      const savedNode = result.records[0].get("d").properties;
      console.log("Data saved", savedNode);
    } catch (error) {
      console.error("Error saving data:", error.message);
    }
  });
  
  // Event handler for errors
  client.on("error", (error) => {
    console.error("MQTT error:", error);
  });
}
```

#### 3.4.2 Application Example: Demonstrator Plant Data

In the following example, an integration for a plant demonstrator is implemented:

```javascript
import mqtt from 'mqtt';
export function applyEndpoints(datahub) {
  var app = datahub.app;
  var executeCypher = datahub.executeCypher;
  
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
}
```

The corresponding GraphQL schema for the new data type in the types.graphql file looks like this:

```graphql
type DemonstratorPlantData {
  topic: String!
  value: String!
}
```

#### 3.4.3 Integration into the Module Configuration

To enable the MQTT integration, the applyEndpoints function must be exported in the module.js file:

```javascript
import {getResolvers} from './src/resolvers.js';
import {applyEndpoints} from "./src/endpoints.js";

export {
    getResolvers,
    applyEndpoints as initModule
};
```

The DataHub server automatically calls this function during initialization, providing access to the Express app (`app`) and database functions, such as `executeCypher` for Neo4j database queries.

## 4 Module Creation

A new module can be created, for example, in the following steps by copying and editing an existing module, such as the included example_module.

### 4.1 Creating a Module Copy

First, create a copy of an existing module, e.g., by copying the example_module folder in the server directory. In this example, we'll call the copy roesberg_module.

### 4.2 Modifying package.json

In the roesberg_module directory (in the server directory), you'll find the package.json file. Open this file with a text editor and modify name, version, and description, e.g.:

```json
{
  "name": "roesberg_datahub_module",
  "version": "1.0.0",
  "description": "Roesberg DataHub module"
}
```

### 4.3 Modifying docker-compose.yml

In the server directory, you'll find the docker-compose.yml file. Open this file with a text editor and modify the backend section to use the new roesberg_module as the backend. Under volumes, the new module directory followed by :/module must be specified. Also, the container_name should be modified, e.g., to datahub-roesberg-backend:

```yaml
backend:
  depends_on:
    cms:
      condition: service_completed_successfully
    neo4j:
      condition: service_healthy
  image: ris088/datahub-backend
  container_name: datahub-roesberg-backend
  volumes:
    - ./roesberg_module:/module
    - ./cms:/cms
  ports:
```

### 4.4 Adding a New Data Type

As a simple example, we'll add a new type "RoesbergData" to the types present in the module. To do this, the following must be inserted into the types.graphql file in the schemas subdirectory of the module directory:

```graphql
type RoesbergData
@mutation(operations: []) # Make this type read-only
{
    id: Int!
    formData: String!
    contact: String!
}
```

This would make the new type available and visible in the GraphQL frontend, initially without data:

![graphic](https://github.com/user-attachments/assets/2401db14-76b1-44a8-b499-d82b45cfb310)

### 4.5 Using Data from REST API

As a simple example, we'll access data from a REST API and create entries of the new RoesbergData type. The resolvers.js file in the src subdirectory of the module directory can be modified for this purpose.
First, a function is needed that can fetch data from an external source, such as through a REST API. In the example for the RoesbergData type, this is the roesbergData function, which can be seen in the following code example.
Additionally, for the Headless CMS, a function is needed that determines the number of elements provided by this resolver. In the example, this is the roesbergDataAggregate function.
Finally, the resolvers query must be modified so that both previously mentioned functions are used.
The resolvers.js can be structured like this:

```javascript
const FAKE_API_URL = 'https://reqres.in/api/users';

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
    return {count: resJson.total};
}

const resolvers = {
    Query: {
        // The following two overwrite the auto-generated resolvers for the `RoesbergData` type
        roesbergData,
        roesbergDataAggregate
    },
}

export const getResolvers = () => resolvers;
```

### 4.6 The queries.graphql File

In the module's schemas subdirectory, the queries.graphql file is located. The following line should be added to the type Query block for our example:

```graphql
GenerateRoesbergData(userInfo: UserKnownInfo): RoesbergData
```

### 4.7 The module.js File

In the module.js file, which is located in the module directory (in our example, roesberg_module), the modified resolvers.js from the src subdirectory must be imported. The content of module.js could then look like this:

```javascript
import {getResolvers} from './src/resolvers.js';
import {getOAuthServerOptions, getProtectedEndpoints} from "./src/auth.js";
import {applyEndpoints} from "./src/endpoints.js";

export {
    getResolvers,
    getOAuthServerOptions,
    getProtectedEndpoints,
    applyEndpoints as initModule
};
```

### 4.8 Testing

1. To test the new module, execute the following command in its server subdirectory:
```bash
docker compose up -d
```

![graphic](https://github.com/user-attachments/assets/bdcbe6bb-7637-4f1b-80ec-2abc88f7c013)

2. After a few seconds, the new backend module should be successfully started.

3. Then open the following link in a web browser to see the module with the data in the GraphQL frontend:
```
http://localhost:8000
```

Now entries based on the data from the REST API should be visible in the frontend for the new type:

![graphic](https://github.com/user-attachments/assets/af9b1d3c-6f85-41d7-9106-d3cf5209778f)
