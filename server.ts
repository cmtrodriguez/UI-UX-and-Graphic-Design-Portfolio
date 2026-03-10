import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Supabase if credentials are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Initialize SQLite as fallback
const db = new Database("portfolio.db");

// Ensure uploads directory exists for local fallback
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer - use memory storage for Supabase, disk for local
const storage = supabase ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Initialize local database
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    tools TEXT,
    tags TEXT,
    image TEXT,
    color TEXT,
    status TEXT DEFAULT 'Published',
    case_study_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use("/uploads", express.static("uploads"));

  // API Routes
  app.post("/api/verify-password", (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    const isAdmin = req.query.admin === 'true';

    if (supabase) {
      try {
        let query = supabase.from('projects').select('*');
        if (!isAdmin) {
          query = query.eq('status', 'Published');
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data.map(p => ({
          ...p,
          tools: typeof p.tools === 'string' ? JSON.parse(p.tools) : (p.tools || []),
          tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || [])
        })));
      } catch (e) {
        console.error("Supabase fetch error:", e);
        // Fallback to SQLite if Supabase fails
      }
    }

    // SQLite Fallback
    let query = "SELECT * FROM projects";
    if (!isAdmin) {
      query += " WHERE status = 'Published'";
    }
    query += " ORDER BY created_at DESC";
    
    const projects = db.prepare(query).all();
    res.json(projects.map(p => ({
      ...p,
      tools: p.tools ? JSON.parse(p.tools) : [],
      tags: p.tags ? JSON.parse(p.tags) : []
    })));
  });

  app.post("/api/projects", upload.single("imageFile"), async (req, res) => {
    const { password, project: projectJson } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const project = JSON.parse(projectJson);
    let imagePath = project.image;

    if (supabase && req.file) {
      try {
        const file = req.file;
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName);
          
        imagePath = publicUrl;
      } catch (e) {
        console.error("Supabase upload error:", e);
        return res.status(500).json({ error: "Failed to upload to Supabase Storage" });
      }
    } else if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const { id, title, category, description, tools, tags, color, status, case_study_content } = project;

    if (supabase) {
      try {
        const { error } = await supabase.from('projects').insert([{
          id, title, category, description, 
          tools: JSON.stringify(tools), 
          tags: JSON.stringify(tags || []), 
          image: imagePath, 
          color, 
          status: status || 'Published', 
          case_study_content
        }]);
        if (error) throw error;
        return res.json({ success: true });
      } catch (e) {
        console.error("Supabase insert error:", e);
        // Fallback to SQLite
      }
    }

    // SQLite Fallback
    const stmt = db.prepare(`
      INSERT INTO projects (id, title, category, description, tools, tags, image, color, status, case_study_content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    try {
      stmt.run(id, title, category, description, JSON.stringify(tools), JSON.stringify(tags || []), imagePath, color, status || 'Published', case_study_content);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    const { password, status } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('projects').update({ status }).eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
      } catch (e) {
        console.error("Supabase update error:", e);
      }
    }

    const stmt = db.prepare("UPDATE projects SET status = ? WHERE id = ?");
    stmt.run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/projects/:id", async (req, res) => {
    const { password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (supabase) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ success: true });
      } catch (e) {
        console.error("Supabase delete error:", e);
      }
    }

    const stmt = db.prepare("DELETE FROM projects WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
