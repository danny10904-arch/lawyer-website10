import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getContent } from "./db.js";

const SECRET_KEY = process.env.JWT_SECRET || "lawyer-cms-secret-key";
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  
  try {
    const content = await getContent();
    const currentHash = content?.admin?.passwordHash || DEFAULT_PASSWORD_HASH;

    if (bcrypt.compareSync(password, currentHash)) {
      const token = jwt.sign({ role: "admin" }, SECRET_KEY, { expiresIn: "1h" });
      return res.json({ token });
    }
    res.status(401).json({ error: "密碼錯誤" });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
}
