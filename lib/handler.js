import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUser, addXP, isDev, isBanned, isCommandDisabled, addError, getDB } from './database.js';
import { runSecurity } from './security.js';
import config from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsDir = path.join(__dirname, '../plugins');

let plugins = {};
let pluginCount = 0;

async function loadPlugins() {
    plugins = {};
    pluginCount = 0;
    const loadDir = async (dir) => {
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
        catch { return; }
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await loadDir(fullPath);
            } else if (entry.name.endsWith('.js') && !entry.name.startsWith('_')) {
                try {
                    // cache-busting بيخلي ملفات الـ plugins تتحدث ديناميكياً
                    const fileUrl = `file://${fullPath.replace(/\\/g, '/')}?t=${Date.now()}`;
                    const mod = await import(fileUrl);
                    const handler = mod.default;
                    if (handler && handler.command) {
                        const cmds = Array.isArray(handler.command) ? handler.command : [handler.command];
                        for (const cmd of cmds) {
                            plugins[cmd.toLowerCase()] = handler;
                        }
                        pluginCount++;
                    }
                } catch (e) {
                    console.error(`[PLUGIN ERROR] ${entry.name}: ${e.message}`);
                }
            }
        }
    };
    await loadDir(pluginsDir);
    console.log(`[ESCANOR] ✅ تم تحميل ${pluginCount} plugin (${Object.keys(plugins).length} أمر)`);
}

function parseMessage(m) {
    try {
        const msg = m.message;
        if (!msg) return '';

        // Interactive response (زرار أو منسدلة)
        const interactiveParams = msg?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
        if (interactiveParams) {
            try {
                const parsed = JSON.parse(interactiveParams);
                if (parsed.id) return parsed.id;
            } catch {}
        }

        return (
            msg.conversation ||
            msg.extendedTextMessage?.text ||
            msg.imageMessage?.caption ||
            msg.videoMessage?.caption ||
            msg.documentMessage?.caption ||
            msg.buttonsResponseMessage?.selectedButtonId ||
            msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
            msg.templateButtonReplyMessage?.selectedId ||
            ''
        );
    } catch { return ''; }
}

function getCommand(body) {
    if (!body || !body.startsWith(config.prefix)) return null;
    const cmd = body.slice(config.prefix.length).trim().split(/\s+/)[0];
    return cmd.toLowerCase();
}

function getArgs(body) {
    const parts = body.trim().split(/\s+/);
    return parts.slice(1);
}

async function safeReact(conn, m, emoji) {
    try {
        await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    } catch {}
}

async function handleMessage(conn, m) {
    try {
        m.text = parseMessage(m);
        m.body = m.text;
        m.sender = m.key.participant || m.key.remoteJid;
        m.chat = m.key.remoteJid;
        m.isGroup = m.chat?.endsWith('@g.us') || false;
        m.isDev = isDev(m.sender);
        m.pushName = m.pushName || m.sender?.split('@')[0] || '';

        // تجاهل رسائل البوت نفسه
        if (!m.sender || m.key?.fromMe) return;
        if (!m.chat) return;

        // فحص الحظر
        if (isBanned(m.sender)) return;

        // فحص الأمان (سبام، لينكس، ملفات خبيثة)
        const secResult = await runSecurity(m, conn);
        if (secResult.block) return;

        const body = m.text;
        if (!body) {
            if (m.isGroup) addXP(m.sender, 1);
            return;
        }

        const cmd = getCommand(body);
        if (!cmd) {
            if (m.isGroup) addXP(m.sender, 1);
            return;
        }

        // فحص تعطيل الأمر
        if (isCommandDisabled(cmd)) {
            await conn.sendMessage(m.chat, {
                text: `❌ الأمر *.${cmd}* معطل حالياً`,
            }, { quoted: m });
            return;
        }

        const handler = plugins[cmd];
        if (!handler) return;

        // فحص صلاحية المطور
        if (handler.devOnly && !m.isDev) return;

        // فحص صلاحية المجموعة
        if (handler.groupOnly && !m.isGroup) {
            await conn.sendMessage(m.chat, { text: '❌ هذا الأمر للمجموعات فقط' }, { quoted: m });
            return;
        }

        if (handler.privateOnly && m.isGroup) {
            await conn.sendMessage(m.chat, { text: '❌ هذا الأمر للمحادثات الخاصة فقط' }, { quoted: m });
            return;
        }

        m.args = getArgs(body);
        m.q = m.args.join(' ');
        m.prefix = config.prefix;
        m.command = cmd;

        const user = getUser(m.sender);
        m.user = user;

        // React ⏳ قبل التنفيذ
        await safeReact(conn, m, '⏳');

        await handler(m, { conn, user, db: getDB(), isDev: m.isDev });

        // XP + React ✅ بعد التنفيذ
        addXP(m.sender, 5);
        await safeReact(conn, m, '✅');

    } catch (err) {
        console.error('[HANDLER ERROR]', err.message || err);
        addError(err);
        try {
            await conn.sendMessage(m.chat, {
                text: `❌ حدث خطأ في الأمر\n\`${err.message?.slice(0, 150) || 'خطأ غير معروف'}\``,
            }, { quoted: m });
            await safeReact(conn, m, '❌');
        } catch {}
    }
}

export { loadPlugins, handleMessage, plugins };
