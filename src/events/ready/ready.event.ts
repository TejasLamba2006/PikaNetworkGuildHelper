import fs from "node:fs";
import path from "node:path";
import Event from "@/structures/event.js";
export default new Event({
  event: "ready",
  run: async (c, client) => {
    c.logger.info(`Bot logged in as ${client.user.tag}`);
    const commands = c.commands.map(command => command.data.toJSON());
    if (c.config.COMMANDS_GUILD_ONLY === "true")
      await client.guilds.cache.get(c.config.GUILD_ID.toString())?.commands.set([...commands]);
    else await client.application.commands.set([...commands]);

    c.logger.info("Commands registered");

    findOrCreate("./data/donations.json");
    findOrCreate("./data/guildLogs.json");
    findOrCreate("./data/guildMembers.json");
  },
});

async function findOrCreate(filePath: string) {
  try {
    await fs.promises.access(filePath);
    return;
  } catch {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, "");
  }
}
