const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { RiotLoLAPI } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lol')
        .setDescription('英雄聯盟綜合查詢系統')
        .setNameLocalization('zh-TW', '英雄聯盟')
        .addStringOption(opt => 
            opt.setName('name')
               .setNameLocalization('zh-TW', '召喚師名稱')
               .setDescription('輸入遊戲內的名稱')
               .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('tag')
               .setNameLocalization('zh-TW', '標籤')
               .setDescription('輸入 # 後的標籤 (例如 tw2)')
               .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const name = interaction.options.getString('name').trim();
        const tag = interaction.options.getString('tag').replace('#', '').trim();

        try {
            // 1. 取得帳號資料
            const accountResp = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RiotLoLAPI}`);
            const accountData = await accountResp.json();
            
            if (!accountData.puuid) {
                return await interaction.editReply(`❌ 找不到玩家：**${name}#${tag}**`);
            }

            // 2. 取得召喚師詳細資料 (等級、頭像)
            const summonerResp = await fetch(`https://tw2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${RiotLoLAPI}`);
            const summonerData = await summonerResp.json();

            // 3. 建立基本資訊 Embed
            const mainEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(`⚔️ 英雄聯盟玩家：【${name}#${tag}】`)
                .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summonerData.profileIconId}.png`)
                .addFields(
                    { name: '📊 等級', value: `\`${summonerData.summonerLevel}\``, inline: true },
                    { name: '🌍 地區', value: '`台港澳 (TW2)`', inline: true }
                )
                .setDescription(`**已查詢到召喚師【${name}#${tag}】的詳細資料**`)
                .setFooter({ text: '點擊下方按鈕進行進階查詢(僅你可見)' });

            // 4. 建立按鈕 (使用 | 作為安全分隔符)
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mastery|${accountData.puuid}`)
                    .setLabel('英雄專精')
                    .setEmoji('🔥')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`rank|${accountData.puuid}`)
                    .setLabel('排位排名')
                    .setEmoji('🏆')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`history|${accountData.puuid}`)
                    .setLabel('近期戰績')
                    .setEmoji('📜')
                    .setStyle(ButtonStyle.Secondary)
);

            await interaction.editReply({ embeds: [mainEmbed], components: [buttons] });

        } catch (e) {
            console.error(e);
            await interaction.editReply('❌ 進入系統失敗，請稍後再試。');
        }
    }
};