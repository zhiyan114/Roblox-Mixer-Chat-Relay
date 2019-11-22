# Roblox-Mixer-Chat-Relay

## About
A simple chat relay between roblox and mixer. Project was made for entertainment purpose, use it with risk.

## Configuration Doc
* **RelayMyChat** (Type: Bool) - This config will relay your chat from roblox and only your chat.
* **RelayAllRobloxChat** (Type: Bool) - This relay everyone's roblox chat (even strangers on roblox) except your if you disable RelayMyChat.
* **RelayAllMixerChat** (Type: Bool) - This relay's everyone's chat from mixer regardless who you are.
* **ImplicitToken** (Type: String) - Use this ONLY if your able to get a Implicit Token from a client (such as Mixer developer site) otherwise leave empty and the internal software will give future authorization instruction (Use it only if you know what your doing and if you do, use it so that you will not be prompted with authorization everytime you load the js).
