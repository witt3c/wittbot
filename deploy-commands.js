const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { token, clientId } = require('./config.json');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🌍 正在更新全域 Slash Commands...');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('✅ 全域 Slash Commands 更新完成（最多 1 小時生效）');
  } catch (error) {
    console.error(error);
  }
})();
