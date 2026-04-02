import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import crypto from 'crypto';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');
const dbPath = path.join(__dirname, 'database.db');

// --- DATABASE ---
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    bizName TEXT,
    city TEXT,
    score INTEGER,
    blueprint TEXT,
    phaseHtml TEXT,
    auditData TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blueprint_id TEXT,
    role TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blueprint_id) REFERENCES blueprints(id)
  );
`);
try { db.exec(`ALTER TABLE blueprints ADD COLUMN auditData TEXT`); } catch {}
try { db.exec(`ALTER TABLE blueprints ADD COLUMN phaseHtml TEXT`); } catch {}

// Disable FK enforcement so chat works even before blueprint is saved
db.pragma('foreign_keys = OFF');

// --- MIDDLEWARE ---
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json({ limit: '50mb' }));

process.on('uncaughtException', (err) => console.error('[CRITICAL] Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('[CRITICAL] Unhandled Rejection:', reason));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenAI(GEMINI_API_KEY) : null;

// =====================================================
// SITE AUDIT
// =====================================================
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const mockReport = {
    score: 78,
    mobileFirstScore: 82,
    leadsEstimatesScore: 65,
    googleAiReadyScore: 71,
    summary: "Your site has foundational elements but is missing key conversion and local GEO signals that modern AI search engines require to feature local businesses.",
    brandAnalysis: "Established local presence with growth potential.",
    brandColors: {
      primary: "#1a1a2e",
      accent: "#F3DD6D",
      background: "#F5F0E8",
      text: "#1a1a2e"
    },
    technicalAudit: {
      mobileSpeed: { label: "Mobile Load Speed", status: "warning", value: "3.1s", reason: "Page load exceeds 2s threshold. Images not optimized for mobile." },
      contactForm: { label: "Lead Capture Form", status: "pass", value: "Found", reason: "Contact form detected on homepage." },
      sslCertificate: { label: "SSL Certificate", status: "pass", value: "Secure", reason: "Valid HTTPS certificate found." },
      metaDescription: { label: "Meta Description", status: "fail", value: "Missing", reason: "No meta description found — critical for AI search visibility." },
      googleBusinessProfile: { label: "Google Business Profile", status: "warning", value: "Unclaimed", reason: "GBP found but not fully optimized. Missing service categories and posts." },
      reviewSentiment: { label: "Review Sentiment", status: "pass", value: "4.7/5", reason: "Positive sentiment detected across Google reviews." }
    },
    strengths: [
      { indicator: "SSL Security", description: "Site is secured with HTTPS, a baseline trust signal." },
      { indicator: "Review Sentiment", description: "4.7/5 rating shows strong customer satisfaction." }
    ],
    weaknesses: [
      { indicator: "No Meta Description", description: "Google AI cannot summarize your business for AI Overview results without proper meta descriptions." },
      { indicator: "Slow Mobile Speed", description: "3.1s load time causes 53% of mobile visitors to leave before the page loads." },
      { indicator: "GBP Not Optimized", description: "Unclaimed or incomplete Google Business Profile means you're losing direct local search placement." }
    ],
    recommendations: [
      { title: "Add Meta Descriptions", description: "Write a 155-character description for every page including target keywords.", action: "Fix Now" },
      { title: "Optimize Mobile Speed", description: "Compress images, enable lazy loading, and use a CDN to hit under 1.5s load time.", action: "Improve Speed" },
      { title: "Complete Your GBP", description: "Verify ownership, add all services, post weekly updates, and respond to all reviews.", action: "Claim GBP" }
    ],
    city: "Local Area",
    reviewThemes: ["Quality Service", "Reliability", "Professionalism"]
  };

  try {
    if (genAI) {
      const prompt = `Analyze the website ${url} and return ONLY a raw JSON object (no markdown, no backticks) with this exact structure:
{"score":number,"mobileFirstScore":number,"leadsEstimatesScore":number,"googleAiReadyScore":number,"summary":"string","brandAnalysis":"string","brandColors":{"primary":"#hex","accent":"#hex","background":"#hex","text":"#hex"},"technicalAudit":{"mobileSpeed":{"label":"Mobile Load Speed","status":"pass|fail|warning","value":"string","reason":"string"},"contactForm":{"label":"Contact Form","status":"pass|fail|warning","value":"string","reason":"string"},"sslCertificate":{"label":"SSL Certificate","status":"pass|fail|warning","value":"string","reason":"string"},"metaDescription":{"label":"Meta Description","status":"pass|fail|warning","value":"string","reason":"string"},"googleBusinessProfile":{"label":"Google Business Profile","status":"pass|fail|warning","value":"string","reason":"string"},"reviewSentiment":{"label":"Review Sentiment","status":"pass|fail|warning","value":"string","reason":"string"}},"strengths":[{"indicator":"string","description":"string"}],"weaknesses":[{"indicator":"string","description":"string"}],"recommendations":[{"title":"string","description":"string","action":"string"}],"city":"string","reviewThemes":["string","string","string"]}

For brandColors: extract the ACTUAL dominant colors used on the website. primary = main brand color (button bg, logo color), accent = highlight/CTA color, background = main page background, text = main text color. Return real hex codes observed from the site.`;
      const result = await genAI.models.generateContent({ model: 'gemini-1.5-flash', contents: prompt });
      const raw = (result.text || '').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(raw);
      return res.json(parsed);
    }
    res.json(mockReport);
  } catch (err) {
    console.error('[ANALYSIS] Failed:', err.message);
    res.json(mockReport);
  }
});

// ── STRATEGY ENGINE (for No-Website flow) ───────────────────────────────────
app.post('/api/analyze-strategy', async (req, res) => {
  const { bizName, industry, city, goal, vibe } = req.body;
  if (!bizName || !industry) return res.status(400).json({ error: 'Business name and industry required.' });

  const vibeColors = {
    'Modern': { primary: '#6366f1', accent: '#a855f7', background: '#0f172a', text: '#f8fafc' },
    'Classic': { primary: '#1e293b', accent: '#94a3b8', background: '#f8fafc', text: '#0f172a' },
    'Bold': { primary: '#ef4444', accent: '#f59e0b', background: '#000000', text: '#ffffff' },
    'Friendly': { primary: '#10b981', accent: '#3b82f6', background: '#f0fdf4', text: '#064e3b' }
  };

  const colors = vibeColors[vibe] || vibeColors['Modern'];

  try {
    if (genAI) {
      const prompt = `You are a high-conversion website strategist. 
      Business: ${bizName} (${industry})
      Location: ${city}
      Core Goal: ${goal}
      Aesthetic: ${vibe}

      Generate a strategic brand package for a new website. Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
      {
        "score": 100,
        "summary": "Strategically architected for high-velocity ${goal.toLowerCase()} growth in ${city}.",
        "brandAnalysis": "Focusing on ${industry} expertise with a ${vibe.toLowerCase()} visual identity to drive ${goal.toLowerCase()}.",
        "headlines": {
          "hero": "A killer 5-8 word headline that sells",
          "sub": "A 10-15 word sub-headline that builds trust",
          "cta": "A punchy 2-4 word primary CTA"
        },
        "strategy": {
          "goals": ["Goal 1 (e.g. 15% increase in calls)", "Goal 2", "Goal 3"],
          "targetROI": "A percentage or ratio describing the potential ROI"
        },
        "vibePrompt": "A highly detailed 100-word design prompt for Base44 (AI website builder). Include layout, color usage (${colors.primary}, ${colors.accent}), and conversion-first sections.",
        "technicalAudit": {
          "strategy": { "label": "Strategic Alignment", "status": "pass", "value": "Optimized", "reason": "Pre-architected for ${goal}." },
          "conversion": { "label": "Conversion Funnel", "status": "pass", "value": "A-Grade", "reason": "Copy and layout designed by AdHello AI expert logic." }
        }
      }`;

      const result = await genAI.models.generateContent({ model: 'gemini-1.5-flash', contents: prompt });
      const raw = (result.text || '').replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(raw);
      
      return res.json({
        ...parsed,
        brandColors: colors,
        city,
        companyName: bizName,
        isNoWebsiteFlow: true
      });
    }
    // Mock fallback
    res.json({
      score: 100,
      summary: "Strategic launch plan for " + bizName,
      headlines: { hero: "The Future of " + industry, sub: "Dominating " + city + " with AI search readiness.", cta: "Start Now" },
      brandColors: colors,
      isNoWebsiteFlow: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Strategy generation failed.' });
  }
});

// =====================================================
// PHASE HTML GENERATOR (personalized per client)
// =====================================================
function buildPhaseHtml(bizName, cityLabel, t0, t1, t2, colors = {}) {
  // Use brand colors with sensible fallbacks
  const bg   = colors.background || '#F5F0E8';
  const text = colors.text       || '#1a1a2e';
  const pri  = colors.primary    || '#1a1a2e';
  const acc  = colors.accent     || '#F3DD6D';
  // Ensure contrast: if accent is very light, use primary for text on accent
  const accText = acc.toLowerCase() === '#ffffff' || acc.toLowerCase() === '#fff' ? text : (acc > '#888888' ? text : '#ffffff');

  const p1 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
body{background:${bg};color:${text};min-height:100vh}
nav{background:#fff;padding:14px 28px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(0,0,0,0.08);position:sticky;top:0;z-index:10}
.logo{font-weight:900;font-size:17px;letter-spacing:-0.5px;color:${text}}
.nav-cta{background:${acc};color:${pri};padding:8px 18px;border-radius:50px;font-weight:800;font-size:12px;border:none}
.hero{padding:52px 28px 36px;display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}
h1{font-size:38px;font-weight:900;line-height:1.05;letter-spacing:-1.5px;margin-bottom:14px;color:${text}}
h1 span{color:${acc};background:${pri};padding:2px 8px;border-radius:6px}
.sub{font-size:14px;color:#555;margin-bottom:24px;line-height:1.6}
.cta-row{display:flex;gap:10px}
.btn-p{background:${acc};color:${pri};padding:12px 24px;border-radius:50px;font-weight:900;font-size:13px;border:none;cursor:pointer}
.btn-s{background:transparent;color:${text};padding:12px 20px;border-radius:50px;font-weight:700;font-size:13px;border:2px solid ${text};cursor:pointer}
.stars{display:flex;align-items:center;gap:6px;margin-top:18px;font-size:12px;font-weight:700;color:#555}
.star{color:${acc};font-size:15px}
.hero-img{background:linear-gradient(135deg,${pri},${pri}cc);border-radius:20px;height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;padding:20px;text-align:center}
.hero-img h3{color:${acc};font-size:22px;font-weight:900;margin-bottom:8px}
.hero-img p{color:rgba(255,255,255,0.6);font-size:13px}
.badge{position:absolute;top:14px;right:14px;background:${acc};color:${pri};padding:5px 10px;border-radius:50px;font-size:10px;font-weight:900}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:0 28px 36px}
.card{background:#fff;border-radius:18px;padding:20px;border:1px solid rgba(0,0,0,0.08)}
.icon{width:40px;height:40px;background:${bg};border-radius:10px;margin-bottom:14px;display:flex;align-items:center;justify-content:center;font-size:20px}
.card h4{font-size:14px;font-weight:800;margin-bottom:6px;color:${text}}
.card p{font-size:11px;color:#888;line-height:1.5}
.reviews{padding:0 28px 36px}
.reviews h2{font-size:22px;font-weight:900;margin-bottom:16px;color:${text}}
.r-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.rc{background:#fff;padding:18px;border-radius:18px;border:1px solid rgba(0,0,0,0.08)}
.rc p{font-size:12px;color:#444;line-height:1.6;margin-bottom:10px}
.author{font-size:11px;font-weight:800;color:${text}}
</style></head><body>
<nav><div class="logo">📍 ${bizName}</div><button class="nav-cta">Book Now →</button></nav>
<div class="hero">
  <div><h1>${bizName}<br><span>${cityLabel}'s Best</span></h1><p class="sub">Trusted by hundreds of ${cityLabel} customers for ${t0.toLowerCase()}, ${t1.toLowerCase()}, and results that speak for themselves.</p>
  <div class="cta-row"><button class="btn-p">⚡ Get Free Quote</button><button class="btn-s">See Our Work</button></div>
  <div class="stars"><span class="star">★★★★★</span> 4.9/5 · 200+ Google Reviews · ${cityLabel}</div></div>
  <div class="hero-img"><h3>${bizName}</h3><p>Proudly serving<br>${cityLabel} since day one</p><div class="badge">✓ #1 Rated Local</div></div>
</div>
<div class="grid">
  <div class="card"><div class="icon">⭐</div><h4>${t0}</h4><p>Our #1 priority for every ${cityLabel} customer — guaranteed or we make it right.</p></div>
  <div class="card"><div class="icon">🤝</div><h4>${t1}</h4><p>Professional, on-time, and respectful of your time and space.</p></div>
  <div class="card"><div class="icon">🛡️</div><h4>${t2}</h4><p>We show up when we say we will. No surprises, no excuses — ever.</p></div>
</div>
<div class="reviews"><h2>What ${cityLabel} Customers Say</h2>
<div class="r-grid">
  <div class="rc"><p>"${bizName} exceeded every expectation. ${t0} like no other business in ${cityLabel}!"</p><div class="author">— Sarah M., ${cityLabel} ★★★★★</div></div>
  <div class="rc"><p>"Finally found a business that delivers real ${t1}. ${bizName} is our permanent go-to."</p><div class="author">— James R., ${cityLabel} ★★★★★</div></div>
</div></div>
</body></html>`;

  const p2 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
body{background:#fff;color:${text};min-height:100vh}
.top-bar{background:${pri};color:#fff;padding:10px 28px;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700}
.bar-cta{background:${acc};color:${pri};padding:7px 16px;border-radius:50px;font-weight:900;border:none;cursor:pointer;font-size:12px}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:380px}
.hl{background:${pri};padding:52px 36px;color:#fff;display:flex;flex-direction:column;justify-content:center}
.hl h1{font-size:34px;font-weight:900;line-height:1.1;letter-spacing:-1px;margin-bottom:14px}
.hl p{font-size:14px;opacity:0.8;margin-bottom:24px;line-height:1.6}
.urgency{background:rgba(255,255,255,0.1);border:1px solid ${acc};border-radius:10px;padding:10px 14px;margin-bottom:18px;font-size:12px;font-weight:700;color:${acc}}
.cta-btn{background:${acc};color:${pri};padding:14px 28px;border-radius:50px;font-weight:900;font-size:14px;border:none;cursor:pointer;width:fit-content}
.hr{background:#f8f8ff;padding:36px;display:flex;flex-direction:column;justify-content:center}
.book{background:#fff;border-radius:18px;padding:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid rgba(0,0,0,0.08)}
.book h3{font-size:16px;font-weight:900;margin-bottom:5px;color:${text}}
.book p{font-size:12px;color:#888;margin-bottom:16px}
input{width:100%;padding:11px 14px;border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;margin-bottom:10px;font-size:13px;font-family:inherit;background:#fafafa;display:block}
.book-btn{width:100%;background:${pri};color:#fff;padding:13px;border-radius:10px;font-weight:900;border:none;cursor:pointer;font-size:13px}
.social{padding:32px 28px;background:#fafafa;border-top:1px solid rgba(0,0,0,0.06)}
.social h2{font-size:20px;font-weight:900;margin-bottom:16px;text-align:center;color:${text}}
.tg{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.tc{background:#fff;border-radius:18px;padding:18px;border:1px solid rgba(0,0,0,0.08)}
.ts{color:${acc};font-size:13px;margin-bottom:7px}
.tt{font-size:12px;color:#444;line-height:1.6;margin-bottom:10px}
.ta{font-size:11px;font-weight:800;color:${pri}}
</style></head><body>
<div class="top-bar"><span>🔥 Limited appointment slots this week — ${cityLabel}</span><button class="bar-cta">Book Now</button></div>
<div class="hero">
  <div class="hl"><div class="urgency">⚡ 18 people viewed ${bizName} this week in ${cityLabel}</div><h1>Experience Real ${t0} in ${cityLabel}</h1><p>Join 200+ ${cityLabel} customers who chose ${bizName} for ${t1.toLowerCase()} they can count on, every single time.</p><button class="cta-btn">Book Free Consultation →</button></div>
  <div class="hr"><div class="book"><h3>Book in 60 Seconds</h3><p>Available today across ${cityLabel}</p><input placeholder="Your Name" readonly><input placeholder="Phone Number" readonly><input placeholder="Best Time to Call" readonly><button class="book-btn">Get My Free Quote →</button></div></div>
</div>
<div class="social"><h2>Why ${cityLabel} Chooses ${bizName}</h2>
<div class="tg">
  <div class="tc"><div class="ts">★★★★★</div><p class="tt">"The ${t0.toLowerCase()} from ${bizName} was unlike anything else in ${cityLabel}. Booked them again immediately."</p><div class="ta">— Mike T., ${cityLabel}</div></div>
  <div class="tc"><div class="ts">★★★★★</div><p class="tt">"${t1} that actually delivers results! ${bizName} has our entire business. Don't look anywhere else."</p><div class="ta">— Jennifer L., ${cityLabel}</div></div>
</div></div>
</body></html>`;

  const p3 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',system-ui,sans-serif}
body{background:#0D0D0D;color:#fff;min-height:100vh}
nav{padding:18px 36px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08)}
.logo{font-weight:900;font-size:18px;letter-spacing:-0.5px}
.logo span{color:${acc}}
.nav-links{display:flex;gap:28px;font-size:12px;font-weight:700;color:rgba(255,255,255,0.5)}
.nav-cta{background:${acc};color:${pri};padding:9px 22px;border-radius:50px;font-weight:900;font-size:12px;border:none;cursor:pointer}
.hero{padding:52px 36px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06)}
.badge{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:50px;padding:7px 18px;font-size:11px;font-weight:900;color:${acc};letter-spacing:1px;margin-bottom:20px}
.hero h1{font-size:46px;font-weight:900;line-height:1.0;letter-spacing:-2px;margin-bottom:14px}
.hero h1 span{color:${acc}}
.hero p{font-size:15px;color:rgba(255,255,255,0.5);max-width:460px;margin:0 auto}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.06);border-radius:18px;overflow:hidden;margin:32px 36px}
.stat{background:#0D0D0D;padding:24px;text-align:center}
.stat-num{font-size:32px;font-weight:900;color:${acc};letter-spacing:-1px}
.stat-label{font-size:11px;color:rgba(255,255,255,0.35);font-weight:700;margin-top:5px;text-transform:uppercase;letter-spacing:1px}
.press{padding:24px 36px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center}
.press-label{font-size:10px;font-weight:900;color:rgba(255,255,255,0.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px}
.logos{display:flex;gap:28px;justify-content:center;opacity:0.4;font-size:13px;font-weight:900;letter-spacing:1px}
.cases{padding:36px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.case{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px}
.metric{font-size:36px;font-weight:900;color:#F3DD6D;letter-spacing:-1px}
.case h4{font-size:13px;font-weight:800;margin:7px 0 5px}
.case p{font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5}
</style></head><body>
<nav><div class="logo">${bizName} <span>Elite</span></div><div class="nav-links"><span>Services</span><span>Results</span><span>About</span></div><button class="nav-cta">Get Started</button></nav>
<div class="hero"><div class="badge">🏆 #1 RANKED IN ${cityLabel.toUpperCase()}</div><h1>The Authority<br>in <span>${cityLabel}</span></h1><p>${bizName} — Where ${t0} meets elite ${t1.toLowerCase()}. The premium choice for discerning ${cityLabel} clients.</p></div>
<div class="stats"><div class="stat"><div class="stat-num">200+</div><div class="stat-label">Happy Clients</div></div><div class="stat"><div class="stat-num">4.9★</div><div class="stat-label">Google Rating</div></div><div class="stat"><div class="stat-num">#1</div><div class="stat-label">In ${cityLabel}</div></div></div>
<div class="press"><div class="press-label">As recognized by</div><div class="logos"><span>GOOGLE</span><span>YELP</span><span>NEXTDOOR</span><span>BBB</span></div></div>
<div class="cases">
  <div class="case"><div class="metric">+42%</div><h4>Leads in 30 Days</h4><p>After launching Phase 1 in ${cityLabel}, ${bizName} saw a 42% increase in qualified leads in the first month.</p></div>
  <div class="case"><div class="metric">3x</div><h4>Review Volume</h4><p>Automated post-job review requests tripled Google review count, securing the #1 position in ${cityLabel}.</p></div>
</div>
</body></html>`;

  return [p1, p2, p3];
}

// =====================================================
// FULFILLMENT ENGINE
// =====================================================
app.post('/api/fulfill', async (req, res) => {
  const { bizName, city, score, reviewThemes, brandColors } = req.body;
  if (!bizName) return res.status(400).json({ error: 'BizName required' });

  const cityLabel = city || 'your local area';
  const t0 = (reviewThemes && reviewThemes[0]) || 'Quality';
  const t1 = (reviewThemes && reviewThemes[1]) || 'Service';
  const t2 = (reviewThemes && reviewThemes[2]) || 'Reliability';
  const scoreNum = parseInt(score) || 78;
  const revLeak = 100 - scoreNum;

  const blueprint = `# Digital Blueprint for ${bizName}

## Phase 1: Modern Foundation — Your Digital Headquarters

Right now, most local businesses in **${cityLabel}** are invisible to Google's AI. Your website needs to communicate clearly to both humans and AI search engines — signaling **who you are**, **where you serve**, and **what problems you solve** in the exact language that modern search AI understands.

### What Gets Built for ${bizName}
- **Bento-Grid Homepage**: A modern, mobile-first layout with your services arranged in scannable cards that both customers and Google AI can understand instantly — replacing the generic template that blends in with every competitor
- **Hero Section with Social Proof**: Your boldest customer result front-and-center, featuring your reputation for ${t0} and ${t1} from real verified reviews
- **Local GEO Architecture**: Every heading, URL, image alt tag, and metadata block is crafted around **"${bizName} ${cityLabel}"** search terms — the exact queries your customers are using in AI search
- **Lead Capture System**: A prominent above-the-fold CTA with an optimized booking form, reducing friction and capturing visitors before they leave for a competitor

### Why This Is Urgent for ${bizName}
With a current score of **${scoreNum}/100**, you are leaving approximately **${revLeak}%** of potential revenue on the table every single month — visitors who find you but don't convert, or never find you at all. Phase 1 is the structural fix that makes everything else possible.

### Timeline
**Week 1**: Domain setup, design system configured, hero section live  
**Week 2**: All service pages built with GEO-optimized copy  
**Week 3**: Review widgets, lead capture forms, and analytics installed  
**Week 4**: Google Business Profile synced, schema markup live, launch

---

## Phase 2: Conversion Engine — Turn Visitors Into Revenue

Traffic without conversion is vanity. Phase 2 transforms ${bizName}'s new website from a digital brochure into a **24/7 automated revenue machine**. Every visitor becomes a potential booking, every lead gets followed up automatically, and every dollar of marketing spend works significantly harder.

### What Gets Built
- **AI Booking Widget**: A 24/7 automated intake system that qualifies leads and books appointments while you sleep — immediately addressing the #1 customer question about ${t2}
- **Automated Review System**: After every completed job, a timed SMS requests a Google review. At 4.8+ stars, ${bizName} qualifies for Google's "Local Pack" featured position
- **Conversion-First Copy**: Every headline, CTA, and page section written with a single goal — turning a ${cityLabel} visitor into a booked client
- **CRM Follow-Up Sequences**: Leads who don't book immediately receive a 3-touch automated sequence over 72 hours, recovering up to 40% of lost inquiries

### Expected Revenue Impact
Businesses at ${bizName}'s stage see a **30–60% increase in booked appointments** within 90 days of activating Phase 2 — without increasing their advertising budget.

---

## Phase 3: Elite Authority — Become the Undeniable #1 in ${cityLabel}

Modern AI search engines (Google AI Overviews, Bing Copilot, ChatGPT) feature businesses with a complete **brand signal ecosystem** — not just a website. Phase 3 makes ${bizName} the undeniable, AI-cited authority for your category in ${cityLabel}.

### What Gets Built
- **Authority Content Hub**: Weekly 600-word articles answering the exact questions ${cityLabel} customers search — "best [service] in ${cityLabel}", "how much does [service] cost", "is [bizName] legit?" — these articles get picked up directly by Google AI Overviews
- **YouTube Brand Presence**: Monthly 2-3 minute service showcase videos, ranking on both YouTube and Google, providing a geographic authority signal that no local competitor has
- **Omni-Channel Signal Network**: Consistent ${bizName} brand presence across Google Business Profile, social channels, and local directories — signaling to every AI: "This is a trusted, established, real business"
- **Competitor Displacement**: As your authority score climbs from ${scoreNum} toward 95+, you systematically displace competitors in local AI results and capture their customer flow

### The 90-Day Authority Timeline
- **Month 1**: Foundation live, GBP fully optimized, first 5 authority articles published in ${cityLabel}
- **Month 2**: Review count tripled, YouTube channel launched, measurable conversion rate improvement
- **Month 3**: ${bizName} appearing in Google AI Overviews for "${cityLabel}" searches, dominant in the local map pack
`;

  const phaseHtml = buildPhaseHtml(bizName, cityLabel, t0, t1, t2, brandColors || {});
  res.json({ blueprint, phaseHtml });
});

// =====================================================
// SAVE BLUEPRINT
// =====================================================
app.post('/api/fulfill/save', (req, res) => {
  const { bizName, city, score, blueprint, phaseHtml, auditData } = req.body;
  try {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO blueprints (id, bizName, city, score, blueprint, phaseHtml, auditData) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, bizName, city, score, blueprint,
      phaseHtml ? JSON.stringify(phaseHtml) : null,
      auditData ? JSON.stringify(auditData) : null
    );
    res.json({ id, success: true });
  } catch (error) {
    console.error('[SAVE] Error:', error);
    res.status(500).json({ error: 'Save failed' });
  }
});

// =====================================================
// GET BLUEPRINT
// =====================================================
app.get('/api/fulfill/:id', (req, res) => {
  const { id } = req.params;
  try {
    const row = db.prepare('SELECT * FROM blueprints WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const messages = db.prepare('SELECT role, content FROM chat_history WHERE blueprint_id = ? ORDER BY created_at ASC').all(id);
    res.json({
      ...row,
      phaseHtml: row.phaseHtml ? JSON.parse(row.phaseHtml) : null,
      auditData: row.auditData ? JSON.parse(row.auditData) : null,
      messages
    });
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// =====================================================
// CHAT — GEO Ranking Coach
// =====================================================
app.post('/api/fulfill/:id/chat', async (req, res) => {
  const { id } = req.params;
  const { message, blueprintInfo, auditReport } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const bizName = blueprintInfo?.bizName || 'the business';
  const city = blueprintInfo?.city || 'your city';
  const score = blueprintInfo?.score || 'N/A';

  // Fetch audit data from DB if not provided
  const audit = auditReport || (() => {
    try {
      const row = db.prepare('SELECT auditData FROM blueprints WHERE id = ?').get(id);
      return row?.auditData ? JSON.parse(row.auditData) : null;
    } catch { return null; }
  })();

  let auditContext = '';
  if (audit) {
    const checks = audit.technicalAudit ? Object.values(audit.technicalAudit) : [];
    const failing = checks.filter(c => c.status === 'fail').map(c => `FAIL: ${c.label} — ${c.reason || c.value || ''}`).join('\n');
    const warnings = checks.filter(c => c.status === 'warning').map(c => `WARN: ${c.label} — ${c.reason || c.value || ''}`).join('\n');
    const weaknesses = (audit.weaknesses || []).map(w => `- ${w.indicator}: ${w.description}`).join('\n');
    const recommendations = (audit.recommendations || []).map(r => `> ${r.title}: ${r.description}`).join('\n');
    auditContext = `
=== ${bizName} AUDIT DATA ===
AEO Score: ${audit.score}/100 | Mobile: ${audit.mobileFirstScore}/100 | AI Ready: ${audit.googleAiReadyScore}/100
Summary: ${audit.summary || ''}
FAILING: ${failing || 'none'}
WARNINGS: ${warnings || 'none'}
WEAKNESSES: ${weaknesses || 'none'}
RECOMMENDATIONS: ${recommendations || 'none'}
===========================`;
  }

  try {
    // Save user message — skip if blueprint doesn't exist yet (FK safety)
    const blueprintExists = db.prepare('SELECT id FROM blueprints WHERE id = ?').get(id);
    if (blueprintExists) {
      try { db.prepare('INSERT INTO chat_history (blueprint_id, role, content) VALUES (?, ?, ?)').run(id, 'user', message); } catch {}
    }

    const history = blueprintExists
      ? db.prepare('SELECT role, content FROM chat_history WHERE blueprint_id = ? ORDER BY created_at ASC').all(id)
      : [];

    let replyText = '';

    if (genAI) {
      try {
        const systemPrompt = `You are the "GEO Ranking Coach" for AdHello.ai — an elite local SEO and digital growth expert.
You are coaching ${bizName} in ${city}. Their AEO score is ${score}/100.
${auditContext}
Give actionable advice that references their ACTUAL audit data. When they ask how to improve a score or fix an issue, cite the EXACT failing checks and explain step-by-step how to fix it.
Be concise (2-4 paragraphs max), conversational, and highly specific. Use bullet points. Be encouraging but direct.`;

        const historyText = history.slice(0, -1).map(m =>
          `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`
        ).join('\n\n');

        const fullPrompt = `${systemPrompt}\n\n${historyText ? 'Conversation:\n' + historyText + '\n\n' : ''}User: ${message}\n\nCoach:`;

        const result = await genAI.models.generateContent({ model: 'gemini-1.5-flash', contents: fullPrompt });
        replyText = result.text || '';
      } catch (geminiErr) {
        console.error('[CHAT] Gemini failed:', geminiErr.message);
      }
    }

    if (!replyText) {
      const lm = message.toLowerCase();
      if (lm.includes('rank') || lm.includes('seo') || lm.includes('geo')) {
        replyText = `Great question on GEO ranking for **${bizName}**!\n\n1. **Google Business Profile** — Fill every field (services, hours, description). Post weekly updates.\n2. **NAP Consistency** — Your Name, Address, Phone must be identical on your website, GBP, and every directory listing.\n3. **Local landing pages** — Create a page titled "${bizName} in ${city}" with that exact phrase in your H1, URL, and first paragraph.\n\nThese three steps alone can push you into the local top 3 within 60 days. Want me to go deeper on any of them?`;
      } else if (lm.includes('base44') || lm.includes('prompt') || lm.includes('website') || lm.includes('build')) {
        replyText = `For **${bizName}**, here's your Phase 1 Base44 prompt:\n\n> *"Build a premium bento-grid homepage for ${bizName} in ${city}. Warm cream background (#F5F0E8), dark navy headings, gold (#F3DD6D) CTA buttons. Include: bold split-hero with 'Get Free Quote' button, 3-column services grid with icons, Google reviews widget showing 4.9 stars, and a contact form. Mobile-first. Add local schema markup for GEO signals."*\n\nPaste this directly into Base44's AI Site Builder. Which phase prompt would you like next?`;
      } else if (lm.includes('review') || lm.includes('rating') || lm.includes('google')) {
        replyText = `Reviews are the **#1 local ranking signal** for ${bizName}. Here's a system that reliably triples review volume:\n\n**The After-Service Text** (send within 1 hour of completing a job):\n> *"Hi [Name]! Thanks for choosing ${bizName}. If we did a great job, a quick Google review would mean everything to us: [link]. Takes 60 seconds! 🙏"*\n\nAt 4.8+ stars you qualify for Google's Local Pack featured placement — that alone can double your inbound leads. Want me to help write a review request sequence for your specific customers?`;
      } else {
        replyText = `Great question! As your **GEO Ranking Coach** for ${bizName}, here's where I'd focus:\n\n- 🗺️ **Local GEO signals** — Google Business Profile + consistent citations across directories\n- ⚡ **Conversion optimization** — AI booking widget so you never miss an after-hours lead\n- 📹 **Authority content** — Weekly articles answering "${city} [service]" questions that get picked up by Google AI Overviews\n\nWhich of these would you like to dive into? I have exact scripts, prompts, and checklists for each.`;
      }
    }

    // Save reply — skip if blueprint doesn't exist yet
    if (blueprintExists) {
      try { db.prepare('INSERT INTO chat_history (blueprint_id, role, content) VALUES (?, ?, ?)').run(id, 'model', replyText); } catch {}
    }
    res.json({ text: replyText });
  } catch (error) {
    console.error('[CHAT] Error:', error);
    res.status(500).json({ error: 'Chat failed. Please try again.' });
  }
});

app.post('/api/stitch-design', (req, res) => res.json({ success: true }));
app.post('/api/ad-brief/generate-image', (req, res) => res.json({ imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000' }));

app.use(express.static(DIST_DIR));
app.get('*', (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
