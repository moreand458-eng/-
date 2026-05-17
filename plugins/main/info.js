import config from '../../config.js';
import { getUptime, getArabicDate } from '../../lib/utils.js';
import { getDB } from '../../lib/database.js';

const handler = async (m, { conn }) => {
    const { week, date, time } = getArabicDate();
    const db = getDB();
    const totalUsers = Object.keys(db.users || {}).length;
    const uptime = getUptime();
    await conn.sendMessage(m.chat, {
        image: { url: config.botImage },
        caption: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 🤖 معلومات البوت
│
│ 🌙 الاسم: ${config.botName}
│ 👨‍💻 المطور: ${config.botOwner}
│ ⚡ الإصدار: V3.0.0
│
│ 📅 اليوم: ${week}
│ 🗓️ التاريخ: ${date}
│ ⏰ الوقت: ${time}
│ ⏱️ وقت التشغيل: ${uptime}
│ 👥 المستخدمين: ${totalUsers}
│
│ 📞 المطور: wa.me/${config.ownerNumber[0]}
│ 📢 القناة: ${config.channelLink}
│ 💬 مجموعة الدعم: ${config.supportGroup}
╰•─•─•─•─•─•─•─•─•─•`,
    }, { quoted: m });
};

handler.command = ['info', 'معلومات', 'بوت', 'about'];
handler.tags = ['main'];
export default handler;
