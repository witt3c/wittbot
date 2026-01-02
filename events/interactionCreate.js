const { Events, MessageFlags } = require('discord.js');
// 引用 LoL 的函式
const { getMasteryReport, getRankReport, getHistoryReport } = require('../commands/lol_functions.js');
// 引用 Valorant 的函式
const { getValRankReport, getValHistoryReport } = require('../commands/val_functions.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // --- 1. 處理斜線指令 ---
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
            // 解析 ID (格式: action|參數1|參數2|參數3...)
            const parts = interaction.customId.split('|');
            const action = parts[0];

            // --- [ A. Valorant 判斷區 ] ---
            if (action === 'valrank' || action === 'valhistory') {
                const [, name, tag, region] = parts; // 解構賦值取得參數
                
                // 如果你想跟 LoL 一樣用私人訊息回覆，就用 deferReply
                // 如果你想直接在原訊息切換，就用 deferUpdate
                await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

                try {
                    if (action === 'valrank') {
                        console.log(`[VAL 按鈕] 積分查詢: ${name}#${tag}`);
                        const result = await getValRankReport(name, tag, region);
                        await interaction.editReply(result);
                    } 
                    else if (action === 'valhistory') {
                        console.log(`[VAL 按鈕] 戰績查詢: ${name}#${tag}`);
                        const result = await getValHistoryReport(name, tag, region);
                        await interaction.editReply(result);
                    }
                } catch (e) {
                    console.error(e);
                    await interaction.editReply({ content: `❌ Valorant 查詢失敗：${e.message}` });
                }
                return; // 結束 Valorant 處理
            }

            // --- [ B. LoL 判斷區 ] ---
            // 這裡維持你原本的 LoL 邏輯
            const puuid = parts[1];
            const lolActions = ['mastery', 'rank', 'history'];
            
            if (lolActions.includes(action)) {
                // 從 Embed 標題解析出名稱與標籤
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
                        const result = await getMasteryReport(puuid, name, tag);
                        await interaction.editReply(result);
                    } 
                    else if (action === 'rank') {
                        const result = await getRankReport(puuid, name, tag);
                        await interaction.editReply(result);
                    } 
                    else if (action === 'history') {
                        const result = await getHistoryReport(puuid, name, tag);
                        await interaction.editReply(result);
                    }
                } catch (e) {
                    console.error(e);
                    await interaction.editReply({ content: `❌ LoL 錯誤：${e.message}` });
                }
            }
        }
    },
};