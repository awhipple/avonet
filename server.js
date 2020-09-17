const WebSocket = require('ws');

const AWS = require('aws-sdk');
AWS.config.update({
  region: "us-east-2",
  endpoint: "https://dynamodb.us-east-2.amazonaws.com",
});

const port = 9789;
const wss = new WebSocket.Server({port});

const channels = {};

wss.on('connection', function connection(ws) {

  console.log("Initiated new connection with client");

  ws.on('message', message => {

    var parsed = JSON.parse(message);
    if ( ws.clientName ) {
      parsed.from = ws.clientName;
    }
    message = JSON.stringify(parsed);

    var { type, channel: channelName, body, name } = parsed;
    var channel = null;
    if ( channelName ) {
      channels[channelName] = channels[channelName] || [];
      channel = channels[channelName];
      var channelIndex = channel.indexOf(ws);
    }

    if ( type === "ping" ) {
      ws.send("Successfully pinged! Welcome to Avonet.");

    } else if ( type === "auth" ) {
      ws.clientName = name;

    } else if ( type === "subscribe" ) {
      if ( channelIndex === -1 ) {
        channel.push(ws);
      }

    } else if ( type === "unsubscribe" ) {
      if ( channelIndex !== -1 ) {
        channel.splice(channelIndex, 1);
      }

    } else if ( type === "broadcast" ) {
      channel.forEach(client => {
        client.send(message);
      });
    }

  });

});

console.log("Listening on " + port);
