import { getGroup, saveGroup, getUser, saveUser, isBanned } from './database.js';
import config from '../config.js';

const floodMap = new Map();

const MALICIOUS_LINK_PATTERNS = [
    /bit\.ly\/[a-zA-Z0-9]+/i,
    /tinyurl\.com\/[a-zA-Z0-9]+/i,
    /t\.me\/[a-zA-Z0-9_+]+/i,
    /discord\.gg\/[a-zA-Z0-9]+/i,
    /chat\.whatsapp\.com\/[a-zA-Z0-9]+/i,
    /wa\.me\/[a-zA-Z0-9]+/i,
    /telegra\.ph\/[a-zA-Z0-9\-]+/i,
    /cutt\.ly\/[a-zA-Z0-9]+/i,
    /shorte\.st\/[a-zA-Z0-9]+/i,
    /adf\.ly\/[a-zA-Z0-9]+/i,
    /ouo\.io\/[a-zA-Z0-9]+/i,
    /rb\.gy\/[a-zA-Z0-9]+/i,
    /is\.gd\/[a-zA-Z0-9]+/i,
    /v\.gd\/[a-zA-Z0-9]+/i,
    /ow\.ly\/[a-zA-Z0-9]+/i,
];

const SPAM_WORDS = [
    'هلا بالكل', 'تعالو', 'مجانا', 'ربح', 'فرصة عمل', 'اربح', 'هاك', 'سرقة'
];

const MALICIOUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.vbs', '.ps1', '.sh', '.msi', '.apk'];

function checkFlood(sender) {
    const now = Date.now();
    if (!floodMap.has(sender)) {
        floodMap.set(sender, { count: 1, first: now });
        return false;
    }
    const data = floodMap.get(sender);
    if (now - data.first > config.floodTime) {
        floodMap.set(sender, { count: 1, first: now });
        return false;
    }
    data.count++;
    if (data.count >= config.floodLimit) {
        floodMap.set(sender, { count: 0, first: now });
        return true;
    }
    return false;
}

function hasLink(text) {
    if (!text) return false;
    return MALICIOUS_LINK_PATTERNS.some(p => p.test(text));
}

function hasSpam(text) {
    if (!text) return false;
    return SPAM_WORDS.some(w => text.includes(w));
}

function hasMaliciousFile(filename) {
    if (!filename) return false;
    return MALICIOUS_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext));
}

async function runSecurity(m, conn) {
    const sender = m.sender;
    const groupJid = m.chat;
    const isGroup = groupJid.endsWith('@g.us');

    if (isBanned(sender)) {
        return { block: true, reason: 'محظور' };
    }

    if (!isGroup) return { block: false };

    const grp = getGroup(groupJid);
    const text = m.text || m.body || '';
    const metadata = await conn.groupMetadata(groupJid).catch(() => null);
    const participants = metadata?.participants || [];
    const isAdmin = participants.find(p => p.id === sender)?.admin != null;
    const isBotAdmin = participants.find(p => p.id === conn.user.id)?.admin != null;

    if (isAdmin) return { block: false };

    if (grp.antiLink && hasLink(text)) {
        if (isBotAdmin) {
            await conn.sendMessage(groupJid, {
                text: `⚠️ تحذير @${sender.split('@')[0]}!\nتم حذف الرابط الخبيث 🔗❌\nانتبه أي رابط تاني هيتم طردك`,
                mentions: [sender]
            });
            await conn.sendMessage(groupJid, { delete: m.key });
        }
        return { block: true, reason: 'رابط خبيث' };
    }

    if (grp.antiSpam && hasSpam(text)) {
        if (isBotAdmin) {
            await conn.sendMessage(groupJid, { delete: m.key });
        }
        return { block: true, reason: 'سبام' };
    }

    if (config.antiFlood && checkFlood(sender)) {
        if (isBotAdmin) {
            await conn.sendMessage(groupJid, {
                text: `⚠️ @${sender.split('@')[0]} بطيء شوية يا صديقي! 🚫 متبعتش رسايل كتير`,
                mentions: [sender]
            });
        }
        return { block: true, reason: 'فلود' };
    }

    if (m.message?.documentMessage) {
        const filename = m.message.documentMessage.fileName || '';
        if (hasMaliciousFile(filename)) {
            if (isBotAdmin) {
                await conn.sendMessage(groupJid, { delete: m.key });
                await conn.sendMessage(groupJid, {
                    text: `⚠️ @${sender.split('@')[0]} تم حذف ملف خطير! ❌`,
                    mentions: [sender]
                });
            }
            return { block: true, reason: 'ملف خبيث' };
        }
    }

    return { block: false };
}

export { runSecurity, hasLink, hasSpam, hasMaliciousFile, checkFlood };
