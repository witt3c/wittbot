const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { RiotLoLAPI } = require('../config.json');

// --- 內部輔助函式：取得英雄資料表 ---
async function fetchChampionMap() {
    try {
        const resp = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.24.1/data/zh_TW/champion.json`);
        const data = await resp.json();
        const map = {};
        for (let key in data.data) {
            const champ = data.data[key];
            map[champ.key] = { name: champ.name, id: champ.id };
        }
        return map;
    } catch (e) {
        console.error("無法載入英雄資料表:", e);
        return {};
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lol')
        .setDescription('英雄聯盟綜合查詢系統')
        .setNameLocalization('zh-TW', '英雄聯盟')
        .addStringOption(opt => 
            opt.setName('name').setNameLocalization('zh-TW', '召喚師名稱').setDescription('輸入名稱').setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('tag').setNameLocalization('zh-TW', '標籤').setDescription('輸入標籤').setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        // 【修正 1】 這裡要加入 Ephemeral 標記，整則回覆才會是私密的
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        const name = interaction.options.getString('name').trim();
        const tag = interaction.options.getString('tag').replace('#', '').trim();

        try {
            // 1. 取得帳號 PUUID
            const accountResp = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${RiotLoLAPI}`);
            const accountData = await accountResp.json();
            
            if (!accountData.puuid) {
                return await interaction.editReply(`❌ 找不到玩家：**${name}#${tag}**`);
            }

            // 2. 平行取得數據
            const [summonerResp, masteryResp, matchIdsResp, champMap] = await Promise.all([
                fetch(`https://tw2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${RiotLoLAPI}`),
                fetch(`https://tw2.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${accountData.puuid}?api_key=${RiotLoLAPI}`),
                fetch(`https://sea.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountData.puuid}/ids?start=0&count=20&api_key=${RiotLoLAPI}`),
                fetchChampionMap()
            ]);

            const summonerData = await summonerResp.json();
            const masteryData = await masteryResp.json();
            const matchIds = await matchIdsResp.json();

            // 3. 處理「最常用英雄」與橫向 Splash Art
            let topChampDisplay = "無資料";
            let topChampSplash = null;

            if (masteryData && masteryData.length > 0) {
                const topKey = masteryData[0].championId.toString();
                const champInfo = champMap[topKey];
                
                if (champInfo) {
                    topChampDisplay = `${champInfo.name} (Lv.${masteryData[0].championLevel})`;
                    topChampSplash = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champInfo.id}_0.jpg`;
                }
            }

            // 4. 處理「近 20 場勝率」
            let wins = 0, losses = 0;
            if (Array.isArray(matchIds) && matchIds.length > 0) {
                const matchResults = await Promise.all(
                    matchIds.map(id => fetch(`https://sea.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RiotLoLAPI}`).then(r => r.json()))
                );
                matchResults.forEach(match => {
                    const p = match.info?.participants.find(part => part.puuid === accountData.puuid);
                    if (p) p.win ? wins++ : losses++;
                });
            }
            const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

            // 5. 建立 Embed
            const mainEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle(`⚔️ 英雄聯盟玩家：【${name}#${tag}】`)
                .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summonerData.profileIconId}.png`)
                .addFields(
                    { name: '🌍 地區', value: '`台港澳 (TW2)`', inline: true },
                    { name: '📊 等級', value: `\`${summonerData.summonerLevel}\``, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '🔥 最常用英雄', value: `\`${topChampDisplay}\``, inline: true },
                    { name: '📜 近 20 場勝負', value: `\`${wins}勝 / ${losses}負\` (勝率 ${winRate}%)`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true }
                )
                .setDescription(`**已查詢到召喚師【${name}#${tag}】的詳細資料**`)
                .setFooter({ text: '點擊下方按鈕進行進階查詢 (僅你可見)' });

            if (topChampSplash) {
                mainEmbed.setImage(topChampSplash);
            }

            // 6. 建立按鈕
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`mastery|${accountData.puuid}`).setLabel('英雄專精').setEmoji('🔥').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`rank|${accountData.puuid}`).setLabel('排位排名').setEmoji('🏆').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`history|${accountData.puuid}`).setLabel('近期戰績').setEmoji('📜').setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({ embeds: [mainEmbed], components: [buttons] });

        } catch (e) {
            console.error(e);
            // 【修正 2】 這裡是 editReply 而不是 deferReplyReply
            await interaction.editReply({ content: '❌ 查詢失敗，請檢查名稱與標籤是否正確。' });
        }
    }
};