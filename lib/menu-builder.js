import { getSections } from './database.js';
import config from '../config.js';

function buildMainMenuMessage(conn, m, user, totalUsers) {
    const { prepareWAMessageMedia } = conn.__helpers || {};
    const mentionId = m.key.participant || m.key.remoteJid;
    const now = new Date();
    const week = now.toLocaleDateString('ar-EG', { weekday: 'long' });
    const time = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const sections = getSections();

    const rows = sections.map(s => ({
        header: s.header,
        title: s.title,
        id: s.id
    }));

    const bodyText = `مــرحــبـا بـك يـــا:*┆⌊*@${mentionId.split('@')[0]}*⌉┆
⊱ ∙ ─๋︩︪─︩─═⊐‹#☕›⊏═─๋︩︪─๋︩︪─┈ ∙ ⊰ـ
╮╮˚᳝ ─✦🌙معلومات البوت🌙☇─˚᳝᳝𖥻
┤┌─ׅ─ׅ┈⥶ـ
│┊ ۬.͜ـ🌙˖اســمــــي: 𝙴𝚂𝙲𝙽𝙾𝚁𝚁-𝙱𝙾𝚃」
│┊ ۬.͜ـ🕋˖الـــمـــــطور: ⌗𝐄𝐒𝐂𝐀𝐍𝛩𝐑」
│┊ ۬.͜ـ⚡˖رقـــم الـمـــطور: 201092178171+」
│┊ ۬.͜ـ👾˖الــيــوم : ${week}」
│┊ ۬.͜ـ🐢˖ الــتــاريــخ : ${time}」
┘└─ׅ─ׅ┈⥶ـ
╯˚᳝ ─︩︪✦☕معلومات البوت☕☇─˚᳝᳝𖥻
⊱ ∙ ─๋︩︪─๋︩︪─═⊐‹#☕›⊏═─๋︩︪─๋︩︪─┈ ∙ ⊰ـ
╮╮˚᳝ ─✦🤖مِـــعــلومـاتــــك🤖☇─˚᳝᳝𖥻
┤┌─ׅ─ׅ┈⥶ـ
│┊ ۬.͜ـ🍒˖مــســتــواك :  ${user.level}」
│┊ ۬.͜ـ📯˖رتــبــتــك :  ${user.role}」
│┊ ۬.͜ـ📡˖الــمـســتــخــدمــيـن : ${totalUsers}」
┘└─ׅ─ׅ┈⥶ـ
╯˚᳝ ─✦ 💕مِـــعــلومـاتــــك💕☇─˚᳝᳝𖥻
⊱ ∙ ─๋︩︪─๋︩︪─═⊐‹#☕›⊏═─๋︩︪─๋︩︪─┈ ∙ ⊰ـ`;

    return {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: bodyText },
                    contextInfo: { mentionedJid: [m.sender], isForwarded: false },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: '⌈🍭┊اوامر┊🍬⌋',
                                    sections: [
                                        {
                                            title: '❪🐣┊مـهـام_الـبـوت┊🍡❫',
                                            highlight_label: '𝙴𝚂𝙲𝙰𝙽𝙾𝚁-𝙱𝙾𝚃',
                                            rows
                                        }
                                    ]
                                })
                            },
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '⌈📩╎شات البوت╎📩⌋',
                                    url: config.ownerLink
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({ display_text: '⌈🌟╎تقييم╎🌟⌋', id: '.تقيم' })
                            },
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '⌈📲╎قـنـاة الـمـطـور╎📲⌋',
                                    url: config.channelLink
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({ display_text: '⌈🚀╎المطور╎🚀⌋', id: '.المطور' })
                            }
                        ]
                    }
                }
            }
        }
    };
}

function buildSectionMenu(sectionId, sectionTitle, sectionEmoji, rows, bodyExtra = '') {
    const mentionPart = bodyExtra;
    const bodyText = `╮••─๋︩︪──๋︩︪─═⊐‹﷽›⊏═─๋︩︪──๋︩︪─┈☇
╿↵ مرحــبـا ⌊@⁨𝑬𝑠ᥴ𝑎ꪀ𝑜𝑟⁩⌉
── • ◈ • ──
*⌝${sectionEmoji}┊${sectionTitle}┊${sectionEmoji}⌞*
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹𝐄𝐒𝐂𝐍𝐎𝐑 𝐁𝐎𝐓›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇ـ
┤┌ ─๋︩︪─✦الأوامر☇─˚᳝᳝𖥻
${rows.map(r => `> │┊ ۬.͜ـ${sectionEmoji}˖ ⟨${r.cmd}☇`).join('\n')}
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇ـ
╯─ׅ─๋︩︪─═⊐‹𝐄𝐒𝐂𝐍𝐎𝐑 𝐁𝐎𝐓›⊏═┈ ─๋︩︪─⊰ـ${mentionPart}`;

    return {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: bodyText },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: `⌈${sectionEmoji}┊الأوامر┊${sectionEmoji}⌋`,
                                    sections: [{
                                        title: `❪${sectionEmoji}┊${sectionTitle}┊${sectionEmoji}❫`,
                                        highlight_label: '𝙴𝚂𝙲𝙰𝙽𝙾𝚁-𝙱𝙾𝚃',
                                        rows: rows.map(r => ({
                                            header: r.desc || sectionTitle,
                                            title: `${sectionEmoji}┊${r.cmd}`,
                                            id: `.${r.cmd}`
                                        }))
                                    }]
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({ display_text: '⌈🔙╎الرئيسية╎🔙⌋', id: '.قائمة' })
                            }
                        ]
                    }
                }
            }
        }
    };
}

function buildDevMenu(isDev) {
    if (!isDev) return null;
    const cmds = [
        { cmd: 'بنج', desc: 'اختبار سرعة البوت' },
        { cmd: 'رام', desc: 'إظهار استخدام الذاكرة' },
        { cmd: 'errors', desc: 'عرض آخر الأخطاء' },
        { cmd: 'اضافه-ملف', desc: 'إضافة ملف أمر جديد' },
        { cmd: 'اضافه-قسم', desc: 'إضافة قسم جديد' },
        { cmd: 'اضافه-مطور', desc: 'إضافة مطور جديد' },
        { cmd: 'حظر', desc: 'حظر مستخدم' },
        { cmd: 'فك-حظر', desc: 'فك حظر مستخدم' },
        { cmd: 'بوتات-فرعي', desc: 'إدارة البوتات الفرعية' },
        { cmd: 'اذاعه-فرعي', desc: 'إذاعة لجميع المجموعات' },
        { cmd: 'تنظيف', desc: 'حذف الملفات المؤقتة' },
        { cmd: 'تنضيف2', desc: 'حذف رسائل الجروب' },
    ];

    const bodyText = `╮••─๋︩︪──๋︩︪─═⊐‹﷽›⊏═─๋︩︪──๋︩︪─┈☇
╿↵ مرحــبـا ⌊@⁨𝑬𝑠ᥴ𝑎ꪀ𝑜𝑟⁩⌉
── • ◈ • ──
*⌝👨🏻‍💻┊قسم المطورين┊👨🏻‍💻⌞*
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹𝐄𝐒𝐂𝐍𝐎𝐑 𝐁𝐎𝐓›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇ـ
┤┌ ─๋︩︪─✦أوامر المطورين☇─˚᳝᳝𖥻
${cmds.map(c => `> │┊ ۬.͜ـ👨🏻‍💻˖ ⟨${c.cmd}☇`).join('\n')}
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇ـ
╯─ׅ─๋︩︪─═⊐‹𝐄𝐒𝐂𝐍𝐎𝐑 𝐁𝐎𝐓›⊏═┈ ─๋︩︪─⊰ـ`;

    return {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: bodyText },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: '⌈👨🏻‍💻┊أوامر المطورين┊👨🏻‍💻⌋',
                                    sections: [{
                                        title: '❪👨🏻‍💻┊قسم المطورين┊👨🏻‍💻❫',
                                        highlight_label: '𝙴𝚂𝙲𝙰𝙽𝙾𝚁-𝙱𝙾𝚃',
                                        rows: cmds.map(c => ({
                                            header: c.desc,
                                            title: `👨🏻‍💻┊${c.cmd}`,
                                            id: `.${c.cmd}`
                                        }))
                                    }]
                                })
                            },
                            {
                                name: 'quick_reply',
                                buttonParamsJson: JSON.stringify({ display_text: '⌈🔙╎الرئيسية╎🔙⌋', id: '.قائمة' })
                            }
                        ]
                    }
                }
            }
        }
    };
}

export { buildMainMenuMessage, buildSectionMenu, buildDevMenu };
