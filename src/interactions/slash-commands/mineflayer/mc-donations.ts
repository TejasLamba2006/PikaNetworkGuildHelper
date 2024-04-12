import Command from "@/structures/command.js";
import { getGuildRecentDonations } from "@/structures/mineflayer.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("mc-donations")
    .setDescription("Get the recent Minecraft donations"),
  run: async (client, interaction) => {
    await interaction.deferReply();
    const data = await getGuildRecentDonations();
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Recent Minecraft Donations")
      .setDescription(
        data
          ?.map(donation => {
            return `**${donation.name}** donated **$${donation.amount}** on **${donation.date}**`;
          })
          .join("\n") || "No donations found"
      );

    await interaction.editReply({ embeds: [embed] });
  },
});
