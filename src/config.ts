/**
 * Bot configuration
 */
export namespace config {
  // Discord bot token (prefer using environment variables over hardcoded values)
  export const token = process.env.TOKEN || "";

  // Bot settings
  export const settings = {
    prefix: "!",
    defaultCooldown: 3, // seconds
    deleteCommandMessages: true,
    messageDeleteTimeout: 3000, // milliseconds
  };

  // Application IDs
  export const ids = {
    applicationId: "1076585679687008326",
  };

  // Appearance
  export const appearance = {
    defaultColor: 0xffffff,
    errorColor: 0xff0000,
    successColor: 0x00ff00,
  };
}
