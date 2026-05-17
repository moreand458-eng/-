import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCommandDisabled, toggleCommand, deleteCommand } from '../../lib/database.js';
import { loadPlugins } from '../../lib/handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsDir = path.join(__dirname, '../../plugins');

const handler = async (m, { conn }) => {
    const subCmd = m.args[0];

    if (subCmd === 'امسح' || subCmd === 'مسح') {
        const cmdName = m.args[1];
        if (!cmdName) {
            await conn.sendMessage(m.chat, { text: '❌ حدد اسم الأمر المراد حذفه\n.اضافه-ملف امسح [اسم-الامر]' }, { quoted: m });
            return;
        }
        deleteCommand(cmdName);
        await conn.sendMessage(m.chat, { text: `✅ تم حذف الأمر "${cmdName}" بنجاح!` }, { quoted: m });
        return;
    }

    if (subCmd === 'تعطيل' || subCmd === 'تشغيل') {
        const cmdName = m.args[1];
        if (!cmdName) {
            await conn.sendMessage(m.chat, { text: '❌ حدد اسم الأمر\n.اضافه-ملف تعطيل [اسم-الامر]' }, { quoted: m });
            return;
        }
        const result = toggleCommand(cmdName);
        await conn.sendMessage(m.chat, {
            text: result === 'disabled' ? `⛔ تم تعطيل الأمر "${cmdName}"` : `✅ تم تشغيل الأمر "${cmdName}"`,
        }, { quoted: m });
        return;
    }

    if (!m.q || subCmd === 'مساعده') {
        await conn.sendMessage(m.chat, {
            text: `╭•─•─•─•─•─•─•─•─•─•┈●
│ 📁 إضافة ملف أمر
│
│ طرق الاستخدام:
│ .اضافه-ملف [قسم] | [امر] | [وصف]
│   مثال: .اضافه-ملف games | لعبه2 | لعبة جديدة
│
│ .اضافه-ملف امسح [اسم-الامر]
│   لحذف أمر
│
│ .اضافه-ملف تعطيل [اسم-الامر]
│   لتعطيل/تشغيل أمر
╰•─•─•─•─•─•─•─•─•─•`,
        }, { quoted: m });
        return;
    }

    const parts = m.q.split('|').map(p => p.trim());
    if (parts.length < 2) {
        await conn.sendMessage(m.chat, { text: '❌ يجب تحديد: قسم | اسم-الامر | وصف' }, { quoted: m });
        return;
    }

    const [section, cmdName, desc = 'أمر جديد'] = parts;
    const sectionDir = path.join(pluginsDir, section);

    if (!fs.existsSync(sectionDir)) {
        fs.mkdirSync(sectionDir, { recursive: true });
    }

    const fileName = `${cmdName}.js`;
    const filePath = path.join(sectionDir, fileName);

    if (fs.existsSync(filePath)) {
        await conn.sendMessage(m.chat, { text: `⚠️ الأمر "${cmdName}" موجود أصلاً في قسم "${section}"` }, { quoted: m });
        return;
    }

    const template = `// ${desc}\n// تم إنشاؤه تلقائياً بواسطة ESCANOR BOT\n\nconst handler = async (m, { conn }) => {\n    await conn.sendMessage(m.chat, {\n        text: '⚙️ أمر: ${cmdName}\\n${desc}\\n\\nقيد التطوير... 🔧',\n    }, { quoted: m });\n};\n\nhandler.command = ['${cmdName}'];\nhandler.tags = ['${section}'];\nhandler.help = ['${cmdName}'];\nexport default handler;\n`;

    fs.writeFileSync(filePath, template, 'utf-8');

    await loadPlugins();

    await conn.sendMessage(m.chat, {
        text: `✅ تم إنشاء الأمر "${cmdName}" في قسم "${section}" بنجاح!\n📁 المسار: plugins/${section}/${fileName}`,
    }, { quoted: m });
};

handler.command = ['اضافه-ملف', 'إضافة-ملف', 'addfile'];
handler.tags = ['dev'];
handler.devOnly = true;
export default handler;
