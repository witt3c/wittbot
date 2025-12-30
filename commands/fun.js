const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('骰子硬幣')
        .setDescription('娛樂小工具')
        .addSubcommand(sub => 
            sub.setName('擲骰子')
            .setDescription('擲骰子')
            .addIntegerOption(opt => opt.setName('max').setDescription('最大點數 (預設 100)').setMinValue(2)))
        .addSubcommand(sub => 
            sub.setName('丟硬幣')
            .setDescription('翻硬幣 (正/反)')),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const embed = new EmbedBuilder().setTimestamp();



        if (sub === '擲骰子') {
            const max = interaction.options.getInteger('max') || 100;
            const result = Math.floor(Math.random() * max) + 1;
            
            // 根據點數決定評價與顏色
            let color, comment, emoji;
            const percentage = (result / max) * 100;

            if (percentage >= 90) {
                color = '#4c00ff'; // 金色
                comment = '大成功！今天是你的幸運日！';
                emoji = '👑';
            } else if (percentage >= 50) {
                color = '#00FF00'; // 綠色
                comment = '還不錯喔，運氣穩定！';
                emoji = '✅';
            } else if (percentage >= 10) {
                color = '#FFA500'; // 橘色
                comment = '普普通通，再接再厲。';
                emoji = '🎲';
            } else {
                color = '#FF0000'; // 紅色
                comment = '大失敗... 沒關係，下次會更好。';
                emoji = '💀';
            }

            embed.setColor(color)
                .setTitle(`${emoji} 擲骰子結果`)
                .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setDescription(`在 **1 到 ${max}** 之間，${interaction.user} 擲出了：`)
                .addFields({ name: '🎲 最終點數', value: `**${result}**`, inline: true })
                .setFooter({ text: `評價：${comment}` });

        } else if (sub === '丟硬幣') {
            const isHeads = Math.random() < 0.5;
            const resultText = isHeads ? '正面 (Heads)' : '反面 (Tails)';
            const coinImage = isHeads 
                ? 'https://github.com/witt3c/wittbot/blob/main/imgur/TWD50front.png?raw=true' // 你可以找個硬幣正面圖
                : 'https://github.com/witt3c/wittbot/blob/main/imgur/TWD50back.png?raw=true'; // 你可以找個硬幣反面圖

            embed.setColor('#026FFF')
                .setTitle('🪙 丟了一枚50元硬幣')
                .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail(coinImage) // 這裡就不會報錯了
                .addFields({ name: '結果', value: `✨ **${resultText}**` });
        }

        await interaction.reply({ embeds: [embed] });
    },
};