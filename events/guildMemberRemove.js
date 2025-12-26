const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        // 全伺服器 成員離開伺服器記錄檔
        console.log(`💔 ${member.user.tag} 離開 ${member.guild.name} (${member.guild.id})`);

        const channel = member.guild.systemChannel;
        if (!channel) return console.log('❌ 找不到系統歡迎頻道');

        // 建立基礎 Embed 樣式 (所有伺服器共通部分)
        const leaveEmbed = new EmbedBuilder()
            .setColor('#ff2020')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        // ---------------------------------------------------------
        // 根據不同伺服器 ID 填入各自原有的文字設計
        // ---------------------------------------------------------
        switch (member.guild.id) {
            case '1330733636219043961': // chill play
                leaveEmbed
                    .setAuthor({ 
                        name: ` ${member.guild.name} 損失了一名 chill 友`, 
                        iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
                    })
                    .setDescription(`
很遺憾 ${member} 離開了 ${member.guild.name} DC 社群 

\`\`\`
PLAY GAMEING--CHILL PLAYING
尊重 友善 包容 一切就是保持起 CHILL
\`\`\`


期許 ${member.user.globalName} 還有機會與我們同遊
                    `)
                    .setFooter({ text: `${member.guild.name} 祝福您平安喜樂` });
                break;

            case '1048586401618329670': // naykkei的伺服器
                leaveEmbed
                    .setAuthor({ 
                        name: ` ${member.guild.name} 損失了一名玩家`, 
                        iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
                    })
                    .setDescription(`
很遺憾 ${member} 離開了 ${member.guild.name} DC 社群 

\`\`\`
NAYYKEI永遠愛著你
\`\`\`


期許 ${member.user.globalName} PEACE
                    `)
                    .setFooter({ text: `${member.guild.name} NAYYKEI ` });
                break;

            case '1452546484909375543': // 新測試群
                leaveEmbed
                    .setAuthor({ 
                        name: ` ${member.guild.name} 損失了一名玩家`, 
                        iconURL: member.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/default-server.png' 
                    })
                    .setDescription(`
很遺憾 ${member} 離開了 ${member.guild.name} DC 社群 

\`\`\`
測試之路用遠花路
\`\`\`


期許 ${member.user.globalName} HAPPYHAPPY
                    `)
                    .setFooter({ text: `${member.guild.name} 測試愉快` });
                break;

            default:
                // 非指定伺服器不發送
                return;
        }

        // 發送訊息
        await channel.send({ embeds: [leaveEmbed] });
    },
};