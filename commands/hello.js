const { SlashCommandBuilder, EmbedBuilder,MessageFlags } = require('discord.js');
const { Version } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('維特你好')
        .setDescription('讓維特助手向您介紹自己'),
    async execute(interaction) {
        const helloEmbed = new EmbedBuilder()
            .setColor('#026FFF')
            .setTitle('👋 您好！我是 維特Witt DC助手')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription(`很高興見到你，${interaction.user}！`)
            .addFields(  
                { name: '\u200B', value: '\u200B' },               
                { 
                    name: '🛠️ 核心功能一覽', 
                    value: '```md\n# 動態語音頻道\n* 創建、管理臨時個人語音頻道\n\n# 新朋友歡迎語\n* 歡迎新成員與離開通知\n\n# 英雄聯盟戰績\n* 查詢英雄聯盟玩家專精排位\n\n# 特戰英豪戰績\n* 查詢特戰英豪玩家專精排位\n\n# 小遊戲增感情\n* 小遊戲擲骰子丟硬幣來解決選擇困難```',
                },                              
                { name: '\u200B', value: '\u200B' },
                { 
                    name: '📊 運行狀態', 
                    value: `> **版本：** \`${Version}\`\n> **狀態：** \`穩定運作🚀\``, 
                    inline: true 
                },
                { 
                    name: '💡 幫助', 
                    value: `> 輸入 \`/介紹指令\`\n> 查看完整指令`, 
                    inline: true 
                },
                { 
                    name: '👤 關於開發者', 
                    value: `> <@393579380674134016>\n> bug 請協助通報`, 
                    inline: true 
                }
            )
            .setFooter({ text: `🏡 當前伺服器：${interaction.guild.name}` })
            .setTimestamp();

        await interaction.reply({ embeds: [helloEmbed], flags: MessageFlags.Ephemeral });
    },
};
