const { SlashCommandBuilder, EmbedBuilder,MessageFlags } = require('discord.js');
const { Version } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('顯示 機器人資訊 與 指令幫助'),
    async execute(interaction) {
        const infoEmbed = new EmbedBuilder()
            .setColor('#026FFF')
            .setTitle('🤖 維特 Witt DC 助手 資訊')
            .addFields(
                { name: '目前版本', value: Version, inline: true },
                { name: '系統狀態', value: '全伺服器通用版', inline: true },
                { name: '可用指令', value: '`/info` - 顯示此選單\n`/hello` - 自我介紹\n`/server` - 查看伺服器資訊\n`/刪除訊息` - 刪除大量訊息' }
            )
            .setFooter({ text: '感謝使用 維特Witt DC助手' })
            .setTimestamp();

        await interaction.reply({ embeds: [infoEmbed] ,flags: MessageFlags.Ephemeral});
    },
};