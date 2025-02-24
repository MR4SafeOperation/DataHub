


import {getResolvers} from './src/resolvers.js';
import {getOAuthServerOptions, getProtectedEndpoints} from "./src/auth.js";
import {applyEndpoints} from "./src/endpoints.js";


export {
    getResolvers,
    getOAuthServerOptions,
    getProtectedEndpoints,
    applyEndpoints as initModule
};

//const mqtt = require("mqtt");
// import mqtt from 'mqtt';
// const client = mqtt.connect("mqtt://192.168.178.11:1883");

// client.on("connect", () => {
//   console.log("Connected to Demonstrator | MQTT-Server")
//   client.subscribe("MR4SO/#", (err) => {
//     if (!err) {
//       console.log("Topic MR4SO/# suscribed")
//     } else {
//       console.error("Error at subscribing: ", err)
//     }
//   });
// });

// client.on("message", (topic, message) => {
//   console.log(topic + " " + message.toString());
// });

// client.on("error", (error) => {
//   console.error("MQTT error:", error);
// });