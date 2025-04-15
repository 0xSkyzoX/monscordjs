import { InteractionTypeResponse } from "../monscordjs/@types/datatypes";
import { config } from "./config";
import { logger } from "./utils/logger";

/**
 * Handles the !clear command to delete messages
 */
export async function handleClearCommand(message, discord) {
  try {
    const args = message.content.split(" ");
    const count = parseInt(args[1]);

    // Validate number of messages to delete
    if (isNaN(count) || count < 2) {
      await message.reply({
        content:
          "❌ Error: Message count must be a number greater than or equal to 2!",
      });

      if (config.settings.deleteCommandMessages) {
        setTimeout(() => {
          message.client
            .deleteMessage()
            .catch((err) => logger.error("Failed to delete message:", err));
        }, config.settings.messageDeleteTimeout);
      }
      return;
    }

    // Delete messages
    await message.channel.bulkDelete(count);

    // Confirm successful deletion
    await message.reply({
      content: `✅ Successfully deleted ${count} messages!`,
    });

    // Add reaction to indicate success
    await message.react("👍");
  } catch (error) {
    logger.error("Error in clear command:", error);
    await message
      .reply({
        content: "❌ An error occurred while trying to delete messages.",
      })
      .catch((err) => logger.error("Failed to send error message:", err));
  }
}

/**
 * Handles the 212 test command
 */
export async function handleTestCommand(message, discord) {
  try {
    // Send text reply
    await message.reply({ content: "Hello Mate!" });

    // Send embed
    await discord.sendEmbed(message.channel_id, {
      title: "Hello World",
      description: "This is a Discord Bot!",
      color: config.appearance.defaultColor,
      author: {
        name: message.author.global_name || message.author.username,
        icon_url: message.author.avatarURL(),
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: "Powered by monscordjs",
      },
    });

    logger.debug("Test command executed by", message.author.username);
  } catch (error) {
    logger.error("Error in test command:", error);
  }
}

/**
 * Handles the /help slash command
 */
export async function handleHelpInteraction(interaction) {
  try {
    await interaction.send({
      type: InteractionTypeResponse.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: "Bot Help",
            description: "Here are the available commands:",
            color: config.appearance.defaultColor,
            fields: [
              {
                name: "!clear [number]",
                value: "Deletes the specified number of messages.",
              },
              {
                name: "212",
                value: "Test command that sends a greeting and embed.",
              },
              {
                name: "/hello",
                value: "Sends a friendly greeting.",
              },
            ],
            footer: {
              text: "For more help, contact the bot administrator.",
            },
          },
        ],
      },
    });

    logger.debug("Help command executed");
  } catch (error) {
    logger.error("Error in help interaction:", error);

    // Attempt to notify the user about the error
    await interaction
      .send({
        type: InteractionTypeResponse.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "An error occurred while processing your request.",
        },
      })
      .catch((err) => logger.error("Failed to send error response:", err));
  }
}
