:begin
CREATE CONSTRAINT UNIQUE_IMPORT_NAME FOR (node:`UNIQUE IMPORT LABEL`) REQUIRE (node.`UNIQUE IMPORT ID`) IS UNIQUE;
:commit
CALL db.awaitIndexes(300);
:begin
UNWIND [{_id:19, properties:{id:"b35d5ca7-dc5a-4a24-8ca5-4c726fe71007", title:"Seinfeld", episodes:88}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Series;
UNWIND [{_id:2, properties:{gender:"Male", name:"Jack Jones", dateOfBirth:date('1967-01-12'), id:"e80fcf0b-2f5f-474e-853f-0c9159901043"}}, {_id:3, properties:{gender:"Female", name:"Annabelle Brooks", dateOfBirth:date('1992-09-27'), id:"51ae2b23-15a3-44cf-99d0-6c65950a3259"}}, {_id:4, properties:{address:"Fake St. 123", gender:"Male", name:"Otto McKnight", dateOfBirth:date('1984-03-12'), id:"c5339bb7-10de-438e-9cea-0d7549e66c0f"}}, {_id:5, properties:{address:"Imaginary Alley 44", gender:"Other", name:"Kim Johnson", dateOfBirth:date('1999-12-31'), id:"6d636ee1-8eee-44a9-9f3b-cd6c21ff1c67"}}, {_id:13, properties:{address:"Up The Hill 23, 12234 Mountainville", gender:"Female", name:"Paula Anderson", dateOfBirth:date('1972-04-04'), id:"45e7f862-c405-4293-8b9e-b50993ac7f77"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Demo:Person;
UNWIND [{_id:16, properties:{name:"John Travolta", id:"2c398a3f-4bcf-4cef-b6c8-df68ab4e3d3c"}}, {_id:18, properties:{name:"Jerry Seinfeld", id:"6ad13df3-88d9-4c12-b85c-c30bb726f6e7"}}, {_id:20, properties:{name:"The \"Bees\"", id:"2596f07f-6b00-40a7-90ab-dfc867c50979"}}, {_id:23, properties:{name:"Bruce Willis", id:"5151a117-ddfd-4c43-9bfb-e823bc9572f5"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Actor;
UNWIND [{_id:9, properties:{quantity:56, price:1.99, name:"Cheeseburger", id:"d3e8a3b2-9e3e-467a-921e-fe3e2aa2c11e"}}, {_id:10, properties:{quantity:120, price:4.5, name:"Fresh Salad ", description:"100g mixed salad with olives and feta cheese", id:"4a63dad7-c06f-4538-9d0b-86f3dd703743"}}, {_id:11, properties:{quantity:233, price:1.19, name:"Milk 1L", description:"", id:"751c6294-6251-4055-882d-19be159efa29"}}, {_id:12, properties:{quantity:-1, price:249.0, name:"Office Suite 2023", id:"f71fc3f6-d4a9-4b13-8551-bb0a79314803"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Demo:Product;
UNWIND [{_id:26, properties:{metaId:"0d68c3bb-fff4-4d7d-a88c-6e28a2b29416", type:"AssetAdministrationShell", value:"key"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Key;
UNWIND [{_id:14, properties:{website:"https://agroloxial.com", industries:["Agriculture", "IT"], name:"Agro-LoXial", description:"Apps for farmers", id:"631b0bb1-5f83-44ba-9eaa-38af05d84ef0"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Company;
UNWIND [{_id:17, properties:{runtime:120, id:"f805d654-708f-4e3a-8ea5-b877d7836587", title:"Bee Movie"}}, {_id:21, properties:{runtime:123, id:"7048c82b-9b08-43e4-b798-92fd6c9b5050", title:"Das große Krabbeln"}}, {_id:22, properties:{runtime:130, id:"50d54fde-f3e4-40b1-b5c3-bd5789e2b610", title:"Die Hard 1"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Movie;
UNWIND [{_id:6, properties:{industries:["IT", "Services"], name:"Software Solutions Ltd", id:"6d53d37c-6e48-491c-943c-1c85c6383d5f"}}, {_id:7, properties:{industries:["Agriculture", "Foods"], name:"Future Farming Industries", id:"64670bec-0b64-4abd-82df-da8f90c0b243"}}, {_id:8, properties:{industries:["Foods"], name:"Feel Good Inc.", id:"dda78197-e008-4742-95ea-b00904aa1f03"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Company:Demo;
UNWIND [{_id:25, properties:{idShort:"", metaId:"48581428-90b9-4403-8909-5ed37a769519", id:"123", modelType:"BasicEventElement"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Submodel;
UNWIND [{_id:24, properties:{idShort:"123", metaId:"454b9a19-5e34-45f8-bcc8-ed442a810760", modelType:"Blob", category:"BlobCat"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:Capability;
UNWIND [{_id:0, properties:{nodeId:"TestId"}}, {_id:1, properties:{id:"testID"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:TestNode;
UNWIND [{_id:15, properties:{id:"test"}}] AS row
CREATE (n:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row._id}) SET n += row.properties SET n:TA;
:commit
:begin
UNWIND [{start: {_id:25}, end: {_id:24}, properties:{}}] AS row
MATCH (start:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.start._id})
MATCH (end:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.end._id})
CREATE (start)-[r:submodelElements]->(end) SET r += row.properties;
UNWIND [{start: {_id:4}, end: {_id:6}, properties:{}}, {start: {_id:3}, end: {_id:8}, properties:{}}] AS row
MATCH (start:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.start._id})
MATCH (end:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.end._id})
CREATE (start)-[r:WORKS_FOR]->(end) SET r += row.properties;
UNWIND [{start: {_id:9}, end: {_id:8}, properties:{}}, {start: {_id:10}, end: {_id:7}, properties:{}}, {start: {_id:12}, end: {_id:6}, properties:{}}, {start: {_id:11}, end: {_id:7}, properties:{}}] AS row
MATCH (start:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.start._id})
MATCH (end:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.end._id})
CREATE (start)-[r:OFFERED_BY]->(end) SET r += row.properties;
UNWIND [{start: {_id:23}, end: {_id:22}, properties:{}}, {start: {_id:18}, end: {_id:17}, properties:{}}, {start: {_id:16}, end: {_id:17}, properties:{}}, {start: {_id:20}, end: {_id:21}, properties:{}}] AS row
MATCH (start:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.start._id})
MATCH (end:`UNIQUE IMPORT LABEL`{`UNIQUE IMPORT ID`: row.end._id})
CREATE (start)-[r:ACTED_IN]->(end) SET r += row.properties;
:commit
:begin
MATCH (n:`UNIQUE IMPORT LABEL`)  WITH n LIMIT 20000 REMOVE n:`UNIQUE IMPORT LABEL` REMOVE n.`UNIQUE IMPORT ID`;
:commit
:begin
DROP CONSTRAINT UNIQUE_IMPORT_NAME;
:commit
