import { getContent } from "./db.js";

export default async function handler(req: any, res: any) {
  try {
    const data = await getContent();
    
    // Remove sensitive admin data before sending to client
    if (data && data.admin) {
      delete data.admin;
    }
    
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching content:", err);
    res.status(500).json({ error: "無法讀取資料庫" });
  }
}
