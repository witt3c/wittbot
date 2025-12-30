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

        if (interaction.isButton()) {
            const [action, puuid, name, tag] = interaction.customId.split('|');
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            try {
                if (action === 'mastery') {
                    const result = await getMasteryReport(puuid, name, tag);
                    await interaction.editReply(result);
                } else if (action === 'rank') {
                    const result = await getRankReport(puuid, name, tag);
                    await interaction.editReply(result);
                } else if (action === 'history') {
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