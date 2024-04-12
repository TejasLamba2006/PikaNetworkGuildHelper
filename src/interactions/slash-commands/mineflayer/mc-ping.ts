import Command from "@/structures/command.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { bot } from "@/structures/mineflayer.js";
import config from "@/jsons/config.json";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("mc-ping")
    .setDescription("Check the ping of the Mineflayer bot"),
  run: async (client, interaction) => {
    const ping = bot.player.ping;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`${config.mineflayer.username}'s Ping`)
      .setDescription(`The ping of ${config.mineflayer.username} is ${ping} ms.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
});
