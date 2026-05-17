import { startBot } from './lib/connection.js';
import cron from 'node-cron';

console.log('╔═════════════════════════════════════════╗');
console.log('║         𝙴𝚂𝙲𝙰𝙽𝙾𝚁-𝙱𝙾𝚃  V3 بدء التشغيل      ║');
console.log('║    V3 - قسم المطورين فقط                ║');
console.log('║      جميع الحقوق محفوظة لـ 𝑬𝒔𝒄𝒂𝒏𝒐      ║');
console.log('╚═════════════════════════════════════════╝\n');

process.on('unhandledRejection', (err) => {
    console.error('[UNHANDLED]', err?.message || err);
});
process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT]', err?.message || err);
});

startBot().catch(console.error);

cron.schedule('0 5 * * *', async () => {
    console.log('[CRON] تذكير الصلاة - الفجر');
});
cron.schedule('0 12 * * 5', async () => {
    console.log('[CRON] تذكير جمعة مباركة');
});
