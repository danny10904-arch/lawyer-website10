import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import contentHandler from "./api/content.js";
import loginHandler from "./api/login.js";
import updateHandler from "./api/update-content.js";
import changePasswordHandler from "./api/change-password.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/content", (req, res) => contentHandler(req, res));
  app.post("/api/login", (req, res) => loginHandler(req, res));
  app.post("/api/update-content", (req, res) => updateHandler(req, res));
  app.post("/api/change-password", (req, res) => changePasswordHandler(req, res));

  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
