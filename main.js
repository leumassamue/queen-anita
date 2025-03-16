const fs = require('fs')
require('dotenv').config();
// Adding session handling using SESSION_JSON environment variable
const sessionInput = process.env.SESSION_ID;
if (sessionInput) {
    const sessionPath = './session/creds.json';
    fs.mkdirSync('./session', { recursive: true });
    fs.writeFileSync(sessionPath, sessionInput, 'utf-8');
    console.log("Session file created successfully from environment variable.");
} else {
    console.log("No session ID provided. Using default method for session.");
}

const { default: makeWASocket, DisconnectReason, makeInMemoryStore, jidDecode, proto, getContentType, useMultiFileAuthState, downloadContentFromMessage } = require("@whiskeysockets/baileys")
const pino = require('pino')
const pm2 = require('pm2');
const { Boom } = require('@hapi/boom')
const FileType = require('file-type')
const readline = require("readline");
const path = require('path')
const _ = require('lodash')
const yargs = require('yargs/yargs')
const PhoneNumber = require('awesome-phonenumber')
var low
try {
low = require('lowdb')
} catch (e) {
low = require('./lib/lowdb')}
//=================================================//
const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')
//=================================================//
const prefix = process.env.PREFIX;
//=================================================//
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
//=================================================//
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
/https?:\/\//.test(opts['db'] || '') ?
new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
new mongoDB(opts['db']) :
new JSONFile(`./davidcyriltech/database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
if (global.db.data !== null) return
global.db.READ = true
await global.db.read()
global.db.READ = false
global.db.data = {
users: {},
chats: {},
game: {},
database: {},
settings: {},
setting: {},
others: {},
sticker: {},
...(global.db.data || {})}
  global.db.chain = _.chain(global.db.data)}
loadDatabase()


const question = (text) => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); return new Promise((resolve) => { rl.question(text, resolve) }) };

async function startBotz() {
const { state, saveCreds } = await useMultiFileAuthState("session")
const David = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: false,
auth: state,
connectTimeoutMs: 60000,
defaultQueryTimeoutMs: 0,
keepAliveIntervalMs: 10000,
emitOwnEvents: true,
fireInitQueries: true,
generateHighQualityLinkPreview: true,
syncFullHistory: true,
markOnlineOnConnect: true,
browser: ["Ubuntu", "Chrome", "20.0.04"],
});




if (!David.authState.creds.registered) {
const phoneNumber = await question('\nPlease Type Your WhatsApp Number\nExample 2349066831211 :\n');
let code = await David.requestPairingCode(phoneNumber);
acode = code?.match(/.{1,4}/g)?.join("-") || code;
console.log(`PAIRING CODE :`, code);
}








David.ev.on("messages.upsert", async (chatUpdate) => {
    try {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;

        // Extract the message object
        mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" 
            ? mek.message.ephemeralMessage.message 
            : mek.message;

        // Define the list of emojis
        const emojis = [
            '☄️', '🫶', '🫂', '🥲', '😍', '🤩', '🥳', '🌚', '🥷', 
            '🇳🇬', '🌷', '☑️', '♥️', '🖤', '💜', '🧘', '❤️', '🧡', 
            '💛', '💚', '💯', '💙', '🥹', '🤍', '🤎', '💞', '💓', 
            '💗', '💖', '🗿', '🔥', '✨', '🎉', '🎊', '🙈', '⭐', 
            '😳', '🎁', '', '💔', '🤩', '😏', '🫣', '💀', '☠️', 
            '🌈', '🍸', '🫧', '✍️', '🌼', '🍀', '😐', '💵', '🙏', 
            '🔥', '🦋', '🥴', '🥵', '🥺', '🐬', '😎', '🦄', '❄️', 
            '😯', '😇', '💎', '🎶', '👀', '🥰'
        ];

        // Function to select a random emoji
        function getRandomEmoji() {
            return emojis[Math.floor(Math.random() * emojis.length)];
        }

        // Auto-like logic
        if (global.autoStatusReact && mek.key && mek.key.remoteJid === "status@broadcast") {
            const randomEmoji = getRandomEmoji(); // Get a random emoji
            const ownerId = `${David.user.id.split(':')[0]}@s.whatsapp.net`; // Owner's JID

            // Send reaction
            await David.sendMessage(mek.key.remoteJid, {
                react: {
                    key: mek.key,
                    text: randomEmoji, // Random emoji reaction
                },
            }, { statusJidList: [mek.key.participant, ownerId] });
        }
    } catch {
        // Silent error handling
    }
});



David.ev.on("messages.upsert", async (chatUpdate) => {
 try {
const mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast' && global.autoViewStatus) {
    await David.readMessages([mek.key]);
}




if (!David.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
const m = smsg(David, mek, store)
require("./QUEEN_ANITA-V4.js")(David, m, chatUpdate, store)
 } catch (err) {
 console.log(err)
 }
});




David.ev.on("call", async (callEvent) => {
    if (global.ANTICALL) {
        const callId = callEvent[0].id; // Incoming call ID
        const callerId = callEvent[0].from; // Caller’s WhatsApp ID

        try {
            // Reject the call
            await David.rejectCall(callId, callerId);

            // Send a warning message to the caller
            await David.sendMessage(callerId, {
                text: "Hello, I am *QUEEN ANITA V4* Multi-Device WhatsApp Bot👋\n Please Do Not Call This Number. \nMy Owner Is Unavailable. Try Again Later."
            });

            console.log(`Call from ${callerId} rejected successfully.`);
        } catch (error) {
            console.error(`Failed to reject call from ${callerId}:`, error.message);
        }
    }
});


const axios = require("axios");

/**
 * Downloads a file from a URL and converts it into a buffer.
 * @param {string} url - The URL of the file to download.
 * @returns {Promise<Buffer>} - The downloaded file as a buffer.
 */
const getBuffer = async (url) => {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    } catch (error) {
        console.error(`Error fetching buffer from URL: ${url}\n${error.message}`);
        throw new Error("Failed to fetch buffer.");
    }
};



    const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif'); // Ensure exif.js is imported

David.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
    const buffer = Buffer.isBuffer(path)
        ? path
        : /^https?:\/\//.test(path)
        ? await getBuffer(path) // Use the getBuffer function here
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);

    const webpBuffer = await writeExifImg(buffer, {
        packname: options.packname || global.packname,
        author: options.author || global.author,
    });

    await David.sendMessage(jid, { sticker: { url: webpBuffer } }, { quoted });
};

David.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
    const buffer = Buffer.isBuffer(path)
        ? path
        : /^https?:\/\//.test(path)
        ? await getBuffer(path) // Use the getBuffer function here
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);

    const webpBuffer = await writeExifVid(buffer, {
        packname: options.packname || global.packname,
        author: options.author || global.author,
    });

    await David.sendMessage(jid, { sticker: { url: webpBuffer } }, { quoted });
};




// Load levels from JSON
function loadLevels() {
    if (fs.existsSync("database/level.json")) {
        const data = fs.readFileSync("database/level.json");
        return JSON.parse(data);
    }
    return {}; // Return empty object if file doesn't exist
}

// Save levels to JSON
function saveLevels(data) {
    fs.writeFileSync("./david-cyril/level.json", JSON.stringify(data, null, 2));
}

// Load levels from JSON at the start
let userLevels = loadLevels();

David.ev.on("messages.upsert", async (messageEvent) => {
    if (global.LEVELUP) {
        const { messages } = messageEvent;
        const message = messages[0];
        const sender = message.key.participant || message.key.remoteJid;

        // Initialize user's level and XP if not present
        if (!userLevels[sender]) {
            userLevels[sender] = { xp: 0, level: 1, role: "Novice" };
        }

        // Add XP for every message
        userLevels[sender].xp += 10;

        // Check if user has leveled up
        const user = userLevels[sender];
        if (user.xp >= user.level * 100) {
            user.level++; // Increment level
            user.xp = 0; // Reset XP

            // Assign a new role if applicable
            const newRole = global.roles[user.level] || user.role;
            if (newRole !== user.role) {
                user.role = newRole;
            }

            // Save updated levels to JSON
            saveLevels(userLevels);

            // Send level-up message
            await David.sendMessage(message.key.remoteJid, {
                text: `🎉 *Congratulations!* @${sender.split("@")[0]} has leveled up!\n\n` +
                      `*New Level:* ${user.level}\n` +
                      `*Role:* ${user.role}\n` +
                      `Keep chatting to reach higher levels!`,
                mentions: [sender],
            });

            // Bonus: Reward XP or items (optional)
            if (user.level % 5 === 0) { // Bonus every 5 levels
                user.xp += 50; // Extra XP reward
                await David.sendMessage(message.key.remoteJid, {
                    text: `🎁 Bonus Reward: You received 50 XP for reaching Level ${user.level}!`,
                    mentions: [sender],
                });
            }
        }

        // Save progress after every update
        saveLevels(userLevels);
    }
});





David.ev.on("group-participants.update", async (update) => {
    if (global.WELCOME) {
        const { id, participants, action } = update;

        if (action === "add") {
            for (const user of participants) {
                const userName = await David.getName(user);
                const userAvatar = await David.profilePictureUrl(user, "image").catch(() => "https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg");
                const groupMetadata = await David.groupMetadata(id);
                const groupName = groupMetadata.subject;
                const groupIcon = await David.profilePictureUrl(id, "image").catch(() => "https://i.ibb.co/G5mJZxs/rin.jpg");
                const memberCount = groupMetadata.participants.length;
                const background = "https://i.ibb.co/4YBNyvP/images-76.jpg";

                try {
                    // Fetch the welcome image from the API
                    const welcomeImageUrl = `https://api.siputzx.my.id/api/canvas/welcomev1?username=${encodeURIComponent(userName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&guildIcon=${encodeURIComponent(groupIcon)}&avatar=${encodeURIComponent(userAvatar)}&background=${encodeURIComponent(background)}`;
                    
                    // Download the image
                    const response = await axios.get(welcomeImageUrl, { responseType: "arraybuffer" });
                    const buffer = Buffer.from(response.data);

                    // Send the welcome message with the image
                    await David.sendMessage(id, {
                        image: buffer,
                        caption: `🎉 Welcome @${user.split("@")[0]} to *${groupName}*!\n\nWe're happy to have you here. Enjoy your stay!`,
                        mentions: [user],
                    });
                } catch (error) {
                    console.error("Error generating welcome image:", error.message);
                    await David.sendMessage(id, {
                        text: `🎉 Welcome @${user.split("@")[0]} to *${groupName}*!`,
                        mentions: [user],
                    });
                }
            }
        }
    }
});


David.ev.on("group-participants.update", async (update) => {
    if (global.WELCOME) {
        const { id, participants, action } = update;

        for (const user of participants) {
            const userName = await David.getName(user);
            const userAvatar = await David.profilePictureUrl(user, "image").catch(() => "https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg");
            const groupMetadata = await David.groupMetadata(id);
            const groupName = groupMetadata.subject;
            const groupIcon = await David.profilePictureUrl(id, "image").catch(() => "https://i.ibb.co/G5mJZxs/rin.jpg");
            const memberCount = action === "add" ? groupMetadata.participants.length : groupMetadata.participants.length - 1;
            const background = "https://i.ibb.co/4YBNyvP/images-76.jpg";

            try {
                const apiType = action === "add" ? "welcomev1" : "goodbyev1";
                const apiMessage = action === "add"
                    ? `🎉 Welcome @${user.split("@")[0]} to *${groupName}*!\n\nWe're happy to have you here. Enjoy your stay!`
                    : `😢 Goodbye @${user.split("@")[0]} from *${groupName}*.\n\nWe’re sad to see you go. Take care!`;

                // Fetch the image from the API
                const apiUrl = `https://api.siputzx.my.id/api/canvas/${apiType}?username=${encodeURIComponent(userName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&guildIcon=${encodeURIComponent(groupIcon)}&avatar=${encodeURIComponent(userAvatar)}&background=${encodeURIComponent(background)}`;
                const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
                const buffer = Buffer.from(response.data);

                // Send the message with the image
                await David.sendMessage(id, {
                    image: buffer,
                    caption: apiMessage,
                    mentions: [user],
                });
            } catch (error) {
                console.error(`Error generating ${action === "add" ? "welcome" : "goodbye"} image:`, error.message);

                const fallbackMessage = action === "add"
                    ? `🎉 Welcome @${user.split("@")[0]} to *${groupName}*!`
                    : `😢 Goodbye @${user.split("@")[0]} from *${groupName}*.`;

                await David.sendMessage(id, {
                    text: fallbackMessage,
                    mentions: [user],
                });
            }
        }
    }
});


// Setting
David.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

David.getName = (jid, withoutContact= false) => {
id = David.decodeJid(jid)
withoutContact = David.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = David.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === David.decodeJid(David.user.id) ?
David.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

David.public = true










David.serializeM = (m) => smsg(David, m, store);

// Event: Connection Update
David.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        if ([
            DisconnectReason.badSession,
            DisconnectReason.connectionClosed,
            DisconnectReason.connectionLost,
            DisconnectReason.connectionReplaced,
            DisconnectReason.restartRequired,
            DisconnectReason.timedOut
        ].includes(reason)) {
            console.log('Reconnecting...');
            startBotz();
        } else if (reason === DisconnectReason.loggedOut) {
            console.log('Logged out. Please scan QR again.');
            process.exit(1);
        } else {
            console.error(`Unknown DisconnectReason: ${reason}`);
            process.exit(1);
        }
    } else if (connection === 'open') {
        console.log('[Connected] ' + JSON.stringify(David.user.id, null, 2));

        // Array of image URLs
        const images = [
            'https://files.catbox.moe/e2pxey.jpg',
            'https://files.catbox.moe/jd0s4p.jpg',
            'https://files.catbox.moe/e2pxey.jpg'
        ];

        // Randomly select one image URL
        const imageUrl = images[Math.floor(Math.random() * images.length)];

        const caption = `*[ QUEEN ANITA V4 CONNECTED ]*\n\n*WELCOME OWNER👋🥺*\n> Type ${prefix}menu to see my commands list\n> Type ${prefix}help if you need a guide\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ᴛᴇᴄʜ`;

        const ownJid = `${David.user.id.split(':')[0]}@s.whatsapp.net`; 
        // Send the random image with caption to the owner's WhatsApp number
        David.sendMessage(ownJid, {
            image: { url: imageUrl },
            caption: caption,
        })
        .catch((error) => {
            console.error('Error sending connection image:', error);
        });
    }
});

David.ev.on('creds.update', saveCreds)

David.sendText = (jid, text, quoted = '', options) => David.sendMessage(jid, { text: text, ...options }, { quoted })
//=========================================\\
    
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});



David.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }
    
    David.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}

return buffer
} 
    
//=========================================\\
David.ev.on("creds.update", saveCreds);
David.getFile = async (PATH, returnAsFilename) => {
let res, filename
const data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
const type = await FileType.fromBuffer(data) || {
mime: 'application/octet-stream',
ext: '.bin'
}
if (data && returnAsFilename && !filename)(filename = path.join(__dirname, './tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
return {
res,
filename,
...type,
data,
deleteFile() {
return filename && fs.promises.unlink(filename)
}
}
}


David.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
let type = await David.getFile(path, true)
let { res, data: file, filename: pathFile } = type
if (res && res.status !== 200 || file.length <= 65536) {
try { throw { json: JSON.parse(file.toString()) } }
catch (e) { if (e.json) throw e.json }
}
let opt = { filename }
if (quoted) opt.quoted = quoted
if (!type) options.asDocument = true
let mtype = '', mimetype = type.mime, convert
if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
else if (/video/.test(type.mime)) mtype = 'video'
else if (/audio/.test(type.mime)) (
convert = await (ptt ? toPTT : toAudio)(file, type.ext),
file = convert.data,
pathFile = convert.filename,
mtype = 'audio',
mimetype = 'audio/ogg; codecs=opus'
)
else mtype = 'document'
if (options.asDocument) mtype = 'document'

let message = {
...options,
caption,
ptt,
[mtype]: { url: pathFile },
mimetype
}
let m
try {
m = await David.sendMessage(jid, message, { ...opt, ...options })
} catch (e) {
console.error(e)
m = null
} finally {
if (!m) m = await David.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
return m
}
}

David.sendTextWithMentions = async (jid, text, quoted, options = {}) => David.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
//=========================================\\

return David
}


// Start the bot
startBotz();

function smsg(David, m, store) {
if (!m) return m
let M = proto.WebMessageInfo
if (m.key) {
m.id = m.key.id
m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
m.chat = m.key.remoteJid
m.fromMe = m.key.fromMe
m.isGroup = m.chat.endsWith('@g.us')
m.sender = David.decodeJid(m.fromMe && David.user.id || m.participant || m.key.participant || m.chat || '')
if (m.isGroup) m.participant = David.decodeJid(m.key.participant) || ''
}
if (m.message) {
m.mtype = getContentType(m.message)
m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
m.body = m.message.conversation || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') || m.text
let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
if (m.quoted) {
let type = getContentType(quoted)
m.quoted = m.quoted[type]
if (['productMessage'].includes(type)) {
type = getContentType(m.quoted)
m.quoted = m.quoted[type]
}
if (typeof m.quoted === 'string') m.quoted = {
text: m.quoted
}
m.quoted.mtype = type
m.quoted.id = m.msg.contextInfo.stanzaId
m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
m.quoted.sender = David.decodeJid(m.msg.contextInfo.participant)
m.quoted.fromMe = m.quoted.sender === David.decodeJid(David.user.id)
m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
m.getQuotedObj = m.getQuotedMessage = async () => {
if (!m.quoted.id) return false
let q = await store.loadMessage(m.chat, m.quoted.id, conn)
 return exports.smsg(conn, q, store)
}
let vM = m.quoted.fakeObj = M.fromObject({
key: {
remoteJid: m.quoted.chat,
fromMe: m.quoted.fromMe,
id: m.quoted.id
},
message: quoted,
...(m.isGroup ? { participant: m.quoted.sender } : {})
})
m.quoted.delete = () => David.sendMessage(m.quoted.chat, { delete: vM.key })
m.quoted.copyNForward = (jid, forceForward = false, options = {}) => David.copyNForward(jid, vM, forceForward, options)
m.quoted.download = () => David.downloadMediaMessage(m.quoted)
}
}
if (m.msg.url) m.download = () => David.downloadMediaMessage(m.msg)
m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? David.sendMedia(chatId, text, 'file', '', m, { ...options }) : David.sendText(chatId, text, m, { ...options })
m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)))
m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => David.copyNForward(jid, m, forceForward, options)

return m
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})



const express = require('express'); // Import Express
const app = express(); // Create Express app
const PORT = process.env.PORT || 3000; // Use Heroku's dynamic port or 3000

let botStatus = "Disconnected"; // Initialize the bot status

// Serve an HTML page with connection status
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title> Queen Anita V4 Bot Status</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    .status { font-size: 24px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>Queen Anita V4 WhatsApp Bot</h1>
                <div class="status">Status: <strong>CONNECTED ✅</strong></div>
            </body>
        </html>
    `);
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
