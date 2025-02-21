# Anleitung zur Erstellung eines MR-DataHub Moduls

## Inhalt

1. [Einleitung](#einleitung)
2. [Voraussetzungen](#voraussetzungen)
   - [Installation von Docker](#installation-von-docker)
   - [Node.js](#nodejs)
   - [MR4B DataHub](#mr4b-datahub)
3. [Grundlagen zur Erstellung eines Moduls](#grundlagen-zur-erstellung-eines-moduls)
   - [GraphQL Schema](#graphql-schema)
   - [JavaScript](#javascript)
     - [Individuelle Resolver](#individuelle-resolver)
     - [Authentifizierung](#authentifizierung)
     - [Individuelle REST Endpunkte / Initialisierung](#individuelle-rest-endpunkte--initialisierung)
   - [File Service](#file-service)
     - [Upload](#upload)
     - [Löschen](#löschen)
     - [Herunterladen](#herunterladen)
4. [Modulerstellung](#modulerstellung)
   - [Kopie eines Moduls erstellen](#kopie-eines-moduls-erstellen)
   - [Anpassen der Datei package.json](#anpassen-der-datei-packagejson)
   - [Anpassen der Datei docker-compose.yml](#anpassen-der-datei-docker-composeyml)
   - [Einfügen eines neuen Datentyps](#einfügen-eines-neuen-datentyps)
   - [Daten von REST API verwenden](#daten-von-rest-api-verwenden)
   - [Die Datei queries.graphql](#die-datei-queriesgraphql)
   - [Die Datei module.js](#die-datei-modulejs)
   - [Testen](#testen)

---

## Einleitung

Der MR4B DataHub Server ist ein auf GraphQL basierender Server-Application-Stack, der eine flexible und skalierbare Datenverwaltung bietet: [https://github.com/foprs/datahub-mr4b](https://github.com/foprs/datahub-mr4b)

Um eine Backend-Anwendung mit dem MR4B DataHub Server-Backend zu erzeugen, wird ein entsprechendes Modul benötigt. Das grundlegende Setup von Datenbank, Webserver etc. wird dabei vom DataHub Server bereitgestellt.

---

## Voraussetzungen

### Installation von Docker

[Installationsanleitung für Docker](https://docs.docker.com/desktop/setup/install/windows-install/)

- Beim ersten Start können die meisten Fragen mit "Skip" übersprungen werden.
- Docker wird standardmäßig auf Laufwerk C installiert. Mindestens **20 GB** freier Speicherplatz sind erforderlich.

### Node.js

[Download Node.js](https://nodejs.org/en/download/prebuilt-installer)

- Standardinstallation reicht aus. Keine zusätzlichen Optionen erforderlich.

### MR4B DataHub

- [Download des DataHub](https://github.com/foprs/datahub-mr4b?tab=readme-ov-file)
- Projektinformationen: [GitHub Repository](https://github.com/foprs/datahub-mr4b)

---

## Grundlagen zur Erstellung eines Moduls

### GraphQL Schema

Das Schema wird im Ordner `schemas` definiert. Hier befinden sich `types`, `queries` und `mutations` als `.graphql` Dateien.

### JavaScript

Mit JavaScript lassen sich folgende Funktionalitäten individualisieren:
- Individuelle Resolver
- Authentifizierung
- REST Endpunkte / Initialisierung

Die Datei `module.js` muss im Modulverzeichnis existieren und dient als Einstiegspunkt.

#### Individuelle Resolver

```javascript
export async function getResolvers(datahub, context) { ... }
```

#### Authentifizierung (OAuth 2.0)

```javascript
export async function getOAuthServerOptions(datahub, context) { ... }
```

[Weitere Informationen zu OAuth](https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html)

#### Individuelle REST Endpunkte / Initialisierung

```javascript
export async function preInitModule(datahub, context) { ... }
export async function initModule(datahub, context) { ... }
```

---

## File Service

### Upload

```http
POST /file/upload (multipart/form-data)
PUT /file/upload/{:identifier} (multipart/form-data)
```

### Löschen

```http
DELETE /file/{:identifier}
```

### Herunterladen

```http
GET /file/{:identifier}
GET /file/get_token/{:identifier}
```

[Mehr Infos zum File Service](https://github.com/foprs/datahub-mr4b/blob/main/server/example_module/FILESERVICE.md)

---

## Modulerstellung

### Kopie eines Moduls erstellen

Ein vorhandenes Modul kopieren, z.B. `example_module` und in `roesberg_module` umbenennen.

### Anpassen der Datei package.json

```json
{
  "name": "roesberg_datahub_module",
  "version": "1.0.0",
  "description": "Roesberg DataHub module"
}
```

### Anpassen der Datei docker-compose.yml

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

### Einfügen eines neuen Datentyps

Datei `types.graphql` erweitern:

```graphql
type RoesbergData @mutation(operations: []) {
  id: Int!
  formData: String!
  contact: String!
}
```

### Daten von REST API verwenden

Datei `resolvers.js` anpassen:

```javascript
const FAKE_API_URL = 'https://reqres.in/api/users';

async function roesbergData(parent, args, context, info) {
  let { limit, offset } = args.options;
  limit = limit || 10;
  offset = offset || 0;

  let res = await fetch(FAKE_API_URL);
  let { per_page, total } = await res.json();

  const pagePromises = [];
  for (let i = 1; i <= Math.ceil(total / per_page); i++) {
    pagePromises.push(fetch(`${FAKE_API_URL}?page=${i}`));
  }

  const pageData = await Promise.all(pagePromises.map(res => res.json()));
  const allData = pageData.flatMap(page => page.data);

  return allData.map(user => ({
    id: user.id,
    formData: Math.random().toString(36).substring(2, 8),
    contact: `${user.first_name.charAt(0)}.${user.last_name}`
  }));
}

export const getResolvers = () => ({ Query: { roesbergData } });
```

### Die Datei queries.graphql

```graphql
type Query {
  GenerateRoesbergData(userInfo: UserKnownInfo): RoesbergData
}
```

### Die Datei module.js

```javascript
import { getResolvers } from './src/resolvers.js';
export { getResolvers };
```

### Testen

```sh
docker compose up -d
```

Anschließend im Browser öffnen: [http://localhost:8000](http://localhost:8000)
