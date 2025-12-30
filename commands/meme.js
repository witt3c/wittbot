const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('隨機抽出一張台灣經典迷因 (方案 B)'),
    async execute(interaction) {
        // 這裡收集了台灣網路文化中常見的經典迷因
        const twMemes = [
            { title: '杰哥不要！', url: 'https://i.imgur.com/e1nS3P3.jpg' },
            { title: '我就爛', url: 'https://i.imgur.com/8991Y1I.jpg' },
            { title: '這我也布吉島', url: 'https://i.imgur.com/6XyUeGz.png' },
            { title: '真香', url: 'https://i.imgur.com/6M6k8Xo.jpg' },
            { title: '你這樣我會很難辦', url: 'https://i.imgur.com/zXn9L6V.jpg' },
            { title: '又是你，你最爛', url: 'https://i.imgur.com/7v68sF0.jpg' },
            { title: '想也知道', url: 'https://i.imgur.com/E87q2i3.jpg' },
            { title: '嚇到吃手手', url: 'https://i.imgur.com/yv89Gz4.jpg' },
            { title: '這就是我要的！', url: 'https://i.imgur.com/yN67X7y.jpg' },
            { title: '看好了世界，我只示範一次', url: 'https://i.imgur.com/D8v0G2r.jpg' }
        ];

        // 隨機選出一張
        const randomMeme = twMemes[Math.floor(Math.random() * twMemes.length)];

        const memeEmbed = new EmbedBuilder()
            .setColor('#026FFF')
            .setTitle(`🇹🇼 台灣本土迷因：${randomMeme.title}`)
            .setImage(randomMeme.url)
            .setFooter({ text: `WittBot 迷因倉庫 | 隨手一抽，必屬精品` })
            .setTimestamp();

        await interaction.reply({ embeds: [memeEmbed] });
    },
};