const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { Version } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('介紹指令') // 建議改為 info 或是 幫助
        .setDescription('顯示維特助手的所有指令與資訊'),
    async execute(interaction) {
        const infoEmbed = new EmbedBuilder()
            .setColor('#026FFF')
            .setTitle('🤖 維特 Witt DC 助手 | 指令選單')
            // 加入簡短描述，增加標題與內容間的呼吸感
            //.setDescription('這裡列出了目前我所支援的所有功能。')
            .addFields(       
                { name: '\u200B', value: '\u200B' },          
                { 
                    name: '📜 可用指令', 
                    value: [
                        '`/維特你好` - 維特助手自我介紹',
                        '`/介紹指令` - 維特助手操作指令',
                        '`/刪除訊息` - 一次刪除頻道訊息',
                        '`/伺服資訊` - 開啟伺服詳細資訊',
                        '`/硬幣骰子` - 丟硬幣擲骰子來決定任何事',
                        '`/今日迷因` - 查看今日推薦一則台灣迷因',
                        '`/英雄聯盟` - 查詢召喚師的專精戰績排位',
                        '`/特戰英豪` - 查詢玩家特務專精戰績排位'
                    ].join('\n') 
                },
                { name: '\u200B', value: '\u200B' }, 
                { name: '📌 目前版本', value: `\`\u200B ${Version}\``, inline: true },
                { name: '⚙️ 系統狀態', value: '`\u200B 全伺服器通用`', inline: true },
            )
            .setFooter({ text: `服務對象：${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [infoEmbed], flags: MessageFlags.Ephemeral });
    },
};