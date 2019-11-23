-- Roblox to Mixer Chat Relay Client by zhiyan114
-- Supported ONLY on synapse

local StarterGui = game:GetService("StarterGui");
local HttpService = game:GetService("HttpService");
if(syn) then
  local WebSocket = syn.websocket.connect("ws://localhost:37168")
  print("Websocket has been established")
  WebSocket.OnMessage:Connect(function(Msg)
    local ChatData = HttpService:JSONDecode(Msg)
    StarterGui:SetCore("ChatMakeSystemMessage",{
      Text = "["..ChatData['Username'].."]: "..ChatData['Message'];
      Color = Color3.fromRGB(0, 247, 255);
    });
  end)
  local SendChatMessage = function(IsHost, Username, Msg)
    local DataToSend = {}
    DataToSend.IsClient = IsHost;
    DataToSend.Username = Username;
    DataToSend.Message = Msg;
    WebSocket:Send(HttpService:JSONEncode(DataToSend))
  end
  for i,v in pairs(game.Players:GetPlayers()) do
    v.Chatted:Connect(function(msg)
      if v == game.Players.LocalPlayer then
        SendChatMessage(true,v.Name,msg)
        else
        SendChatMessage(false,v.Name,msg)
      end
    end)
  end
  game.Players.PlayerAdded:Connect(function(plr)
    plr.Chatted:Connect(function(msg)
      SendChatMessage(false,plr.Name,msg)
    end)
  end)
end
