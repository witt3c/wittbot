const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('刪除訊息')
    .setDescription('刪除指定數量的訊息（管理員限定）')
    // 🔐 管理員權限（Manage Messages）
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option
        .setName('數量')
        .setDescription('要刪除的訊息數量 (1~100)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('數量');

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: '❌ 數量必須介於 1~100',
        ephemeral: true,
      });
    }

    try {
      // 先 defer，避免 3 秒超時
      await interaction.deferReply({ ephemeral: true });

      const messages = await interaction.channel.messages.fetch({
        limit: amount,
      });

      const deleted = await interaction.channel.bulkDelete(messages, true);

      await interaction.editReply({
        content: `🧹 已刪除 ${deleted.size} 則訊息`,
      });
    } catch (err) {
      console.error('刪除訊息錯誤:', err);

      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ 刪除失敗，請確認 Bot 權限或訊息是否超過 14 天',
          ephemeral: true,
        });
      }
    }
  },
};
