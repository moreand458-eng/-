// ====== الطريقة الصح لـ import من baileys ======
import * as baileys from '@whiskeysockets/baileys';

// baileys بيعمل export named + default — هنتعامل مع الاتنين
const makeWASocket   = baileys.default || baileys.makeWASocket;
const useMultiFileAuthState  = baileys.useMultiFileAuthState;
const DisconnectReason       = baileys.DisconnectReason;
const fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
const proto                  = baileys.proto;

import pino from 'pino';
import readline from 'readline';
import fs from 'fs';
import config from '../config.js';
import { loadPlugins, handleMessage } from './handler.js';
import { getGroup } from './database.js';

const logger = pino({ level: 'silent' });

// بديل makeInMemoryStore — كاش بسيط في الميموري
const msgCache      = new Map();   // id → message
const contactsCache = {};          // jid → contact info

// سؤال في التيرمنال
function question(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

async function startBot() {
    await loadPlugins();

    // تأكد من وجود مجلد الـ session
    if (!fs.existsSync(config.sessionDir || './session')) {
        fs.mkdirSync(config.sessionDir || './session', { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir || './session');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[ESCANOR] baileys: ${version.join('.')} | latest: ${isLatest}`);

    const conn = makeWASocket({
        version,
        logger,
        auth: state,
        browser: ['𝙴𝚂𝙲𝙰𝙽𝙾𝚁 BOT', 'Chrome', '120.0.0'],
        printQRInTerminal: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        getMessage: async (key) => {
            return msgCache.get(key.id) || proto.Message.fromObject({});
        }
    });

    // ======= طلب Pairing Code =======
    // يجب يكون بعد makeWASocket مباشرة وقبل أي event listener
    if (!conn.authState.creds.registered) {
        // انتظر ثانية عشان الـ socket يستقر
        await new Promise(r => setTimeout(r, 1000));

        let phoneNumber = config.ownerNumber[0]; // رقم المالك الافتراضي من config

        // لو عايز تدخل رقم يدوي من التيرمنال
        const inputPhone = await question(
            '\n╔══════════════════════════════════════╗\n' +
            '║  📱 أدخل رقمك أو اضغط Enter         ║\n' +
            `║  الرقم الافتراضي: ${phoneNumber.padEnd(16)}║\n` +
            '╚══════════════════════════════════════╝\n' +
            '→ الرقم (مع كود الدولة بدون +): '
        );

        if (inputPhone.trim()) {
            phoneNumber = inputPhone.trim().replace(/[^0-9]/g, '');
        } else {
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        }

        console.log(`\n[ESCANOR] 📤 جاري إرسال كود الربط لـ: +${phoneNumber}`);

        try {
            const code = await conn.requestPairingCode(phoneNumber);
            const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
            console.log('\n╔═══════════════════════════════════════════╗');
            console.log('║      🔑  PAIRING CODE / كود الربط         ║');
            console.log(`║                                           ║`);
            console.log(`║          ►  ${formatted}  ◄               ║`);
            console.log(`║                                           ║`);
            console.log('╠═══════════════════════════════════════════╣');
            console.log('║  📲 افتح واتساب على الهاتف               ║');
            console.log('║  ← الأجهزة المرتبطة                      ║');
            console.log('║  ← ربط جهاز                              ║');
            console.log('║  ← ربط بـ رقم الهاتف                    ║');
            console.log('║  ← أدخل الكود أعلاه                     ║');
            console.log('╚═══════════════════════════════════════════╝\n');
        } catch (e) {
            console.error('\n❌ فشل طلب كود الربط:', e.message);
            console.error('💡 تأكد من الرقم (مع كود الدولة) وحاول تاني\n');
            console.error('💡 احذف مجلد session وأعد التشغيل لو الخطأ مستمر\n');
        }
    } else {
        console.log('[ESCANOR] ✅ session موجودة، جاري الاتصال...');
    }

    // ======= Helpers =======
    conn.getName = (jid) => {
        try {
            const c = contactsCache[jid];
            return c?.name || c?.pushName || jid.split('@')[0];
        } catch { return jid.split('@')[0]; }
    };

    // ======= Events =======
    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('contacts.upsert', (contacts) => {
        for (const c of contacts) {
            if (c.id) contactsCache[c.id] = { ...contactsCache[c.id], ...c };
        }
    });

    conn.ev.on('contacts.update', (updates) => {
        for (const c of updates) {
            if (c.id) contactsCache[c.id] = { ...contactsCache[c.id], ...c };
        }
    });

    conn.ev.on('messages.upsert', async ({ messages, type }) => {
        for (const msg of messages) {
            if (msg.key?.id && msg.message) {
                msgCache.set(msg.key.id, msg.message);
                if (msgCache.size > 500) msgCache.delete(msgCache.keys().next().value);
            }
        }
        if (type !== 'notify') return;
        for (const m of messages) {
            if (!m.message) continue;
            m.chat = m.key.remoteJid;
            try { await handleMessage(conn, m); }
            catch (e) { console.error('[MSG ERROR]', e.message); }
        }
    });

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            console.log('[ESCANOR] 🔄 جاري الاتصال بـ WhatsApp...');
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            const isLoggedOut = code === DisconnectReason.loggedOut;
            console.log(`[ESCANOR] ⚠️ انقطع الاتصال — كود: ${code}`);
            if (isLoggedOut) {
                console.log('[ESCANOR] 🚫 تم تسجيل الخروج! احذف مجلد session وأعد تشغيل البوت');
                process.exit(1);
            } else {
                console.log('[ESCANOR] 🔄 إعادة الاتصال بعد 5 ثواني...');
                setTimeout(() => startBot(), 5000);
            }
        }

        if (connection === 'open') {
            printBanner();
            console.log(`[ESCANOR] ✅ متصل! الرقم: +${conn.user?.id?.split(':')[0]}`);
            console.log(`[ESCANOR] 👤 الاسم: ${conn.user?.name || 'ESCANOR BOT'}`);
        }
    });

    conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
        try {
            const grp = getGroup(id);
            if (!grp.welcome && !grp.goodbye) return;
            const meta = await conn.groupMetadata(id).catch(() => null);
            const name = meta?.subject || 'المجموعة';
            for (const p of participants) {
                if (action === 'add' && grp.welcome) {
                    await conn.sendMessage(id, {
                        text: `╭•─•─•─•─•┈●\n│ 🎉 أهلاً @${p.split('@')[0]}\n│ بـ ${name}\n│ اكتب .قائمة\n╰•─•─•─•─•`,
                        mentions: [p]
                    });
                }
                if (action === 'remove' && grp.goodbye) {
                    await conn.sendMessage(id, {
                        text: `╭•─•─•─•─•┈●\n│ 👋 وداعاً @${p.split('@')[0]}\n╰•─•─•─•─•`,
                        mentions: [p]
                    });
                }
            }
        } catch {}
    });

    return conn;
}

function printBanner() {
    console.log('\n\x1b[36m');
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   𝙴𝚂𝙲𝙰𝙽𝙾𝚁-𝙱𝙾𝚃  V3  ✅  متصل         ║');
    console.log('║   by ⌗𝐄𝐒𝐂𝐀𝐍𝛩𝐑  · جميع الحقوق محفوظة ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log('\x1b[0m');
}

export { startBot };
