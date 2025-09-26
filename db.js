const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_FILE = path.join(DB_DIR, 'bot.db');

const db = new sqlite3.Database(DB_FILE);

// Inicialização das tabelas
// contacts: um registro por remetente (JID base sem @c.us armazenado separado para facilitar?)
// conversations: agrupamento por (contact_id + setor + status aberto)
// messages: cada mensagem recebida/enviada
// notifications: registros de notificações enviadas

const INIT_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jid TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL,
  sector_key TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  last_message_at DATETIME,
  FOREIGN KEY(contact_id) REFERENCES contacts(id)
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  direction TEXT NOT NULL, -- inbound | outbound | system
  body TEXT,
  raw_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  sector_key TEXT,
  target_jid TEXT,
  success INTEGER,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);
`;

function init() {
  return new Promise((resolve, reject) => {
    db.exec(INIT_SQL, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function getOrCreateContact(jid) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM contacts WHERE jid = ?', [jid], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row.id);
      db.run('INSERT INTO contacts (jid) VALUES (?)', [jid], function(insErr){
        if (insErr) return reject(insErr);
        resolve(this.lastID);
      });
    });
  });
}

function getOpenConversation(contactId, sectorKey) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM conversations WHERE contact_id = ? AND sector_key = ? AND status = "open" ORDER BY id DESC LIMIT 1', [contactId, sectorKey], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function openConversation(contactId, sectorKey){
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO conversations (contact_id, sector_key, last_message_at) VALUES (?,?,CURRENT_TIMESTAMP)', [contactId, sectorKey], function(err){
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

function appendMessage(conversationId, direction, body, raw){
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO messages (conversation_id, direction, body, raw_json) VALUES (?,?,?,?)', [conversationId, direction, body, raw ? JSON.stringify(raw) : null], function(err){
      if (err) return reject(err);
      db.run('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);
      resolve(this.lastID);
    });
  });
}

function recordNotification(conversationId, sectorKey, targetJid, success, error){
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO notifications (conversation_id, sector_key, target_jid, success, error) VALUES (?,?,?,?,?)', [conversationId, sectorKey, targetJid, success ? 1 : 0, error || null], function(err){
      if (err) return reject(err);
      resolve(this.lastID);
    });
  });
}

async function getOrCreateConversation(jid, sectorKey){
  const contactId = await getOrCreateContact(jid);
  let conv = await getOpenConversation(contactId, sectorKey);
  if (!conv) {
    const convId = await openConversation(contactId, sectorKey);
    return { id: convId, contact_id: contactId };
  }
  return conv;
}

module.exports = {
  init,
  getOrCreateConversation,
  appendMessage,
  recordNotification,
  db
};
