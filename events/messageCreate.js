const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        if (message.content === '?!help') {
            await message.reply('**🎵 Witt 指令簡介**\n`?!hello` - 自我介紹\n`?!Version` - 版本查詢');
        }

        if (message.content === '?!hello') {
            await message.reply('您好，我是維特助手！目前版本 v1.4.3。');
        }

        if (message.content === '?!Version') {
            await message.reply('目前最新版本為 v1.3.0');
        }
        
        if (message.content === "?!updating") {
            await message.delete();
            await message.channel.send("目前正在更新迭代中...");
        }
    },
};