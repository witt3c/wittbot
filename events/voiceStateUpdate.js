const { Events } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const { client } = newState;
        const { config, dynamicVoiceChannels } = client;

        // 建立頻道配置表 (ID : 房間名稱)
        const voiceConfigs = {
            [config.originalVoiceChannelp1Id]: '的遊戲頻道',
            [config.originalVoiceChannelp2Id]: '英雄召集令',
            [config.originalVoiceChannelp3Id]: '的gtav房',
            [config.originalVoiceChannelp4Id]: '的楓谷房',
            [config.originalVoiceChannelp5Id]: '的鬥陣房',
            [config.originalVoiceChannelp6Id]: '的三角洲房',
            [config.originalVoiceChannelp7Id]: '的遊戲房間',
            [config.originalVoiceChannelp8Id]: '酒吧 歡迎光臨',
            [config.originalVoiceChannelp9Id]: '潛水吐泡中',
            [config.originalVoiceChannelp10Id]: '棋靈王之爭',
            [config.originalVoiceChannelp11Id]: '的聊天房間',
            [config.originalVoiceChannelp12Id]: '的少女閨房',
            [config.originalVoiceChannelp13Id]: '聽歌房',
            [config.originalVoiceChannelp14Id]: '掛機潛水中後台敲',
            [config.originalVoiceChannelp15Id]: '特戰上分列車',
            [config.originalVoiceChannelp16Id]: '英雄召集',
            [config.originalVoiceChannelp17Id]: '天命團',
            [config.originalVoiceChannelp18Id]: '瘋癲大隊',
            [config.originalVoiceChannelp19Id]: '的MC世界',
            [config.originalVoiceChannelp20Id]: '的天天樂園房',
        };

        // --- 建立邏輯 ---
        if (voiceConfigs[newState.channelId] && oldState.channelId !== newState.channelId) {
            const member = newState.member;
            const category = newState.channel.parent; // 取得原本頻道的分類
            const suffix = voiceConfigs[newState.channelId];

            try {
                // 這裡就是修正後的片段：加入了 category 的防呆判斷
                const channelName = `${member.displayName}${suffix}`;
                const newChannel = await newState.guild.channels.create({
                    name: channelName,
                    type: 2, // 語音頻道
                    parent: category ? category.id : null, // 修正點：如果沒有分類就不設定，防止報錯
                    permissionOverwrites: category ? category.permissionOverwrites.cache.map(p => ({
                        id: p.id, 
                        allow: p.allow, 
                        deny: p.deny
                    })) : [], // 修正點：如果沒有分類就給空陣列
                });

                await member.voice.setChannel(newChannel);
                dynamicVoiceChannels.add(newChannel.id);
            } catch (err) {
                console.error('建立動態語音頻道失敗:', err);
            }
        }

        // --- 刪除邏輯 ---
        if (dynamicVoiceChannels.has(oldState.channelId) && newState.channelId !== oldState.channelId) {
            const channel = oldState.channel;
            if (channel && channel.members.size === 0) {
                try {
                    await channel.delete();
                    dynamicVoiceChannels.delete(channel.id);
                } catch (err) {
                    console.error('刪除動態頻道失敗:', err);
                }
            }
        }
    }
};