//Roblox to Mixer Chat Relay Server by zhiyan114

// Load the configuration
const Mixer = require('@mixer/client-node');
const ws = require('ws');
const fs = require('fs');
const path = require('path');
const request = require('request');
const { ShortCodeExpireError, OAuthClient } = require('@mixer/shortcode-oauth');

// Get the configuration File or create a custom json to let the script know that it mising and throw an exception
var Config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json')) || '{"Internal": "NoConfig"}')

// Check if the configuration is in good shape
if(Config['Internal'] == "NoConfig") {
  throw new Error("Configuration File missing. Please download a new one")
} else if(!Config['ChannelName'] || Config['ChannelName'] == "") {
  throw new Error("Missing Channel Name Field. Please fill it out.")
}

if(Config['Token'] == "" ||) {
  // Cannot find the user's authorization token, lets request the user for one
  const client = new OAuthClient({
    clientId: '61d126b36914d014844b54e614478330c03ca731700b4596',
    scopes: ['chat:bypass_catbot','chat:bypass_filter','chat:bypass_slowchat','chat:chat','chat:connect'],
  });
  const attempt = () =>
  client.getCode().then(code => {
    console.log(`Authorization Required. Please go to mixer.com/go and enter ${code.code} to get an authorization token`);
    return code.waitForAccept();
  }).catch(err => {
    if (err instanceof ShortCodeExpireError) {
      return attempt(); // loop!
    }
      throw err;
    });
    attempt().then(tokens => {
      Config['Token'] = tokens.data.accessToken;
      // Save the configuration and let the user to restart the application.
      fs.writeFileSync(path.resolve(__dirname, 'config.json'),JSON.stringify(Config))
      console.log("Token Successfully Generated and save into the configuration file, please re-run the script. At anytime if the token is invalidated, you may safely erase the Token part of the configuration to generate a new token.");
      process.exitCode = 1;
    });
} else {
  // The authorization token found, let proceed the core stuff
  // Request against mixer's API to get channel ID from channel name
  request('https://mixer.com/api/v1/channels/'+Config['ChannelName']+'?fields=id', function (error, response, body) {
    var ChannelIdObj = JSON.parse(body);
    if(ChannelIdObj['id']) {
      // Successfully obtain the channel ID, now we can proceed with the chat functions
      const client = new Mixer.Client(new Mixer.DefaultRequestRunner());
      const wss = new ws.Server({ port: 37168 });
      var ActiveWsClient = false;
      client.use(new Mixer.OAuthProvider(client, {
        tokens: {
          access: Config['Token'],
          expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
        }
      }));
      // Setup the mixer chat client
      var socket = null;
      var InternalSocket = null;
      client.request('GET', 'users/current').then(function(UserData) {
        Mixer.ChatService(client).join(ChannelIdObj['id']).then(function(ClientChatData) {
          socket = new Mixer.Socket(ws, ClientChatData.endpoints).boot();
          socket.on('ChatMessage', data => {
            if(Config['RelayAllMixerChat'] == true) {
              if(InternalSocket && InternalSocket != null) {
                InternalSocket.send(JSON.stringify({"Username":data.user_name, "Message":data.message.message[0].data}));
              }
            }
          });
          socket.auth(channelId, userId, authkey).then(function() {
            console.log('Mixer Chat socket authenticated');
            socket.call('msg',["Roblox and Mixer chat relay server has been started"])
          })
        })
      })
      wss.on('connection', function connection(wsc) {
        // Rejects additional websocket client after the first one already established
        if (ActiveWsClient == true) {
          wsc.close(1000, "An existing connection was already established")
          console.log("Another client was attempting to connect while the connection was already been established.")
          return;
        }
        ActiveClient = true;
        InternalSocket = wsc;
        socket.call('msg',['Roblox Client has been connected. Message will now start to relay.'])
        // Detect the message from the client and relay it to mixer chat
        wsc.on('message', function(msg) {
          var RobloxChatData = JSON.parse(msg);
          if(RobloxChatData['IsClient'] == true && Config['RelayMyChat'] == true) {
            // Relay the client's chat or your own chat if the config is enabled
            socket.call('msg',["["+RobloxChatData['Username']+"]: "+RobloxChatData['Message']]);
          } else if(RobloxChatData['IsClient'] == false && Config['RelayAllRobloxChat'] == true) {
            // Relay all the players' chat in the game except your (unless enabled) if the config is enabled
            socket.call('msg',["["+RobloxChatData['Username']+"]: "+RobloxChatData['Message']]);
          }
        })
        // Detect if the websocket is disconnected and if it is, accept another client. *Best to restart the script to prevent memory leak warnings*
        wsc.on('close', function() {
          client.close()
          console.log("Connection with Socket has been disconnected and will also disconnect mixer interactive.");
          socket.call('msg',['Roblox Client has been disconnected. No further message will be relayed.']);
          InternalSocket = null;
          ActiveClient = false;
        })
      })
    } else {
      // Throw exception because mixer responsed that the channel is invalid
      throw new Error("The channel's username is likely invalid, please check the name and try again")
    }
  })
}
