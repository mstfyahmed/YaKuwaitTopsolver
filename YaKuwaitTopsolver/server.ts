import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import multer from "multer";
import { Server as SocketIOServer } from "socket.io";
import http from "http";

const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS universities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    university_id INTEGER,
    name TEXT,
    description TEXT,
    category TEXT,
    font TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (university_id) REFERENCES universities(id)
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    name TEXT,
    description TEXT,
    price REAL,
    font TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    label TEXT DEFAULT 'مشروع',
    outputs TEXT,
    outputs_label TEXT DEFAULT 'المخرجات',
    delivery_date TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER,
    file_path TEXT,
    file_type TEXT,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS info_boxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    text TEXT,
    bg_color TEXT DEFAULT '#ffffff',
    text_color TEXT DEFAULT '#000000',
    text_size TEXT DEFAULT 'text-lg',
    font_family TEXT DEFAULT 'sans',
    shape TEXT DEFAULT 'rounded',
    is_bold BOOLEAN DEFAULT 0,
    has_3d_shadow BOOLEAN DEFAULT 0,
    width INTEGER DEFAULT 200,
    height INTEGER DEFAULT 100,
    pos_x INTEGER DEFAULT 0,
    pos_y INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    university_id INTEGER,
    subject_id INTEGER,
    test_type TEXT,
    date TEXT,
    time_slot TEXT,
    syllabus_url TEXT,
    user_phone TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  );
`);

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN title TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE universities ADD COLUMN sort_order INTEGER DEFAULT 0");
} catch (e) {}

try {
  db.exec("ALTER TABLE universities ADD COLUMN description TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN text_size TEXT DEFAULT 'text-lg'");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN font_family TEXT DEFAULT 'sans'");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN shape TEXT DEFAULT 'rounded'");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN is_bold BOOLEAN DEFAULT 0");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN has_3d_shadow BOOLEAN DEFAULT 0");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN width INTEGER DEFAULT 200");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN height INTEGER DEFAULT 100");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN pos_x INTEGER DEFAULT 0");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN pos_y INTEGER DEFAULT 0");
} catch (e) {}

try {
  db.exec("ALTER TABLE info_boxes ADD COLUMN file_url TEXT");
} catch (e) {}

// Migration: Ensure sort_order exists (for existing databases)
try {
  db.exec("ALTER TABLE subjects ADD COLUMN sort_order INTEGER DEFAULT 0");
} catch (e) {}
try {
  db.exec("ALTER TABLE subjects ADD COLUMN category TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE subjects ADD COLUMN font TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE subjects ADD COLUMN color TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE plans ADD COLUMN sort_order INTEGER DEFAULT 0");
} catch (e) {}
try {
  db.exec("ALTER TABLE plans ADD COLUMN font TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE plans ADD COLUMN color TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE plans ADD COLUMN label TEXT DEFAULT 'مشروع'");
} catch (e) {}
try {
  db.exec("ALTER TABLE plans ADD COLUMN outputs TEXT DEFAULT '[\"PD1\", \"PD2\"]'");
} catch (e) {}

try {
  db.exec("ALTER TABLE plans ADD COLUMN outputs_label TEXT DEFAULT 'المخرجات'");
} catch (e) {}

try {
  db.exec("ALTER TABLE plans ADD COLUMN sample_title TEXT DEFAULT 'نموذج العمل'");
} catch (e) {}

try {
  db.exec("ALTER TABLE plans ADD COLUMN sample_subtitle TEXT DEFAULT 'استعراض أو تحميل النموذج المعتمد'");
} catch (e) {}

try {
  db.exec("ALTER TABLE plans ADD COLUMN delivery_date TEXT");
} catch (e) {}

// Seed Initial Data
const seed = () => {
  const unis = ["ACK", "ACM", "AUM", "AUK", "AIU"];
  const insertUni = db.prepare("INSERT OR IGNORE INTO universities (name) VALUES (?)");
  unis.forEach(u => insertUni.run(u));

  const aum = db.prepare("SELECT id FROM universities WHERE name = 'AUM'").get();
  if (aum) {
    const subjects = [
      ["Financial Accounting (ACT300)", "Accounting", "1 خطة متاحة"],
      ["Managerial Accounting (ACT310)", "Accounting", "1 خطة متاحة"],
      ["Intermediate Accounting I (ACT410)", "Accounting", "1 خطة متاحة"],
      ["Intermediate Accounting II (ACY410)", "Accounting", "1 خطة متاحة"],
      ["Cost Accounting (ACT470)", "Accounting", "1 خطة متاحة"],
      ["Modern Architecture (AD454)", "Arts & Design", "1 خطة متاحة"],
      ["Modern Mechanics (PHY5172)", "Physics", "1 خطة متاحة"],
      ["Modern Physics (PHYS342)", "Physics", "1 خطة متاحة"],
      ["Thermal and Energy Science (AE200)", "Mechanical Engineering", "1 خطة متاحة"],
      ["Building Envelope Design and Thermal Loads (AE413)", "Mechanical Engineering", "1 خطة متاحة"],
      ["Thermal and Energy Science (CVL299)", "Mechanical Engineering", "1 خطة متاحة"],
      ["Engineering Acoustics (AE415)", "Mechanical Engineering", "1 خطة متاحة"],
      ["Architectural Engineering (AE311)", "Mechanical Engineering", "1 خطة متاحة"],
      ["Technology and Research Methods (BUS230 (eng))", "English", "6 خطة متاحة"]
    ];

    const insertSub = db.prepare("INSERT INTO subjects (university_id, name, category, description) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE name = ?)");
    subjects.forEach(s => insertSub.run(aum.id, s[0], s[1], s[2], s[0]));

    // Add plans for BUS230
    const bus230 = db.prepare("SELECT id FROM subjects WHERE name LIKE 'Technology and Research Methods%'").get();
    if (bus230) {
      const insertPlan = db.prepare("INSERT INTO plans (subject_id, name, price) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM plans WHERE subject_id = ? AND name = ?)");
      for (let i = 1; i <= 6; i++) {
        insertPlan.run(bus230.id, `Assignment ${i}`, 10, bus230.id, `Assignment ${i}`);
      }
    }
    
    // Add default plans for others
    const otherSubs = db.prepare("SELECT id, name FROM subjects WHERE name NOT LIKE 'Technology and Research Methods%'").all();
    otherSubs.forEach(s => {
      const insertPlan = db.prepare("INSERT INTO plans (subject_id, name, price) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM plans WHERE subject_id = ? AND name = ?)");
      insertPlan.run(s.id, "Assignment 1", 10, s.id, "Assignment 1");
    });
  }

  const defaultSettings = [
    ["site_name", "Yakuwait Top Solver"],
    ["hero_title", "Yakuwait"],
    ["hero_subtitle", "Top Solver"],
    ["hero_description", "الحل الأمثل لجميع مهامك الدراسية بأعلى جودة ودقة متناهية"],
    ["logo_size", "56"],
    ["logo_url", ""],
    ["whatsapp_number", "967738118033"],
    ["whatsapp_prefix", "السلام عليكم"],
    ["whatsapp_button_text", "اطلب عبر واتساب"],
    ["ui_texts", "{}"],
    ["primary_color", "#000000"],
    ["secondary_color", "#ffffff"],
    ["accent_color", "#f3f4f6"],
    ["admin_email", "mstfyahmedsif@gmail.com"],
    ["admin_password", "mstfymstfy737216610"],
    ["plan_card_size", "medium"],
    ["layout_mode", "map"],
    ["map_border_color", "#06b6d4"],
    ["map_fill_color", "rgba(6, 182, 212, 0.05)"],
    ["map_bg_color", "#050510"],
    ["map_font_family", "Tajawal"],
    ["map_title", "Yakuwait Top Solver"],
    ["map_elements_config", "{}"]
  ];
  const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  defaultSettings.forEach(s => insertSetting.run(s[0], s[1]));
  
  // Force update password if it's the old one
  db.prepare("UPDATE settings SET value = 'mstfymstfy737216610' WHERE key = 'admin_password' AND value = 'mstfymstfy'").run();
};
seed();

const app = express();
app.use(express.json());

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// API Routes
app.get("/api/universities", (req, res) => {
  const unis = db.prepare("SELECT * FROM universities ORDER BY sort_order ASC, name ASC").all();
  res.json(unis);
});

app.get("/api/info-boxes", (req, res) => {
  const boxes = db.prepare("SELECT * FROM info_boxes ORDER BY sort_order ASC, id ASC").all();
  res.json(boxes);
});

app.get("/api/subjects/:universityId", (req, res) => {
  const subjects = db.prepare("SELECT * FROM subjects WHERE university_id = ? ORDER BY sort_order ASC, name ASC").all(req.params.universityId);
  res.json(subjects);
});

app.get("/api/plans/:subjectId", (req, res) => {
  const plans = db.prepare(`
    SELECT p.*, s.file_path as sample_file_path, s.file_type as sample_file_type 
    FROM plans p 
    LEFT JOIN samples s ON p.id = s.plan_id 
    WHERE p.subject_id = ? 
    ORDER BY p.sort_order ASC, p.name ASC
  `).all(req.params.subjectId);
  
  const plansWithSample = plans.map((p: any) => {
    const { sample_file_path, sample_file_type, ...planData } = p;
    if (sample_file_path) {
      planData.sample = { file_path: sample_file_path, file_type: sample_file_type };
    }
    return planData;
  });
  
  res.json(plansWithSample);
});

app.get("/api/plan/:planId", (req, res) => {
  const plan = db.prepare(`
    SELECT p.*, s.name as subject_name, u.name as university_name 
    FROM plans p 
    JOIN subjects s ON p.subject_id = s.id 
    JOIN universities u ON s.university_id = u.id 
    WHERE p.id = ?
  `).get(req.params.planId);
  const sample = db.prepare("SELECT * FROM samples WHERE plan_id = ?").get(req.params.planId);
  res.json({ ...plan, sample });
});

app.get("/api/settings", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings").all();
  const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  res.json(config);
});

app.get("/api/bookings/available", (req, res) => {
  const { date } = req.query;
  const bookings = db.prepare("SELECT time_slot FROM bookings WHERE date = ? AND status != 'cancelled'").all(date);
  res.json(bookings.map((b: any) => b.time_slot));
});

app.post("/api/bookings", (req, res) => {
  const { university_id, subject_id, test_type, date, time_slot, syllabus_url, user_phone } = req.body;
  
  // Check if slot is already taken
  const existing = db.prepare("SELECT id FROM bookings WHERE date = ? AND time_slot = ? AND status != 'cancelled'").get(date, time_slot);
  if (existing) {
    return res.status(400).json({ error: "هذا الوقت محجوز مسبقاً، يرجى اختيار وقت آخر." });
  }

  const result = db.prepare(`
    INSERT INTO bookings (university_id, subject_id, test_type, date, time_slot, syllabus_url, user_phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(university_id, subject_id, test_type, date, time_slot, syllabus_url || null, user_phone || null);
  
  res.json({ success: true, id: result.lastInsertRowid });
});

app.get("/api/admin/bookings", (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, u.name as university_name, s.name as subject_name 
    FROM bookings b
    JOIN universities u ON b.university_id = u.id
    JOIN subjects s ON b.subject_id = s.id
    ORDER BY b.date DESC, b.time_slot ASC
  `).all();
  res.json(bookings);
});

// Admin Routes
app.use("/api/admin", (req, res, next) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      const io = req.app.get("io");
      console.log(`[Socket] Emitting data_updated for ${req.method} ${req.originalUrl}, io defined: ${!!io}`);
      if (io) {
        io.emit("data_updated");
      }
    }
  });
  next();
});

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  const adminEmail = db.prepare("SELECT value FROM settings WHERE key = 'admin_email'").get().value;
  const adminPass = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get().value;
  if (email === adminEmail && password === adminPass) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

app.post("/api/admin/settings", (req, res) => {
  const updates = req.body;
  const updateStmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  Object.entries(updates).forEach(([key, value]) => {
    updateStmt.run(key, String(value));
  });
  res.json({ success: true });
});

app.post("/api/admin/info-boxes", (req, res) => {
  const { title, text, bg_color, text_color, text_size, font_family, shape, is_bold, has_3d_shadow, width, height, pos_x, pos_y, file_url } = req.body;
  const result = db.prepare(`
    INSERT INTO info_boxes 
    (title, text, bg_color, text_color, text_size, font_family, shape, is_bold, has_3d_shadow, width, height, pos_x, pos_y, file_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title || '',
    text || '', 
    bg_color || '#ffffff', 
    text_color || '#000000', 
    text_size || 'text-lg',
    font_family || 'sans',
    shape || 'rounded',
    is_bold ? 1 : 0,
    has_3d_shadow ? 1 : 0,
    width || 200,
    height || 100,
    pos_x || 0,
    pos_y || 0,
    file_url || ''
  );
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/admin/info-boxes/:id", (req, res) => {
  const { title, text, bg_color, text_color, text_size, font_family, shape, is_bold, has_3d_shadow, width, height, pos_x, pos_y, file_url } = req.body;
  db.prepare(`
    UPDATE info_boxes 
    SET title = ?, text = ?, bg_color = ?, text_color = ?, text_size = ?, font_family = ?, shape = ?, is_bold = ?, has_3d_shadow = ?, width = ?, height = ?, pos_x = ?, pos_y = ?, file_url = ? 
    WHERE id = ?
  `).run(
    title, text, bg_color, text_color, text_size, font_family, shape, is_bold ? 1 : 0, has_3d_shadow ? 1 : 0, width, height, pos_x, pos_y, file_url, req.params.id
  );
  res.json({ success: true });
});

app.delete("/api/admin/info-boxes/:id", (req, res) => {
  db.prepare("DELETE FROM info_boxes WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.post("/api/admin/universities", (req, res) => {
  const { name, description } = req.body;
  db.prepare("INSERT INTO universities (name, description) VALUES (?, ?)").run(name, description);
  res.json({ success: true });
});

app.put("/api/admin/universities/:id", (req, res) => {
  const { name, description } = req.body;
  db.prepare("UPDATE universities SET name = ?, description = ? WHERE id = ?").run(name, description, req.params.id);
  res.json({ success: true });
});

app.post("/api/admin/subjects", (req, res) => {
  const { university_id, name, category, description, font, color } = req.body;
  const result = db.prepare("INSERT INTO subjects (university_id, name, category, description, font, color) VALUES (?, ?, ?, ?, ?, ?)").run(university_id, name, category, description, font, color);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/admin/subjects/:id", (req, res) => {
  const { name, category, description, font, color } = req.body;
  db.prepare("UPDATE subjects SET name = ?, category = ?, description = ?, font = ?, color = ? WHERE id = ?").run(name, category, description, font, color, req.params.id);
  res.json({ success: true, id: req.params.id });
});

app.post("/api/admin/plans", (req, res) => {
  const { subject_id, name, description, price, font, color, outputs, label, outputs_label, delivery_date } = req.body;
  const result = db.prepare("INSERT INTO plans (subject_id, name, description, price, font, color, outputs, label, outputs_label, delivery_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(subject_id, name, description, price, font, color, outputs || '["PD1", "PD2"]', label || 'مشروع', outputs_label || 'المخرجات', delivery_date || null);
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put("/api/admin/plans/:id", (req, res) => {
  const { name, description, price, font, color, outputs, label, outputs_label, sample_title, sample_subtitle, delivery_date } = req.body;
  db.prepare("UPDATE plans SET name = ?, description = ?, price = ?, font = ?, color = ?, outputs = ?, label = ?, outputs_label = ?, sample_title = ?, sample_subtitle = ?, delivery_date = ? WHERE id = ?").run(name, description, price, font, color, outputs, label, outputs_label || 'المخرجات', sample_title || 'نموذج العمل', sample_subtitle || 'استعراض أو تحميل النموذج المعتمد', delivery_date || null, req.params.id);
  res.json({ success: true });
});

app.delete("/api/admin/subjects/:id", (req, res) => {
  db.prepare("DELETE FROM subjects WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.delete("/api/admin/plans/:id", (req, res) => {
  db.prepare("DELETE FROM plans WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/admin/all-subjects", (req, res) => {
  const subjects = db.prepare("SELECT s.*, u.name as university_name FROM subjects s JOIN universities u ON s.university_id = u.id ORDER BY s.sort_order ASC, s.name ASC").all();
  res.json(subjects);
});

app.post("/api/admin/logo", upload.single("logo"), (req: any, res) => {
  const logo_url = `/uploads/${req.file.filename}`;
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('logo_url', ?)").run(logo_url);
  res.json({ success: true, logo_url });
});

app.post("/api/admin/upload", upload.single("file"), (req: any, res) => {
  const file_url = `/uploads/${req.file.filename}`;
  res.json({ success: true, file_url });
});

app.post("/api/admin/samples", upload.single("file"), (req: any, res) => {
  const { plan_id } = req.body;
  const file_path = `/uploads/${req.file.filename}`;
  const file_type = req.file.mimetype.includes("pdf") ? "pdf" : "image";
  
  // Delete old sample if exists
  db.prepare("DELETE FROM samples WHERE plan_id = ?").run(plan_id);
  db.prepare("INSERT INTO samples (plan_id, file_path, file_type) VALUES (?, ?, ?)").run(plan_id, file_path, file_type);
  res.json({ success: true });
});

app.put("/api/admin/universities/:id", (req, res) => {
  const { name } = req.body;
  db.prepare("UPDATE universities SET name = ? WHERE id = ?").run(name, req.params.id);
  res.json({ success: true });
});

app.delete("/api/admin/universities/:id", (req, res) => {
  db.prepare("DELETE FROM universities WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.post("/api/admin/reorder-universities", (req, res) => {
  const { ids } = req.body;
  const update = db.prepare("UPDATE universities SET sort_order = ? WHERE id = ?");
  db.transaction(() => {
    ids.forEach((id: number, index: number) => update.run(index, id));
  })();
  res.json({ success: true });
});

app.post("/api/admin/reorder-subjects", (req, res) => {
  const { ids } = req.body; // Array of IDs in order
  const update = db.prepare("UPDATE subjects SET sort_order = ? WHERE id = ?");
  db.transaction(() => {
    ids.forEach((id: number, index: number) => update.run(index, id));
  })();
  res.json({ success: true });
});

app.post("/api/admin/reorder-plans", (req, res) => {
  const { ids } = req.body; // Array of IDs in order
  const update = db.prepare("UPDATE plans SET sort_order = ? WHERE id = ?");
  db.transaction(() => {
    ids.forEach((id: number, index: number) => update.run(index, id));
  })();
  res.json({ success: true });
});

async function startServer() {
  const PORT = 3000;
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: "*" }
  });

  // Attach io to app so routes can use it
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => res.sendFile(path.resolve("dist/index.html")));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
