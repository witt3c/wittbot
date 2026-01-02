const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { valApiKey } = require('../config.json');

const BASE_URL = 'https://api.henrikdev.xyz/valorant';

// --- [功能 1] 取得積分報表 ---
async function getValRankReport(name, tag, region) {
    try {
        const url = `${BASE_URL}/v1/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
        const response = await axios.get(url, { headers: { 'Authorization': valApiKey } });
        const d = response.data.data;

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle(`🏆 ${name}#${tag} 積分戰報`)
            .setImage(d?.images?.large || 'https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a3b05d4e/0/largeicon.png')
            .addFields(
                { 
                    name: '🎖️ 目前段位', 
                    value: `**${d?.currenttierpatched || 'Unrated'}**\n分數: \`${d?.ranking_in_tier || 0} RR\``, 
                    inline: true 
                },
                { 
                    name: '📈 最近變動', 
                    value: d?.mmr_change_to_last_game >= 0 ? `\`+${d.mmr_change_to_last_game}\`` : `\`${d.mmr_change_to_last_game}\``, 
                    inline: true 
                }
            )
            .setFooter({ text: '數據來源：Henrik-v1' })
            .setTimestamp();

        return { embeds: [embed] };
    } catch (e) {
        throw new Error("無法取得積分資料。");
    }
}

// --- [功能 2] 取得近期戰績報表 ---
async function getValHistoryReport(name, tag, region) {
    try {
        const url = `${BASE_URL}/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=5`;
        const response = await axios.get(url, { headers: { 'Authorization': valApiKey } });
        const matches = response.data.data;

        const historyParsed = matches.map(match => {
            const p = match.players.all_players.find(part => part.name.toLowerCase() === name.toLowerCase());
            if (!p) return null;

            const team = p.team.toLowerCase();
            const isWin = match.teams[team]?.has_won;
            const acs = Math.round(p.stats.score / (match.metadata.rounds_played || 1));
            
            // 計算爆頭率
            const totalHits = p.stats.headshots + p.stats.bodyshots + p.stats.legshots;
            const hsRate = totalHits > 0 ? Math.round((p.stats.headshots / totalHits) * 100) : 0;

            return {
                win: isWin ? '⭕ 勝利' : (match.metadata.mode === "Deathmatch" ? '⚔️ 死鬥' : '❌ 失敗'),
                map: match.metadata.map,
                mode: match.metadata.mode,
                agent: p.character,
                kda: `${p.stats.kills}/${p.stats.deaths}/${p.stats.assists}`,
                score: `${match.teams.blue.rounds_won}:${match.teams.red.rounds_won}`,
                hs: hsRate,
                acs: acs
            };
        }).filter(m => m !== null);

        // 模仿 LOL 模板的分行排版
        const historyText = historyParsed.map((m, i) => {
    // 根據 ACS 給予簡單評語，增加豐富度
    let rating = '😐 平凡';
    if (m.acs >= 300) rating = '🔥 戰神';
    else if (m.acs >= 250) rating = '💎 菁英';
    else if (m.acs >= 200) rating = '👍 優秀';

    return `\`${i + 1}.\` **${m.win}** | **${m.mode}** | ${m.map}\n` +
           `\u00A0\u00A0\u00A0 👤 **使用特務：** ${m.agent} (${rating})\n` +
           `\u00A0\u00A0\u00A0 📊 **對戰表現：** KDA: \`${m.kda}\` | 比分: \`${m.score}\` \n` +
           `\u00A0\u00A0\u00A0 🎯 **進階數據：** 爆頭率: \`${m.hs}%\` | 平均戰力(ACS): \`${m.acs}\``;
}).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`📜 ${name}#${tag} 近期戰績`)
            .setDescription(historyText || "無戰績資料")
            .setFooter({ text: '數據來源：Henrik-v3' })
            .setTimestamp();

        return { embeds: [embed] };
    } catch (e) {
        throw new Error("無法取得戰績資料。");
    }
}

module.exports = { getValRankReport, getValHistoryReport };