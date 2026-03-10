import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DATA_FILE = path.join(process.cwd(), 'data.json');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Hardcoded fallback data in case both DB and file fail
const DEFAULT_CONTENT = {
  hero: { title: "專業法律服務", subtitle: "守護您的權益", description: "提供最專業的法律諮詢與訴訟代理" },
  about: { title: "關於陳律師", avatarUrl: "", points: [] },
  expertise: [],
  judgments: [],
  contact: { email: "", phone: "", address: "" }
};

export async function getRawContent() {
  let localData = DEFAULT_CONTENT;
  try {
    if (fs.existsSync(DATA_FILE)) {
      localData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('File Error:', err);
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 1)
        .single();

      if (!error && data) {
        let contentData = data.content;
        while (typeof contentData === 'string') {
          try {
            const parsed = JSON.parse(contentData);
            if (typeof parsed === 'string' && parsed === contentData) break;
            contentData = parsed;
          } catch (e) { break; }
        }
        if (Array.isArray(contentData) && contentData.length > 0) {
          contentData = contentData[0];
        }
        if (contentData && contentData.content && !contentData.hero) {
          contentData = contentData.content;
          while (typeof contentData === 'string') {
            try {
              const parsed = JSON.parse(contentData);
              if (typeof parsed === 'string' && parsed === contentData) break;
              contentData = parsed;
            } catch (e) { break; }
          }
          if (Array.isArray(contentData) && contentData.length > 0) {
            contentData = contentData[0];
          }
        }
        return contentData || localData;
      }
    }
  } catch (err) {
    console.error('DB Error:', err);
  }

  return localData;
}

export async function getContent() {
  const contentData = await getRawContent();
  const localData = DEFAULT_CONTENT;

  const parseArray = (arr: any) => {
    if (typeof arr === 'string') {
      try { return JSON.parse(arr); } catch (e) { return []; }
    }
    return Array.isArray(arr) ? arr : [];
  };

  const parsedExpertise = parseArray(contentData.expertise);
  const parsedJudgments = parseArray(contentData.judgments);
  const parsedAboutPoints = parseArray(contentData.about?.points);

  return {
    ...localData,
    ...contentData,
    hero: {
      ...localData.hero,
      ...contentData.hero,
      // 確保 imageUrl 有被傳遞
      imageUrl: contentData.hero?.imageUrl || localData.hero?.imageUrl
    },
    about: {
      title: contentData.about?.title || localData.about?.title || "關於陳律師",
      avatarUrl: contentData.about?.avatarUrl || localData.about?.avatarUrl,
      points: parsedAboutPoints.length > 0 ? parsedAboutPoints : (localData.about?.points || [])
    },
    expertise: parsedExpertise.length > 0 ? parsedExpertise : localData.expertise,
    judgments: parsedJudgments.length > 0 ? parsedJudgments : localData.judgments,
    contact: contentData.contact || localData.contact
  };
}

// db.ts 修正後的 updateContent 函數
export async function updateContent(newContent: any) {
  const existingContent = await getRawContent();
  const mergedContent = { ...existingContent, ...newContent };

  if (supabase) {
    console.log('Updating content in Supabase...');
    // ✅ 修正：不要使用 JSON.stringify，直接傳入 mergedContent 物件
    // Supabase SDK 會自動處理 JSONB 格式
    const { error } = await supabase
      .from('site_content')
      .upsert({ id: 1, content: mergedContent });

    if (error) throw error;
    return { success: true };
  }

  // 本地檔案寫入邏輯保持不變...
  try {
    const contentToSave = JSON.stringify(mergedContent, null, 2);
    fs.writeFileSync(DATA_FILE, contentToSave);
    return { success: true };
  } catch (err) {
    console.error('Local File Write Error:', err);
    throw err;
  }
}
