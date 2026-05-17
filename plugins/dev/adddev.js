import { addDev, isDev } from '../../lib/database.js';

const handler = async (m, { conn }) => {
    const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let target = mentioned[0];

    if (!target && m.args[0]) {
        const num = m.args[0].replace(/[^0-9]/g, '');
        if (num) target = `${num}@s.whatsapp.net`;
    }

    if (!target) {
        await conn.sendMessage(m.chat, {
            text: `❌ طريقة الاستخدام:\n.اضافه-مطور @شخص\nأو\n.اضافه-مطور رقم`,
        }, { quoted: m });
        return;
    }

    const num = target.split('@')[0];
    if (isDev(target)) {
        await conn.sendMessage(m.chat, { text: `ℹ️ @${num} هو مطور أصلاً`, mentions: [target] }, { quoted: m });
        return;
    }

    addDev(target);
    await conn.sendMessage(m.chat, {
        text: `✅ تم إضافة @${num} كمطور بنجاح! 👨‍💻`,
        mentions: [target]
    }, { quoted: m });
};

handler.command = ['اضافه-مطور', 'adddev', 'إضافة-مطور'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
