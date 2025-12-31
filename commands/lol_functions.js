const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const { RiotLoLAPI } = require('../config.json');


// --- [優化] 全域快取變數 ---
let championCache = null;

const tierLabels = {
    'CHALLENGER': '菁英',
    'GRANDMASTER': '宗師',
    'MASTER': '大師',
    'DIAMOND': '鑽石',
    'EMERALD': '翡翠',
    'PLATINUM': '白金',
    'GOLD': '金牌',
    'SILVER': '銀牌',
    'BRONZE': '銅牌',
    'IRON': '鐵牌',
    'UNRANKED': '未分級'
};
const modeLabels = {
    "CLASSIC": "召喚峽谷",
    "ARAM": "隨機單中",
    "URF": "阿福快打",
    "ULTBOOK": "終極咒語",
    "NEXUSBLITZ": "閃電急擊",
    "ONEFORALL": "一克隆大作戰",
    "CHERRY": "競技場", // Arena 模式在 API 有時會顯示為 CHERRY
    "ARENA": "競技場",
    "TUTORIAL": "教學模式",
    "DOOMBOTSTEEMO": "末日經文 (提摩)",
    "KINGPORO": "普羅王傳說",
    "STARGUARDIAN": "星光戰士模式",
    "GAMEMODEX": "閃電急擊",
    "ODYSSEY": "奧德賽",
    "SWIFTPLAY": "快速對戰"
};

const laneIcons = {
    'TOP': '<:datatop:1455735383374430330>',    // 上路
    'JUNGLE': '<:datajg:1455735378249252945>', // 打野
    'MIDDLE': '<:datamid:1455735379834699786>', // 中路
    'BOTTOM': '<:databot:1455735376734978219>', // 下路
    'UTILITY': '<:datasup:1455735381692776448>', // 輔助
    '': '🌀' // 其他模式 (如 ARAM)
};

/**
 * 取得英雄對照表（優先從快取讀取）
 */
async function getChampionMap() {
    if (championCache) return championCache;

    try {
        // 使用 14.24.1 版本 (你可以根據 Riot 更新手動調整此 URL)
        const ddResp = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.24.1/data/zh_TW/champion.json`);
        const ddData = await ddResp.json();
        
        const champMap = {};
        for (let key in ddData.data) {
            const champ = ddData.data[key];
            champMap[champ.key] = { 
                id: champ.id, 
                name: champ.name 
            };
        }
        
        championCache = champMap; 
        console.log("✅ 已建立英雄資料快取");
        return championCache;
    } catch (e) {
        console.error("❌ 無法取得 Data Dragon 資料:", e);
        return {};
    }
}

// --- 1. 英雄專精報表 (視覺化) ---
async function getMasteryReport(puuid, name = "玩家", tag = "") {
    const [masteryResp, champMap] = await Promise.all([
        fetch(`https://tw2.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${RiotLoLAPI}`),
        getChampionMap()
    ]);

    const masteryData = await masteryResp.json();
    if (!Array.isArray(masteryData)) throw new Error("無法取得專精資料，請檢查 API Key。");

    const canvas = createCanvas(900, 900);
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const top10 = masteryData.slice(0, 10);
    const drawCircle = async (index) => {
        const m = top10[index];
        if (!m) return;
        const info = champMap[m.championId];
        if (!info) return;

        const img = await loadImage(`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${info.id}.png`);
        let x, y, radius;
        if (index === 0) { x = centerX; y = centerY; radius = 220; }
        else {
            radius = 120 - (index * 10);
            const angle = ((index - 1) / 9) * Math.PI * 2 - Math.PI / 2;
            x = centerX + Math.cos(angle) * 325;
            y = centerY + Math.sin(angle) * 325;
        }
        ctx.save();
        ctx.shadowColor = index === 0 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(0, 153, 255, 0.4)';
        ctx.shadowBlur = index === 0 ? 30 : 20;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
        ctx.strokeStyle = index === 0 ? '#FFD700' : '#0099FF';
        ctx.lineWidth = index === 0 ? 15 : 6;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
    };

    for (let i = 1; i < top10.length; i++) await drawCircle(i);
    await drawCircle(0);

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'mastery.png' });
    const top10Text = top10.map((m, i) => {
        const cName = champMap[m.championId]?.name || "未知英雄";
        return `\`${(i + 1).toString().padStart(2, ' ')}.\` **${cName}**\u00A0\u00A0(Lv.${m.championLevel}, ${m.championPoints.toLocaleString()} pts)`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🔥 ${name}#${tag} 英雄專精回報`)
        .setImage('attachment://mastery.png')
        .addFields({ name: '排行清單', value: top10Text || "無資料" });

    return { embeds: [embed], files: [attachment] };
}

// --- 2. 牌位排名報表 ---
async function getRankReport(puuid, name, tag) {
    const rankResp = await fetch(`https://tw2.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RiotLoLAPI}`);
    const rankData = await rankResp.json();

    if (!Array.isArray(rankData)) {
        console.error("Riot API 錯誤:", rankData);
        throw new Error("無法取得牌位資料。");
    }

    let solo = { tier: 'UNRANKED', rank: '', pts: 0, win: 0, loss: 0 };
    let flex = { tier: 'UNRANKED', rank: '', pts: 0, win: 0, loss: 0 };

    rankData.forEach(r => {
        if (r.queueType === 'RANKED_SOLO_5x5') {
            solo = { tier: r.tier, rank: r.rank, pts: r.leaguePoints, win: r.wins, loss: r.losses };
        } else if (r.queueType === 'RANKED_FLEX_SR') {
            flex = { tier: r.tier, rank: r.rank, pts: r.leaguePoints, win: r.wins, loss: r.losses };
        }
    });

    const soloTierName = tierLabels[solo.tier] || solo.tier;
    const flexTierName = tierLabels[flex.tier] || flex.tier;

    const getRankImg = (tier) => `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`;
    const displayTier = solo.tier !== 'UNRANKED' ? solo.tier : (flex.tier !== 'UNRANKED' ? flex.tier : 'unranked');

    const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle(`🏆 ${name}#${tag} 牌位戰報`)
        //.setThumbnail(getRankImg(displayTier))
        .setImage(getRankImg(displayTier))
        .addFields(
            { 
                name: '🎮 單雙排積分', 
                value: solo.tier !== 'UNRANKED' 
                    ? `**${soloTierName} ${solo.rank}**\n分數: \`${solo.pts} LP\`\n勝負: \`${solo.win}W / ${solo.loss}L\` (${Math.round(solo.win/(solo.win+solo.loss)*100) || 0}%)`
                    : `**尚未分級 (Unranked)**`, 
                inline: false 
            },
            { 
                name: '👥 彈性積分', 
                value: flex.tier !== 'UNRANKED'
                    ? `**${flexTierName} ${flex.rank}**\n分數: \`${flex.pts} LP\`\n勝負: \`${flex.win}W / ${flex.loss}L\` (${Math.round(flex.win/(flex.win+flex.loss)*100) || 0}%)`
                    : `**尚未分級 (Unranked)**`, 
                inline: false 
            }
        )
        .setFooter({ text: '數據來源：Riot Games' })
        .setTimestamp();

    return { embeds: [embed] };
}

// --- 3. 近期戰績報表 ---
async function getHistoryReport(puuid, name, tag) {
    const matchIdsResp = await fetch(`https://sea.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5&api_key=${RiotLoLAPI}`);
    const matchIds = await matchIdsResp.json();

    if (!Array.isArray(matchIds) || matchIds.length === 0) throw new Error("找不到近期比賽紀錄。");

    const champMap = await getChampionMap();

    const matchesData = await Promise.all(
        matchIds.map(id => fetch(`https://sea.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RiotLoLAPI}`).then(r => r.json()))
    );

    const historyParsed = matchesData.map(match => {
        const p = match.info?.participants.find(part => part.puuid === puuid);
        if (!p) return null;

        // --- 1. 處理遊戲時長 (秒轉分:秒) ---
        const totalSeconds = match.info.gameDuration;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // --- 2. 模式判定 ---
        let modeName = modeLabels[match.info.gameMode] || match.info.gameMode;
        if (match.info.gameMode === "CLASSIC") {
            if (match.info.queueId === 420) modeName = "單雙排";
            else if (match.info.queueId === 440) modeName = "彈性積分";
            else if (match.info.queueId === 430 || match.info.queueId === 490) modeName = "一般對戰";
        }

        // --- 3. 計算額外數據：吃兵與參戰率 ---
        const totalCS = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
        const csPerMin = (totalCS / (totalSeconds / 60)).toFixed(1);
        
        // 找到同隊的所有玩家來計算團隊總擊殺
        const teamId = p.teamId;
        const teamKills = match.info.participants
            .filter(part => part.teamId === teamId)
            .reduce((sum, part) => sum + (part.kills || 0), 0);
        const kp = teamKills > 0 ? Math.round(((p.kills + p.assists) / teamKills) * 100) : 0;

        // --- 4. 特殊榮譽 (多連殺) ---
        let honor = "";
        if (p.pentaKills > 0) honor = " 🔥 **PENTA KILL**";
        else if (p.quadraKills > 0) honor = " ⚡ **Quadra Kill**";
        else if (p.tripleKills > 0) honor = " ✨ Triple Kill";

        // --- 5. 路線圖示 ---
        const laneIcon = laneIcons[p.teamPosition] || '🌀';

        return {
            win: p.win ? '⭕ 勝利' : '❌ 失敗',
            champion: champMap[p.championId]?.name || p.championName,
            kda: `${p.kills}/${p.deaths}/${p.assists}`,
            kdaRatio: ((p.kills + p.assists) / (p.deaths || 1)).toFixed(2),
            mode: modeName,
            lane: laneIcon,
            duration: durationString,
            cs: totalCS,
            csMin: csPerMin,
            kp: kp,
            honor: honor
        };
    }).filter(m => m !== null);

    // --- 6. 輸出排版：分兩行顯示資訊 ---
    const historyText = historyParsed.map((m, i) => 
        `\`${i + 1}.\` **${m.win}** | **${m.mode}** \`[${m.duration}]\`${m.honor}\n` +
        `\u00A0\u00A0\u00A0 \u00A0\u00A0\u00A0 ${m.lane} **${m.champion}** | KDA: \`${m.kda}\` (\`${m.kdaRatio}\`)\n` +
        `\u00A0\u00A0\u00A0 \u00A0\u00A0\u00A0 🌾 吃兵: \`${m.cs}\` (\`${m.csMin}\`) | ⚔️ 參戰: \`${m.kp}%\``
    ).join('\n\n');

    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle(`📜 ${name}#${tag} 近期戰績`)
        .setDescription(historyText || "無戰績資料")
        .setFooter({ text: '數據來源：Riot Match-V5' })
        .setTimestamp();

    return { embeds: [embed] };
}

module.exports = { getMasteryReport, getRankReport, getHistoryReport };