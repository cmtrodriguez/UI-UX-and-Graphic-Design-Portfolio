import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (fs.existsSync(path.join(__dirname, ".env"))) {
  dotenv.config();
}

// Initialize Supabase if credentials are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Validate Supabase configuration
const isPlaceholderUrl = supabaseUrl?.includes("cruxd.supabase.co");
const isValidUrl = supabaseUrl && supabaseUrl.startsWith("https://");

const supabase = (isValidUrl && !isPlaceholderUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (isPlaceholderUrl) {
  console.warn("⚠️ SUPABASE_URL is still using the placeholder 'cruxd'. Please update it in your environment variables.");
} else if (supabaseUrl && !isValidUrl) {
  console.warn("⚠️ SUPABASE_URL is invalid. It should start with 'https://'.");
} else if (supabase) {
  console.log("✅ Supabase client initialized successfully.");
} else {
  console.log("ℹ️ Supabase not configured. Running in Local Mode (SQLite + Local Storage).");
}

// Initialize SQLite as fallback
const dbPath = process.env.VERCEL === "1" ? "/tmp/portfolio.db" : "portfolio.db";
const db = new Database(dbPath);

// Ensure uploads directory exists for local fallback
const uploadsDir = process.env.VERCEL === "1" ? "/tmp/uploads" : path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer - use memory storage for Supabase, disk for local
const storage = supabase ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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

const app = express();

app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// API Routes
app.get("/api/config-status", (req, res) => {
  res.json({
    supabaseEnabled: !!supabase,
    isPlaceholder: isPlaceholderUrl,
    isValidUrl: isValidUrl,
    hasKey: !!supabaseKey
  });
});

app.post("/api/verify-password", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD is not set in environment variables");
    return res.status(500).json({ error: "Server configuration error: ADMIN_PASSWORD is not set." });
  }

  if (password?.trim() === adminPassword.trim()) {
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
  console.log("POST /api/projects received", {
    hasFile: !!req.file,
    hasBody: !!req.body,
    passwordMatch: req.body?.password === process.env.ADMIN_PASSWORD
  });

  const { password, project: projectJson } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    console.warn("Unauthorized project upload attempt");
    return res.status(401).json({ error: "Unauthorized: Invalid password" });
  }

  if (!projectJson) {
    return res.status(400).json({ error: "Missing project data" });
  }

  const project = JSON.parse(projectJson);
  let imagePath = project.image;

  if (supabase && req.file) {
    try {
      console.log("Uploading to Supabase Storage...");
      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error("Supabase storage error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);
        
      imagePath = publicUrl;
      console.log("Supabase upload successful:", imagePath);
    } catch (e) {
      console.error("Supabase upload error:", e);
      let errorMessage = e.message || 'Unknown error';
      if (errorMessage.includes('ENOTFOUND')) {
        errorMessage = "Could not connect to Supabase. Your SUPABASE_URL might be incorrect or have a typo.";
      }
      return res.status(500).json({ error: `Failed to upload to Supabase Storage: ${errorMessage}` });
    }
  } else if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }

  const { id, title, category, description, tools, tags, color, status, case_study_content } = project;

  if (supabase) {
    try {
      console.log("Inserting into Supabase Database...");
      const { error } = await supabase.from('projects').insert([{
        id, title, category, description, 
        tools: JSON.stringify(tools), 
        tags: JSON.stringify(tags || []), 
        image: imagePath, 
        color, 
        status: status || 'Published', 
        case_study_content
      }]);
      if (error) {
        console.error("Supabase database error:", error);
        throw error;
      }
      console.log("Supabase insert successful");
      return res.json({ success: true });
    } catch (e) {
      console.error("Supabase insert error:", e);
      let errorMessage = e.message || 'Unknown error';
      if (errorMessage.includes('ENOTFOUND')) {
        errorMessage = "Could not connect to Supabase. Your SUPABASE_URL might be incorrect or have a typo.";
      }
      return res.status(500).json({ error: `Failed to insert into Supabase: ${errorMessage}` });
    }
  }

  // SQLite Fallback
  console.log("Falling back to SQLite...");
  const stmt = db.prepare(`
    INSERT INTO projects (id, title, category, description, tools, tags, image, color, status, case_study_content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    stmt.run(id, title, category, description, JSON.stringify(tools), JSON.stringify(tags || []), imagePath, color, status || 'Published', case_study_content);
    res.json({ success: true });
  } catch (e) {
    console.error("SQLite insert error:", e);
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

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if email service is configured
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    const missing = [];
    if (!emailUser) missing.push("EMAIL_USER");
    if (!emailPass) missing.push("EMAIL_PASS");
    
    console.error(`Contact Form Error: Missing ${missing.join(", ")}`);
    return res.status(500).json({ 
      error: `Configuration Missing: Please add ${missing.join(" and ")} to your Environment Variables in Settings.` 
    });
  }

  try {
    console.log(`Attempting to send email from: ${emailUser}`);
    
    // Configure transporter for Gmail with explicit settings
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: emailUser.trim(),
        pass: emailPass.trim(),
      },
      debug: true, // Show debug output in server logs
      logger: true // Log information in server logs
    });

    // Verify connection configuration
    try {
      await transporter.verify();
      console.log("SMTP Connection verified successfully");
    } catch (verifyError) {
      console.error("SMTP Verification Failed:", verifyError);
      throw new Error(`Connection Failed: ${verifyError.message}`);
    }

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: "rodriguez.cmt7@gmail.com",
      subject: subject || `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #f27d26; padding-bottom: 10px;">New Contact Form Submission</h2>
          <div style="margin-top: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap; line-height: 1.6; color: #444;">${message}</div>
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">Sent from your Portfolio Website</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    res.json({ success: true });
  } catch (error) {
    console.error("Detailed Email Error:", error);
    
    let userFriendlyMessage = "Failed to send email.";
    
    if (error.message.includes("Connection Failed")) {
      userFriendlyMessage = `Connection Error: ${error.message}`;
    } else if (error.code === 'EAUTH') {
      userFriendlyMessage = "Authentication Failed: Please double-check your App Password. Ensure it's the 16-character code from Google.";
    } else if (error.code === 'ESOCKET') {
      userFriendlyMessage = "Network Error: Could not connect to Gmail. Please try again in a few moments.";
    } else {
      userFriendlyMessage = `Error: ${error.message || "Unknown error occurred"}`;
    }
    
    res.status(500).json({ error: userFriendlyMessage });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message || "An unexpected error occurred",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

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

// Only start the server if we're not running as a Vercel function
if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
