import Event from "@/structures/event.js";
import type { GuildMember } from "discord.js";

export default new Event({
  event: "interactionCreate",
  run: async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.find(a => a.data.name === interaction.commandName);
      if (!command) return;
      const member = interaction.guild?.members.cache.get(interaction.user.id) as GuildMember;
      console.log(`${interaction.user.tag} used command ${interaction.commandName}`);
      try {
        await command.run(client, interaction, member);
      } catch (err) {
        if (interaction.deferred || interaction.replied) {
          try {
            await interaction.followUp("An error occured.");
          } catch (err) {}
        } else {
          try {
            await interaction.reply("An error occured.");
          } catch (err) {}
        }
        console.error("Error when executing slash command:");
        console.error(err);
      }
    }
  },
});
