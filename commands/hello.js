const { SlashCommandBuilder, EmbedBuilder,MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('讓維特助手向你打個招呼'),
    async execute(interaction) {
        // 建立一個精美的介紹嵌入訊息 (Embed)
        const helloEmbed = new EmbedBuilder()
            .setColor('#026FFF')
            .setTitle('👋 您好！我是 維特Witt DC助手')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription(`很高興見到你，${interaction.user}！`)
            .addFields(
                { name: '關於我', value: '我是由 naykkei(Witt) 開發的多功能助手，專門為社群提供自動化服務。' },
                { name: '目前狀態', value: '🚀 運作良好，隨時準備為您服務。' },
                { name: '核心功能', value: '• 動態語音頻道管理\n• 伺服器歡迎與離開提醒\n• 多伺服器獨立設定\n\n👉👉使用/info來查看指令吧!' }
            )
            .setFooter({ text: `服務伺服器：${interaction.guild.name} | 版本 v1.5.2` })
            .setTimestamp();

        // 發送回覆
        await interaction.reply({ embeds: [helloEmbed] ,flags: MessageFlags.Ephemeral});
    },
};