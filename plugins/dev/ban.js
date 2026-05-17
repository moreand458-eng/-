import { banUser, unbanUser, isBanned } from '../../lib/database.js';

const handler = async (m, { conn }) => {
    const subCmd = m.args[0];
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let target = mentioned[0];

    if (!target && m.args[1]) {
        const num = m.args[1].replace(/[^0-9]/g, '');
        if (num) target = `${num}@s.whatsapp.net`;
    }

    if (subCmd === 'فك' || subCmd === 'unban') {
        if (!target) {
            await conn.sendMessage(m.chat, { text: '❌ حدد الشخص المراد فك حظره' }, { quoted: m });
            return;
        }
        unbanUser(target);
        await conn.sendMessage(m.chat, {
            text: `✅ تم فك حظر @${target.split('@')[0]} بنجاح!`,
            mentions: [target]
        }, { quoted: m });
        return;
    }

    if (!target) {
        await conn.sendMessage(m.chat, { text: `❌ طريقة الاستخدام:\n.حظر @شخص\n.حظر فك @شخص` }, { quoted: m });
        return;
    }

    if (isBanned(target)) {
        await conn.sendMessage(m.chat, {
            text: `ℹ️ @${target.split('@')[0]} محظور أصلاً`,
            mentions: [target]
        }, { quoted: m });
        return;
    }

    banUser(target);
    await conn.sendMessage(m.chat, {
        text: `🚫 تم حظر @${target.split('@')[0]} بنجاح!\nلن يستطيع استخدام البوت بعد الآن`,
        mentions: [target]
    }, { quoted: m });
};

handler.command = ['حظر', 'ban', 'فك-حظر', 'unban'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
