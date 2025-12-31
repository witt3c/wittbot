const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('今日迷因')
        .setDescription('從 memes.tw 抓取台灣本土熱門迷因'),

    async execute(interaction) {
        // 1. 先給予初步回應，因為抓取 API 需要一點時間
        await interaction.deferReply();

        try {
            // 2. 呼叫 memes.tw API (取得今日熱門)
            // 註：這是一個公開的 API 節點
            const response = await fetch('https://memes.tw/wtf/api');
            const memes = await response.json();

            if (!memes || memes.length === 0) {
                return await interaction.editReply('❌ 目前找不到迷因，請稍後再試。');
            }

            // 3. 隨機從清單中挑選一個迷因
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];

            // 4. 建立 Embed 卡片
            const memeEmbed = new EmbedBuilder()
                .setColor('#f1c40f') // 金黃色
                .setTitle(randomMeme.title || '台灣在地迷因')
                .setURL(`https://memes.tw/wtf/${randomMeme.id}`) // 點擊標題連回原網站
                .setImage(randomMeme.src) // 迷因圖片網址
                .setFooter({ 
                    text: `👍 ${randomMeme.notbad_count} | 💬 ${randomMeme.comment_count} | 來源：memes.tw` 
                })
                .setTimestamp();

            // 5. 回傳迷因
            await interaction.editReply({ embeds: [memeEmbed] });

        } catch (error) {
            console.error('Meme Error:', error);
            await interaction.editReply('❌ 抓取迷因時發生錯誤，請檢查網路連線。');
        }
    },
};