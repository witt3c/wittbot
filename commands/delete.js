const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('刪除訊息')
    .setDescription('刪除指定數量的訊息（管理員限定）')
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
        flags: [MessageFlags.Ephemeral], 
      });
    }

    try {
      // 使用 flags 代替 ephemeral
      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

      const messages = await interaction.channel.messages.fetch({
        limit: amount,
      });

      // bulkDelete 的第二個參數 true 代表過濾掉超過 14 天的訊息（Discord 不允許大量刪除舊訊息）
      const deleted = await interaction.channel.bulkDelete(messages, true);

      await interaction.editReply({
        content: `🧹 已刪除 ${deleted.size} 則訊息`,
      });
    } catch (err) {
      console.error('刪除訊息錯誤:', err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 刪除失敗，請確認 Bot 權限或訊息是否超過 14 天',
          flags: [MessageFlags.Ephemeral],
        });
      } else {
        await interaction.editReply({
          content: '❌ 刪除失敗，請確認 Bot 權限或訊息是否超過 14 天',
        });
      }
    }
  },
};