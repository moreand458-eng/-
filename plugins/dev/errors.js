import { getErrors, getDB, saveDB } from '../../lib/database.js';

const handler = async (m, { conn }) => {
    const errors = getErrors();
    if (!errors.length) {
        await conn.sendMessage(m.chat, {
            text: '✅ لا توجد أخطاء مسجلة! البوت يعمل بشكل ممتاز 🎉',
        }, { quoted: m });
        return;
    }

    if (m.args[0] === 'مسح' || m.args[0] === 'clear') {
        const db = getDB();
        db.errors = [];
        saveDB(db);
        await conn.sendMessage(m.chat, { text: '✅ تم مسح سجل الأخطاء!' }, { quoted: m });
        return;
    }

    const last10 = errors.slice(-10).reverse();
    const text = last10.map((e, i) =>
        `${i + 1}. [${e.time}]\n   ${e.error.slice(0, 150)}`
    ).join('\n\n');

    await conn.sendMessage(m.chat, {
        text: `╭•─•─•─•─•─•─•─•─•─•┈●
│ ❌ آخر ${last10.length} خطأ
╰•─•─•─•─•─•─•─•─•─•

${text}

💡 اكتب .errors مسح لحذف السجل`,
    }, { quoted: m });
};

handler.command = ['errors', 'اخطاء', 'سجل-الاخطاء'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
