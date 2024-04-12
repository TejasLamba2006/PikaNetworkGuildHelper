import config from "@/jsons/config.json";
import Command from "@/structures/command.js";
import { bot } from "@/structures/mineflayer.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("mc-ping")
    .setDescription("Check the ping of the Mineflayer bot"),
  run: async (client, interaction) => {
    const ping = bot.player.ping;

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${config.mineflayer.username}'s Ping`)
      .setDescription(`The ping of ${config.mineflayer.username} is ${ping} ms.`)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
});
