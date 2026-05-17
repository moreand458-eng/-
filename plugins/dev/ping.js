import { getUptime } from '../../lib/utils.js';

const handler = async (m, { conn }) => {
    const start = Date.now();
    await conn.sendMessage(m.chat, { react: { text: '🏓', key: m.key } });
    const latency = Date.now() - start;
    await conn.sendMessage(m.chat, {
        text: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 🏓 بنج - اختبار السرعة
│
│ ⚡ السرعة: ${latency}ms
│ ⏱️ وقت التشغيل: ${getUptime()}
│ 🟢 البوت يعمل بشكل ممتاز
╰•─•─•─•─•─•─•─•─•─•`,
    }, { quoted: m });
};

handler.command = ['بنج', 'ping', 'سرعه'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
