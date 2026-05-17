import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '../../temp');

const handler = async (m, { conn }) => {
    let count = 0;
    if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const f of files) {
            try {
                fs.unlinkSync(path.join(tempDir, f));
                count++;
            } catch {}
        }
    }
    await conn.sendMessage(m.chat, {
        text: `✅ تم التنظيف!\n🗑️ تم حذف ${count} ملف مؤقت`,
    }, { quoted: m });
};

handler.command = ['تنظيف', 'clean', 'تنضيف'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
