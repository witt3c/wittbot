const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        // 全伺服器紀錄檔
        console.log(`🎉 ${member.user.tag} 加入 ${member.guild.name} (${member.guild.id})`);
        //console.log(member);

        const channel = member.guild.systemChannel;
        if (!channel) return console.log('❌ 找不到系統歡迎頻道');

        // 先建立基礎 Embed 樣式
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#026FFF')
            .setAuthor({ 
                name: `歡迎加入 ${member.guild.name} 🎉🎉 `, 
                iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
            })
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `${member.guild.name} DC 社群   感謝你的加入` })
            .setTimestamp();

        // 根據伺服器 ID 填入各自指定的 Description 內容
        switch (member.guild.id) {
            case '1330733636219043961': // Chill Play 伺服器
                welcomeEmbed.setDescription(`
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
                `);
                break;

            case '943498383170101298': // 橫行霸道
                welcomeEmbed.setDescription(`
熱烈掌聲給 ${member} :clap: :clap:
歡迎您加入 **${member.guild.name} DC 社群** :video_game: :video_game: 

\`\`\`
恭喜本＂耍廢群＂
迎來第 ${member.guild.memberCount} 個惠仔
\`\`\`

:loudspeaker: 本社群設有個人語音通話模組
可點擊個遊戲群組中建立語音頻道
即可創建個人專屬房間
或您也可以加入已創建完成之專屬房

再次歡迎 ${member.user.globalName} 的加入
                `);
                break;    

            case '1048586401618329670': // Naykkei 的伺服器
                welcomeEmbed.setDescription(`
熱烈掌聲給 ${member} :clap: :clap:
歡迎您加入 **${member.guild.name} DC 社群** :video_game: :video_game: 

\`\`\`
恭喜本＂耍廢群＂
迎來第 ${member.guild.memberCount} 個惠仔
\`\`\`

:loudspeaker: 本社群設有個人語音通話模組
可點擊個遊戲群組中建立語音頻道
即可創建個人專屬房間
或您也可以加入已創建完成之專屬房

再次歡迎 ${member.user.globalName} 的加入
                `);
                break;


            case '1452546484909375543': // 新測試用伺服器
                welcomeEmbed.setDescription(`
熱烈掌聲給 ${member} :clap: :clap:
歡迎您加入 **${member.guild.name} DC 社群** :video_game: :video_game: 

\`\`\`
測試路途遙遙無期
\`\`\`

:warning: 進入本社群頻道 請至頻道左上方 【頻道與身分組】
確認遊玩遊戲頻道 與 聊天群組
如未加選身分組 該頻道將不會顯示
往後依舊仍可自行選擇添加

:loudspeaker: 本社群設有個人語音通話模組
可點擊個遊戲群組中建立語音頻道
即可創建個人專屬房間

測試測試 DEBUG

再次歡迎 ${member.user.globalName} 的加入
祝您 完全都不會有BUG :statue_of_liberty:  :statue_of_liberty:
                `);
                break;

            default:
                // 非指定伺服器不執行
                return;
        }

        // 發送訊息
        await channel.send({ embeds: [welcomeEmbed] });
    },
};