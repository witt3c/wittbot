const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { valApiKey } = require('../config.json');

const BASE_URL = 'https://api.henrikdev.xyz/valorant';

// 1. 地圖對照表
const valmapLabels = {
    "Abyss": "深窟幽境", "Ascent": "義境空島", "Bind": "劫境之地", "Breeze": "熱帶樂園",
    "Corrode": "晶蝕之地", "District": "鐵蹄特區", "Drift": "浮木港灣", "Fracture": "天漠之峽",
    "Glitch": "詭滅之地", "Haven": "遺落境地", "Icebox": "極地寒港", "Kasbah": "阿拉伯堡壘",
    "Lotus": "蓮華古城", "Pearl": "深海遺珠", "Piazza": "義式廣場", "Split": "雙塔迷城", "Sunset": "日落之城"
};

// 2. 模式對照表
const valModeLabels = {
    "Competitive": "競技模式",
    "Unrated": "一般模式",
    "Deathmatch": "死鬥模式",
    "Swiftplay": "超速衝點",
    "Spike Rush": "輻能搶攻戰",
    "Escalation": "超激進戰",
    "Team Deathmatch":"團隊死鬥",
    "Replication":"複製亂戰",
    "Snowball Fight":"打雪仗",
    "Custom Game":"自訂模式",
    "Premier": "特戰英豪菁英賽"
};

// 3. 特務對照表
const valAgentLabels = {
    "Phoenix": "菲尼克斯", "Jett": "婕提", "Viper": "薇蝮", "Sova": "蘇法",
    "Cypher": "瑟符", "Brimstone": "布史東", "Sage": "聖祈", "Omen": "歐門",
    "Breach": "叛奇", "Raze": "芮茲", "Reyna": "蕾娜", "Killjoy": "愷宙",
    "Skye": "絲凱", "Yoru": "夜戮", "Astra": "亞星卓", "KAY/O": "KAY/O",
    "Chamber": "錢博爾", "Neon": "妮虹", "Fade": "菲德", "Harbor": "哈泊",
    "Gekko": "蓋克", "Deadlock": "蒂羅", "Iso": "離索", "Clove": "珂樂芙",
    "Vyse": "薇絲", "Tejo": "戴侯", "Waylay": "維蕾", "Veto": "維托"
};

const valTierLabels = {
    "Unrated": "未分級",
    "Iron": "鐵牌",
    "Bronze": "銅牌",
    "Silver": "銀牌",
    "Gold": "金牌",
    "Platinum": "鉑金",
    "Diamond": "鑽石",
    "Ascendant": "超凡入聖",
    "Immortal": "神話",
    "Radiant": "輻能戰魂"
};

// --- 段位格式化工具 ---
function formatTier(rawTier) {
    if (!rawTier || rawTier === "Unrated" || rawTier === "無資料") return "未分級";
    const parts = rawTier.split(' ');
    const chineseName = valTierLabels[parts[0]] || parts[0];
    const rankNum = parts[1] ? ` ${parts[1]}` : "";
    return `${chineseName}${rankNum}`;
}

// --- [功能 1] 取得積分報表 ---
// --- [功能 1] 取得積分報表 (完整訂正版) ---
async function getValRankReport(name, tag, region) {
    try {
        const url = `${BASE_URL}/v2/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
        const response = await axios.get(url, { headers: { 'Authorization': valApiKey } });
        const d = response.data.data;

        const current = d.current_data;
        const bySeason = d.by_season;
        const seasonKeys = Object.keys(bySeason);

        let latestSeasonId = null;
        let stats = null;

        // 【核心訂正】由後往前找，確保跳過 e11a1 等空殼，鎖定有資料的 e10a6
        for (let i = seasonKeys.length - 1; i >= 0; i--) {
            const key = seasonKeys[i];
            const s = bySeason[key];
            // 排除有 error 或場次為 0 的賽季
            if (!s.error && s.number_of_games > 0) {
                latestSeasonId = key;
                stats = s;
                break; 
            }
        }

        // 如果真的完全沒打過（例如新號），保底取最後一個
        if (!latestSeasonId) {
            latestSeasonId = seasonKeys[seasonKeys.length - 1];
            stats = bySeason[latestSeasonId] || { wins: 0, number_of_games: 0 };
        }

        // 數據計算
        const wins = stats.wins || 0;
        const matches = stats.number_of_games || 0;
        const losses = matches - wins; 
        const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) : "0";

        // 翻譯與格式化 (保留你原有的設計)
        const currentTier = formatTier(current?.currenttierpatched);
        const highestTier = formatTier(d.highest_rank?.patched_tier);

        const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle(`🏆 ${name}#${tag} 積分戰報`)
            .setThumbnail(current?.images?.large || null)
            .addFields(
                { 
                    name: '🎖️ 目前段位', 
                    value: `**${currentTier}**\n分數: \`${current?.ranking_in_tier || 0} RR\``, 
                    inline: true 
                },
                { 
                    name: '📈 最近變動', 
                    value: current?.mmr_change_to_last_game >= 0 
                        ? `\`+${current.mmr_change_to_last_game}\`` 
                        : `\`${current?.mmr_change_to_last_game || 0}\``, 
                    inline: true 
                },
                { 
                    name: '🔝 歷史最高', 
                    value: `**${highestTier}**`, 
                    inline: true 
                },
                { 
                    name: `📊 本賽季統計 (${latestSeasonId.toUpperCase()})`, 
                    value: `總場數: \`${matches}\` | \`${wins}勝 ${losses}敗\`\n勝率: \`${winRate}%\``, 
                    inline: false 
                }
            )
            .setFooter({ text: '數據來源：Henrik-v2 API' })
            .setTimestamp();

        return { embeds: [embed] };

    } catch (e) {
        console.error("Rank API Error:", e.message);
        throw new Error("無法取得積分詳細資料，請檢查名稱是否正確。");
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
            const totalHits = p.stats.headshots + p.stats.bodyshots + p.stats.legshots;
            const hsRate = totalHits > 0 ? Math.round((p.stats.headshots / totalHits) * 100) : 0;

            const translatedMap = valmapLabels[match.metadata.map] || match.metadata.map;
            const translatedMode = valModeLabels[match.metadata.mode] || match.metadata.mode;
            const translatedAgent = valAgentLabels[p.character] || p.character;

            return {
                win: isWin ? '⭕ 勝利' : (match.metadata.mode === "Deathmatch" ? '⚔️ 死鬥' : '❌ 失敗'),
                map: translatedMap,
                mode: translatedMode,
                agent: translatedAgent,
                kda: `${p.stats.kills}/${p.stats.deaths}/${p.stats.assists}`,
                score: `${match.teams.blue.rounds_won}:${match.teams.red.rounds_won}`,
                hs: hsRate,
                acs: acs
            };
        }).filter(m => m !== null);

        const historyText = historyParsed.map((m, i) => {
            let rating = '😐 平凡';
            if (m.acs >= 300) rating = '🔥 戰神';
            else if (m.acs >= 250) rating = '💎 菁英';
            else if (m.acs >= 200) rating = '👍 優秀';

            return `\`${i + 1}.\` **${m.mode}** |  ${m.map}  |  **${m.win}**\n` +
                   `\u00A0\u00A0\u00A0 \u00A0\u00A0\u00A0 👤 **特務：** ${m.agent} (${rating})\n` +
                   `\u00A0\u00A0\u00A0 \u00A0\u00A0\u00A0 📊 **表現：** KDA： \`${m.kda}\` | 比分： \`${m.score}\` \n` +
                   `\u00A0\u00A0\u00A0 \u00A0\u00A0\u00A0 🎯 **數據：** 爆頭率： \`${m.hs}%\` | 平均戰力(ACS)： \`${m.acs}\``;
        }).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`📜 ${name}#${tag} 玩家近期對戰紀錄`)
            .setDescription(historyText || "無對戰紀錄")
            .setFooter({ text: '數據來源：Henrik-v3' })
            .setTimestamp();

        return { embeds: [embed] };
    } catch (e) {
        throw new Error("無法取得對戰紀錄，請通知開發者 <@393579380674134016>。");
    }
}

module.exports = { getValRankReport, getValHistoryReport };