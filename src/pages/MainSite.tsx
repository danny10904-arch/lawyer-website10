import { motion, useScroll, useTransform } from "framer-motion";
import {
  Scale,
  Briefcase,
  Users,
  Gavel,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Award,
  BookOpen,
  FileText,
  ShieldCheck,
  ExternalLink,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useRef, useState, useEffect, FormEvent, ReactNode } from "react";
import React from "react";
import { SiteContent } from "../types";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhgZUw-scn2fmI54qKEDexAgsdy6eDBZInth4EMcYKLWfeEXFc4FxZKEEVim89h4U/exec";

// Helper to map icon names to components
const IconMap: Record<string, ReactNode> = {
  Scale: <Scale className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Briefcase: <Briefcase className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
  Gavel: <Gavel className="w-6 h-6" />
};

export default function MainSite() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    category: "家事與遺產繼承",
    message: ""
  });
  const [activeCategory, setActiveCategory] = useState("全部");
  const [visibleCount, setVisibleCount] = useState(6);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timeoutDuration = 20000; // 20s timeout

    const timer = setTimeout(() => {
      if (isMounted && !content) {
        setError("系統載入超時，請檢查網路或重新整理。");
      }
    }, timeoutDuration);

    // Add cache busting to ensure we always get fresh data
    fetch(`/api/content?t=${Date.now()}`)
      .then(res => {
        if (!res.ok && res.status !== 304) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Received non-JSON response:", contentType);
          // Attempt to read text to see what was returned (e.g. HTML error page)
          return res.text().then(text => {
            console.error("Response body:", text.slice(0, 500)); // Log first 500 chars
            throw new Error("Received non-JSON response from server");
          });
        }
        return res.json();
      })
      .then(data => {
        console.log("Received data from API:", data);
        let parsedData = data;

        // Handle stringified JSON
        while (typeof parsedData === 'string') {
          try {
            const parsed = JSON.parse(parsedData);
            if (typeof parsed === 'string' && parsed === parsedData) break;
            parsedData = parsed;
          } catch (e) {
            console.error("Failed to parse string data:", e);
            break;
          }
        }

        // Handle nested content property (e.g., if Supabase returns { content: { ... } })
        if (parsedData && parsedData.content && !parsedData.hero) {
          parsedData = parsedData.content;

          // Handle stringified nested content
          while (typeof parsedData === 'string') {
            try {
              const parsed = JSON.parse(parsedData);
              if (typeof parsed === 'string' && parsed === parsedData) break;
              parsedData = parsed;
            } catch (e) {
              console.error("Failed to parse nested string data:", e);
              break;
            }
          }
        }

        // Handle array wrapper
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          parsedData = parsedData[0];
        }

        if (isMounted) {
          setContent(parsedData);
          setError(null);
          clearTimeout(timer);
        }
      })
      .catch(err => {
        console.error("Failed to fetch content", err);
        // Only set error if we don't have content yet
        if (isMounted && !content) {
          setError("載入失敗，請檢查資料庫連線或重新整理。");
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const categories = ["全部", "民事訴訟", "刑事訴訟", "勞資爭議", "家事與遺產繼承", "金融犯罪/賠償", "智慧財產權", "行政訴訟"];

  // Helper to safely parse potentially stringified arrays
  const parseArray = (arr: any) => {
    if (typeof arr === 'string') {
      try {
        return JSON.parse(arr);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(arr) ? arr : [];
  };

  // Ensure safe defaults for all sections
  const safeContent = {
    hero: content?.hero || { title: "陳品潔律師事務所", subtitle: "專業法律服務", description: "提供最專業的法律諮詢與訴訟代理" },
    about: {
      title: content?.about?.title || "關於陳律師",
      avatarUrl: content?.about?.avatarUrl,
      points: parseArray(content?.about?.points)
    },
    expertise: parseArray(content?.expertise),
    judgments: parseArray(content?.judgments),
    contact: content?.contact || { email: "", phone: "", address: "", facebook: "", instagram: "" }
  };

  const filteredJudgments = safeContent?.judgments
    ? (activeCategory === "全部" ? safeContent.judgments : safeContent.judgments.filter(j => j.category === activeCategory))
    : [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsSubmitted(true);
      setFormData({ name: "", phone: "", category: "家事與遺產繼承", message: "" });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      alert("傳送失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stable entrance animations instead of scroll-linked ones
  const opacity = 1;
  const scale = 1;

  if (error) {
    return (
      <div className="min-h-screen bg-legal-navy flex flex-col items-center justify-center text-white gap-6 px-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full">
          <ShieldCheck className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">載入失敗</h2>
          <p className="text-white/60 max-w-xs mx-auto">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-legal-gold text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          重新整理
        </button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-legal-navy flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 text-legal-gold animate-spin" />
        <p className="text-legal-gold/60 animate-pulse">正在初始化法律服務系統...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen selection:bg-legal-gold selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gavel className="text-legal-gold w-5 h-5 md:w-6 md:h-6" />
          <span className="font-serif text-lg md:text-xl font-bold tracking-tight">陳品潔律師事務所</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest">
          <a href="#about" className="hover:text-legal-gold transition-colors">關於我</a>
          <a href="#expertise" className="hover:text-legal-gold transition-colors">專業領域</a>
          <a href="#cases" className="hover:text-legal-gold transition-colors">經典案例</a>
          <a href="#contact" className="hover:text-legal-gold transition-colors">聯繫諮詢</a>
        </div>
        <a href="#contact" className="bg-legal-navy text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-legal-gold transition-all duration-300">
          預約諮詢
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen md:h-screen flex items-center justify-center overflow-hidden bg-legal-navy text-white pt-24 md:pt-20 pb-12 md:pb-0">
        <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000"
            alt="Law Office"
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-legal-navy/50 via-transparent to-legal-navy" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <span className="text-legal-gold font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 block text-xs md:text-base">陳品潔律師事務所 | JAMIE CHEN</span>
            <h1 className="text-4xl md:text-8xl font-bold leading-tight mb-6">
              {safeContent.hero.title}<br />
              <span className="italic font-normal text-legal-gold">{safeContent.hero.subtitle}</span>
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
              {safeContent.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 md:gap-4">
              <a href="#expertise" className="w-full sm:w-auto bg-legal-gold text-white px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                查看專業領域 <ChevronRight className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-6 px-4">
                <a href={safeContent.contact.instagram} target="_blank" rel="noreferrer" className="hover:text-legal-gold transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href={safeContent.contact.facebook} target="_blank" rel="noreferrer" className="hover:text-legal-gold transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative max-w-sm mx-auto md:max-w-none"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border-4 md:border-8 border-white/10 shadow-2xl relative group">
              <img
                {/* 修改這裡：優先讀取資料庫中的 imageUrl，若無則顯示預設網址 */}
                src={content?.hero?.imageUrl || "https://images.weserv.nl/?url=duk.tw/v8dWec.jpg"}
                // src="https://images.weserv.nl/?url=duk.tw/v8dWec.jpg"
                alt="陳品潔律師"
                className="w-full h-full object-cover transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-legal-gold/5 mix-blend-multiply" />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 glass p-4 md:p-6 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-legal-gold/20 p-2 md:p-3 rounded-full">
                  <Award className="text-legal-gold w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-legal-navy font-bold text-sm md:text-base">專業法律顧問</p>
                  <p className="text-legal-navy/60 text-[10px] md:text-xs">多地法院實務勝訴經驗</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
            >
              {safeContent.about.avatarUrl && (
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-legal-gold/20 shadow-2xl flex-shrink-0">
                  <img
                    src={safeContent.about.avatarUrl}
                    alt="律師照片"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="flex-grow text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-8">{safeContent.about.title}</h2>
                <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-12 md:mt-16">
                  {safeContent.about.points.map((point, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="text-legal-gold text-3xl md:text-4xl font-serif">{point.number}</div>
                      <h3 className="text-lg md:text-xl font-bold">{point.title}</h3>
                      <p className="text-legal-navy/60 text-sm md:text-base leading-relaxed">{point.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section id="expertise" className="py-16 md:py-24 bg-legal-sand relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 gap-6 md:gap-8 text-center md:text-left">
            <div>
              <span className="text-legal-gold font-medium tracking-widest uppercase mb-2 block text-xs md:text-base">Our Services</span>
              <h2 className="text-3xl md:text-5xl font-bold">專業領域</h2>
            </div>
            <p className="text-legal-navy/60 max-w-md text-sm md:text-base">我們在多個法律領域擁有豐富的實務經驗，致力於提供全方位的法律支援。</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {safeContent.expertise.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-legal-gold/20 w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)] max-w-sm flex flex-col"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-legal-sand rounded-xl flex items-center justify-center mb-6 group-hover:bg-legal-gold group-hover:text-white transition-colors duration-500">
                  {IconMap[item.iconName] || <Scale className="w-6 h-6" />}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-legal-navy/60 text-xs md:text-sm leading-relaxed mb-6 flex-grow">{item.description}</p>
                <div className="pt-4 md:pt-6 border-t border-legal-sand flex items-center justify-between mt-auto">
                  <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-tighter text-legal-navy/40">代表案號</span>
                  <span className="text-[10px] md:text-xs font-medium text-legal-gold">{item.cases}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section id="cases" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">實務經歷</h2>
            <div className="w-16 md:w-24 h-1 bg-legal-gold mx-auto mb-8" />
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-4xl mx-auto lg:px-20">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(6); }}
                  className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 border whitespace-nowrap ${activeCategory === cat ? "bg-legal-navy text-white border-legal-navy shadow-lg" : "bg-white text-legal-navy border-legal-sand hover:border-legal-gold"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
            {filteredJudgments.slice(0, visibleCount).map((item, index) => (
              <motion.a
                href={item.link} target="_blank" rel="noreferrer" key={item.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: (index % 2) * 0.1 }}
                className="group flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border border-legal-sand hover:bg-legal-sand transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-legal-navy text-white rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-[7px] md:text-[8px] uppercase opacity-60">Year</span>
                  <span className="text-xs md:text-base font-serif">{item.year.replace('年度', '')}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-legal-gold/10 text-legal-gold text-[8px] md:text-[10px] font-bold rounded uppercase tracking-wider">{item.court}</span>
                    <span className="text-legal-navy/40 text-[9px] md:text-[10px]">{item.date}</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold group-hover:text-legal-gold transition-colors truncate">{item.subject}</h3>
                  <p className="text-legal-navy/60 text-[10px] md:text-xs mt-0.5">{item.type}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-legal-gold/30 flex items-center justify-center group-hover:bg-legal-gold group-hover:text-white transition-all">
                    <FileText className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          {filteredJudgments.length > visibleCount && (
            <div className="mt-12 text-center">
              <button onClick={() => setVisibleCount(prev => prev + 6)} className="px-8 py-3 rounded-full border border-legal-navy text-legal-navy font-bold text-sm hover:bg-legal-navy hover:text-white transition-all">顯示更多案例</button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-legal-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-legal-gold/5 -skew-x-12 translate-x-1/4" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8">聯繫我們</h2>
              <p className="text-white/60 mb-8 md:mb-12 text-sm md:text-lg leading-relaxed">法律問題不應成為您的負擔。請留下您的聯繫資訊，我們將在最短時間內由專人與您聯繫。</p>
              <div className="space-y-6 md:space-y-8 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 md:w-5 md:h-5 text-legal-gold" /></div>
                  <div className="text-left">
                    <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest">Email Address</p>
                    <a href={`mailto:${safeContent.contact.email}`} className="text-base md:text-lg font-medium hover:text-legal-gold transition-colors flex items-center gap-2">{safeContent.contact.email}<ExternalLink className="w-3 h-3 md:w-4 md:h-4 opacity-50" /></a>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 md:w-5 md:h-5 text-legal-gold" /></div>
                  <div className="text-left">
                    <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest">Phone Number</p>
                    <a href={`tel:${safeContent.contact.phone.replace(/\s/g, '')}`} className="text-base md:text-lg font-medium hover:text-legal-gold transition-colors flex items-center gap-2">{safeContent.contact.phone}<ExternalLink className="w-3 h-3 md:w-4 md:h-4 opacity-50" /></a>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 md:w-5 md:h-5 text-legal-gold" /></div>
                  <div className="text-left">
                    <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest">Office Location</p>
                    <p className="text-base md:text-lg font-medium text-balance">{safeContent.contact.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="w-16 h-16 text-legal-gold mb-4" />
                  <h3 className="text-2xl font-bold text-legal-navy mb-2">送出成功！</h3>
                  <button onClick={() => setIsSubmitted(false)} className="mt-8 text-legal-gold font-bold hover:underline">再次填寫表單</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-legal-navy uppercase tracking-widest">姓名</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-legal-sand border-none rounded-xl p-3 md:p-4 text-sm text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none" placeholder="您的稱呼" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] md:text-xs font-bold text-legal-navy uppercase tracking-widest">電話</label>
                      <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-legal-sand border-none rounded-xl p-3 md:p-4 text-sm text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none" placeholder="聯繫電話" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-legal-navy uppercase tracking-widest">諮詢類別</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-legal-sand border-none rounded-xl p-3 md:p-4 text-sm text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none appearance-none">
                      <option>家事與遺產繼承</option>
                      <option>民事訴訟</option>
                      <option>勞資爭議</option>
                      <option>刑事/金融犯罪</option>
                      <option>其他法律諮詢</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-legal-navy uppercase tracking-widest">簡述需求</label>
                    <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full bg-legal-sand border-none rounded-xl p-3 md:p-4 text-sm text-legal-navy focus:ring-2 focus:ring-legal-gold outline-none resize-none" placeholder="請簡述您的法律問題..." />
                  </div>
                  <button disabled={isSubmitting} className="w-full bg-legal-navy text-white py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:bg-legal-gold transition-colors shadow-lg shadow-legal-navy/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> 傳送中...</> : "送出諮詢請求"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-legal-sand py-8 md:py-12 border-t border-legal-navy/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Gavel className="text-legal-gold w-5 h-5" />
            <span className="font-serif text-lg font-bold">陳品潔律師事務所</span>
          </div>
          <p className="text-legal-navy/40 text-[10px] md:text-sm">© {new Date().getFullYear()} 陳品潔律師事務所. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
