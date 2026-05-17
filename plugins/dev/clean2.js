const handler = async (m, { conn }) => {
    if (!m.isGroup) {
        await conn.sendMessage(m.chat, { text: '❌ هذا الأمر يعمل في المجموعات فقط' }, { quoted: m });
        return;
    }
    try {
        const metadata = await conn.groupMetadata(m.chat);
        const participants = metadata.participants || [];
        const isBotAdmin = participants.find(p => p.id === conn.user?.id)?.admin != null;
        if (!isBotAdmin) {
            await conn.sendMessage(m.chat, { text: '❌ البوت يحتاج صلاحيات أدمن لتنفيذ هذا الأمر' }, { quoted: m });
            return;
        }
        await conn.sendMessage(m.chat, { text: '🧹 جاري تنظيف المجموعة...\n⚠️ ملاحظة: هذا الأمر يتطلب صلاحيات إضافية من واتساب' }, { quoted: m });
    } catch (e) {
        await conn.sendMessage(m.chat, { text: `❌ خطأ: ${e.message}` }, { quoted: m });
    }
};

handler.command = ['تنضيف2', 'clean2', 'تنظيف-جروب'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
