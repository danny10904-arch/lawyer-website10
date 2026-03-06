import { useState, useEffect, FormEvent } from "react";
import React from "react";
import { SiteContent, Expertise, Judgment } from "../types";
import { 
  Save, 
  Plus, 
  Trash2, 
  LogOut, 
  LayoutDashboard, 
  Briefcase, 
  Scale, 
  Info,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Users,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Gavel,
  ShieldCheck,
  Eye,
  EyeOff,
  Settings,
  UserCircle
} from "lucide-react";

export default function AdminPanel() {
  console.log("AdminPanel rendering, isLoggedIn:", !!localStorage.getItem("admin_token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("admin_token"));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "expertise" | "judgments" | "contact" | "settings">("hero");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchContent();
    }
  }, [isLoggedIn]);

  const fetchContent = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/content?t=${Date.now()}`);
      if (!res.ok) throw new Error("無法讀取資料");
      const data = await res.json();
      
      let parsedData = data;
      // Robust parsing similar to MainSite.tsx
      while (typeof parsedData === 'string') {
        try {
          const parsed = JSON.parse(parsedData);
          if (typeof parsed === 'string' && parsed === parsedData) break;
          parsedData = parsed;
        } catch (e) { break; }
      }
      
      if (parsedData && parsedData.content && !parsedData.hero) {
        parsedData = parsedData.content;
        while (typeof parsedData === 'string') {
          try {
            const parsed = JSON.parse(parsedData);
            if (typeof parsed === 'string' && parsed === parsedData) break;
            parsedData = parsed;
          } catch (e) { break; }
        }
      }
      
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        parsedData = parsedData[0];
      }

      if (!parsedData || !parsedData.hero) {
        throw new Error("資料格式不正確");
      }

      setContent(parsedData);
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || "載入失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        setIsLoggedIn(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("登入失敗");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
  };

  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/update-content", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.message) {
        setMessage("儲存成功！");
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("新密碼與確認密碼不符");
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.message) {
        setMessage("密碼修改成功！");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("修改失敗");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-legal-navy flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <LayoutDashboard className="text-legal-gold w-8 h-8" />
            <h1 className="text-2xl font-bold text-legal-navy">律師事務所管理系統</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">管理員密碼</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-legal-sand border-none rounded-xl p-4 pr-12 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                  placeholder="請輸入密碼"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-legal-navy/40 hover:text-legal-navy transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button className="w-full bg-legal-navy text-white py-4 rounded-xl font-bold hover:bg-legal-gold transition-colors shadow-lg">
              登入系統
            </button>
            <p className="text-center text-xs text-legal-navy/40">預設密碼為 admin123</p>
          </form>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-legal-sand flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-legal-navy mb-2">載入失敗</h2>
          <p className="text-legal-navy/60 mb-6">{fetchError}</p>
          <button 
            onClick={fetchContent}
            className="w-full bg-legal-navy text-white py-3 rounded-xl font-bold hover:bg-legal-gold transition-colors"
          >
            重新嘗試
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !content || !content.hero) {
    return (
      <div className="min-h-screen bg-legal-sand flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-legal-gold animate-spin" />
        <p className="text-legal-navy/40">正在載入管理後台...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-legal-sand flex">
      {/* Sidebar */}
      <aside className="w-64 bg-legal-navy text-white flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <LayoutDashboard className="text-legal-gold w-6 h-6" />
          <span className="font-bold tracking-tight">後端管理系統</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("hero")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "hero" ? "bg-legal-gold text-white" : "hover:bg-white/5 text-white/60"}`}
          >
            <Info className="w-5 h-5" /> 首頁文字
          </button>
          <button 
            onClick={() => setActiveTab("about")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "about" ? "bg-legal-gold text-white" : "hover:bg-white/5 text-white/60"}`}
          >
            <Users className="w-5 h-5" /> 關於我
          </button>
          <button 
            onClick={() => setActiveTab("expertise")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "expertise" ? "bg-legal-gold text-white" : "hover:bg-white/5 text-white/60"}`}
          >
            <Briefcase className="w-5 h-5" /> 專業領域
          </button>
          <button 
            onClick={() => setActiveTab("judgments")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "judgments" ? "bg-legal-gold text-white" : "hover:bg-white/5 text-white/60"}`}
          >
            <Scale className="w-5 h-5" /> 實務經歷
          </button>
          <button 
            onClick={() => setActiveTab("contact")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "contact" ? "bg-legal-gold text-white" : "hover:bg-white/5 text-white/60"}`}
          >
            <Mail className="w-5 h-5" /> 聯絡資訊
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "settings" ? "bg-legal-gold text-white" : "hover:bg-white/5 text-white/60"}`}
          >
            <Settings className="w-5 h-5" /> 系統設定
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" /> 登出
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-legal-navy">
              {activeTab === "hero" && "首頁文字編輯"}
              {activeTab === "about" && "關於我區塊編輯"}
              {activeTab === "expertise" && "專業領域管理"}
              {activeTab === "judgments" && "實務經歷管理"}
              {activeTab === "contact" && "聯絡資訊編輯"}
              {activeTab === "settings" && "系統帳號設定"}
            </h2>
            <p className="text-legal-navy/40 mt-1">修改內容後請記得點擊儲存按鈕</p>
          </div>
          <div className="flex items-center gap-4">
            {message && (
              <span className="text-green-600 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5" /> {message}
              </span>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-legal-navy text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-legal-gold transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              儲存變更
            </button>
          </div>
        </header>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-legal-navy/5">
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">主標題 (第一行)</label>
                <input 
                  type="text" 
                  value={content.hero.title}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                  className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">主標題 (金黃色部分)</label>
                <input 
                  type="text" 
                  value={content.hero.subtitle}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                  className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">首頁描述文字</label>
                <textarea 
                  rows={4}
                  value={content.hero.description}
                  onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                  className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">區塊標題</label>
                <input 
                  type="text" 
                  value={content.about.title}
                  onChange={(e) => setContent({ ...content, about: { ...content.about, title: e.target.value } })}
                  className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">個人大頭貼照片 URL</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-legal-sand border-2 border-legal-gold flex-shrink-0">
                    {content.about.avatarUrl ? (
                      <img src={content.about.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-legal-navy/20">
                        <UserCircle className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={content.about.avatarUrl || ""}
                    onChange={(e) => setContent({ ...content, about: { ...content.about, avatarUrl: e.target.value } })}
                    className="flex-grow bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                    placeholder="請輸入照片網址 (例如: https://...)"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <label className="block text-sm font-bold text-legal-navy uppercase tracking-widest">核心價值點 (共 3 點)</label>
                {content.about.points.map((point, idx) => (
                  <div key={idx} className="p-6 bg-legal-sand rounded-2xl space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1/4">
                        <label className="block text-[10px] font-bold text-legal-navy/40 mb-1 uppercase">編號</label>
                        <input 
                          type="text" 
                          value={point.number}
                          onChange={(e) => {
                            const newPoints = [...content.about.points];
                            newPoints[idx].number = e.target.value;
                            setContent({ ...content, about: { ...content.about, points: newPoints } });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-sm outline-none"
                        />
                      </div>
                      <div className="w-3/4">
                        <label className="block text-[10px] font-bold text-legal-navy/40 mb-1 uppercase">標題</label>
                        <input 
                          type="text" 
                          value={point.title}
                          onChange={(e) => {
                            const newPoints = [...content.about.points];
                            newPoints[idx].title = e.target.value;
                            setContent({ ...content, about: { ...content.about, points: newPoints } });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-legal-navy/40 mb-1 uppercase">描述</label>
                      <textarea 
                        rows={2}
                        value={point.description}
                        onChange={(e) => {
                          const newPoints = [...content.about.points];
                          newPoints[idx].description = e.target.value;
                          setContent({ ...content, about: { ...content.about, points: newPoints } });
                        }}
                        className="w-full bg-white border-none rounded-lg p-2 text-sm outline-none resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "expertise" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-legal-navy">專業領域列表</h3>
                <button 
                  onClick={() => {
                    const newItem: Expertise = { title: "新領域", description: "請輸入描述", iconName: "Scale", cases: "案號" };
                    setContent({ ...content, expertise: [...content.expertise, newItem] });
                  }}
                  className="flex items-center gap-2 text-legal-gold font-bold text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" /> 新增領域
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.expertise.map((item, idx) => (
                  <div key={idx} className="p-6 bg-legal-sand rounded-2xl relative group">
                    <button 
                      onClick={() => {
                        const newList = content.expertise.filter((_, i) => i !== idx);
                        setContent({ ...content, expertise: newList });
                      }}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={item.title}
                        onChange={(e) => {
                          const newList = [...content.expertise];
                          newList[idx].title = e.target.value;
                          setContent({ ...content, expertise: newList });
                        }}
                        className="w-full bg-white border-none rounded-lg p-3 font-bold text-legal-navy outline-none"
                        placeholder="領域名稱"
                      />
                      <textarea 
                        rows={3}
                        value={item.description}
                        onChange={(e) => {
                          const newList = [...content.expertise];
                          newList[idx].description = e.target.value;
                          setContent({ ...content, expertise: newList });
                        }}
                        className="w-full bg-white border-none rounded-lg p-3 text-sm text-legal-navy/60 outline-none resize-none"
                        placeholder="領域描述"
                      />
                      <div className="flex gap-4">
                        <div className="flex-grow">
                          <label className="block text-[10px] font-bold text-legal-navy/40 mb-1 uppercase">代表案號</label>
                          <input 
                            type="text" 
                            value={item.cases}
                            onChange={(e) => {
                              const newList = [...content.expertise];
                              newList[idx].cases = e.target.value;
                              setContent({ ...content, expertise: newList });
                            }}
                            className="w-full bg-white border-none rounded-lg p-2 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-legal-navy/40 mb-1 uppercase">圖示名稱</label>
                          <select 
                            value={item.iconName}
                            onChange={(e) => {
                              const newList = [...content.expertise];
                              newList[idx].iconName = e.target.value;
                              setContent({ ...content, expertise: newList });
                            }}
                            className="w-full bg-white border-none rounded-lg p-2 text-xs outline-none"
                          >
                            <option value="Scale">Scale (天平)</option>
                            <option value="Users">Users (人群)</option>
                            <option value="Briefcase">Briefcase (公事包)</option>
                            <option value="ShieldCheck">Shield (盾牌)</option>
                            <option value="Gavel">Gavel (法槌)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "judgments" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-legal-navy">實務經歷列表 ({content.judgments.length} 筆)</h3>
                <button 
                  onClick={() => {
                    const newItem: Judgment = { 
                      id: Date.now().toString(), 
                      court: "臺灣法院", 
                      year: "114年度", 
                      type: "案號", 
                      subject: "案件主旨", 
                      date: new Date().toISOString().split('T')[0], 
                      category: "民事訴訟", 
                      link: "" 
                    };
                    setContent({ ...content, judgments: [newItem, ...content.judgments] });
                  }}
                  className="flex items-center gap-2 text-legal-gold font-bold text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" /> 新增案例
                </button>
              </div>
              <div className="space-y-4">
                {content.judgments.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-legal-sand rounded-2xl flex items-start gap-4 group">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1 space-y-2">
                        <input 
                          type="text" 
                          value={item.year}
                          onChange={(e) => {
                            const newList = [...content.judgments];
                            newList[idx].year = e.target.value;
                            setContent({ ...content, judgments: newList });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-xs outline-none"
                          placeholder="年度"
                        />
                        <select 
                          value={item.category}
                          onChange={(e) => {
                            const newList = [...content.judgments];
                            newList[idx].category = e.target.value;
                            setContent({ ...content, judgments: newList });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-xs outline-none"
                        >
                          <option>民事訴訟</option>
                          <option>刑事訴訟</option>
                          <option>勞資爭議</option>
                          <option>家事與遺產繼承</option>
                          <option>金融犯罪/賠償</option>
                          <option>智慧財產權</option>
                          <option>行政訴訟</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <input 
                          type="text" 
                          value={item.subject}
                          onChange={(e) => {
                            const newList = [...content.judgments];
                            newList[idx].subject = e.target.value;
                            setContent({ ...content, judgments: newList });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-sm font-bold outline-none"
                          placeholder="案件主旨"
                        />
                        <input 
                          type="text" 
                          value={item.link}
                          onChange={(e) => {
                            const newList = [...content.judgments];
                            newList[idx].link = e.target.value;
                            setContent({ ...content, judgments: newList });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-[10px] text-blue-500 outline-none"
                          placeholder="判決書連結"
                        />
                      </div>
                      <div className="md:col-span-1 space-y-2">
                        <input 
                          type="text" 
                          value={item.court}
                          onChange={(e) => {
                            const newList = [...content.judgments];
                            newList[idx].court = e.target.value;
                            setContent({ ...content, judgments: newList });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-xs outline-none"
                          placeholder="法院"
                        />
                        <input 
                          type="text" 
                          value={item.type}
                          onChange={(e) => {
                            const newList = [...content.judgments];
                            newList[idx].type = e.target.value;
                            setContent({ ...content, judgments: newList });
                          }}
                          className="w-full bg-white border-none rounded-lg p-2 text-xs outline-none"
                          placeholder="案號"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const newList = content.judgments.filter((_, i) => i !== idx);
                        setContent({ ...content, judgments: newList });
                      }}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">電子郵件</label>
                  <input 
                    type="email" 
                    value={content.contact.email}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
                    className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">聯繫電話</label>
                  <input 
                    type="text" 
                    value={content.contact.phone}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
                    className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">事務所地址</label>
                <input 
                  type="text" 
                  value={content.contact.address}
                  onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })}
                  className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">Facebook 連結</label>
                  <input 
                    type="text" 
                    value={content.contact.facebook}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, facebook: e.target.value } })}
                    className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-legal-navy mb-2 uppercase tracking-widest">Instagram 連結</label>
                  <input 
                    type="text" 
                    value={content.contact.instagram}
                    onChange={(e) => setContent({ ...content, contact: { ...content.contact, instagram: e.target.value } })}
                    className="w-full bg-legal-sand border-none rounded-xl p-4 text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-md space-y-8">
              <div className="p-6 bg-legal-sand rounded-3xl border border-legal-navy/5">
                <h3 className="text-xl font-bold text-legal-navy mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-legal-gold w-6 h-6" /> 修改管理員密碼
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-legal-navy/60 mb-1 uppercase">目前密碼</label>
                    <input 
                      type="password" 
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white border-none rounded-xl p-3 text-legal-navy outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-legal-navy/60 mb-1 uppercase">新密碼</label>
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border-none rounded-xl p-3 text-legal-navy outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-legal-navy/60 mb-1 uppercase">確認新密碼</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border-none rounded-xl p-3 text-legal-navy outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full bg-legal-navy text-white py-3 rounded-xl font-bold hover:bg-legal-gold transition-all disabled:opacity-50"
                  >
                    {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "確認修改"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
