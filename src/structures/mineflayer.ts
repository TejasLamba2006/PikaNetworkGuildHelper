import config from "@/jsons/config.json";
import Event from "@/structures/event.js";
import Logger from "@/structures/logger.js";
import { ChannelType } from "discord.js";
import mineflayer from "mineflayer";

interface ItemDescription {
  display: Display;
}

interface Display {
  type: string;
  value: DisplayValue;
}

interface DisplayValue {
  Lore: Lore;
  Name: Name;
}

interface Lore {
  type: string;
  value: LoreValue;
}

interface LoreValue {
  type: string;
  value: string[];
}

interface Name {
  type: string;
  value: string;
}

interface RecentDonation {
  name: string;
  amount: number;
  date: string;
  position: number;
}

const logger = new Logger();
const bot = mineflayer.createBot({
  host: config.mineflayer.host,
  port: 25565,
  username: config.mineflayer.username,
  password: config.mineflayer.loginPassword,
  version: "1.8.9",
});

export default new Event({
  event: "ready",
  run: async function startMineflayerBot(client) {
    try {
      logger.info(`Connecting to ${config.mineflayer.host}`);
      bot.on("login", async () => {
        logger.info(`Connected to ${config.mineflayer.host} as ${config.mineflayer.username}!`);
      });

      bot.on("spawn", async () => {
        logger.info("Spawned.");
      });
      const minecraftChannel = client.channels.cache.get(config.mineflayer.minecraftChannelID);
      const donationsLogsChannel = config.mineflayer.donationsLogs.enabled
        ? client.channels.cache.get(config.mineflayer.donationsLogs.channel)
        : null;

      if (minecraftChannel?.type !== ChannelType.GuildText) {
        logger.error(
          `Channel ${config.mineflayer.minecraftChannelID} is not a text-based channel!`
        );
        return;
      }

      bot.on("message", async message => {
        const messageString = message.toString();

        if (!messageString) return;

        if (messageString.match(/\/(register|login)/)) {
          if (messageString.match(/\/register/))
            await bot.chat(
              `/register ${config.mineflayer.loginPassword} ${config.mineflayer.loginPassword}`
            );
          if (messageString.match(/\/login/))
            await bot.chat(`/login ${config.mineflayer.loginPassword}`);
          return;
        }

        if (messageString.length >= 1) {
          if (
            config.mineflayer.donationsLogs.enabled &&
            messageString.startsWith("Guilds ▏") &&
            messageString.match(
              /^Guilds ▏ ([^\s]+) deposited (\d{1,3}(?:,\d{3})*|\d+) ⛃ Guild Coins in the Guild Bank\.$/
            )
          ) {
            const match = messageString.match(
              /^Guilds ▏ ([^\s]+) deposited (\d{1,3}(?:,\d{3})*|\d+) ⛃ Guild Coins in the Guild Bank\.$/
            );
            if (match) {
              const [, name, amount] = match;
              if (donationsLogsChannel?.type !== ChannelType.GuildText) {
                logger.error(
                  `Channel ${config.mineflayer.donationsLogs.channel} is not a text-based channel!`
                );
                return;
              }
              await donationsLogsChannel.send({
                content: `**${name}** deposited **$${amount}** in the Guild Bank.`,
              });
            }
          }
          await minecraftChannel.send(`\`\`\`${messageString}\`\`\``);
        }
      });

      bot.once("error", async error => {
        logger.error(`Mineflayer error: ${error}`);
      });
    } catch (error) {
      logger.error(`${error}`);
    }
  },
});

export async function getGuildRecentDonations(): Promise<RecentDonation[] | undefined> {
  try {
    bot.chat("/guild");
    await sleep(2000);
    await bot.simpleClick.rightMouse(34);
    await sleep(2000);

    const window = bot.currentWindow;
    if (!window) {
      logger.debug("No active window");
      return;
    }

    const item = window.slots[31];
    if (!item || !item.nbt) {
      logger.debug("No item in the 32nd slot");
      return;
    }

    const description = item.nbt.value as unknown as ItemDescription;
    return parseDonations(description);
  } catch (error) {
    logger.error(`Failed to get guild recent donations: ${error}`);
  }
}
export { bot };

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseDonations(itemDescription: ItemDescription): RecentDonation[] {
  const donations = itemDescription.display.value.Lore.value.value;
  return donations
    .filter(donation => donation.trim() !== "") // Filter out empty strings
    .map((donation, index) => {
      const match = donation.match(
        /§7#(\d+) §f(.*): §6§l\+ §6(\d+),(\d+) Guild Coins §7\((\d{2}-\d{2}-\d{4} \d{2}:\d{2})\)/
      );
      if (!match) {
        throw new Error(`Could not parse donation: ${donation}`);
      }
      return {
        position: Number.parseInt(match[1]),
        name: match[2],
        amount: Number.parseInt(match[3] + match[4]),
        date: match[5],
      };
    });
}
