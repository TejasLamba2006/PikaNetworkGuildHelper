import config from "@/jsons/config.json";
import Event from "@/structures/event.js";
import Logger from "@/structures/logger.js";
import { ChannelType } from "discord.js";
import mineflayer from "mineflayer";

const logger = new Logger();
const bot = mineflayer.createBot({
  host: config.mineflayer.host,
  port: 25565,
  username: config.mineflayer.username,
  password: config.mineflayer.loginPassword,
  version: '1.8.9',
});

export default new Event({
  event: "ready",
  run: async function startMineflayerBot(client) {
    try {
      logger.info(`Connecting to ${config.mineflayer.host}...`);

      bot.on("message", async (message) => {
        const messageString = message.toString();

        if (!messageString) return;

        if (messageString.match(/\/(register|login)/)) {
          if (messageString.match(/\/register/))
            await bot.chat(`/register ${config.mineflayer.loginPassword} ${config.mineflayer.loginPassword}`);
          if (messageString.match(/\/login/)) await bot.chat(`/login ${config.mineflayer.loginPassword}`);
          return;
        }

        const minecraftChannel = client.channels.cache.get(config.mineflayer.minecraftChannelID);

        if (minecraftChannel?.type !== ChannelType.GuildText) {
          logger.error(`Channel ${config.mineflayer.minecraftChannelID} is not a text-based channel!`);
          return;
        }

        if (messageString.length >= 1) {
          await minecraftChannel.send(`\`\`\`${messageString}\`\`\``);
        }
      });

      bot.once("login", async () => {
        logger.info(`Connected to ${config.mineflayer.host} as ${config.mineflayer.username}!`);
      });

      bot.once("spawn", async () => {
        logger.info("Spawned.");
      });

      bot.once("error", async error => {
        logger.error(`Mineflayer error: ${error}`);
      });
    } catch (error) {
      logger.error(`${error}`);
    }
  },
});

export { bot };
