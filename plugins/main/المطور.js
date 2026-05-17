import config from '../../config.js';

const handler = async (m, { conn }) => {
    await conn.sendMessage(m.chat, {
        image: { url: config.botImage },
        caption: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 👨‍💻 معلومات المطور
│
│ 🌟 الاسم: ${config.botOwner}
│ 📞 الرقم: +${config.ownerNumber[0]}
│ 💬 الواتساب: ${config.ownerLink}
│ 📢 القناة: ${config.channelLink}
│ 💬 مجموعة الدعم: ${config.supportGroup}
│
│ 🤖 بوت: ${config.botName}
│ 🔒 جميع الحقوق محفوظة
╰•─•─•─•─•─•─•─•─•─•`,
        buttons: [
            {
                buttonId: 'contact_dev',
                buttonText: { displayText: '📞 تواصل مع المطور' },
                type: 1
            }
        ]
    }, { quoted: m });
};

handler.command = ['المطور', 'مطور', 'owner', 'dev'];
handler.tags = ['main'];
export default handler;
