const { Events, MessageFlags } = require('discord.js');
// 確保這行有引用到三個函式
const { getMasteryReport, getRankReport, getHistoryReport } = require('../commands/lol_functions.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '執行指令發生錯誤', flags: [MessageFlags.Ephemeral] });
            }
        }

        // --- 2. 處理按鈕點擊 ---
        if (interaction.isButton()) {
            // 現在 ID 只有 [action, puuid]
            const [action, puuid] = interaction.customId.split('|');

            // 從 Embed 標題解析出名稱與標籤 (格式: ⚔️ 英雄聯盟玩家：【名稱#標籤】)
            const mainEmbed = interaction.message.embeds[0];
            let name = "未知", tag = "";
            
            if (mainEmbed && mainEmbed.title) {
                const match = mainEmbed.title.match(/【(.*)#(.*)】/);
                if (match) {
                    name = match[1];
                    tag = match[2];
                }
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            try {
                if (action === 'mastery') {
                    console.log(`[按鈕觸發] 專精查詢: ${name}#${tag}`);
                    const result = await getMasteryReport(puuid, name, tag);
                    await interaction.editReply(result);
                } 
                else if (action === 'rank') {
                    console.log(`[按鈕觸發] 牌位查詢: ${name}#${tag}`);
                    const result = await getRankReport(puuid, name, tag);
                    await interaction.editReply(result);
                } 
                else if (action === 'history') {
                    console.log(`[按鈕觸發] 戰績查詢: ${name}#${tag}`);
                    const result = await getHistoryReport(puuid, name, tag);
                    await interaction.editReply(result);
                }
            } catch (e) {
                console.error(e);
                await interaction.editReply({ content: `❌ 錯誤：${e.message}` });
            }
        }
    },
};