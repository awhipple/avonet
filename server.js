const WebSocket = require('ws');

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
    }

    if ( type === "ping" ) {
      ws.send("Successfully pinged! Welcome to Avonet.");
    } else if ( type === "auth" ) {
      ws.clientName = name;
    } else if ( type === "subscribe" ) {
      channel.push(ws);
    } else if ( type === "unsubscribe" ) {
      var index = channel.indexOf(ws);
      if ( index !== -1 ) {
        channel.splice(index, 1);
      }
    } else if ( type === "broadcast" ) {
      channel.forEach(client => {
        client.send(message);
      });
    }

    console.log(channels);
    console.log(message);

    // wss.clients.forEach(client => {
    //   if ( /*client !== ws && */client.readyState === WebSocket.OPEN) {
    //     client.send("Go TEAM!");
    //   }
    // });

  });

});

console.log("Listening on " + port);
