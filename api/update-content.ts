// update-content.ts 修正建議
import jwt from "jsonwebtoken";
import { updateContent } from "./db.js";

const SECRET_KEY = process.env.JWT_SECRET || "lawyer-cms-secret-key";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "未授權" });

  try {
    jwt.verify(token, SECRET_KEY);
    
    // ✅ 確保 newData 是物件
    let newData = req.body;
    if (typeof newData === 'string') {
      newData = JSON.parse(newData);
    }

    await updateContent(newData);
    res.json({ message: "更新成功" });
  } catch (err: any) {
    console.error("API Error:", err);
    res.status(401).json({ error: err.message || "更新失敗" });
  }
}
