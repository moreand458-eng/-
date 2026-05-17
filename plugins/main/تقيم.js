import config from '../../config.js';

const handler = async (m, { conn }) => {
    await conn.sendMessage(m.chat, {
        text: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 🌟 تقييم البوت
│
│ شكراً على تقييمك! 🙏
│ رأيك يهمنا كثيراً
│
│ ⭐⭐⭐⭐⭐
│
│ 📞 للتواصل: ${config.ownerLink}
│ 💬 مجموعة الدعم: ${config.supportGroup}
╰•─•─•─•─•─•─•─•─•─•`,
    }, { quoted: m });
};

handler.command = ['تقيم', 'تقييم', 'rate'];
handler.tags = ['main'];
export default handler;
