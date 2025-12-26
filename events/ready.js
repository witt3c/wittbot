const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true, // 只執行一次
    execute(client) {
        console.log(`🤖：執行成功 BOT正在以帳號 ${client.user.tag} 上線中...`);
    },
};