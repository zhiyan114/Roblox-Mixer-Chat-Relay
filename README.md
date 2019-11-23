# Roblox-Mixer-Chat-Relay

## About
A simple chat relay between roblox and mixer. Project was made for entertainment purpose, use it with risk.

## Configuration Doc
* **RelayMyChat** (Type: Bool) - This config will relay your chat from roblox and only your chat.
* **RelayAllRobloxChat** (Type: Bool) - This relay everyone's roblox chat (even strangers on roblox) except your if you disable RelayMyChat.
* **RelayAllMixerChat** (Type: Bool) - This relay's everyone's chat from mixer regardless who you are.
* **ChannelName** (Type: String) - The channel name that the bot should be on.
* **Token** (Type: String) - Use this ONLY if your able to get a Implicit Token from a client (such as Mixer developer site) otherwise leave empty and the internal software will give future authorization instruction.

## Nodejs Package
The following package you are required to install
* **@mixer/shortcode-oauth** - Internal Authorization System
* **ws** - The core feature of this Project or known as WebSocket
* **@mixer/client-node** - The main function of the user chat bot
* **request** - To get additional required information such as channel id from the name you given in the config

## Known Bugs (That will eventually fixed)
* When players in roblox chat too quickly, the message will relay back to roblox (aka duplicate message). - To temporary solve this, set **RelayAllRobloxChat** to false on a busy server unless you don't mind.