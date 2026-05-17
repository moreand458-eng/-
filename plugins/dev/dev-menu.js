import { buildDevMenu } from '../../lib/menu-builder.js';
import { isDev } from '../../lib/database.js';

const handler = async (m, { conn }) => {
    if (!isDev(m.sender)) {
        await conn.sendMessage(m.chat, {
            text: '❌ هذا الأمر للمطورين فقط!'
        }, { quoted: m });
        return;
    }
    const devMsg = buildDevMenu(true);
    await conn.relayMessage(m.chat, devMsg, {});
};

handler.command = ['قسم-مطور', 'dev-menu', 'مطورين', 'devmenu'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
