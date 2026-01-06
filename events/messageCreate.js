const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        if (message.content === '?!help') {
            await message.reply('**🎵 Witt 指令簡介**\n`?!hello` - 自我介紹\n`?!Version` - 版本查詢');
        }


        if (message.content === '?!Version') {
            await message.reply('目前最新版本為 v1.3.0');
        }
        
        if (message.content === "?!lolupdatok") {
            await message.delete();
            await message.channel.send(`\u200B \n輸入 /英雄聯盟 + 召喚師名稱 + 標籤 即可查詢玩家帳號\n指令輸出僅查詢者可見，請放心查詢。`);
        }
    },
};