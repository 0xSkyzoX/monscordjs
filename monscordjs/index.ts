import { Constants } from './constants';
import { ListenEvents, MessageInfo, StatusType, UserInfo, ActivityType, Activities, InteractionInfo, MemberInfo } from './@types/datatypes';
import WebSocket from 'ws';
import Channel from './Client/channel';
import Guild from './Client/guild';
import { EmbedInfo } from './@types/datatypes';
import Message from './Client/Message';
import Interactions from './Client/Interactions/interactions';
import ClientInteraction from './Applications/client';

const webSocket = new WebSocket(Constants.GATEWAY);

interface PresenceData {
     activities: [{ name: string, type: ActivityType }],
     status: StatusType
}
var InitPresenceData: PresenceData = {
     activities: [{ name: "", type: 0 }],
     status: "online"
}

type EventParamMap = {
     "MessageCreate": Message;
     "InteractionCreate": Interactions;
   };

export default class Discord {
     private token: string;
     messageSendData: MessageInfo;
     channel: Channel;
     guild: Guild;
     client_interaction: ClientInteraction
     constructor(token: string) {
          this.token = token
          this.channel = new Channel(token);
          this.guild = new Guild(token, this.channel.guild_id)
          this.client_interaction = new ClientInteraction(token)
     }

     /**
      * changing bot presence and customize it as you want
      * @param status client online action
      * @param activities customize bot activity
      */

     presence(status: StatusType, { activities: [{ name, type }] }: Activities) {
          InitPresenceData.status = status
          InitPresenceData.activities = [{ name: name, type: type }]
     }

     private async getClient(): Promise<UserInfo> {
          try {
               const response = await fetch(`${Constants.API_BASE}/users/@me`, {
                    method: "GET",
                    headers: {
                         "Content-Type": "application/json",
                         "Authorization": `Bot ${this.token}`
                    }
               })
               const data = await response.json()
               if (response.ok) {
                    return data
               } else {
                    console.log("ERR ", response.status)
               }
          } catch (err) {
               console.log(err)
          }
     }

     /**
      * important to make the bot online
      * @param ready params contain client bot information
      */

     public async connect(ready: (client: UserInfo) => void) {
          webSocket.on('open', () => {
               // identification payload
               const identificationPayload = {
                    op: 2,
                    d: {
                         token: this.token,
                         intents: 513, // intents for bot,
                         properties: {
                              "os": "linux",
                              "browser": "my_library",
                              "device": "my_library"
                         },
                         presence: InitPresenceData,
                         session_id: null
                    },
               };
               webSocket.send(JSON.stringify(identificationPayload));
               const heartbeatInterval = 1000 * 25; // send hearbeat in every 25 seconds
               setInterval(() => {
                    const heartbeatPayload = {
                         op: 1, // Heartbeat opcode
                         d: null,
                    };
                    webSocket.send(JSON.stringify(heartbeatPayload));
               }, heartbeatInterval);
          });
          const clientInfos = await this.getClient()

          ready(clientInfos)
     }

     private async fetchMember(message: MessageInfo) {
          if (!message) return console.log("Invalid Message Data")
          try {
               const response = await fetch(`${Constants.API_BASE}/guilds/${message.guild_id}/members/${message.author.id}`, {
                    method: "GET",
                    headers: {
                         "Authorization": `Bot ${this.token}`,
                         "Content-Type": "application/json"
                    }
               })
               const data: MemberInfo = await response.json()
               if (response.ok) {
                    return data
               }
          } catch(err) {
               console.log(err)
          }
     }

     /**
      * listening to event
      * @param type Event type to listen for
      */
     listen<T extends keyof EventParamMap>(type: T, paramsEvent: (params_event: EventParamMap[T]) => void) {
          webSocket.addEventListener("message", async (e) => {
               const data = JSON.parse(e.data.toString())
               if (type === "MessageCreate") {
                    if (data.t === "MESSAGE_CREATE") {
                         const _message: MessageInfo = data.d
                         const message = new Message(this.token, _message)
                         await message.client.getClientData()
                         paramsEvent(message as EventParamMap[T])
                    }
               }
               if (type == "InteractionCreate") {
                    if (data.t == "INTERACTION_CREATE") {
                         const _data: InteractionInfo = data.d
                         console.log(_data.data.options)
                         const interaction = new Interactions(this.token, _data, webSocket)
                         paramsEvent(interaction as EventParamMap[T])
                    }
               }
          })

          webSocket.on('error', (error) => {
               console.error('WebSocket connection error:', error);
          });

          webSocket.on('close', (code, reason) => {
               console.log('WebSocket connection closed.', 'Code:', code, 'Reason:', reason);
          });
     }

     /**
      * sending Message to a specific channel by id
      * @param channel_id choosing a channel by putting id
      * @param content message content text
      * @returns 
      */

     public async sendMessage(channel_id: string, content: string) {
          if (!content) return console.log("Invalid Message Content")
          if (!channel_id) return console.log("Invalid Channel Id")

          try {
               const response = await fetch(`${Constants.API_BASE}/channels/${channel_id}/messages`, {
                    headers: {
                         "Content-Type": "application/json",
                         "Authorization": `Bot ${this.token}`
                    },
                    body: JSON.stringify({ content: content }),
                    method: "POST"
               })
               const data = await response.json()
               if (!response.ok) {
                    console.log("status", response.status, " error!")
               } else {
                    this.messageSendData = data
                    return data
               }
          } catch (err) {
               console.log(err)
          }
     }

     /**
      * Edit some specific message by add their message and channel id
      * @param value 
      * @param channel_id 
      * @param message_id 
      * @returns Promise Void fetch Async
      */

     public async editMessage(value: string, channel_id: string = "", message_id: string = "") {
          if (!value) return console.log("Invalid Value")
          try {
               const response = await fetch(`${Constants.API_BASE}/channels/${this.messageSendData.channel_id || channel_id}/messages/${this.messageSendData.id || message_id}`, {
                    method: "PATCH",
                    headers: {
                         "Content-Type": "application/json",
                         "Authorization": `Bot ${this.token}`
                    },
                    body: JSON.stringify({ content: value })
               })
               if (!response.ok) {
                    console.log("err status ", response.status)
               }
          } catch (err) {
               console.log(err)
          }
     }
     /**
      * sending embed mesasge to a specific channel
      * @param channel_id message embed channel
      * @param embed informations JSON
      * @returns 
      */
     public async sendEmbed(channel_id: string, embed: EmbedInfo) {
          if (!embed) return console.log("Invalid Embed JSON")
          try {
               const response = await fetch(`${Constants.API_BASE}/channels/${channel_id}/messages`, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                         "Authorization": `Bot ${this.token}`
                    },
                    body: JSON.stringify({ embeds: [embed] })
               })
               if (!response.ok) {
                    console.log("err status ", response.status)
               }
          } catch (err) {
               console.log(err)
          }
     }
     /**
      * Discord function
      * @param function 
      */
     public FC(fun: () => void) {
          fun()
     }
}

