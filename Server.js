// Load the configuration
const Mixer = require('@mixer/client-node');
const ws = require('ws');
const fs = require('fs');
const { ShortCodeExpireError, OAuthClient } = require('@mixer/shortcode-oauth');

// Get the configuration File or create a custom json to let the script know that it mising and throw an exception
var Config = JSON.parse(fs.readFileSync("config.json") ?? '{"Internal": "NoConfig"}'')

// Check if the configuration is in good shape
if(Config['Internal'] == "NoConfig") {
  throw new Error("Configuration File missing. Please download a new one")
} else if(!Config['RelayMyChat'] || !Config['RelayAllRobloxChat'] || !Config['RelayAllMixerChat'] || !Config['ChannelName'] || !Config['Token']) {
  throw new Error("Missing Configuration Objects, please download and use a new configuration file.")
 else if(Config['ChannelName'] == "") {
  throw new Error("Missing Channel Name Field. Please fill it out.")
 }

if(Config['Token'] == "") {
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
      Config['Token'] = tokens.accessToken;
      // Save the configuration and let the user to restart the application.
      fs.writeFileSync("config.json",JSON.stringify(Config))
      console.log("Token Successfully Generated and save into the configuration file, please re-run the script. At anytime if the token is invalidated, you may safely erase the Token part of the configuration to generate a new token.");
      process.exitCode = 1;
    });
} else {
  // The authorization token found, let proceed the core stuff
}
