import fs from 'fs';
import path from 'path';
import config from '../config.js';

const DB_PATH = config.dbPath;

const defaultData = {
    users: {},
    groups: {},
    banned: [],
    developers: [...config.ownerNumber],
    errors: [],
    sections: [...config.sections],
    customFiles: {},
    disabledCommands: []
};

function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch {
        return { ...defaultData };
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getDB() {
    return loadDB();
}

function getUser(jid) {
    const db = loadDB();
    const number = jid.split('@')[0];
    if (!db.users[number]) {
        db.users[number] = {
            number,
            xp: 0,
            level: 0,
            role: 'جندي',
            coins: 0,
            diamonds: 0,
            dollars: 0,
            warns: 0,
            registered: false,
            registerName: '',
            lastDaily: 0,
            lastWeekly: 0,
            lastSalary: 0,
            banned: false,
            title: '',
            messages: 0,
            joinedAt: Date.now()
        };
        saveDB(db);
    }
    return db.users[number];
}

function saveUser(jid, data) {
    const db = loadDB();
    const number = jid.split('@')[0];
    db.users[number] = { ...db.users[number], ...data };
    saveDB(db);
}

function getGroup(jid) {
    const db = loadDB();
    if (!db.groups[jid]) {
        db.groups[jid] = {
            jid,
            antiLink: true,
            antiSpam: true,
            welcome: true,
            goodbye: true,
            warns: {},
            muted: false,
            locked: false,
            createdAt: Date.now()
        };
        saveDB(db);
    }
    return db.groups[jid];
}

function saveGroup(jid, data) {
    const db = loadDB();
    db.groups[jid] = { ...db.groups[jid], ...data };
    saveDB(db);
}

function isDev(jid) {
    const db = loadDB();
    const number = jid.split('@')[0];
    return db.developers.includes(number) || config.ownerNumber.includes(number);
}

function addDev(jid) {
    const db = loadDB();
    const number = jid.split('@')[0];
    if (!db.developers.includes(number)) {
        db.developers.push(number);
        saveDB(db);
        return true;
    }
    return false;
}

function isBanned(jid) {
    const db = loadDB();
    const number = jid.split('@')[0];
    return db.banned.includes(number);
}

function banUser(jid) {
    const db = loadDB();
    const number = jid.split('@')[0];
    if (!db.banned.includes(number)) {
        db.banned.push(number);
        saveDB(db);
        return true;
    }
    return false;
}

function unbanUser(jid) {
    const db = loadDB();
    const number = jid.split('@')[0];
    db.banned = db.banned.filter(n => n !== number);
    saveDB(db);
}

function addError(err) {
    const db = loadDB();
    db.errors.push({ time: new Date().toISOString(), error: err.toString().slice(0, 500) });
    if (db.errors.length > 50) db.errors = db.errors.slice(-50);
    saveDB(db);
}

function getErrors() {
    const db = loadDB();
    return db.errors;
}

function addXP(jid, amount) {
    const db = loadDB();
    const number = jid.split('@')[0];
    const user = getUser(jid);
    user.xp += amount;
    user.messages = (user.messages || 0) + 1;
    const newLevel = getRankLevel(user.xp);
    const leveledUp = newLevel > user.level;
    user.level = newLevel;
    user.role = config.ranks[newLevel]?.name || 'جندي';
    db.users[number] = user;
    saveDB(db);
    return { leveledUp, newLevel, role: user.role };
}

function getRankLevel(xp) {
    let level = 0;
    for (let i = config.ranks.length - 1; i >= 0; i--) {
        if (xp >= config.ranks[i].xp) { level = i; break; }
    }
    return level;
}

function isCommandDisabled(cmd) {
    const db = loadDB();
    return (db.disabledCommands || []).includes(cmd);
}

function toggleCommand(cmd) {
    const db = loadDB();
    if (!db.disabledCommands) db.disabledCommands = [];
    if (db.disabledCommands.includes(cmd)) {
        db.disabledCommands = db.disabledCommands.filter(c => c !== cmd);
        saveDB(db);
        return 'enabled';
    } else {
        db.disabledCommands.push(cmd);
        saveDB(db);
        return 'disabled';
    }
}

function deleteCommand(cmd) {
    const db = loadDB();
    if (!db.disabledCommands) db.disabledCommands = [];
    if (!db.disabledCommands.includes(cmd)) {
        db.disabledCommands.push(cmd);
    }
    saveDB(db);
}

function addSection(section) {
    const db = loadDB();
    if (!db.sections) db.sections = [];
    db.sections.push(section);
    saveDB(db);
}

function getSections() {
    const db = loadDB();
    return db.sections || config.sections;
}

export {
    getDB, saveDB, getUser, saveUser, getGroup, saveGroup,
    isDev, addDev, isBanned, banUser, unbanUser,
    addError, getErrors, addXP, getRankLevel,
    isCommandDisabled, toggleCommand, deleteCommand,
    addSection, getSections
};
