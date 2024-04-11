import fs from "node:fs";
import path from "node:path";
import config from "@/jsons/config.json";
import Event from "@/structures/event.js";
import Cron from "croner";
import { ChannelType, EmbedBuilder } from "discord.js";
import { request } from "undici";

interface User {
  username: string;
}

interface Member {
  user: User;
  joinDate: string;
}

interface Leveling {
  level: number;
  exp: number;
  totalExp: number;
}

interface GuildData {
  name: string;
  tag: string;
  currentTrophies: number;
  creationTime: string;
  members: Member[];
  owner: User;
  leveling: Leveling;
}

export default new Event({
  event: "ready",
  run: async (c, client) => {
    c.logger.info(`Bot logged in as ${client.user.tag}`);
    const commands = c.commands.map(command => command.data.toJSON());
    if (c.config.COMMANDS_GUILD_ONLY === "true")
      await client.guilds.cache.get(c.config.GUILD_ID.toString())?.commands.set([...commands]);
    else await client.application.commands.set([...commands]);

    c.logger.info("Commands registered");

    await findOrCreate("./data/donations.json");
    await findOrCreate("./data/guildLogs.json");
    await findOrCreate("./data/guildMembers.json");

    if (config.guild.JOIN_LEAVE_LOGS.enabled) {
      const joinLeaveLogsChannel = client.channels.cache.get(config.guild.JOIN_LEAVE_LOGS.channel);
      if (joinLeaveLogsChannel?.type !== ChannelType.GuildText) {
        c.logger.error(
          `Channel ${config.guild.JOIN_LEAVE_LOGS.channel} is not a text based channel!`
        );
      } else {
        c.logger.info("Join/Leave logs channel found");
        const webhook =
          (await joinLeaveLogsChannel.fetchWebhooks()).find(
            v => v.name === "PikaNetworkGuildHelperBot"
          ) ||
          (await joinLeaveLogsChannel.createWebhook({
            name: "PikaNetworkGuildHelperBot",
            reason: "Join/Leave logs",
          }));
        c.logger.info("Join/Leave logs webhook found");
        Cron("* * * * *", async () => {
          c.logger.debug("Checking for new members");
          const data = await getLeaveAndJoins();
          c.logger.debug(`Found ${data.joined.length} new members and ${data.left.length} left`);
          if (data.joined.length > 0) {
            const embed = new EmbedBuilder().setTitle("New members joined").setColor("Green");
            for (const member of data.joined) {
              embed.setDescription(`**${member.user.username}** joined on ${member.joinDate}`);
              await webhook.send({
                embeds: [embed],
                username: config.guild.name,
                avatarURL: config.guild.logo,
              });
            }
          } else if (data.left.length > 0) {
            const embed = new EmbedBuilder().setTitle("Members left").setColor("Red");
            for (const member of data.left) {
              embed.setDescription(`**${member.user.username}** left on ${member.joinDate}`);
              await webhook.send({
                embeds: [embed],
                username: config.guild.name,
                avatarURL: config.guild.logo,
              });
            }
          }
        });
      }
    }
  },
});

async function findOrCreate(filePath: string) {
  try {
    await fs.promises.access(filePath);
    return;
  } catch {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, "[]");
  }
}

async function getGuild() {
  const data = await request(`https://stats.pika-network.net/api/clans/${config.guild.name}`);
  const dataMembers = (await data.body.json()) as GuildData;
  return dataMembers;
}

/**
 * Retrieves the list of new members who joined a guild and the list of members who left the guild.
 * @returns {Promise<{ joined: Member[], left: Member[] }>} An object containing the joined and left members.
 */
async function getLeaveAndJoins(): Promise<{ joined: Member[]; left: Member[] }> {
  const oldMembers: Member[] = JSON.parse(fs.readFileSync("./data/guildMembers.json", "utf8"));

  const guild = await getGuild();

  const newMembers = guild.members;

  const joined = newMembers.filter(
    member => !oldMembers.some(v => v.user.username === member.user.username)
  );

  const left = oldMembers.filter(
    member => !newMembers.some(v => v.user.username === member.user.username)
  );
  fs.writeFileSync("./data/guildMembers.json", JSON.stringify(newMembers, null, 2));
  return { joined, left };
}
