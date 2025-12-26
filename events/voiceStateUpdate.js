const { Events } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        // 從 client 取得全域變數
        const { client } = newState;
        const { config, dynamicVoiceChannels } = client;

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
            try {
                const member = newState.member;
                const category = newState.channel.parent;
                const suffix = voiceConfigs[newState.channelId];

                const newChannel = await newState.guild.channels.create({
                    name: `${member.user.globalName || member.user.username} ${suffix}`,
                    type: 2,
                    parent: category,
                    permissionOverwrites: category ? category.permissionOverwrites.cache.map(p => ({
                        id: p.id, allow: p.allow, deny: p.deny
                    })) : [],
                });

                await member.voice.setChannel(newChannel);
                dynamicVoiceChannels.add(newChannel.id);
            } catch (error) {
                console.error('建立語音頻道出錯:', error);
            }
        }

        // --- 刪除邏輯 ---
        if (oldState.channelId && dynamicVoiceChannels.has(oldState.channelId) && newState.channelId !== oldState.channelId) {
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