import dotenv from "dotenv";
dotenv.config();
import Discord from "../monscordjs";
import {
  ActivityType,
  InteractionTypeResponse,
  OptionsType,
} from "../monscordjs/@types/datatypes";
import { config } from "./config";
import {
  handleClearCommand,
  handleTestCommand,
  handleHelpInteraction,
} from "./commands";
import { logger } from "./utils/logger";

// Use token from environment variables with fallback to config file
const TOKEN = process.env.TOKEN || config.token;

// Validation
if (!TOKEN) {
  logger.error(
    "No Discord token provided. Please set TOKEN in environment variables or config.ts"
  );
  process.exit(1);
}

// Initialize Discord client
const discord = new Discord(TOKEN);

// Command handlers
discord.listen("MessageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Command routing
  if (message.content.startsWith("!clear")) {
    await handleClearCommand(message, discord);
  } else if (message.content === "212") {
    await handleTestCommand(message, discord);
  }
});

// Interaction handlers
discord.listen("InteractionCreate", async (interaction) => {
  switch (interaction.data.name) {
    case "help":
      await handleHelpInteraction(interaction);
      break;
    // Add more interaction handlers as needed
  }
});

// Bot initialization
discord.FC(async () => {
  try {
    // Set presence
    discord.presence("idle", {
      activities: [
        {
          name: "discord.js plus",
          type: ActivityType.Listening,
        },
      ],
    });

    // Register slash commands
    discord.client_interaction.setApplicationId("1076585679687008326");
    await discord.client_interaction.registerSlashcommand("GLOBAL", {
      name: "hello",
      description: "Send a friendly hello",
      options: [
        {
          name: "your",
          type: OptionsType.STRING,
          description: "the best code",
        },
      ],
    });

    logger.info("Slash commands registered successfully");
  } catch (error) {
    logger.error("Error during initialization:", error);
  }
});

// Connect to Discord
discord.connect((client) => {
  logger.info(`Bot ${client.username} is now online`);
});

// Handle process termination
process.on("SIGINT", () => {
  logger.info("Shutting down bot gracefully...");
  // Add any cleanup logic here
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
});
