const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { valApiKey } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('val')
        .setDescription('特戰英豪綜合查詢系統')
        .setNameLocalization('zh-TW', '特戰英豪')
        .addStringOption(opt => 
            opt.setName('name')
               .setNameLocalization('zh-TW', '玩家名稱')
               .setDescription('輸入遊戲內的名稱')
               .setRequired(true)
        )
        .addStringOption(opt => 
            opt.setName('tag')
               .setNameLocalization('zh-TW', '標籤')
               .setDescription('輸入 # 後的標籤 (不含 #)')
               .setRequired(true)
        ),

    async execute(interaction) {
        // 如果是按鈕觸發（理論上 val.js 現在只負責 Slash 指令的初次回應）
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();
        const name = interaction.options.getString('name').trim();
        const tag = interaction.options.getString('tag').replace('#', '').trim();

        try {
            // 1. 取得帳號資料 (預檢以獲得正確地區)
            const accResp = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, {
                headers: { 'Authorization': valApiKey }
            });
            
            const acc = accResp.data.data;

            if (!acc) {
                return await interaction.editReply(`❌ 找不到玩家：**${name}#${tag}**`);
            }

            // 2. 建立基本資訊 Embed (首頁)
            const mainEmbed = new EmbedBuilder()
                .setColor('#FF4655')
                .setTitle(`⚔️ 特戰英豪玩家：【${acc.name}#${acc.tag}】`)
                .setThumbnail(acc.card.small)
                .setImage(acc.card.wide) // 顯示玩家精美大圖背景
                .addFields(
                    { name: '📊 等級', value: `\`${acc.account_level}\``, inline: true },
                    { name: '🌍 地區', value: `\`${acc.region.toUpperCase()}\``, inline: true }
                )
                .setDescription(`**已查詢到玩家【${acc.name}#${acc.tag}】的檔案資料**`)
                .setFooter({ text: '點擊下方按鈕進行進階查詢' });

            // 3. 建立按鈕 (格式必須與 interactionCreate.js 解析邏輯一致: action|name|tag|region)
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`valrank|${acc.name}|${acc.tag}|${acc.region}`)
                    .setLabel('排位排名')
                    .setEmoji('🏆')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`valhistory|${acc.name}|${acc.tag}|${acc.region}`)
                    .setLabel('近期戰績')
                    .setEmoji('📜')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({ embeds: [mainEmbed], components: [buttons] });

        } catch (e) {
            console.error('Valorant Slash Command Error:', e);
            await interaction.editReply('❌ 進入系統失敗，帳號可能不存在、為隱私帳號或 API 故障。');
        }
    }
};