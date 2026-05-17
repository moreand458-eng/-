import config from '../config.js';

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor((ms % 3600000) / 60000);
    let s = Math.floor((ms % 60000) / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

function getUptime() {
    return clockString(process.uptime() * 1000);
}

function getArabicDate() {
    const now = new Date();
    const week = now.toLocaleDateString('ar-EG', { weekday: 'long' });
    const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    return { week, date, time };
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRankName(level) {
    return config.ranks[level]?.name || 'جندي';
}

function getLevelFromXP(xp) {
    let level = 0;
    for (let i = config.ranks.length - 1; i >= 0; i--) {
        if (xp >= config.ranks[i].xp) { level = i; break; }
    }
    return level;
}

function getNextLevelXP(level) {
    return config.ranks[level + 1]?.xp || config.ranks[config.ranks.length - 1].xp;
}

function getSenderNumber(jid) {
    return jid.split('@')[0];
}

function makeTag(jid) {
    return `@${getSenderNumber(jid)}`;
}

function isGroup(jid) {
    return jid.endsWith('@g.us');
}

function isPrivate(jid) {
    return jid.endsWith('@s.whatsapp.net');
}

function styleBorder(text, title = '') {
    const lines = text.split('\n');
    const maxLen = Math.max(...lines.map(l => l.length), title.length + 4);
    const top = `╭${'─'.repeat(maxLen + 2)}╮`;
    const bot = `╰${'─'.repeat(maxLen + 2)}╯`;
    const mid = lines.map(l => `│ ${l.padEnd(maxLen)} │`).join('\n');
    return `${top}\n${title ? `│ ${title.padEnd(maxLen)} │\n│${'─'.repeat(maxLen + 2)}│\n` : ''}${mid}\n${bot}`;
}

const LOADING_TEXT = '⏳ جاري التنفيذ...';

async function react(conn, m, emoji = '⏳') {
    try {
        await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    } catch {}
}

export {
    clockString, getUptime, getArabicDate, formatNumber, randomInt,
    randomItem, sleep, getRankName, getLevelFromXP, getNextLevelXP,
    getSenderNumber, makeTag, isGroup, isPrivate, styleBorder,
    LOADING_TEXT, react
};
