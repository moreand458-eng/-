const handler = async (m, { conn }) => {
    if (!m.q) {
        await conn.sendMessage(m.chat, { text: '❌ اكتب الرسالة بعد الأمر\n.اذاعه-فرعي رسالتك هنا' }, { quoted: m });
        return;
    }

    const groups = await conn.groupFetchAllParticipating().catch(() => ({}));
    const groupIds = Object.keys(groups);

    if (!groupIds.length) {
        await conn.sendMessage(m.chat, { text: 'ℹ️ البوت غير موجود في أي مجموعة' }, { quoted: m });
        return;
    }

    await conn.sendMessage(m.chat, { text: `📡 جاري الإذاعة لـ ${groupIds.length} مجموعة...` }, { quoted: m });

    let success = 0, failed = 0;
    for (const gid of groupIds) {
        try {
            await conn.sendMessage(gid, {
                text: `📢 إذاعة من المطور\n\n${m.q}\n\n─────────────\n🤖 ${conn.user?.name || 'ESCANOR BOT'}`,
            });
            success++;
            await new Promise(r => setTimeout(r, 1000));
        } catch { failed++; }
    }

    await conn.sendMessage(m.chat, {
        text: `✅ انتهت الإذاعة\n✔️ نجحت: ${success}\n❌ فشلت: ${failed}`,
    }, { quoted: m });
};

handler.command = ['اذاعه-فرعي', 'إذاعه-فرعي', 'broadcast'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
