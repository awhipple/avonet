const WebSocket = require('ws');

const port = 9789;
const wss = new WebSocket.Server({port});

const threads = {};

wss.on('connection', function connection(ws) {

  console.log("Initiated new connection with client");

  ws.send("Connected to Avonet");

  ws.on('message', message => {
    console.log('received: %s', message);

    wss.clients.forEach(client => {
      if ( client !== ws && client.readyState === WebSocket.OPEN) {
        client.send("Go TEAM!");
      }
    })
  });

});

console.log("Listening on " + port);
