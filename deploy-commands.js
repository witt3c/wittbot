const { REST, Routes } = require('discord.js');
const { token, clientId } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`正在開始刷新 ${commands.length} 個全域斜線指令 (/)。`);

        // 使用 Routes.applicationCommands(clientId) 而非 applicationGuildCommands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ 成功註冊全域指令！');
        console.log('💡 提醒：全域指令可能需要一點時間才會在所有伺服器生效。');
    } catch (error) {
        console.error('註冊指令時發生錯誤:', error);
    }
})();