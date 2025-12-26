const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const msg = { content: '執行指令時發生錯誤！', flags: [MessageFlags.Ephemeral] };
            if (interaction.replied || interaction.deferred) await interaction.editReply(msg);
            else await interaction.reply(msg);
        }
    },
};