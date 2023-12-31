import dotenv from "dotenv";
dotenv.config()
import Message from '../monscordjs/Client/Message';
import { ActivityType, ApplicationsTypes, InteractionTypeResponse, OptionsType, Role } from '../monscordjs/@types/datatypes';
import Interactions from "../monscordjs/Client/Interactions/interactions";
import Discord from "../monscordjs"
const TOKEN = process.env.TOKEN
const discord = new Discord(TOKEN)

// Discord event listener function



discord.listen("MessageCreate", async (message) => {
     if (message.author.bot) return;
     if (message.content.startsWith("!clear")) {
          const args = message.content.split(" ")
          const argsNUM: number = (args[1] as unknown) as number
          if (argsNUM < 2) {
               return discord.FC(() => {
                    message.reply({content: "Error || Message Clear number should be than 2!"})
                    setTimeout(() => {
                         message.client.deleteMessage()
                    }, 3000)
               })
          }
          message.reply({content: "Yo yo"})
          message.react("👍")
          message.channel.bulkDelete(argsNUM)
     }
})

discord.listen("MessageCreate", (message) => {
     if (message.author.bot) return;
     if (message.content === "212") {
          message.reply({content: "Hello Mate!"})
          discord.sendEmbed(message.channel_id, {title: "Hello World", description: "This is a Discord Bot!", color: 0xfff, author: {name: message.author.global_name, icon_url: message.author.avatarURL()}})
          console.log(message.author.avatar)
     }
} )

discord.listen("InteractionCreate", async (interaction) => {
     if (interaction.data.name == "help") {
          interaction.send({type: InteractionTypeResponse.CHANNEL_MESSAGE_WITH_SOURCE, data: {embeds: [{title: 'Hello'}]}})
     }
})

// Discord.js FC (function)

discord.FC(async () => {
     discord.presence("idle", {activities: [{name: "discord.js plus", type: ActivityType.Listening}]})
     discord.client_interaction.setApplicationId("1076585679687008326")
     await discord.client_interaction.registerSlashcommand("GLOBAL", {name: 'hello',description: 'Your command description', options: [{name: "your", type: OptionsType.STRING, description: "the best code"}]})
})

// Discord connect, to Websocket Gateway

discord.connect((client) => {
     console.log(`${client.username} Online`)
})