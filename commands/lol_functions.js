const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const { RiotLoLAPI } = require('../config.json');

// --- 函式 A：英雄專精報表 ---
async function getMasteryReport(puuid, name, tag) {
    const [masteryResp, ddResp] = await Promise.all([
        fetch(`https://tw2.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${RiotLoLAPI}`),
        fetch(`https://ddragon.leagueoflegends.com/cdn/14.24.1/data/zh_TW/champion.json`)
    ]);

    const masteryData = await masteryResp.json();
    const ddData = await ddResp.json();

    if (!Array.isArray(masteryData)) throw new Error("無法取得專精資料，請檢查 API Key。");

    const champMap = {};
    for (let key in ddData.data) {
        champMap[ddData.data[key].key] = { id: ddData.data[key].id, name: ddData.data[key].name };
    }

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
            x = centerX + Math.cos(angle) * 275;
            y = centerY + Math.sin(angle) * 275;
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
    const top10Text = top10.map((m, i) => `\`${(i + 1).toString().padStart(2, ' ')}.\` **${champMap[m.championId]?.name}**\u00A0\u00A0(Lv.${m.championLevel}, ${m.championPoints.toLocaleString()} pts)`).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🔥 ${name}#${tag} 英雄專精回報`)
        .setImage('attachment://mastery.png')
        .addFields({ name: '排行清單', value: top10Text });

    return { embeds: [embed], files: [attachment] };
}

async function getRankReport(puuid, name, tag) {
    // 直接使用 PUUID 查詢牌位，減少一次 API 請求
    const rankResp = await fetch(`https://tw2.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RiotLoLAPI}`);
    const rankData = await rankResp.json();

    // 檢查資料是否為陣列
    if (!Array.isArray(rankData)) {
        console.error("Riot API 牌位錯誤回覆:", rankData);
        throw new Error("無法取得牌位資料，請確認 API Key 是否有效。");
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

    // 牌位圖示 CDN
    const getRankImg = (tier) => `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`;

    // 決定展示的主圖示
    const displayTier = solo.tier !== 'UNRANKED' ? solo.tier : (flex.tier !== 'UNRANKED' ? flex.tier : 'unranked');

    const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle(`🏆 ${name}#${tag} 牌位戰報`)
        .setThumbnail(getRankImg(displayTier))
        .addFields(
            { 
                name: '🎮 單雙排積分', 
                value: solo.tier !== 'UNRANKED' 
                    ? `**${solo.tier} ${solo.rank}**\n分數: \`${solo.pts} LP\`\n勝負: \`${solo.win}W / ${solo.loss}L\` (勝率: ${Math.round(solo.win/(solo.win+solo.loss)*100) || 0}%)`
                    : `**尚未分級 (Unranked)**`, 
                inline: false 
            },
            { 
                name: '👥 彈性積分', 
                value: flex.tier !== 'UNRANKED'
                    ? `**${flex.tier} ${flex.rank}**\n分數: \`${flex.pts} LP\`\n勝負: \`${flex.win}W / ${flex.loss}L\` (勝率: ${Math.round(flex.win/(flex.win+flex.loss)*100) || 0}%)`
                    : `**尚未分級 (Unranked)**`, 
                inline: false 
            }
        )
        .setFooter({ text: '數據來源：Riot Games (PUUID Direct)' })
        .setTimestamp();

    return { embeds: [embed] };
}

async function getHistoryReport(puuid, name, tag) {
    // 1. 取得最近 5 場比賽 ID (注意：戰績 API 使用 asia 節點)
    const matchIdsResp = await fetch(`https://sea.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=5&api_key=${RiotLoLAPI}`);
    const matchIds = await matchIdsResp.json();

    if (!Array.isArray(matchIds) || matchIds.length === 0) {
        throw new Error("找不到近期比賽紀錄。");
    }

    // 2. 取得英雄資料 (用於對照中文名)
    const ddResp = await fetch(`https://ddragon.leagueoflegends.com/cdn/14.24.1/data/zh_TW/champion.json`);
    const ddData = await ddResp.json();
    const champMap = {};
    for (let key in ddData.data) {
        champMap[ddData.data[key].key] = ddData.data[key].name;
    }

    // 3. 抓取每場比賽詳細資料
    const matchesData = await Promise.all(
        matchIds.map(async (id) => {
            const resp = await fetch(`https://sea.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RiotLoLAPI}`);
            return resp.json();
        })
    );

    // 4. 解析每場比賽中該玩家的表現
    const historyParsed = matchesData.map(match => {
        const p = match.info.participants.find(part => part.puuid === puuid);
        if (!p) return null;

        return {
            win: p.win ? '✅ 勝' : '❌ 敗',
            champion: champMap[p.championId] || p.championName,
            kda: `${p.kills}/${p.deaths}/${p.assists}`,
            kdaRatio: ((p.kills + p.assists) / (p.deaths || 1)).toFixed(2),
            mode: match.info.gameMode === 'CLASSIC' ? '積分/一般' : 'ARAM/其他'
        };
    }).filter(m => m !== null);

    // 5. 建立 Embed
    const historyText = historyParsed.map((m, i) => 
        `\`${i+1}.\` **${m.win}** | **${m.champion}**\n\u00A0\u00A0\u00A0 ⚔️ KDA: \`${m.kda}\` (${m.kdaRatio}) | ${m.mode}`
    ).join('\n\n');

    const embed = new EmbedBuilder()
        .setColor('#9b59b6') // 紫色
        .setTitle(`📜 ${name}#${tag} 近期 5 場戰績回報`)
        .setDescription(historyText)
        .setFooter({ text: '數據來源：Riot Match-V5 (Asia)' })
        .setTimestamp();

    return { embeds: [embed] };
}

// 最後記得更新 module.exports
module.exports = { getMasteryReport, getRankReport, getHistoryReport };