import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getContent, updateContent } from "./db.js";

const SECRET_KEY = process.env.JWT_SECRET || "lawyer-cms-secret-key";
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "未授權" });

  try {
    jwt.verify(token, SECRET_KEY);
    const { currentPassword, newPassword } = req.body;
    
    const content = await getContent();
    const currentHash = content?.admin?.passwordHash || DEFAULT_PASSWORD_HASH;

    if (!bcrypt.compareSync(currentPassword, currentHash)) {
      return res.status(401).json({ error: "目前密碼不正確" });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    
    // We update the whole object, but updateContent now merges
    await updateContent({ 
      admin: { 
        ...content.admin,
        passwordHash: newHash 
      } 
    });

    res.json({ message: "密碼更新成功" });
  } catch (err) {
    res.status(401).json({ error: "無效的 Token" });
  }
}
