import config from '../../config.js';
import { getArabicDate } from '../../lib/utils.js';

const handler = async (m, { conn }) => {
    const { week, date, time } = getArabicDate();
    await conn.sendMessage(m.chat, {
        text: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 🤖 ${config.botName}
│
│ السلام عليكم ورحمة الله! 👋
│ أنا بوت واتساب متطور
│ من تطوير ${config.botOwner}
│
│ 📅 اليوم: ${week}
│ 🗓️ التاريخ: ${date}
│ ⏰ الوقت: ${time}
│
│ اكتب .قائمة للمعلومات
╰•─•─•─•─•─•─•─•─•─•`,
    }, { quoted: m });
};

handler.command = ['start', 'بداية', 'هاي', 'سلام', 'مرحبا', 'هلو', 'hi', 'hello'];
handler.tags = ['main'];
export default handler;
