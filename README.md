# Anleitung zur Erstellung eines MR4B DataHub Moduls

## Inhaltsverzeichnis
1. [Einleitung](#1-einleitung)
2. [Voraussetzungen](#2-voraussetzungen)
   1. [Installation von Docker](#21-installation-von-docker)
   2. [Node.js](#22-nodejs)
   3. [MR4B DataHub](#23-mr4b-datahub)
3. [Grundlagen zu Erstellung eines Moduls](#3-grundlagen-zu-erstellung-eines-moduls)
   1. [GraphQL Schema](#31-graphql-schema)
   2. [JavaScript](#32-javascript)
   3. [File Service](#33-file-service)
4. [Modulerstellung](#4-modulerstellung)
   1. [Kopie eines Moduls erstellen](#41-kopie-eines-moduls-erstellen)
   2. [Anpassen der Datei package.json](#42-anpassen-der-datei-packagejson)
   3. [Anpassen der Datei docker-compose.yml](#43-anpassen-der-datei-docker-composeyml)
   4. [Einfügen eines neuen Datentyps](#44-einfügen-eines-neuen-datentyps)
   5. [Daten von REST API verwenden](#45-daten-von-rest-api-verwenden)
   6. [Die Datei queries.graphql](#46-die-datei-queriesgraphql)
   7. [Die Datei module.js](#47-die-datei-modulejs)
   8. [Testen](#48-testen)

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

Im Verzeichnis server befindet sich die Datei docker-compose.yml. Diese Datei mit einem Texteditor öffnen und den Bereich backend anpassen:

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

Als einfaches Beispiel greifen wir auf Daten aus einer REST API zu und erzeugen damit Einträge des neuen Typs RoesbergData. Dazu kann die Datei resolvers.js im Unterverzeichnis src des Modulverzeichnisses angepasst werden:

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

In der Datei module.js, welche im Modulordner liegt, muss die angepasste resolvers.js aus dem Unterverzeichnis src importiert werden:

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
