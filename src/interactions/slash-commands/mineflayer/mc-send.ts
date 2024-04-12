import Command from "@/structures/command.js";
import { bot } from "@/structures/mineflayer.js";
import { SlashCommandBuilder } from "discord.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("mc-send")
    .setDescription("Send a message to the Minecraft chat")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("The message to send to the Minecraft chat")
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    const message = interaction.options.getString("message");

    if (message) {
      await bot.chat(message);
    }
    interaction.reply({ content: `Sent "${message}" to Minecraft chat.`, ephemeral: true });
  },
});
