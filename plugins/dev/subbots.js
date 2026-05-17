const handler = async (m, { conn }) => {
    const groups = await conn.groupFetchAllParticipating().catch(() => ({}));
    const groupList = Object.values(groups).map(g => `📌 ${g.subject} (${g.id})`).join('\n');

    await conn.sendMessage(m.chat, {
        text: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 🤖 إحصائيات البوت
│
│ 👥 عدد المجموعات: ${Object.keys(groups).length}
╰•─•─•─•─•─•─•─•─•─•

${groupList || 'لا توجد مجموعات'}`,
    }, { quoted: m });
};

handler.command = ['بوتات-فرعي', 'subbots', 'المجموعات'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
