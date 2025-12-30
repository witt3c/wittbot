const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RiotTFTAPI } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tft')
        .setDescription('Check TFT rank')
        .setNameLocalization('zh-TW', '戰棋查詢')
        .addStringOption(opt => opt.setName('name').setNameLocalization('zh-TW', '玩家名稱').setDescription('Game Name').setRequired(true))
        .addStringOption(opt => opt.setName('tag').setNameLocalization('zh-TW', '標籤').setDescription('Tagline').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        const name = interaction.options.getString('name').trim();
        const tag = interaction.options.getString('tag').replace('#', '').trim();

        try {
            const accountResp = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-game-name/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RiotTFTAPI}`);
            const accountData = await accountResp.json();

            if (!accountData.puuid) return await interaction.editReply(`❌ 找不到戰棋玩家：**${name}#${tag}**(!!!!!系統建置中，未完成建置，詳細請洽管理員 naykkei)`);

            const summonerResp = await fetch(`https://tw2.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${accountData.puuid}?api_key=${RiotTFTAPI}`);
            const summonerData = await summonerResp.json();

            const leagueResp = await fetch(`https://tw2.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerData.id}?api_key=${RiotTFTAPI}`);
            const leagueData = await leagueResp.json();

            const embed = new EmbedBuilder()
                .setColor('#F9A825')
                .setTitle(`🐧 雲頂之巔：${name}#${tag}`)
                .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summonerData.profileIconId}.png`)
                .setTimestamp();

            if (leagueData && leagueData.length > 0) {
                const rank = leagueData[0];
                embed.addFields({ name: '目前牌位', value: `**${rank.tier} ${rank.rank}** (${rank.leaguePoints} LP)\n勝場：${rank.wins}` });
            } else {
                embed.setDescription('⚠️ 該玩家本賽季尚未進行戰棋積分賽。');
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            await interaction.editReply('❌ 戰棋查詢失敗。');
        }
    }
};