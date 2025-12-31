const { SlashCommandBuilder, EmbedBuilder,MessageFlags } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('伺服資訊')
        .setDescription('查看目前伺服器的詳細狀態'),
    async execute(interaction) {
        const { guild } = interaction;
        
        const serverEmbed = new EmbedBuilder()
            .setColor('#026FFF')
            .setTitle(`📊 ${guild.name} 伺服器資訊     `)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 創辦人', value: `<@${guild.ownerId}>`, inline: true },
                { name: '👥 成員總數', value: `${guild.memberCount} 人`, inline: true },
                { name: '💎 加成等級', value: `${guild.premiumTier} 級 (${guild.premiumSubscriptionCount} 次加成)`, inline: true },
                { name: '📅 創立時間', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🆔 伺服器 ID', value: `\`${guild.id}\``, inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [serverEmbed],flags: MessageFlags.Ephemeral});
    },
};