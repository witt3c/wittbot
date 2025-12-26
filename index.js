// Require the necessary discord.js classes
const fs = require('fs');
const path = require('path');

const { 
  Client, 
  Events, 
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
} = require('discord.js');
const { token,
  originalVoiceChannelp1Id, originalVoiceChannelp2Id, originalVoiceChannelp3Id, originalVoiceChannelp4Id, originalVoiceChannelp5Id, originalVoiceChannelp6Id, originalVoiceChannelp7Id, originalVoiceChannelp8Id, originalVoiceChannelp9Id, originalVoiceChannelp10Id,
  originalVoiceChannelp11Id, originalVoiceChannelp12Id, originalVoiceChannelp13Id, originalVoiceChannelp14Id, originalVoiceChannelp15Id, originalVoiceChannelp16Id, originalVoiceChannelp17Id, originalVoiceChannelp18Id, originalVoiceChannelp19Id, originalVoiceChannelp20Id,
} = require('./config.json');




// Create a new client instance
const client = new Client({ 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

// 📌 指令集合
client.commands = new Collection();
const dynamicVoiceChannels = new Set();

// 讀取 commands 資料夾
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`⚠ Error executing /${interaction.commandName}`, error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({
        content: '❌ 執行指令時發生錯誤',
      });
    } else {
      await interaction.reply({
        content: '❌ 執行指令時發生錯誤',
        ephemeral: true,
      });
    }
  }
});







//測試回應訊息
client.on(Events.MessageCreate, (message) => {
  if(message.author == client.user) return;
  if (message.content === '?!help') {    
message.reply(`
程式碼簡介：
**🎵 Witt動態語音 一般指令**
\`\`\`
?!hello         自我介紹
?!Version       最新版本
\`\`\`

**🎵 Witt 音樂指令一覽(暫定*-程式編輯中)**
\`\`\`
?!p <url>       播放 / 加入佇列
?!pause         暫停
?!resume        繼續
?!stop          停止
?!volume 50     音量
?!loop          循環
\`\`\`
`);
  }
});




 


client.on(Events.MessageCreate,(message)=>{
  if(message.author == client.user) return;
    if (message.content === "?!hello"){
    message.reply(`：您好~~

目前版本 v1.4.3 @251223      

支援功能：
1.成員加入/離開 通知
2.創建專屬臨時聊天房間

更多功能持續開發中...

歡迎任何技術支援都可以聯絡 naykkei(witt)
或寄發email：witt3c@gmail.com`)

    }});

client.on(Events.MessageCreate,(message)=>{
  if(message.author == client.user) return;
    if (message.content === "?!Version"){
        message.reply(`目前witt動態語音最新版本為v1.3.0`)
    }});

client.on(Events.MessageCreate,(message)=>{
  if(message.author == client.user) return;
    if (message.content === "?!updating"){
        message.delete(message);
        message.channel.send(`目前witt動態語音正在更新迭代中，如有動態語音頻道卡頓問題請洽管理員建立臨時語音頻道`)
    }});

//client.on(Events.MessageCreate,(message)=>{
//  if(message.author == client.user) return;
//  console.log(message);
//})

//全伺服器 新人加入記錄檔
client.on(Events.GuildMemberAdd,(member)=>{
    //console.log(member);(新加入成員詳細全資料*暫隱藏)
    console.log(`🎉 ${member.user.tag} 加入 ${member.guild.name} (${member.guild.id})`);
  });
//chill play 新人加入歡迎語
client.on(Events.GuildMemberAdd, async (member) => {
    if (member.guild.id !== '1330733636219043961') return;

    const channel = member.guild.systemChannel;
    if (!channel) return console.log('❌ 找不到系統歡迎頻道');

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#026FFF')
        .setAuthor({ 
            name: `歡迎加入 ${member.guild.name} :tada: :tada:`, 
            iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`
熱烈掌聲給 ${member} :clap: :clap:
歡迎您加入 **${member.guild.name} DC 社群** :video_game: :video_game: 

\`\`\`
PLAY GAMEING--CHILL PLAYING
尊重 友善 包容 一切就是保持起 CHILL
\`\`\`

:warning: 進入本社群頻道 請至頻道左上方 【頻道與身分組】
確認遊玩遊戲頻道 與 聊天群組
如未加選身分組 該頻道將不會顯示
往後依舊仍可自行選擇添加

:loudspeaker: 本社群設有個人語音通話模組
可點擊個遊戲群組中建立語音頻道
即可創建個人專屬房間
或您也可以加入已創建完成之專屬房

如果您覺得此社群不錯 :clap:
可以自行建立邀請連結拉好友進來一起同樂
也可以點擊左上方:small_blue_diamond:伺服器加成
讓社群更加強大 茁壯 :handshake: :handshake:

再次歡迎 ${member.user.globalName} 的加入
祝您 遊戲常勝 抽卡歐皇 :statue_of_liberty:  :statue_of_liberty:


        `)
        .setFooter({ text: `${member.guild.name} DC 社群   感謝你的加入` })
        .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
});
//naykkei的伺服器 新人加入歡迎語
client.on(Events.GuildMemberAdd, async (member) => {
    if (member.guild.id !== '1048586401618329670') return;

    const channel = member.guild.systemChannel;
    if (!channel) return console.log('❌ 找不到系統歡迎頻道');

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#026FFF')
        .setAuthor({ 
            name: `歡迎加入 ${member.guild.name} :tada: :tada:`, 
            iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`
熱烈掌聲給 ${member} :clap: :clap:
歡迎您加入 **${member.guild.name} DC 社群** :video_game: :video_game: 

\`\`\`
PLAY GAMEING--CHILL PLAYING
尊重 友善 包容 一切就是保持起 CHILL
\`\`\`

:warning: 進入本社群頻道 請至頻道左上方 【頻道與身分組】
確認遊玩遊戲頻道 與 聊天群組
如未加選身分組 該頻道將不會顯示
往後依舊仍可自行選擇添加

:loudspeaker: 本社群設有個人語音通話模組
可點擊個遊戲群組中建立語音頻道
即可創建個人專屬房間
或您也可以加入已創建完成之專屬房

如果您覺得此社群不錯 :clap:
可以自行建立邀請連結拉好友進來一起同樂
也可以點擊左上方:small_blue_diamond:伺服器加成
讓社群更加強大 茁壯 :handshake: :handshake:

再次歡迎 ${member.user.globalName} 的加入
祝您 遊戲常勝 抽卡歐皇 :statue_of_liberty:  :statue_of_liberty:


        `)
        .setFooter({ text: `${member.guild.name} DC 社群   感謝你的加入` })
        .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
});
//新測試群 新人加入歡迎語
client.on(Events.GuildMemberAdd, async (member) => {
    if (member.guild.id !== '1452546484909375543') return;

    const channel = member.guild.systemChannel;
    if (!channel) return console.log('❌ 找不到系統歡迎頻道');

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#026FFF')
        .setAuthor({ 
            name: `歡迎加入 ${member.guild.name} :tada: :tada:`, 
            iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`
熱烈掌聲給 ${member} :clap: :clap:
歡迎您加入 **${member.guild.name} DC 社群** :video_game: :video_game: 

\`\`\`
PLAY GAMEING--CHILL PLAYING
尊重 友善 包容 一切就是保持起 CHILL
\`\`\`

:warning: 進入本社群頻道 請至頻道左上方 【頻道與身分組】
確認遊玩遊戲頻道 與 聊天群組
如未加選身分組 該頻道將不會顯示
往後依舊仍可自行選擇添加

:loudspeaker: 本社群設有個人語音通話模組
可點擊個遊戲群組中建立語音頻道
即可創建個人專屬房間
或您也可以加入已創建完成之專屬房

如果您覺得此社群不錯 :clap:
可以自行建立邀請連結拉好友進來一起同樂
也可以點擊左上方:small_blue_diamond:伺服器加成
讓社群更加強大 茁壯 :handshake: :handshake:

再次歡迎 ${member.user.globalName} 的加入
祝您 遊戲常勝 抽卡歐皇 :statue_of_liberty:  :statue_of_liberty:


        `)
        .setFooter({ text: `${member.guild.name} DC 社群   感謝你的加入` })
        .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
});

//全伺服器 成員離開伺服器記錄檔
client.on(Events.GuildMemberRemove,(member)=>{
    //console.log(member);(新加入成員詳細全資料*暫隱藏)
    console.log(`💔 ${member.user.tag} 離開 ${member.guild.name} (${member.guild.id})`);
  });
//chill play 成員離開伺服器
  client.on(Events.GuildMemberRemove, async (member) => {
    if (member.guild.id !== '1330733636219043961') return;

    const channel = member.guild.systemChannel;
    if (!channel) return console.log('❌ 找不到系統歡迎頻道');

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#ff2020')
        .setAuthor({ 
            name: ` ${member.guild.name} 損失了一名 chill 友`, 
            iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`
很遺憾 ${member} 離開了 ${member.guild.name} DC 社群 

\`\`\`
PLAY GAMEING--CHILL PLAYING
尊重 友善 包容 一切就是保持起 CHILL
\`\`\`


期許 ${member.user.globalName} 還有機會與我們同遊


        `)
        .setFooter({ text: `${member.guild.name} 祝福您平安喜樂` })
        .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
});
//naykkei的伺服器 成員離開伺服器
client.on(Events.GuildMemberRemove, async (member) => {
    if (member.guild.id !== '1048586401618329670') return;

    const channel = member.guild.systemChannel;
    if (!channel) return console.log('❌ 找不到系統歡迎頻道');

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#ff2020')
        .setAuthor({ 
            name: ` ${member.guild.name} 損失了一名玩家`, 
            iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`
很遺憾 ${member} 離開了 ${member.guild.name} DC 社群 

\`\`\`
PLAY GAMEING--CHILL PLAYING
尊重 友善 包容 一切就是保持起 CHILL
\`\`\`


期許 ${member.user.globalName} 還有機會與我們同遊


        `)
        .setFooter({ text: `${member.guild.name} 祝福您平安喜樂` })
        .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
});
//新測試群 成員離開伺服器
client.on(Events.GuildMemberRemove, async (member) => {
    if (member.guild.id !== '1452546484909375543') return;

    const channel = member.guild.systemChannel;
    if (!channel) return console.log('❌ 找不到系統歡迎頻道');

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#ff2020')
        .setAuthor({ 
            name: ` ${member.guild.name} 損失了一名玩家`, 
            iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`
很遺憾 ${member} 離開了 ${member.guild.name} DC 社群 

\`\`\`
PLAY GAMEING--CHILL PLAYING
尊重 友善 包容 一切就是保持起 CHILL
\`\`\`


期許 ${member.user.globalName} 還有機會與我們同遊


        `)
        .setFooter({ text: `${member.guild.name} 祝福您平安喜樂` })
        .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
});




//------------------------------------------------------------------】
//臨時語音頻道［自動添加臨時頻道 用戶離開後刪除-------------------------】
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  //chillpaly01綜合遊戲大廳-建立語音頻道------
  if (newState.channelId === originalVoiceChannelp1Id && oldState.channelId !== originalVoiceChannelp1Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}' 的遊戲頻道`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly02英雄聯盟-建立英雄聯盟----------
  if (newState.channelId === originalVoiceChannelp2Id && oldState.channelId !== originalVoiceChannelp2Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 英雄召集令`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly03gtav-建立gta房----------------
  if (newState.channelId === originalVoiceChannelp3Id && oldState.channelId !== originalVoiceChannelp3Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}' 的gtav房`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly04新楓之谷-建立楓之谷房間--------
  if (newState.channelId === originalVoiceChannelp4Id && oldState.channelId !== originalVoiceChannelp4Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}'的楓谷房`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly05鬥陣特工-建立鬥陣語音----------
  if (newState.channelId === originalVoiceChannelp5Id && oldState.channelId !== originalVoiceChannelp5Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}'的鬥陣房`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly06三角洲行動-建立遊戲頻道---------
  if (newState.channelId === originalVoiceChannelp6Id && oldState.channelId !== originalVoiceChannelp6Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}' 的三角洲房`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly07其他遊戲-建立農場遊戲----------
  if (newState.channelId === originalVoiceChannelp7Id && oldState.channelId !== originalVoiceChannelp7Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}' 的遊戲房間`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly08音樂酒吧-建立音樂舞台----------
  if (newState.channelId === originalVoiceChannelp8Id && oldState.channelId !== originalVoiceChannelp8Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}'酒吧 歡迎光臨`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly09潛水專區-前水吐泡後台呼叫------
  if (newState.channelId === originalVoiceChannelp9Id && oldState.channelId !== originalVoiceChannelp9Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}' 潛水吐泡中`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //chillpaly10英雄聯盟-建立聯盟戰棋----------
  if (newState.channelId === originalVoiceChannelp10Id && oldState.channelId !== originalVoiceChannelp10Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName}' 棋靈王之爭`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }

  // 橫行霸道/聊天大廳------------------------- -
  if (newState.channelId === originalVoiceChannelp11Id && oldState.channelId !== originalVoiceChannelp11Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 的聊天房間`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/少女專區------------------------- -
  if (newState.channelId === originalVoiceChannelp12Id && oldState.channelId !== originalVoiceChannelp12Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 的少女閨房`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/聽歌房------------------------- -
  if (newState.channelId === originalVoiceChannelp13Id && oldState.channelId !== originalVoiceChannelp13Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 聽歌房`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/掛機房------------------------- -
  if (newState.channelId === originalVoiceChannelp14Id && oldState.channelId !== originalVoiceChannelp14Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 掛機潛水中後台敲`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/爬分列車------------------------- -
  if (newState.channelId === originalVoiceChannelp15Id && oldState.channelId !== originalVoiceChannelp15Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 特戰上分列車`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/峽谷亡者------------------------- -
  if (newState.channelId === originalVoiceChannelp16Id && oldState.channelId !== originalVoiceChannelp16Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 英雄召集`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/魂命團------------------------- -
  if (newState.channelId === originalVoiceChannelp17Id && oldState.channelId !== originalVoiceChannelp17Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 天命團`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/瘋癲大隊------------------------- -
  if (newState.channelId === originalVoiceChannelp18Id && oldState.channelId !== originalVoiceChannelp18Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 瘋癲大隊`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  //橫行霸道/mc世界------------------------- -
  if (newState.channelId === originalVoiceChannelp19Id && oldState.channelId !== originalVoiceChannelp19Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 的MC世界`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }
  // 橫行霸道/天天碾魚團---------------------- -
  if (newState.channelId === originalVoiceChannelp20Id && oldState.channelId !== originalVoiceChannelp20Id) {
    const member = newState.member;
    const guild = newState.guild;
    const category = newState.channel.parent;
    const categoryPermissions = category.permissionOverwrites.cache;
    const newChannelPermissions = categoryPermissions.map((permission) => ({id: permission.id,allow: permission.allow,deny: permission.deny,}));
    const newChannel = await guild.channels.create({name: `${member.user.globalName} 的天天樂園房`,type: 2,parent: category,permissionOverwrites: newChannelPermissions,});
    await member.voice.setChannel(newChannel);
    dynamicVoiceChannels.add(newChannel.id);
  }


  // Check if the user switched from a dynamically created voice channel to another channel
  if (dynamicVoiceChannels.has(oldState.channelId) && newState.channelId !== oldState.channelId) {
    const channel = oldState.channel;
    if (channel.members.size === 0) {
      // If there are no other users in the channel, delete it
      try {
        await channel.delete();
        // Remove the channel ID from the stored set
        dynamicVoiceChannels.delete(channel.id);
      }
      catch (error) {
        console.error('刪除頻道時發生錯誤:', error);
      }
    }
  }
});
//臨時語音頻道［自動添加臨時頻道 用戶離開後刪除-------------------------】
//------------------------------------------------------------------】


client.login(token);
