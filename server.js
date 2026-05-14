import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;
const JWT_SECRET = 'fawang_secret_key_123'; // In prod, use env var

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure directories
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// --- DATABASE INIT ---
const db = new sqlite3.Database(path.join(__dirname, 'blog.db'));

db.serialize(() => {
  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    nickname TEXT,
    avatarUrl TEXT,
    bio TEXT,
    status TEXT DEFAULT 'pending',
    reg_ip TEXT,
    reg_reason TEXT
  )`);

  // Ensure columns exist for older DBs
  db.run(`ALTER TABLE users ADD COLUMN reg_ip TEXT`, (err) => {});
  db.run(`ALTER TABLE users ADD COLUMN reg_reason TEXT`, (err) => {});
  db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {});

  // Articles Table
  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    tag TEXT,
    thumbnailUrl TEXT,
    excerpt TEXT,
    content TEXT,
    date TEXT
  )`);

  // Comments Table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id TEXT,
    author TEXT,
    avatarUrl TEXT,
    content TEXT,
    date TEXT,
    FOREIGN KEY(article_id) REFERENCES articles(id)
  )`);

  // Config Table (Key-Value)
  db.run(`CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // Assets Table
  db.run(`CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    date TEXT
  )`);

  // Messages Table (Chat)
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER, -- NULL for global chat
    content TEXT,
    timestamp TEXT,
    type TEXT DEFAULT 'private', -- 'private' or 'global'
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  )`);

  // Seed default admin and config if empty
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO users (username, password, role, nickname, avatarUrl, bio, status) VALUES ('admin', '123', 'admin', '法王', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fawang', '痴迷于安全技术的小白帽...', 'approved')`);
    } else {
      // Ensure admin is approved if already exists
      db.run(`UPDATE users SET status = 'approved' WHERE username = 'admin'`);
    }
  });

  db.get("SELECT COUNT(*) as count FROM config", (err, row) => {
    if (row && row.count === 0) {
      const defaultCfg = {
        siteTitle: "法王 ‘s blog",
        avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Fawang",
        authorName: "法王",
        authorRole: "[ WHITE_HAT_SEC ]",
        authorDesc: "痴迷于安全技术的小白帽...\\n\\n\"孩儿立志出乡关，学不成名誓不还。\"",
        announcement: "记录自己技术增长过程的博客~\\n孩儿立志出乡关，学不成名誓不还。",
        bannerImageUrl: "",
        bannerSubtitle: "Life is a coding, I will debug it."
      };
      for (const [k, v] of Object.entries(defaultCfg)) {
        db.run(`INSERT INTO config (key, value) VALUES (?, ?)`, [k, v]);
      }
    }
  });
});

// --- MIDDLEWARE ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// --- AUTH API ---
app.post('/api/auth/register', (req, res) => {
  const { username, password, reason } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  db.get("SELECT COUNT(*) as count FROM users WHERE reg_ip = ? AND status = 'pending'", [ip], (err, row) => {
    if (row && row.count > 0) return res.status(429).json({ error: '您已有账号正在审核中，请勿重复注册。' });

    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      const status = (row && row.count === 0) ? 'approved' : 'pending';
      const role = (row && row.count === 0) ? 'admin' : 'user';
      const randomId = Math.floor(100000 + Math.random() * 900000);
      
      db.run(`INSERT INTO users (id, username, password, role, status, reg_ip, reg_reason) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [randomId, username, password, role, status, ip, reason || ''], function(err) {
        if (err) return res.status(400).json({ error: '用户名已存在或 ID 冲突，请重试。' });
        res.json({ success: true, status, id: randomId });
      });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, user) => {
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'approved') return res.status(403).json({ error: 'Account pending approval' });
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role, nickname: user.nickname, avatarUrl: user.avatarUrl, bio: user.bio } });
  });
});

app.get('/api/users/profile', authenticate, (req, res) => {
  db.get(`SELECT id, username, role, nickname, avatarUrl, bio FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});


// --- ADMIN USER MANAGEMENT ---
app.get('/api/admin/users', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.all(`SELECT id, username, role, nickname, avatarUrl, bio, status, reg_ip, reg_reason FROM users`, (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

app.put('/api/admin/users/:id/status', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.body;
  db.run(`UPDATE users SET status = ? WHERE id = ?`, [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/admin/users/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  // 1. Find user to get avatar path
  db.get(`SELECT avatarUrl FROM users WHERE id = ?`, [req.params.id], (err, user) => {
    if (user && user.avatarUrl && user.avatarUrl.includes('/uploads/')) {
      const relativePath = user.avatarUrl.split('/uploads/')[1];
      const filePath = path.join(uploadsDir, relativePath);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch(e) {}
      }
    }

    // 2. Delete from DB
    db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

app.put('/api/users/profile', authenticate, (req, res) => {
  const { nickname, avatarUrl, bio } = req.body;
  
  // 1. Get current avatar to check for cleanup
  db.get(`SELECT avatarUrl FROM users WHERE username = ?`, [req.user.username], (err, row) => {
    const oldAvatar = row ? row.avatarUrl : null;
    
    // 2. If avatar changed and old one was local upload, delete it
    if (oldAvatar && oldAvatar !== avatarUrl && oldAvatar.includes('/uploads/')) {
      const parts = oldAvatar.split('/uploads/');
      const relativePath = parts[parts.length - 1];
      const filePath = path.join(uploadsDir, relativePath);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error("Failed to delete old avatar:", e); }
      }
    }

    // 3. Update DB
    db.run(`UPDATE users SET nickname = ?, avatarUrl = ?, bio = ? WHERE username = ?`, 
      [nickname, avatarUrl, bio, req.user.username], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
  });
});

// --- CONFIG API ---
app.get('/api/config', (req, res) => {
  db.all(`SELECT * FROM config`, (err, rows) => {
    const config = {};
    rows.forEach(r => config[r.key] = r.value);
    res.json(config);
  });
});

app.post('/api/config', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const config = req.body;
  db.serialize(() => {
    const stmt = db.prepare(`REPLACE INTO config (key, value) VALUES (?, ?)`);
    for (const [k, v] of Object.entries(config)) stmt.run(k, v);
    stmt.finalize();
  });
  res.json({ success: true });
});

// --- ARTICLES API ---
app.get('/api/articles', (req, res) => {
  db.all(`SELECT * FROM articles ORDER BY date DESC`, (err, articles) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(`SELECT * FROM comments`, (err, comments) => {
      const articlesWithComments = articles.map((a) => ({
        ...a,
        comments: comments.filter((c) => c.article_id === a.id)
      }));
      res.json(articlesWithComments);
    });
  });
});

app.post('/api/articles', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { id, title, category, tag, thumbnailUrl, excerpt, content, date } = req.body;
  db.run(`REPLACE INTO articles (id, title, category, tag, thumbnailUrl, excerpt, content, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, category, tag, thumbnailUrl, excerpt, content, date], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.delete('/api/articles/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.run(`DELETE FROM articles WHERE id = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`DELETE FROM comments WHERE article_id = ?`, [req.params.id]); // Cascade delete
    res.json({ success: true });
  });
});

app.post('/api/articles/:id/comments', authenticate, (req, res) => {
  const { author, avatarUrl, content, date } = req.body;
  const commentDate = date || new Date().toISOString();
  db.run(`INSERT INTO comments (article_id, author, avatarUrl, content, date) VALUES (?, ?, ?, ?, ?)`,
    [req.params.id, author, avatarUrl, content, commentDate], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

// --- ASSETS API ---
const assetsDir = path.join(uploadsDir, 'assets');
const usersDir = path.join(uploadsDir, 'users');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir, { recursive: true });

const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const type = req.query.type;
      if (type === 'user') cb(null, usersDir);
      else cb(null, assetsDir);
    },
    filename: (req, file, cb) => {
      // Sanitize: replace spaces and problematic chars with underscores
      const safeName = file.originalname.replace(/\s+/g, '_').replace(/[\[\]]/g, '');
      cb(null, Date.now() + '-' + safeName);
    }
  })
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const host = req.get('host') || `localhost:${port}`;
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  
  const type = req.query.type;
  const folder = type === 'user' ? 'users' : 'assets';
  
  // Use relative path to avoid localhost/CORS issues
  const encodedFilename = encodeURIComponent(req.file.filename);
  const fileUrl = `/uploads/${folder}/${encodedFilename}`;
  
  if (type !== 'user') {
    db.run(`INSERT INTO assets (url, date) VALUES (?, ?)`, [fileUrl, new Date().toISOString()]);
  }
  res.json({ success: true, url: fileUrl });
});

app.get('/api/assets', (req, res) => {
  const host = req.get('host') || `localhost:${port}`;
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  
  fs.readdir(assetsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to read directory' });
    // Sort files by modified time descending
    const sortedFiles = files
      .map(fileName => ({
        name: fileName,
        time: fs.statSync(path.join(assetsDir, fileName)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time)
      .map(file => `/uploads/assets/${file.name}`);
      
    res.json(sortedFiles);
  });
});

app.delete('/api/assets/:filename', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const filename = req.params.filename;
  // Basic security check to prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  const filePath = path.join(assetsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// --- CHAT API ---
app.get('/api/chat/users', authenticate, (req, res) => {
  db.all(`SELECT id, username, nickname, avatarUrl, bio FROM users WHERE status = 'approved' AND id != ?`, [req.user.id], (err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

app.get('/api/chat/global', authenticate, (req, res) => {
  db.all(`SELECT m.*, u.username as sender_name, u.avatarUrl as sender_avatar, u.nickname as sender_nickname 
          FROM messages m 
          JOIN users u ON m.sender_id = u.id 
          WHERE m.type = 'global' 
          ORDER BY m.timestamp ASC LIMIT 100`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/chat/global', authenticate, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Empty content' });
  const timestamp = new Date().toISOString();
  db.run(`INSERT INTO messages (sender_id, content, timestamp, type) VALUES (?, ?, ?, 'global')`, 
    [req.user.id, content, timestamp], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/chat/private/:userId', authenticate, (req, res) => {
  const targetId = req.params.userId;
  db.all(`SELECT m.*, u.username as sender_name, u.avatarUrl as sender_avatar, u.nickname as sender_nickname 
          FROM messages m 
          JOIN users u ON m.sender_id = u.id 
          WHERE m.type = 'private' AND (
            (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
          ) 
          ORDER BY m.timestamp ASC`, [req.user.id, targetId, targetId, req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/chat/private/:userId', authenticate, (req, res) => {
  const targetId = req.params.userId;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Empty content' });
  const timestamp = new Date().toISOString();
  db.run(`INSERT INTO messages (sender_id, receiver_id, content, timestamp, type) VALUES (?, ?, ?, ?, 'private')`, 
    [req.user.id, targetId, content, timestamp], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/chat/updates', authenticate, (req, res) => {
  const since = req.query.since || '1970-01-01T00:00:00Z';
  
  const results = { globalCount: 0, privateCounts: {} };
  
  db.serialize(() => {
    // Count global (exclude self)
    db.get(`SELECT COUNT(*) as count FROM messages WHERE type = 'global' AND timestamp > ? AND sender_id != ?`, [since, req.user.id], (err, row) => {
      if (row) results.globalCount = row.count;
      
      // Count private sent to me
      db.all(`SELECT sender_id, COUNT(*) as count FROM messages 
              WHERE type = 'private' AND receiver_id = ? AND timestamp > ? 
              GROUP BY sender_id`, [req.user.id, since], (err, rows) => {
        if (rows) {
          rows.forEach(r => results.privateCounts[r.sender_id] = r.count);
        }
        res.json(results);
      });
    });
  });
});

app.delete('/api/admin/chat', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  
  const { type, userId, targetUserId, startDate, endDate } = req.query;
  
  let query = `DELETE FROM messages WHERE type = ?`;
  let params = [type === 'global' ? 'global' : 'private'];

  if (type === 'global') {
    if (startDate) { query += ` AND timestamp >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND timestamp <= ?`; params.push(endDate); }
  } else if (type === 'private') {
    if (userId && targetUserId) {
      query += ` AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))`;
      params.push(userId, targetUserId, targetUserId, userId);
    } else if (userId) {
      query += ` AND (sender_id = ? OR receiver_id = ?)`;
      params.push(userId, userId);
    }
    if (startDate) { query += ` AND timestamp >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND timestamp <= ?`; params.push(endDate); }
  } else if (type === 'all_private') {
    query = `DELETE FROM messages WHERE type = 'private'`;
    params = [];
    if (startDate) { query += ` AND timestamp >= ?`; params.push(startDate); }
    if (endDate) { query += ` AND timestamp <= ?`; params.push(endDate); }
  }

  db.run(query, params, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, count: this.changes, message: `${this.changes} messages deleted` });
  });
});

// --- SERVE FRONTEND ---
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  
  // SPA Fallback: Handle all other GET requests by serving index.html
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(distDir, 'index.html'));
    } else {
      next();
    }
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
