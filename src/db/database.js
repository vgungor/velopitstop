const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const dbPath = path.join(__dirname, "bike_service.db");
const logPath = path.join(__dirname, "../../logs/login_attempts.log");

const db = new sqlite3.Database(dbPath);

function initDB() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        is_admin INTEGER DEFAULT 0,
        is_suspended INTEGER DEFAULT 0,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        success INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.get(`SELECT * FROM users WHERE username='admin'`, (err, row) => {
      if (!row) {
        db.run(
          `INSERT INTO users (username, password, is_admin) VALUES ('admin', '123456', 1)`
        );
      }
    });
  });
}

function checkLogin(username, password) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
      if (err) return reject(err);
      if (!row)
        return resolve({ success: false, message: "Kullanıcı bulunamadı" });
      if (row.is_suspended)
        return resolve({ success: false, message: "Kullanıcı askıya alınmış" });
      if (row.password !== password)
        return resolve({ success: false, message: "Şifre hatalı" });

      db.run(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [
        row.id,
      ]);
      resolve({ success: true, user: row });
    });
  });
}

function logLoginAttempt(username, success) {
  const line = `${new Date().toISOString()} | user: ${username} | success: ${success}\n`;
  fs.appendFileSync(logPath, line);
  db.run(`INSERT INTO login_logs (username, success) VALUES (?, ?)`, [
    username,
    success ? 1 : 0,
  ]);
}

function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, username, is_admin, is_suspended, last_login FROM users`,
      [],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function addUser(user) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)`,
      [user.username, user.password, user.is_admin ? 1 : 0],
      (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
}

function toggleUserSuspension(id, suspend) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET is_suspended = ? WHERE id = ?`,
      [suspend ? 1 : 0, id],
      (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
}

module.exports = {
  initDB,
  checkLogin,
  logLoginAttempt,
  getAllUsers,
  addUser,
  toggleUserSuspension,
};
