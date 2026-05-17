import os from 'os';

const handler = async (m, { conn }) => {
    const mem = process.memoryUsage();
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const toMB = (b) => (b / 1024 / 1024).toFixed(2);

    await conn.sendMessage(m.chat, {
        text: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 💾 إحصائيات النظام
│
│ 🧠 RAM:
│   📦 الكلي: ${toMB(total)} MB
│   ✅ المستخدم: ${toMB(used)} MB
│   🆓 المتاح: ${toMB(free)} MB
│
│ 🤖 البوت (Heap):
│   📊 المستخدم: ${toMB(mem.heapUsed)} MB
│   📦 الكلي: ${toMB(mem.heapTotal)} MB
│   🔧 RSS: ${toMB(mem.rss)} MB
│
│ 💻 المعالج: ${os.cpus()[0]?.model || 'غير معروف'}
│ 🖥️ النظام: ${os.type()} ${os.arch()}
│ ⚙️ Node.js: ${process.version}
╰•─•─•─•─•─•─•─•─•─•`,
    }, { quoted: m });
};

handler.command = ['رام', 'ram', 'ذاكره'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
