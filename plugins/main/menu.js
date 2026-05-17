import { getUser, getDB, isDev } from '../../lib/database.js';
import { buildDevMenu } from '../../lib/menu-builder.js';
import config from '../../config.js';

const handler = async (m, { conn }) => {
    const db = getDB();
    const user = getUser(m.sender);
    const totalUsers = Object.keys(db.users || {}).length;
    const now = new Date();
    const week = now.toLocaleDateString('ar-EG', { weekday: 'long' });
    const date = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const bodyText = `مــرحــبـا بـك يـــا:*┆⌊*@${m.sender.split('@')[0]}*⌉┆
⊱ ∙ ─๋︩︪─︩─═⊐‹#☕›⊏═─๋︩︪─๋︩︪─┈ ∙ ⊰ـ
╮╮˚᳝ ─✦🌙معلومات البوت🌙☇─˚᳝᳝𖥻
┤┌─ׅ─ׅ┈⥶ـ
│┊ ۬.͜ـ🌙˖اســمــــي: 𝙴𝚂𝙲𝙽𝙾𝚁𝚁-𝙱𝙾𝚃」
│┊ ۬.͜ـ🕋˖الـــمـــــطور: ⌗𝐄𝐒𝐂𝐀𝐍𝛩𝐑」
│┊ ۬.͜ـ⚡˖رقـــم الـمـــطور: ${config.ownerNumber[0]}+」
│┊ ۬.͜ـ👾˖الــيــوم : ${week}」
│┊ ۬.͜ـ🐢˖ الــتــاريــخ : ${date}」
│┊ ۬.͜ـ⏰˖ الـوقـت : ${time}」
┘└─ׅ─ׅ┈⥶ـ
╯˚᳝ ─︩︪✦☕معلومات البوت☕☇─˚᳝᳝𖥻
⊱ ∙ ─๋︩︪─๋︩︪─═⊐‹#☕›⊏═─๋︩︪─๋︩︪─┈ ∙ ⊰ـ
╮╮˚᳝ ─✦🤖مِـــعــلومـاتــــك🤖☇─˚᳝᳝𖥻
┤┌─ׅ─ׅ┈⥶ـ
│┊ ۬.͜ـ🍒˖مــســتــواك :  ${user.level}」
│┊ ۬.͜ـ📯˖رتــبــتــك :  ${user.role}」
│┊ ۬.͜ـ📡˖الــمـســتــخــدمــيـن : ${totalUsers}」
┘└─ׅ─ׅ┈⥶ـ
╯˚᳝ ─✦ 💕مِـــعــلومـاتــــك💕☇─˚᳝᳝𖥻`;

    const buttons = [
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: '⌈📩╎شات المطور╎📩⌋',
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
    ];

    const msg = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: bodyText },
                    contextInfo: { mentionedJid: [m.sender], isForwarded: false },
                    nativeFlowMessage: { buttons }
                }
            }
        }
    };

    await conn.relayMessage(m.chat, msg, {});

    if (isDev(m.sender)) {
        const devMsg = buildDevMenu(true);
        await conn.relayMessage(m.chat, devMsg, {});
    }
};

handler.command = ['menu', 'قائمة', 'القائمة', 'مهام', 'اوامر', 'الاوامر'];
handler.tags = ['main'];
export default handler;
