import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { promises as fs } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
// Removed @google/genai import to use native fetch for stability
import crypto from 'crypto';
import Database from 'better-sqlite3';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const execFileAsync = promisify(execFile);
const PORT = process.env.PORT || 8081;
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
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    bizName TEXT,
    industry TEXT,
    city TEXT,
    goal TEXT,
    vibe TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// --- DEBUG ROUTE ---
app.set('trust proxy', true);
const APP_ORIGIN = process.env.ADHELLO_APP_DOMAIN || 'https://adhello.ai';

app.get('/api/debug-assets', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const walk = async (dir) => {
      let results = [];
      const list = await fs.readdir(dir);
      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(await walk(filePath));
        } else {
          results.push(filePath.replace(__dirname, ''));
        }
      }
      return results;
    };

    const distFiles = (await fs.access(DIST_DIR).then(() => walk(DIST_DIR)).catch(() => ['DIST MISSING']));
    const publicFiles = (await fs.access(path.join(__dirname, 'public')).then(() => walk(path.join(__dirname, 'public'))).catch(() => ['PUBLIC MISSING']));
    
    res.json({
      timestamp: new Date().toISOString(),
      __dirname,
      DIST_DIR,
      distFiles: distFiles.slice(0, 50),
      publicFiles: publicFiles.slice(0, 50),
      env_base: process.env.BASE_URL || 'NONE',
      app_origin: APP_ORIGIN
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});


process.on('uncaughtException', (err) => console.error('[CRITICAL] Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('[CRITICAL] Unhandled Rejection:', reason));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
/** Text + vision fallback for audit, ad brief, chat; override if Google deprecates default. */
const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-2.0-flash';
const KIE_API_KEY = process.env.KIE_API_KEY;
const KIE_CHAT_MODEL = process.env.KIE_CHAT_MODEL || 'gpt-4o';
const KIE_UPLOAD_BASE = process.env.KIE_UPLOAD_BASE || 'https://kieai.redpandaai.co';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to call Kie.ai AI (OpenAI-compatible) via REST API.
 * options.jsonMode — request JSON object output (site audit, ad brief parse).
 * options.imageBase64 + options.mimeType — GPT-4o vision for image analysis.
 */
async function callKie(prompt, systemPrompt = '', history = [], options = {}) {
  if (!KIE_API_KEY) return null;

  const jsonMode = options.jsonMode === true || options.forceJson === true;
  const imageBase64 = options.imageBase64;
  const mimeType = options.mimeType || 'image/jpeg';

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });

  (history || []).forEach((m) => {
    let role = m.role || 'user';
    if (role === 'model') role = 'assistant'; // SQLite / UI use "model"; OpenAI expects "assistant"
    messages.push({
      role,
      content: m.content || m.text || '',
    });
  });

  if (imageBase64) {
    const raw = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
    const dataUrl = `data:${mimeType};base64,${raw}`;
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    });
  } else {
    messages.push({ role: 'user', content: prompt });
  }

  try {
    const body = {
      model: KIE_CHAT_MODEL,
      messages,
      temperature: 0.7,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };

    const res = await fetch('https://api.kie.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      console.warn('[KIE] Chat error:', data.error?.message || data.msg || data.error || res.status);
      return null;
    }
    const text = data.choices?.[0]?.message?.content;
    return text || null;
  } catch (err) {
    console.error('[KIE] Fetch Exception:', err.message);
    return null;
  }
}

/**
 * Helper to call Gemini AI via native fetch REST API.
 */
async function callGemini(prompt, modelName = 'gemini-2.0-flash', base64Image = null, forceJson = false, imageMimeType = 'image/jpeg') {
  if (!GEMINI_API_KEY) {
    console.warn('[GEMINI] API Key missing. Returning null.');
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
  
  const contents = [{
    parts: [{ text: prompt }]
  }];

  if (base64Image) {
    // If it's a data URI, extract just the base64 part
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const mime = typeof imageMimeType === 'string' && imageMimeType.includes('/')
      ? imageMimeType
      : 'image/jpeg';

    contents[0].parts.push({
      inline_data: {
        mime_type: mime,
        data: base64Data
      }
    });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          ...(forceJson ? { response_mime_type: "application/json" } : {})
        }
      })
    });
    const data = await res.json();
    if (data.error) {
      console.warn('[GEMINI] API error:', data.error?.message || data.error);
      return null;
    }
    // Handle both text and image responses
    const cand0 = data.candidates?.[0];
    const part = cand0?.content?.parts?.[0];
    if (part?.text) return part.text;
    if (part?.inline_data?.data) return 'data:' + (part.inline_data.mime_type || 'image/png') + ';base64,' + part.inline_data.data;
    console.warn(
      '[GEMINI] No text/image in response — model:',
      modelName,
      JSON.stringify({
        finishReason: cand0?.finishReason,
        promptFeedback: data.promptFeedback,
        candidateCount: data.candidates?.length ?? 0,
      }).slice(0, 400)
    );
    return null;
  } catch (err) {
    console.error('[GEMINI] Fetch Exception:', err.message);
    return null;
  }
}

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

/**
 * Generate or edit ad imagery (image output). Uses responseModalities per Gemini image API.
 */
async function callGeminiImageOutput(prompt, base64Image = null, imageMimeType = 'image/jpeg') {
  if (!GEMINI_API_KEY) {
    console.warn('[GEMINI] API Key missing. Returning null.');
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const parts = [{ text: prompt }];
  if (base64Image) {
    const base64Data = base64Image.includes('base64,')
      ? base64Image.split('base64,')[1]
      : base64Image;
    const mime = typeof imageMimeType === 'string' && imageMimeType.includes('/')
      ? imageMimeType
      : 'image/jpeg';
    parts.push({
      inline_data: {
        mime_type: mime,
        data: base64Data
      }
    });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseModalities: ['TEXT', 'IMAGE']
        }
      })
    });
    const data = await res.json();
    if (data.error) {
      console.warn('[GEMINI-IMAGE] API error:', data.error?.message || JSON.stringify(data.error));
      return null;
    }
    const respParts = data.candidates?.[0]?.content?.parts || [];
    for (const part of respParts) {
      if (part.inline_data?.data) {
        const mime = part.inline_data.mime_type || 'image/png';
        return 'data:' + mime + ';base64,' + part.inline_data.data;
      }
    }
    console.warn('[GEMINI-IMAGE] No image in response parts:', JSON.stringify(respParts).slice(0, 300));
    return null;
  } catch (err) {
    console.error('[GEMINI-IMAGE] Fetch Exception:', err.message);
    return null;
  }
}

/** Upload base64 image to Kie temporary storage; returns HTTPS URL for 4o Image `filesUrl`. */
async function kieUploadBase64Image(rawBase64, mimeType = 'image/jpeg') {
  if (!KIE_API_KEY) return null;
  const ext = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('webp')
      ? 'webp'
      : mimeType.includes('gif')
        ? 'gif'
        : 'jpg';
  const dataUrl = rawBase64.includes('base64,')
    ? rawBase64
    : `data:${mimeType};base64,${rawBase64}`;
  try {
    const res = await fetch(`${KIE_UPLOAD_BASE}/api/file-base64-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIE_API_KEY}`,
      },
      body: JSON.stringify({
        base64Data: dataUrl,
        uploadPath: 'adhello/ad-brief',
        fileName: `upload-${Date.now()}.${ext}`,
      }),
    });
    const data = await res.json();
    const url = data.data?.fileUrl || data.data?.downloadUrl;
    if (!res.ok || !url) {
      console.warn('[KIE-UPLOAD]', data.msg || data.error || res.status);
      return null;
    }
    return url;
  } catch (e) {
    console.error('[KIE-UPLOAD]', e.message);
    return null;
  }
}

async function kie4oSubmitImageTask(payload) {
  if (!KIE_API_KEY) return null;
  try {
    const res = await fetch('https://api.kie.ai/api/v1/gpt4o-image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIE_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.code !== 200 || !data.data?.taskId) {
      console.warn('[KIE-4O] Submit failed:', data.msg || JSON.stringify(data));
      return null;
    }
    return data.data.taskId;
  } catch (e) {
    console.error('[KIE-4O] Submit Exception:', e.message);
    return null;
  }
}

async function kie4oPollImageResult(taskId, maxMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(
        `https://api.kie.ai/api/v1/gpt4o-image/record-info?taskId=${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${KIE_API_KEY}` } }
      );
      const data = await res.json();
      if (data.code !== 200 || !data.data) {
        await sleep(2500);
        continue;
      }
      const td = data.data;
      if (td.successFlag === 1) {
        const urls = td.response?.result_urls || [];
        return urls[0] || null;
      }
      if (td.successFlag === 2) {
        console.warn('[KIE-4O] Generation failed:', td.errorMessage || td.errorCode);
        return null;
      }
    } catch (e) {
      console.warn('[KIE-4O] Poll error:', e.message);
    }
    await sleep(2500);
  }
  console.warn('[KIE-4O] Poll timeout');
  return null;
}

async function remoteImageUrlToDataUrl(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') || 'image/png';
  return `data:${ct};base64,${buf.toString('base64')}`;
}

/** Kie 4o Image API (upload reference → async task → poll). Uses KIE_API_KEY. */
async function callKie4oImageOutput(prompt, rawBase64, mimeType) {
  if (!KIE_API_KEY) return null;

  let filesUrl = null;
  if (rawBase64) {
    filesUrl = await kieUploadBase64Image(rawBase64, mimeType || 'image/jpeg');
    if (!filesUrl) {
      console.warn('[KIE-4O] Reference upload failed; trying text-only image generation.');
    }
  }

  const payload = {
    prompt,
    size: '1:1',
    nVariants: 1,
    ...(filesUrl ? { filesUrl: [filesUrl] } : {}),
  };

  const taskId = await kie4oSubmitImageTask(payload);
  if (!taskId) return null;

  const resultUrl = await kie4oPollImageResult(taskId);
  if (!resultUrl) return null;

  // Prefer data URL so the client never depends on third-party CDN fetch rules.
  // If the server cannot download the result (Render egress, transient CDN, etc.),
  // return the raw HTTPS URL — browsers can still display it in <img src="...">.
  try {
    const dataUrl = await remoteImageUrlToDataUrl(resultUrl);
    if (dataUrl) return dataUrl;
    console.warn('[KIE-4O] Could not convert result to data URL; returning remote URL for client display.');
    return resultUrl;
  } catch (e) {
    console.warn('[KIE-4O] Download result failed; returning remote URL:', e.message);
    return resultUrl;
  }
}

/**
 * Unified AI orchestrator: Kie.ai first (same API key as KIE_CHAT_MODEL), then Gemini.
 * visionOpts: { imageBase64, mimeType } — uses Kie GPT-4o vision, then Gemini vision.
 */
async function callAI(prompt, systemPrompt = '', history = [], forceJson = false, visionOpts = null) {
  const img = visionOpts?.imageBase64 || visionOpts?.imageData;
  const mime = visionOpts?.mimeType || 'image/jpeg';

  if (img) {
    const kieVision = await callKie(prompt, systemPrompt, history, {
      jsonMode: forceJson,
      imageBase64: img,
      mimeType: mime,
    });
    if (kieVision) return kieVision;
    console.log('[AI] Kie vision failed or unavailable; falling back to Gemini.');
    return await callGemini(prompt, GEMINI_CHAT_MODEL, img, forceJson, mime);
  }

  const kieResult = await callKie(prompt, systemPrompt, history, { jsonMode: forceJson });
  if (kieResult) return kieResult;

  console.log(`[AI] Falling back to Gemini (JSON: ${forceJson})...`);
  const historyText = (history || []).map(m => 
    `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content || m.text || ''}`
  ).join('\n\n');

  const fullPrompt = [
    systemPrompt,
    historyText ? 'Conversation History:\n' + historyText : '',
    'User: ' + prompt,
    'Assistant:'
  ].filter(Boolean).join('\n\n');

  return await callGemini(fullPrompt, GEMINI_CHAT_MODEL, null, forceJson);
}

/** Which AI backends are configured (no secrets exposed). */
app.get('/api/ai-health', (req, res) => {
  res.json({
    kie: !!KIE_API_KEY,
    gemini: !!GEMINI_API_KEY,
    googlePageSpeed: !!process.env.GOOGLE_PSI_API_KEY,
    kieChatModel: process.env.KIE_CHAT_MODEL || 'gpt-4o',
    geminiChatModel: GEMINI_CHAT_MODEL,
  });
});

/** Smoke-test Kie chat from the server (keys stay server-side). */
app.post('/api/ping-kie', async (req, res) => {
  if (!KIE_API_KEY) {
    return res.status(503).json({ ok: false, error: 'KIE_API_KEY not configured on server' });
  }
  const reply = await callKie('Reply with exactly one short sentence confirming Kie.ai is reachable.', '', [], {});
  res.json({ ok: !!reply, message: reply || null });
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!resend) console.warn('[MAIL] RESEND_API_KEY missing. Email notifications disabled.');

// =====================================================
// SITE AUDIT
// =====================================================
const PSI_API_LIBRARY_URL =
  'https://console.developers.google.com/apis/library/pagespeedonline.googleapis.com';
const PSI_CREDENTIALS_URL = 'https://console.cloud.google.com/apis/credentials';

/** When Google returns PERMISSION_DENIED / "blocked", it's almost always GCP key or API enablement — not the customer's URL. */
function derivePsiSetupHint(psiError) {
  if (!psiError || typeof psiError !== 'string') return null;
  const lower = psiError.toLowerCase();
  if (
    lower.includes('blocked') ||
    lower.includes('permission_denied') ||
    lower.includes('permission denied') ||
    lower.includes('not enabled') ||
    lower.includes('api key not valid') ||
    lower.includes('invalid apikey') ||
    lower.includes('requests to this api') ||
    lower.includes('has been disabled')
  ) {
    return {
      title: 'PageSpeed API access is blocked',
      steps: [
        'Open Google Cloud → APIs & Services → Library and enable PageSpeed Insights API for the same project as your key.',
        'Open APIs & Services → Credentials → your API key → API restrictions: allow PageSpeed Insights API (or "Don\'t restrict key" while testing).',
        'Under Application restrictions: use None (dev) or IP addresses with your server\'s outbound IP. Do not use HTTP referrers only for server-side Node or Cloud Run — Google will block those calls.',
        'Redeploy with GOOGLE_PSI_API_KEY set to that key and run the audit again.',
      ],
      links: [
        { label: 'Enable PageSpeed Insights API', href: PSI_API_LIBRARY_URL },
        { label: 'Manage API keys', href: PSI_CREDENTIALS_URL },
      ],
    };
  }
  return null;
}

async function getPageSpeedInsights(targetUrl) {
  const psiApiKey = process.env.GOOGLE_PSI_API_KEY || '';
  const keyConfigured = !!psiApiKey;
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&strategy=mobile${psiApiKey ? `&key=${psiApiKey}` : ''}`;

    console.log(`[PSI] Analyzing: ${targetUrl}${keyConfigured ? '' : ' (no GOOGLE_PSI_API_KEY — shared quota)'}`);
    const res = await fetch(apiUrl);
    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      console.error('[PSI] Non-JSON response:', raw.slice(0, 400));
      return { psiData: null, psiError: 'Invalid response from PageSpeed API.', keyConfigured };
    }

    if (!res.ok) {
      const msg = data?.error?.message || `HTTP ${res.status}`;
      console.error('[PSI] Request failed:', res.status, msg);
      return { psiData: null, psiError: msg, keyConfigured };
    }

    if (data.error) {
      console.error('[PSI] API error:', data.error.message || data.error);
      return { psiData: null, psiError: data.error.message || String(data.error), keyConfigured };
    }

    const lh = data.lighthouseResult;
    if (!lh?.categories || !lh.audits) {
      console.error('[PSI] Missing lighthouseResult in API response');
      return { psiData: null, psiError: 'PageSpeed returned no Lighthouse result.', keyConfigured };
    }
    const screenshot = lh.audits['final-screenshot']?.details?.data || null;
    const perfScore = (lh.categories.performance?.score || 0) * 100;
    const seoScore = (lh.categories.seo?.score ?? 0) * 100;
    const a11yScore = (lh.categories.accessibility?.score ?? 0) * 100;
    const bpScore = (lh.categories['best-practices']?.score ?? 0) * 100;
    const lcp = lh.audits['largest-contentful-paint']?.displayValue || 'N/A';
    const ssl = lh.audits['is-on-https']?.score === 1;
    
    return {
      psiData: {
        performance: Math.round(perfScore),
        seo: Math.round(seoScore),
        accessibility: Math.round(a11yScore),
        bestPractices: Math.round(bpScore),
        lcp,
        isHttps: ssl,
        screenshot,
        metrics: {
          fcp: lh.audits['first-contentful-paint']?.displayValue,
          tti: lh.audits['interactive']?.displayValue,
          cls: lh.audits['cumulative-layout-shift']?.displayValue,
        },
      },
      psiError: null,
      keyConfigured,
    };
  } catch (err) {
    console.error('[PSI] Fetch Error:', err.message);
    return { psiData: null, psiError: err.message, keyConfigured };
  }
}

/**
 * When PageSpeed Insights is unavailable (quota, key restrictions, blocking),
 * fetch the URL ourselves and derive approximate scores from TTFB + HTML signals.
 * Not a Lighthouse substitute — transparently labeled in psiMeta.measurementSource.
 */
async function fetchHttpAuditSignals(targetUrl) {
  const out = {
    ok: false,
    error: null,
    ttfbMs: null,
    finalUrl: targetUrl,
    isHttps: targetUrl.startsWith('https:'),
    httpStatus: null,
    title: '',
    metaDescription: '',
    hasViewportMeta: false,
    jsonLdBlocks: 0,
    htmlBytesRead: 0,
  };

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 28000);
    const t0 = Date.now();

    const res = await fetch(targetUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (compatible; AdHelloSiteAudit/1.1; +https://adhello.ai) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });

    clearTimeout(tid);
    out.ttfbMs = Date.now() - t0;
    out.httpStatus = res.status;
    out.finalUrl = res.url || targetUrl;

    try {
      out.isHttps = new URL(out.finalUrl).protocol === 'https:';
    } catch (_) {}

    if (!res.ok) {
      out.error = `HTTP ${res.status}`;
      console.warn('[HTTP-AUDIT] Non-OK status:', targetUrl, out.error);
      return out;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      out.error = 'Empty response body';
      return out;
    }

    const decoder = new TextDecoder();
    let html = '';
    const MAX = 450000;
    while (html.length < MAX) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
    }

    out.htmlBytesRead = html.length;
    out.ok = true;

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    out.title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

    const metaDescMatch =
      html.match(/<meta[^>]+name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]+content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
    out.metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';

    out.hasViewportMeta = /<meta[^>]+name\s*=\s*["']viewport["'][^>]*>/i.test(html);

    const ldMatches = html.match(/application\/ld\+json/gi);
    out.jsonLdBlocks = ldMatches ? ldMatches.length : 0;

    console.log(`[HTTP-AUDIT] OK ${targetUrl} → ${out.ttfbMs}ms TTFB, ${out.htmlBytesRead}b HTML`);
    return out;
  } catch (err) {
    out.error = err.name === 'AbortError' ? 'Request timed out (28s)' : err.message;
    console.warn('[HTTP-AUDIT] Failed:', targetUrl, out.error);
    return out;
  }
}

/** Shape-compatible subset of Lighthouse/PSI psiData for buildFallbackAuditReport */
function buildPsiLikeFromHttpCrawl(signals) {
  if (!signals.ok || signals.ttfbMs == null) return null;

  const ttfb = signals.ttfbMs;

  let performance = 52;
  if (ttfb < 180) performance = 82 + Math.min(18, Math.floor((180 - ttfb) / 15));
  else if (ttfb < 400) performance = 68 + Math.floor((400 - ttfb) / 25);
  else if (ttfb < 900) performance = 52 + Math.floor((900 - ttfb) / 70);
  else if (ttfb < 2200) performance = 34 + Math.floor((2200 - ttfb) / 180);
  else performance = Math.max(18, 40 - Math.floor((ttfb - 2200) / 350));

  let seo = 42;
  const metaLen = signals.metaDescription.length;
  if (metaLen >= 50 && metaLen <= 185) seo += 28;
  else if (metaLen >= 25) seo += 14;
  else if (metaLen > 0) seo += 6;

  const titleLen = signals.title.length;
  if (titleLen >= 15 && titleLen <= 65) seo += 18;
  else if (titleLen >= 8) seo += 10;

  if (signals.hasViewportMeta) seo += 10;
  if (signals.jsonLdBlocks > 0) seo += Math.min(12, signals.jsonLdBlocks * 4);

  seo = clampScore(seo);

  let accessibility = signals.hasViewportMeta ? 58 : 46;
  if (signals.title.length > 3) accessibility += 6;
  accessibility = clampScore(accessibility);

  let bestPractices = signals.isHttps ? (signals.httpStatus === 200 ? 74 : 62) : 34;
  if (signals.jsonLdBlocks > 0) bestPractices += 6;
  bestPractices = clampScore(bestPractices);

  const lcpNote = `${Math.round(ttfb)}ms to first byte (HTTP crawl — not Core Web Vitals)`;

  return {
    performance: clampScore(performance),
    seo,
    accessibility,
    bestPractices,
    lcp: lcpNote,
    isHttps: signals.isHttps,
    screenshot: null,
    metrics: {
      fcp: `~${Math.round(ttfb)}ms TTFB`,
      tti: 'N/A (server HTML crawl)',
      cls: 'N/A (server HTML crawl)',
    },
  };
}

function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(Number(n))));
}

/** Deterministic variation when PSI is unavailable so different domains don't all share one score */
function hostnameEntropy(hostname) {
  let h = 2166136261;
  for (let i = 0; i < hostname.length; i++) {
    h ^= hostname.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Site-specific scores from Lighthouse (when PSI works) or hostname entropy (when it doesn't).
 * Numeric scores must never be a single hardcoded mock — that caused identical audits for every URL.
 */
function buildFallbackAuditReport(targetUrl, psiData, actualSsl, actualSpeed, screenshotBase64, psiOpts = {}) {
  const keyConfigured = !!psiOpts.keyConfigured;
  const psiError = psiOpts.psiError || null;
  const measurementSource =
    psiOpts.measurementSource ||
    (psiData ? 'google_lighthouse' : 'none');
  const crawl = psiOpts.httpCrawlSignals || null;
  const psiSetupHint = !psiData ? derivePsiSetupHint(psiError) : null;

  let hostname = 'site';
  try {
    hostname = new URL(targetUrl).hostname.replace(/^www\./i, '');
  } catch (_) {}

  let mobileFirstScore = 52;
  let googleAiReadyScore = 44;
  let leadsEstimatesScore = 48;

  if (psiData) {
    mobileFirstScore = psiData.performance;
    const seo = psiData.seo ?? 50;
    const bp = psiData.bestPractices ?? 50;
    const a11y = psiData.accessibility ?? 50;
    googleAiReadyScore = clampScore(seo * 0.52 + bp * 0.28 + mobileFirstScore * 0.2);
    leadsEstimatesScore = clampScore(a11y * 0.42 + seo * 0.38 + (actualSsl ? 20 : 5));
  } else {
    const e = hostnameEntropy(hostname);
    mobileFirstScore = 28 + (e % 45);
    googleAiReadyScore = 25 + ((e >> 3) % 50);
    leadsEstimatesScore = 30 + ((e >> 7) % 42);
  }

  if (!actualSsl) {
    mobileFirstScore = clampScore(mobileFirstScore - 12);
    googleAiReadyScore = clampScore(googleAiReadyScore - 18);
    leadsEstimatesScore = clampScore(leadsEstimatesScore - 10);
  }

  const score = clampScore(
    mobileFirstScore * 0.38 + leadsEstimatesScore * 0.32 + googleAiReadyScore * 0.3
  );

  const mobileStatus =
    psiData && psiData.performance >= 90 ? 'pass' : psiData && psiData.performance >= 50 ? 'warning' : 'fail';

  let metaStatus = 'warning';
  if (psiData) {
    if (measurementSource === 'http_crawl' && crawl?.metaDescription !== undefined) {
      const ml = crawl.metaDescription.length;
      metaStatus = ml >= 50 && ml <= 185 ? 'pass' : ml >= 25 ? 'warning' : ml > 0 ? 'warning' : 'fail';
    } else {
      metaStatus = psiData.seo >= 85 ? 'pass' : psiData.seo >= 60 ? 'warning' : 'fail';
    }
  }

  const summary = psiData
    ? measurementSource === 'http_crawl'
      ? `${actualSsl ? '' : 'CRITICAL: Insecure or missing HTTPS. '}Approximate scores from AdHello HTTP crawl of ${hostname} (~${crawl?.ttfbMs ?? '?'}ms first byte). Parsed HTML for title, meta description, viewport, JSON-LD — not Google Lighthouse. Set GOOGLE_PSI_API_KEY for Core Web Vitals from Google.`
      : `${actualSsl ? '' : 'CRITICAL: Insecure or missing HTTPS. '}Lighthouse mobile performance is ${psiData.performance}/100; SEO ${psiData.seo}/100. Gaps in structured data and AI-search signals still limit visibility in ChatGPT, Perplexity, and AI Overviews.`
    : psiSetupHint
      ? `Lighthouse could not run for ${hostname}: Google blocked PageSpeed API calls from this deployment (API/key configuration — not your website). Sub-scores below are estimated until PageSpeed access is fixed.`
      : keyConfigured
        ? `Lighthouse data was unavailable for ${hostname}${psiError ? ` (${psiError.length > 160 ? `${psiError.slice(0, 157)}…` : psiError})` : ''}. Sub-scores below are estimated from HTTPS checks and domain signals until PageSpeed returns successfully.`
        : `Google PageSpeed did not return Lighthouse data for ${hostname}. Without GOOGLE_PSI_API_KEY the public PSI quota is very tight — add a PageSpeed Insights API key to your server for reliable measured scores. Current numbers are estimated, not field Lighthouse results.`;

  const brandAnalysisFallback = psiData
    ? null
    : psiSetupHint
      ? 'Google rejected the PageSpeed Insights request. Enable the PageSpeed Insights API and fix API key restrictions (API + application restrictions) for server-side use — see the yellow notice above for steps.'
      : keyConfigured
        ? `We could not complete a Lighthouse scan for ${hostname}${psiError ? `: ${psiError.length > 200 ? `${psiError.slice(0, 197)}…` : psiError}` : ''}. Narrative sections below may be lighter until PageSpeed succeeds.`
        : `We could not run a full Lighthouse scan on ${hostname}. Deploy GOOGLE_PSI_API_KEY so audits use Google's mobile Lighthouse scores instead of estimates.`;

  return {
    score,
    mobileFirstScore,
    leadsEstimatesScore,
    googleAiReadyScore,
    summary,
    psiMeta: {
      lighthouseAvailable: measurementSource === 'google_lighthouse',
      httpCrawlUsed: measurementSource === 'http_crawl',
      measurementSource,
      googlePsiApiKeyConfigured: keyConfigured,
      lastError: psiData ? null : psiError,
      setupHint: psiSetupHint,
      httpCrawlSummary:
        crawl && crawl.ok
          ? {
              ttfbMs: crawl.ttfbMs,
              htmlBytesRead: crawl.htmlBytesRead,
              jsonLdBlocks: crawl.jsonLdBlocks,
              titleLen: crawl.title?.length ?? 0,
              metaLen: crawl.metaDescription?.length ?? 0,
            }
          : null,
    },
    brandAnalysis:
      psiData && measurementSource === 'http_crawl'
        ? 'We fetched your HTML directly (no PageSpeed) and estimated performance/SEO from response time and on-page tags. For true Core Web Vitals, connect a valid Google PSI key or run Lighthouse manually inside your stack.'
        : psiData
          ? 'Signals from Google mobile crawl suggest room to sharpen positioning and trust cues for AI-powered discovery.'
          : brandAnalysisFallback,
    brandColors: { primary: '#1a1a2e', accent: '#F3DD6D', background: '#F5F0E8', text: '#1a1a2e' },
    technicalAudit: {
      mobileSpeed: {
        label: 'Mobile Load Speed',
        status: mobileStatus,
        value: actualSpeed,
        reason:
          measurementSource === 'google_lighthouse'
            ? 'Measured via Google Lighthouse (mobile).'
            : measurementSource === 'http_crawl'
              ? 'Estimated from server response time (TTFB) — not Lighthouse LCP.'
              : 'LCP not available — PageSpeed did not return metrics.',
      },
      contactForm: {
        label: 'Lead Capture Form',
        status: 'warning',
        value: 'Not verified',
        reason: 'Form detection requires a deeper crawl than Lighthouse summary.',
      },
      sslCertificate: {
        label: 'SSL Certificate',
        status: actualSsl ? 'pass' : 'fail',
        value: actualSsl ? 'Secure' : 'Insecure',
        reason: actualSsl
          ? measurementSource === 'http_crawl'
            ? 'HTTPS verified from crawl final URL.'
            : psiData
              ? 'HTTPS reported by Lighthouse.'
              : 'HTTPS inferred from the audited URL.'
          : 'HTTPS missing or broken — critical for trust and rankings.',
      },
      metaDescription: {
        label: 'Meta Description',
        status: metaStatus,
        value:
          measurementSource === 'http_crawl' && crawl?.metaDescription
            ? `${crawl.metaDescription.slice(0, 140)}${crawl.metaDescription.length > 140 ? '…' : ''}`
            : psiData
              ? measurementSource === 'http_crawl'
                ? 'No meta description found in first 450KB of HTML'
                : `SEO category ~${psiData.seo}/100`
              : 'Unknown',
        reason:
          measurementSource === 'http_crawl'
            ? 'Parsed from first ~450KB of HTML (meta name=description).'
            : psiData
              ? 'SEO score reflects meta, crawlability, and mobile basics.'
              : 'Unable to score without Lighthouse SEO category.',
      },
      googleBusinessProfile: {
        label: 'Google Business Profile',
        status: 'warning',
        value: 'Verify manually',
        reason: 'GBP is not exposed in Lighthouse; confirm your listing separately.',
      },
      reviewSentiment: {
        label: 'Review Sentiment',
        status: 'warning',
        value: 'Unknown',
        reason: 'Review data is not available from this automated scan.',
      },
    },
    strengths: [
      {
        indicator: actualSsl ? 'HTTPS' : 'Live domain',
        description: actualSsl
          ? 'HTTPS is enabled — a baseline requirement for AI and local search.'
          : 'Site resolves; enabling HTTPS should be your first priority.',
      },
    ],
    weaknesses: [
      {
        indicator: 'AI & structured data',
        description:
          'AI engines favor clear entities, schema, and crawl-friendly content. Closing gaps here raises discoverability.',
      },
    ],
    recommendations: [
      {
        title: 'Publish machine-readable facts',
        description: 'Add accurate LocalBusiness / Service schema and entity-consistent NAP across the site.',
        action: 'Plan schema rollout',
      },
    ],
    city: 'Local Area',
    reviewThemes: ['Service quality', 'Local trust'],
    screenshot: screenshotBase64,
  };
}

/** Pull JSON object out of model noise (prose + markdown fences) */
function extractJsonObject(text) {
  if (!text || typeof text !== 'string') return '{}';
  const trimmed = text.trim();
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch (_) {}
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const slice = trimmed.slice(start, end + 1);
    try {
      JSON.parse(slice);
      return slice;
    } catch (_) {}
  }
  return trimmed;
}

function cleanAIResponse(text) {
  if (!text) return '';
  try {
    const parsed = JSON.parse(text.trim());
    return parsed.response || parsed.text || parsed.content || text;
  } catch (e) {
    const match = text.match(/\{[\s\S]*"response"\s*:\s*"([\s\S]*?)"[\s\S]*\}/i);
    if (match && match[1]) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    return text.replace(/^```json\s*|```$/g, '').trim();
  }
}

function normalizeAdBriefPayload(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const ac = Array.isArray(raw.adConcepts) ? raw.adConcepts : [];
  return {
    productAnalysis: String(raw.productAnalysis ?? ''),
    visualPrompt: String(raw.visualPrompt ?? ''),
    targetAudience: Array.isArray(raw.targetAudience) ? raw.targetAudience : [],
    marketInsights: Array.isArray(raw.marketInsights) ? raw.marketInsights : [],
    competitiveAdvantages: Array.isArray(raw.competitiveAdvantages) ? raw.competitiveAdvantages : [],
    adConcepts: ac.length
      ? ac
      : [
          { platform: 'Instagram', headline: '', body: '', cta: '' },
          { platform: 'Facebook', headline: '', body: '', cta: '' },
          { platform: 'TikTok', headline: '', body: '', cta: '' },
        ],
  };
}

// --- ANALYTICS PROXY ---
// Forwards tracking data to Agency OS (leadsos) to bypass DNS/CORS issues
app.post('/api/track', async (req, res) => {
  const LEADSOS_URL = 'https://adhello-leadsos-346957283381.us-west1.run.app';
  console.log('[ANALYTICS] Proxy received ping for:', req.body.path);
  
  try {
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    
    const forwardRes = await fetch(`${LEADSOS_URL}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...req.body,
        ip: clientIp // Forward the real client IP to the backend
      })
    });
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[ANALYTICS-PROXY] Failed to forward tracking data:', err.message);
    res.status(200).json({ success: false, error: 'Proxy failed silently' });
  }
});

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  
  let targetUrl = url;
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  // --- 1. Try Google PageSpeed Insights (Lighthouse via Google) ---
  let { psiData, psiError, keyConfigured } = await getPageSpeedInsights(targetUrl);
  let measurementSource = psiData ? 'google_lighthouse' : 'none';
  let httpCrawlSignals = null;

  // --- 2. Direct HTTP crawl when PSI fails — real TTFB + HTML parsing (no Google quota) ---
  if (!psiData) {
    httpCrawlSignals = await fetchHttpAuditSignals(targetUrl);
    const synthetic = buildPsiLikeFromHttpCrawl(httpCrawlSignals);
    if (synthetic) {
      psiData = synthetic;
      psiError = null;
      measurementSource = 'http_crawl';
      console.log('[ANALYSIS] Using HTTP crawl fallback (PSI unavailable).');
    }
  }

  const initialProtocolCheck = targetUrl.startsWith('https');
  const actualSsl = psiData ? psiData.isHttps : initialProtocolCheck;
  const actualSpeed = psiData ? psiData.lcp : '3.1s';
  const screenshotBase64 = psiData ? psiData.screenshot : null;

  const baselineReport = buildFallbackAuditReport(targetUrl, psiData, actualSsl, actualSpeed, screenshotBase64, {
    psiError,
    keyConfigured,
    measurementSource,
    httpCrawlSignals,
  });

  try {
    if (KIE_API_KEY || GEMINI_API_KEY) {
      const metricsLabel =
        measurementSource === 'http_crawl'
          ? `These scores are approximate and come from AdHello HTTP crawl (TTFB + HTML parsing), NOT Google Lighthouse — PSI was unavailable for this deployment.`
          : `Official Google Lighthouse metrics (mobile) from PageSpeed Insights:`;
      const prompt = `Analyze the website ${targetUrl}.

${metricsLabel}

Performance score: ${psiData ? psiData.performance : 'unknown'}
SEO score: ${psiData ? psiData.seo : 'unknown'}
Accessibility: ${psiData ? psiData.accessibility : 'unknown'}
Best practices: ${psiData ? psiData.bestPractices : 'unknown'}
SSL Secured: ${actualSsl}
Primary timing / LCP-style display string: ${actualSpeed}

Return ONLY a raw JSON object (no markdown, no prose) with this structure:
{"summary":"string","brandAnalysis":"string","brandColors":{"primary":"#hex","accent":"#hex","background":"#hex","text":"#hex"},"technicalAudit":{"contactForm":{"label":"Contact Form","status":"pass|fail|warning","value":"string","reason":"string"},"metaDescription":{"label":"Meta Description","status":"pass|fail|warning","value":"string","reason":"string"},"googleBusinessProfile":{"label":"Google Business Profile","status":"pass|fail|warning","value":"string","reason":"string"},"reviewSentiment":{"label":"Review Sentiment","status":"pass|fail|warning","value":"string","reason":"string"}},"strengths":[{"indicator":"string","description":"string"}],"weaknesses":[{"indicator":"string","description":"string"}],"recommendations":[{"title":"string","description":"string","action":"string"}],"city":"string","reviewThemes":["string","string","string"]}

Do NOT include score, mobileFirstScore, leadsEstimatesScore, or googleAiReadyScore — the server computes those.
For brandColors: infer from the business if possible.
IMPORTANT: Respect SSL status ${actualSsl}. If FALSE, call out the security risk in summary and weaknesses.
If metrics are from HTTP crawl (not Lighthouse), say so briefly in summary and avoid claiming "Google measured" Core Web Vitals.`;

      const resultText = await callAI(prompt, '', [], true);
      if (!resultText) throw new Error('Empty response from AI providers');

      const cleaned = cleanAIResponse(resultText);
      const jsonStr = extractJsonObject(cleaned);
      const parsed = JSON.parse(jsonStr);

      const merged = {
        ...baselineReport,
        ...parsed,
        score: baselineReport.score,
        mobileFirstScore: baselineReport.mobileFirstScore,
        leadsEstimatesScore: baselineReport.leadsEstimatesScore,
        googleAiReadyScore: baselineReport.googleAiReadyScore,
        psiMeta: baselineReport.psiMeta,
        summary: parsed.summary || baselineReport.summary,
        brandAnalysis: parsed.brandAnalysis || baselineReport.brandAnalysis,
        brandColors: parsed.brandColors || baselineReport.brandColors,
        technicalAudit: {
          ...baselineReport.technicalAudit,
          ...(parsed.technicalAudit || {}),
          mobileSpeed: baselineReport.technicalAudit.mobileSpeed,
          sslCertificate: baselineReport.technicalAudit.sslCertificate,
          metaDescription: parsed.technicalAudit?.metaDescription || baselineReport.technicalAudit.metaDescription,
        },
        strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : baselineReport.strengths,
        weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length ? parsed.weaknesses : baselineReport.weaknesses,
        recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length ? parsed.recommendations : baselineReport.recommendations,
        city: parsed.city || baselineReport.city,
        reviewThemes: Array.isArray(parsed.reviewThemes) && parsed.reviewThemes.length ? parsed.reviewThemes : baselineReport.reviewThemes,
        screenshot: screenshotBase64,
      };

      return res.json(merged);
    }
    return res.json(baselineReport);
  } catch (err) {
    console.error('[ANALYSIS] AI error:', err);
    return res.json(baselineReport);
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
    if (KIE_API_KEY || GEMINI_API_KEY) {
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

      const resultText = await callAI(prompt, '', [], true);
      if (!resultText) throw new Error('Empty response from AI providers');
      
      const parsed = JSON.parse(cleanAIResponse(resultText));
      
      return res.json({
        ...parsed,
        brandColors: colors,
        vibe: vibe || 'Modern',
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
      vibe: vibe || 'Modern',
      city,
      companyName: bizName,
      isNoWebsiteFlow: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Strategy generation failed.' });
  }
});

// =====================================================
// PHASE HTML GENERATOR (personalized per client)
// =====================================================
function buildPhaseHtml(bizName, cityLabel, t0, t1, t2, colors = {}, headlines = {}, vibe = 'Modern') {
  // Unified color palette across ALL 3 phases
  const bg   = colors.background || '#F5F0E8';
  const textColor = colors.text   || '#1a1a2e';
  const pri  = colors.primary     || '#1a1a2e';
  const acc  = colors.accent      || '#F3DD6D';

  const heroH1 = headlines.hero || `${bizName}<br><span>${cityLabel}'s Best</span>`;
  const heroSub = headlines.sub || `Trusted by hundreds of ${cityLabel} customers for ${t0.toLowerCase()}, ${t1.toLowerCase()}, and results that speak for themselves.`;
  const heroCTA = headlines.cta || '⚡ Get Free Quote';

  const borderRadius = vibe === 'Classic' ? '0px' : vibe === 'Friendly' ? '32px' : '20px';
  const fontFamily = "'Inter', 'Outfit', sans-serif";

  const commonStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;font-family:${fontFamily}}
    body{background:${bg};color:${textColor};min-height:100vh;overflow-x:hidden}
    nav{background:${bg};border-bottom:1px solid ${pri}18;padding:18px 36px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:100}
    .logo{font-weight:900;font-size:20px;letter-spacing:-1px;color:${pri}}
    .nav-cta{background:${acc};color:${pri};padding:10px 24px;border-radius:100px;font-weight:900;font-size:13px;border:none;cursor:pointer;box-shadow:0 4px 14px ${acc}66}
  `;

  // Phase 1: Foundation — same brand colors, contractor-specific layout
  const p1 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
${commonStyles}
.hero{padding:60px 36px 30px;display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;align-items:center;max-width:1100px;margin:0 auto}
h1{font-size:48px;font-weight:900;line-height:1.05;letter-spacing:-2px;margin-bottom:18px;color:${pri}}
h1 span{color:${acc};display:block}
.sub{font-size:17px;opacity:0.7;margin-bottom:28px;line-height:1.6;max-width:480px;color:${textColor}}
.btn-p{background:${acc};color:${pri};padding:16px 32px;border-radius:${borderRadius};font-weight:900;font-size:15px;border:none;cursor:pointer}
.stars{display:flex;align-items:center;gap:8px;margin-top:20px;font-size:13px;font-weight:700;color:${acc}}
.hero-img{background:linear-gradient(135deg,${pri},${acc}44);border-radius:${borderRadius};height:350px;display:flex;align-items:center;justify-content:center;font-size:64px;box-shadow:0 24px 48px rgba(0,0,0,0.08)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:30px 36px 60px;max-width:1100px;margin:0 auto}
.card{background:#fff;border-radius:${borderRadius};padding:28px;border:1px solid ${pri}12;transition:all 0.3s}
.icon{font-size:28px;margin-bottom:16px}
.card h4{font-size:17px;font-weight:900;margin-bottom:10px;color:${pri}}
.card p{font-size:13px;opacity:0.55;line-height:1.6;color:${textColor}}
</style></head><body>
<nav><div class="logo">${bizName}</div><button class="nav-cta">Get Started</button></nav>
<div class="hero">
  <div><h1>${heroH1}</h1><p class="sub">${heroSub}</p>
  <button class="btn-p">${heroCTA}</button>
  <div class="stars">★★★★★ <span style="opacity:0.5;color:${textColor}">4.9/5 · Verified ${cityLabel} Jobs</span></div></div>
  <div class="hero-img">🏗️</div>
</div>
<div class="grid">
  <div class="card"><div class="icon">🏆</div><h4>Elite ${t0}</h4><p>We've built our reputation in ${cityLabel} on providing the absolute highest level of ${t0.toLowerCase()}.</p></div>
  <div class="card"><div class="icon">⚡</div><h4>Fast ${t1}</h4><p>When you need ${t1.toLowerCase()}, we respond instantly. We know your time is valuable.</p></div>
  <div class="card"><div class="icon">🛡️</div><h4>Proven ${t2}</h4><p>Trust is earned. Over 200 homeowners in ${cityLabel} rely on our ${t2.toLowerCase()} every year.</p></div>
</div>
</body></html>`;

  // Phase 2: Conversion — same brand colors, urgency-focused
  const p2 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
${commonStyles}
body{background:${bg}}
.top-bar{background:${acc};color:${pri};padding:10px;text-align:center;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:460px}
.content{padding:60px 48px;display:flex;flex-direction:column;justify-content:center}
.urgency{background:${acc}33;color:${pri};padding:7px 16px;border-radius:50px;font-size:11px;font-weight:900;margin-bottom:18px;display:inline-block;border:1px solid ${acc}}
h1{font-size:40px;font-weight:900;line-height:1.1;margin-bottom:20px;color:${pri}}
.form-container{background:#fff;padding:48px;display:flex;align-items:center;justify-content:center}
.form-card{background:#fff;padding:36px;border-radius:${borderRadius};box-shadow:0 20px 40px rgba(0,0,0,0.08);width:100%;max-width:380px;border:1px solid ${pri}12}
h3{font-size:22px;font-weight:900;margin-bottom:6px;color:${pri}}
.form-card p{font-size:13px;opacity:0.55;margin-bottom:22px;color:${textColor}}
input{width:100%;padding:13px 16px;border-radius:12px;border:2px solid ${pri}15;margin-bottom:10px;font-size:14px;outline:none;box-sizing:border-box;background:${bg}}
input:focus{border-color:${acc}}
.submit-btn{width:100%;padding:14px;background:${acc};color:${pri};border-radius:12px;font-weight:900;border:none;cursor:pointer;font-size:15px}
</style></head><body>
<div class="top-bar">🔥 Only 3 openings left this week in ${cityLabel}</div>
<nav><div class="logo">${bizName}</div><button class="nav-cta">Call Now</button></nav>
<div class="hero">
  <div class="content">
    <div class="urgency">⚡ LIVE IN ${cityLabel.toUpperCase()}</div>
    <h1>Stop Settling for Less than Elite ${t0}</h1>
    <p style="font-size:16px;line-height:1.6;opacity:0.65;margin-bottom:24px;color:${textColor}">We handle everything for ${bizName} clients — from the first call to the final inspection.</p>
    <ul style="list-style:none;gap:10px;display:grid">
      <li style="font-weight:800;color:${pri}">✅ 100% Satisfaction Guarantee</li>
      <li style="font-weight:800;color:${pri}">✅ Professional & Licensed in ${cityLabel}</li>
      <li style="font-weight:800;color:${pri}">✅ Free Estimates Within 24-Hours</li>
    </ul>
  </div>
  <div class="form-container">
    <div class="form-card">
      <h3>Get Your Quote</h3>
      <p>Fill out the form and we'll contact you within 15 minutes.</p>
      <input placeholder="Full Name" readonly>
      <input placeholder="Phone Number" readonly>
      <input placeholder="Service Needed" readonly>
      <button class="submit-btn">${heroCTA}</button>
    </div>
  </div>
</div>
</body></html>`;

  // Phase 3: Elite Authority — same brand colors, dark + accent override
  const darkBg = pri;
  const p3 = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
${commonStyles}
body{background:${darkBg};color:#fff}
nav{background:transparent;border-color:rgba(255,255,255,0.1)}
.logo{color:#fff}
.nav-cta{background:${acc};color:${pri}}
.hero{padding:100px 36px;text-align:center;max-width:900px;margin:0 auto}
.badge{background:linear-gradient(to right,${acc},${acc}88);-webkit-background-clip:text;color:transparent;font-weight:900;text-transform:uppercase;letter-spacing:4px;font-size:13px;margin-bottom:22px;display:block}
h1{font-size:64px;font-weight:900;letter-spacing:-3px;margin-bottom:28px;color:#fff}
h1 span{color:${acc}}
p.lead{font-size:18px;opacity:0.55;line-height:1.7;margin-bottom:44px;color:#fff}
.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;border-top:1px solid rgba(255,255,255,0.1);padding-top:44px}
.stat h2{font-size:44px;font-weight:900;color:${acc};margin-bottom:6px}
.stat p{text-transform:uppercase;font-size:11px;font-weight:900;opacity:0.35;letter-spacing:2px;color:#fff}
.btn-elite{background:${acc};color:${pri};padding:18px 44px;border-radius:100px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;border:none;cursor:pointer;font-size:14px;margin-top:20px}
</style></head><body>
<nav><div class="logo">${bizName.toUpperCase()}</div><button class="nav-cta">Elite Access</button></nav>
<div class="hero">
  <span class="badge">The Authority in ${cityLabel}</span>
  <h1>The Standard of <span>${t0}</span></h1>
  <p class="lead">${bizName} combines precision with elite ${t1.toLowerCase()}. We don't just do the job — we redefine what's possible for ${cityLabel} clients.</p>
  <button class="btn-elite">Start Your Project</button>
  <div class="stats-row">
    <div class="stat"><h2>15+</h2><p>Years Experience</p></div>
    <div class="stat"><h2>24/7</h2><p>Elite Support</p></div>
    <div class="stat"><h2>#1</h2><p>In ${cityLabel}</p></div>
  </div>
</div>
</body></html>`;

  return [p1, p2, p3];
}

// =====================================================
// FULFILLMENT ENGINE
// =====================================================
app.post('/api/fulfill', async (req, res) => {
  const { bizName, city, score, reviewThemes, brandColors, headlines, vibe } = req.body;
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

  const phaseHtml = buildPhaseHtml(
    bizName, 
    cityLabel, 
    t0, t1, t2, 
    brandColors || {}, 
    headlines || {}, 
    vibe || 'Modern'
  );
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
// SITE-WIDE CHATBOT
// =====================================================
app.post('/api/chatbot', async (req, res) => {
  const { messages, userMessage } = req.body;
  if (!userMessage) return res.status(400).json({ error: 'Message required' });

  let replyText = '';
  try {
    const systemPrompt = `You are the AdHello Sales Assistant — a friendly, knowledgeable guide who educates home service business owners (painters, electricians, plumbers, HVAC, roofers, flooring, movers) about modern AI-powered marketing.

YOUR GOAL: Book a VIP demo call with Alex, the founder of AdHello.ai. Every conversation should naturally move toward scheduling that call.

PERSONALITY:
- Warm, confident, genuinely curious about their business
- Talk like a smart friend, not a salesperson or corporate bot
- Short punchy sentences. Ask questions. Keep it conversational.
- Use analogies to explain complex concepts simply

EDUCATION TOPICS (weave these in naturally):
- Why traditional websites fail contractors (brochure sites vs conversion-focused smart sites)
- GEO (Generative Engine Optimization) — how AI search engines like ChatGPT, Perplexity, and Google AI Overviews choose which businesses to recommend
- The Quote Response Engine — automated lead capture, qualification, and follow-up
- Why most contractors lose 60%+ of leads to slow response times
- How AdHello handles everything so they can focus on jobs, not marketing

BOOKING THE CALL:
- After 2-3 exchanges, suggest booking a quick call with Alex
- Frame it as: "Want me to set up a quick 15-min call with Alex? He'll show you exactly how this would work for [their trade] in [their city]. No pitch, just a game plan."
- If they're interested, tell them to click the "Book Demo Meeting" button or go to: https://cal.com/adhello/demo

RULES:
- Never be pushy. Educate first, invite second.
- Keep responses under 3 short paragraphs
- Ask ONE question at a time to keep them engaged
- If they mention a pain point (leads, reviews, website, competitors), acknowledge it and connect it to how AdHello solves it`;
    
    replyText = await callAI(userMessage, systemPrompt, messages);
  } catch (err) {
    console.error('[SITE-CHAT] AI error:', err);
  }

  if (!replyText) {
    replyText = "Hey! I help home service pros like painters, electricians, and plumbers understand how AI is changing local marketing. What kind of work do you do? I'd love to show you how businesses like yours are getting found on Google and AI search engines.";
  }

  res.json({ text: cleanAIResponse(replyText) });
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

    if (KIE_API_KEY || GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are the "GEO Ranking Coach" for AdHello.ai — an elite local SEO expert who talks like a teammate, not a consultant.
You are coaching ${bizName} in ${city} (AEO score: ${score}/100).
${auditContext}
Your vibe: Professional but punchy and conversational. Use phrases like "Check this out," "Here's the move," or "Bottom line." 
Rules:
1. Be direct. Don't ramble.
2. Reference their actual data naturally (e.g., "I see your SSL is failing—that's a huge trust killer").
3. Give 1-2 actionable tips in every response.
4. Encourage them, but don't be afraid to be brutally honest about what's holding them back.
5. Use bullet points for steps.`;

        replyText = await callAI(message, systemPrompt, history);
      } catch (aiErr) {
        console.error('[CHAT] AI failed:', aiErr);
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
    // Real-time sync to Agency OS if user was logged/identified
    if (blueprintExists) {
      setImmediate(() => syncLeadToAgencyOS({ 
          id, 
          source: 'adhello_chatbot',
          bizName: bizName,
          city: city
      }));
    }

    res.json({ text: cleanAIResponse(replyText) });
  } catch (error) {
    console.error('[CHAT] Error:', error);
    res.status(500).json({ error: 'Chat failed. Please try again.' });
  }
});

// Sync Lead to Agency OS (adhelloleadsos)
async function syncLeadToAgencyOS(leadData) {
  const LEADSOS_URL = process.env.ADHELLO_LEADSOS_URL || 'https://leads.adhello.ai';
  const LEADSOS_KEY = process.env.ADHELLO_LEADSOS_API_KEY || 'adhello_secret_123';
  
  try {
    // Fetch chat history if we have a blueprint ID or lead identity
    let chatHistory = leadData.chatHistory || [];
    if (leadData.id && chatHistory.length === 0) {
      try {
        const rows = db.prepare('SELECT role, content FROM chat_history WHERE blueprint_id = ? ORDER BY created_at ASC').all(leadData.id);
        chatHistory = rows.map(r => ({ role: r.role, content: r.content }));
      } catch (e) {}
    }

    const payload = {
      title: leadData.bizName || leadData.name || 'New Lead',
      website: leadData.siteUrl || leadData.website || 'N/A',
      email: leadData.email || 'N/A',
      phone: leadData.phone || 'N/A',
      city: leadData.city || '',
      state: leadData.state || '',
      source: leadData.source || 'adhello_audit',
      totalScore: leadData.auditData?.score || leadData.score || 0,
      auditData: leadData.auditData || null,
      chatHistory: chatHistory,
      message: leadData.message || `Lead from AdHello: ${leadData.goal || 'Strategic Interest'} in ${leadData.industry || 'Unknown Trade'}`,
      // Custom metadata for Agency OS
      industry: leadData.industry || '',
      goal: leadData.goal || '',
      vibe: leadData.vibe || ''
    };

    const res = await fetch(`${LEADSOS_URL}/api/ingest`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': LEADSOS_KEY
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('[SYNC] Agency OS Response:', data);
  } catch (err) {
    console.error('[SYNC] Failed to push lead to Agency OS:', err.message);
  }
}

// --- ATTIO CRM SYNC ---
const ATTIO_API_KEY = process.env.ATTIO_API_KEY;
if (ATTIO_API_KEY) console.log('[ATTIO] API key configured');

async function syncLeadToAttio(leadData) {
  if (!process.env.ATTIO_API_KEY) return null;
  const headers = {
    'Authorization': 'Bearer ' + process.env.ATTIO_API_KEY,
    'Content-Type': 'application/json'
  };
  
  try {
    let companyId = null;
    
    // 1. Create or update Company
    if (leadData.bizName) {
      const companyRes = await fetch('https://api.attio.com/v2/objects/companies/records', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            values: {
              name: [{ value: leadData.bizName }],
              description: [{ value: 'Industry: ' + (leadData.industry || 'Home Services') + ' | City: ' + (leadData.city || '') + ' | Goal: ' + (leadData.goal || '') }]
            }
          }
        })
      });
      const companyData = await companyRes.json();
      companyId = companyData.data?.id?.record_id;
      console.log('[ATTIO] Company synced:', leadData.bizName, companyId || 'no-id');
    }
    
    // 2. Create Person and link to Company
    const personPayload = {
      data: {
        values: {
          name: [{ value: leadData.name || 'Unknown' }],
          email_addresses: leadData.email ? [{ email_address: leadData.email }] : [],
          phone_numbers: leadData.phone ? [{ phone_number: leadData.phone }] : [],
          description: [{ value: 'Source: ' + (leadData.source || 'adhello.ai') + ' | ' + (leadData.goal || '') }]
        }
      }
    };
    
    const personRes = await fetch('https://api.attio.com/v2/objects/people/records', {
      method: 'POST',
      headers,
      body: JSON.stringify(personPayload)
    });
    const personData = await personRes.json();
    console.log('[ATTIO] Person synced:', leadData.email, personData.data?.id?.record_id || 'no-id');
    
    return { company: companyId, person: personData.data?.id?.record_id };
  } catch (err) {
    console.error('[ATTIO] Failed:', err.message);
    return null;
  }
}



// Singular route for SiteAudit.tsx compatibility
app.post('/api/lead', async (req, res) => {
  const { name, email, phone, siteUrl, auditData, source } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

  try {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO leads (id, name, email, phone, bizName, industry, city, goal, vibe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, name, email, phone, auditData?.companyName || '', '', auditData?.city || '', '', ''
    );

    // Push to Agency OS
    await syncLeadToAgencyOS({ ...req.body, bizName: auditData?.companyName });
    await syncLeadToAttio({ ...req.body, bizName: auditData?.companyName });

    res.json({ id, success: true });
  } catch (error) {
    console.error('[LEADS] Error:', error);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

app.post('/api/leads', async (req, res) => {
  const { name, email, phone, bizName, industry, city, goal, vibe } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

  try {
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO leads (id, name, email, phone, bizName, industry, city, goal, vibe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, name, email, phone, bizName, industry, city, goal, vibe
    );

    // Send Email Notification
    if (resend) {
      resend.emails.send({
        from: 'AdHello leads <onboarding@resend.dev>',
        to: 'alex@adhello.ai',
        subject: `🔥 New Lead: ${bizName} (${industry})`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a2e;">
            <h2 style="color: #6366f1;">New Strategic Lead Captured</h2>
            <p><strong>Business:</strong> ${bizName}</p>
            <p><strong>Contact:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Industry:</strong> ${industry}</p>
            <p><strong>Location:</strong> ${city}</p>
            <p><strong>Goal:</strong> ${goal}</p>
            <p><strong>Vibe:</strong> ${vibe}</p>
            <br />
            <a href="https://adhello.ai" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">View Dashboard</a>
          </div>
        `
      }).catch(err => console.error('[MAIL] Error sending lead email:', err));
    }

    // Push to Agency OS
    await syncLeadToAgencyOS({ ...req.body, id, source: 'adhello_strategy' });
    await syncLeadToAttio({ ...req.body, id, source: 'adhello_strategy' });

    res.json({ id, success: true });
  } catch (error) {
    console.error('[LEADS] Error:', error);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// Ad Brief Download - email gate + CRM sync
app.post('/api/ad-brief/download', async (req, res) => {
  const { email, source, adPlatform } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  try {
    await syncLeadToAttio({ email, source: source || 'ad_brief_download', bizName: adPlatform || 'Ad Brief' });
    console.log('[AD-BRIEF] Download lead synced:', email);
    res.json({ success: true });
  } catch (err) {
    console.error('[AD-BRIEF] Download sync failed:', err);
    res.json({ success: true }); // Still allow download even if CRM sync fails
  }
});

/** Prepended to every ad image request so models composite the upload as real product placement (people + scenes). */
const AD_BRIEF_PLACEMENT_DIRECTIVE = `PRODUCT PLACEMENT — READ FIRST:
You are given a REFERENCE PRODUCT IMAGE (attached). Build a finished paid-social advertisement around THAT EXACT PRODUCT.
- Composite the real product from the reference into the scene (correct colors, logo, packaging). Do NOT invent a different product or substitute a generic item.
- Show it in-context: lifestyle setting, believable lighting, hands/model/environment that fit the category.
- Preserve realistic scale when held or placed next to people (hands, countertops, bodies).
- Include marketing overlays: bold headline text, secondary copy, CTA or footer strip where appropriate — readable sans-serif typography.
- Aim for premium DTC / Meta Ads quality: cohesive palette, depth, subtle shadows, not a flat collage.
Square 1:1 unless the creative brief says otherwise.`;

function buildDefaultAdImagePrompt({ headline, bodyText, platform, visualStyle }) {
  const lines = [
    visualStyle ? `Scene & brand vibe (from Ad Brief): ${visualStyle}` : null,
    `Platform: ${platform || 'social feed'}`,
    headline ? `Headline to show as large display type: "${headline}"` : null,
    bodyText ? `Body / subhead / footer copy to include legibly: "${bodyText}"` : null,
    'Layout: integrate the attached product as the hero; add a relatable person and/or setting; include trust or offer elements if it fits (e.g. star rating strip, promo pill, testimonial quote, feature icons).',
  ].filter(Boolean);
  return lines.join('\n');
}

/** Default true: Gemini image is usually faster than Kie async poll; set AD_BRIEF_TRY_GEMINI_FIRST=false to prefer Kie. */
const AD_BRIEF_TRY_GEMINI_FIRST = process.env.AD_BRIEF_TRY_GEMINI_FIRST !== 'false';

async function resolveAdBriefCreativeImage(textPrompt, rawB64, mime) {
  let img = null;

  if (AD_BRIEF_TRY_GEMINI_FIRST) {
    if (GEMINI_API_KEY) {
      img = await callGeminiImageOutput(textPrompt, rawB64, mime);
      if (!img) {
        console.warn('[GEN-IMAGE] Retrying Gemini without reference image.');
        img = await callGeminiImageOutput(textPrompt, null, mime);
      }
    }
    if (!img && KIE_API_KEY) {
      img = await callKie4oImageOutput(textPrompt, rawB64, mime);
      if (!img) {
        console.warn('[GEN-IMAGE] Kie text-only fallback.');
        img = await callKie4oImageOutput(textPrompt, null, mime);
      }
    }
    return img;
  }

  if (KIE_API_KEY) {
    img = await callKie4oImageOutput(textPrompt, rawB64, mime);
  }
  if (!img && GEMINI_API_KEY) {
    img = await callGeminiImageOutput(textPrompt, rawB64, mime);
  }
  if (!img && GEMINI_API_KEY) {
    console.warn('[GEN-IMAGE] Retrying Gemini without reference image.');
    img = await callGeminiImageOutput(textPrompt, null, mime);
  }
  if (!img && KIE_API_KEY && !GEMINI_API_KEY) {
    console.warn('[GEN-IMAGE] Kie text-only fallback (no reference image).');
    img = await callKie4oImageOutput(textPrompt, null, mime);
  }
  return img;
}

app.post('/api/ad-brief/generate-image', async (req, res) => {
  const {
    prompt: clientPrompt,
    imageBase64,
    imageMimeType,
    headline,
    body: bodyText,
    platform,
    originalImage,
    visualStyle,
  } = req.body;

  const rawB64 =
    imageBase64 ||
    (typeof originalImage === 'string' && originalImage.includes('base64,')
      ? originalImage.split('base64,')[1]
      : originalImage);
  if (!rawB64 || typeof rawB64 !== 'string') {
    return res.status(400).json({ error: 'Image required (imageBase64 or originalImage)' });
  }

  let mime = imageMimeType;
  if (!mime && typeof originalImage === 'string' && originalImage.startsWith('data:')) {
    mime = originalImage.match(/^data:([^;]+);/)?.[1];
  }
  mime = mime || 'image/jpeg';

  const userDirection =
    clientPrompt ||
    buildDefaultAdImagePrompt({
      headline,
      bodyText,
      platform,
      visualStyle,
    }) ||
    `Create a scroll-stopping ${platform || 'social'} feed ad using the attached product image as the hero.`;
  const textPrompt = `${AD_BRIEF_PLACEMENT_DIRECTIVE}\n\n--- CREATIVE DIRECTION ---\n${userDirection}`;

  try {
    const img = await resolveAdBriefCreativeImage(textPrompt, rawB64, mime);
    if (!img) {
      return res.status(500).json({
        error: 'Generation failed',
        detail: 'No image returned. Set KIE_API_KEY (Kie 4o Image) or GEMINI_API_KEY.',
      });
    }

    let imageBase64Out = null;
    let mimeTypeOut = 'image/png';
    const m = img.match(/^data:([^;]+);base64,(.+)$/);
    if (m) {
      mimeTypeOut = m[1];
      imageBase64Out = m[2];
    }

    res.json({
      success: true,
      source: 'generated',
      imageUrl: img,
      imageBase64: imageBase64Out,
      mimeType: mimeTypeOut,
    });
  } catch (e) {
    console.error('[GEN-IMAGE]', e);
    res.status(500).json({ error: 'Generation failed', detail: e.message });
  }
});

app.post('/api/stitch-design', (req, res) => res.json({ success: true }));

const MOCKUP_RATE_WINDOW_MS = 60 * 1000;
const MOCKUP_RATE_MAX_REQUESTS = 6;
const mockupRateLimit = new Map();

function getClientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
}

function isMockupRateLimited(ip) {
  const now = Date.now();
  const entry = mockupRateLimit.get(ip) || { count: 0, resetAt: now + MOCKUP_RATE_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + MOCKUP_RATE_WINDOW_MS;
  }
  entry.count += 1;
  mockupRateLimit.set(ip, entry);
  return entry.count > MOCKUP_RATE_MAX_REQUESTS ? Math.ceil((entry.resetAt - now) / 1000) : 0;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeMockupHtml(raw) {
  if (!raw || typeof raw !== 'string') return '';
  let cleaned = cleanAIResponse(raw)
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  // If provider returned JSON string, try common fields.
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const parsed = JSON.parse(cleaned);
      const candidate = parsed.html || parsed.code || parsed.response || parsed.content || '';
      if (typeof candidate === 'string' && candidate.trim()) {
        cleaned = candidate.trim();
      }
    } catch (_) {}
  }

  if (!cleaned) return '';
  if (!cleaned.includes('<div')) {
    return `<div class="min-h-screen bg-neutral-950 text-white p-8"><pre class="whitespace-pre-wrap text-sm text-neutral-200">${escapeHtml(cleaned)}</pre></div>`;
  }
  return cleaned;
}

function buildLocalMockupFallback({ prompt, pageType, siteName }) {
  const lower = String(prompt || '').toLowerCase();
  const isDark = /dark|black|modern|luxury/.test(lower);
  const accent = /blue|hvac|tech/.test(lower)
    ? 'bg-blue-500'
    : /green|landscape|eco|flooring/.test(lower)
      ? 'bg-green-500'
      : /red|roof|emergency/.test(lower)
        ? 'bg-red-500'
        : 'bg-amber-400';
  const pageTitleMap = {
    home: 'Home',
    services: 'Services',
    about: 'About',
    contact: 'Contact',
  };
  const title = pageTitleMap[pageType] || 'Landing Page';
  const brand = siteName || 'Smart Site';
  const body = isDark ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900';
  const card = isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200';

  return `<div class="${body} min-h-screen">
  <header class="border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200'}">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <p class="font-bold text-lg">${escapeHtml(brand)}</p>
      <button class="${accent} text-white px-4 py-2 rounded-lg font-semibold">Get Quote</button>
    </div>
  </header>
  <main class="max-w-6xl mx-auto px-6 py-12 space-y-10">
    <section class="space-y-4">
      <p class="text-xs uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-500'}">Fallback Preview</p>
      <h1 class="text-4xl md:text-5xl font-extrabold">${escapeHtml(brand)} ${title}</h1>
      <p class="${isDark ? 'text-neutral-300' : 'text-neutral-600'} max-w-2xl">
        AI providers are temporarily unavailable, so this instant fallback mockup was generated locally from your prompt.
      </p>
      <p class="text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}">Prompt: ${escapeHtml(prompt).slice(0, 220)}</p>
    </section>
    <section class="grid md:grid-cols-3 gap-5">
      <div class="${card} border rounded-xl p-5"><h3 class="font-bold mb-2">Section 01</h3><p class="${isDark ? 'text-neutral-300' : 'text-neutral-600'} text-sm">Primary offer and trust headline.</p></div>
      <div class="${card} border rounded-xl p-5"><h3 class="font-bold mb-2">Section 02</h3><p class="${isDark ? 'text-neutral-300' : 'text-neutral-600'} text-sm">Service highlights and outcomes.</p></div>
      <div class="${card} border rounded-xl p-5"><h3 class="font-bold mb-2">Section 03</h3><p class="${isDark ? 'text-neutral-300' : 'text-neutral-600'} text-sm">CTA strip and conversion prompt.</p></div>
    </section>
  </main>
</div>`;
}

app.post('/api/generate-mockup', async (req, res) => {
  const { prompt, previousHtml, mode, pageType, styleMemory } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const retryAfter = isMockupRateLimited(getClientIp(req));
  if (retryAfter > 0) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again shortly.',
      retryAfterSeconds: retryAfter
    });
  }

  if (!GEMINI_API_KEY && !KIE_API_KEY) {
    return res.status(503).json({ error: 'No AI provider configured. Set KIE_API_KEY or GEMINI_API_KEY.' });
  }

  const systemInstruction = `You are a senior UI designer.
Output only raw HTML with Tailwind utility classes.
Return code inside exactly one root <div>...</div>.
No markdown, no triple backticks, no explanations, no <html>/<head>/<body>, no scripts.
Keep semantic structure clean and production-like.`;
  const pageContext = pageType ? `Target page type: ${pageType}.` : '';
  const styleContext = styleMemory && typeof styleMemory === 'string' && styleMemory.trim().length > 0
    ? `Shared style memory (must stay consistent across pages):\n${styleMemory}`
    : '';
  const userPrompt = previousHtml && typeof previousHtml === 'string' && previousHtml.trim().length > 0
    ? `Generation mode: ${mode === 'refine' ? 'refine existing design' : 'new design with context'}.
${pageContext}
${styleContext}
User request:
${prompt}

Current design HTML to improve:
${previousHtml}`
    : `${pageContext}\n${styleContext}\n${prompt}`.trim();

  try {
    // Use the existing provider orchestrator (Kie -> Gemini fallback) for reliability.
    const aiResult = await callAI(userPrompt, systemInstruction, [], false);
    let cleaned = normalizeMockupHtml(aiResult || '');
    if (!cleaned) {
      console.warn('[MOCKUP] AI unavailable, using local fallback mockup.');
      cleaned = buildLocalMockupFallback({
        prompt,
        pageType,
        siteName: req.body?.siteName
      });
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-transform');

    // Simulate streaming chunks so the current frontend continues to update live.
    const chunkSize = 180;
    for (let i = 0; i < cleaned.length; i += chunkSize) {
      res.write(cleaned.slice(i, i + chunkSize));
      await sleep(12);
    }
    res.end();
  } catch (error) {
    console.error('[MOCKUP] stream error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Mockup generation failed.' });
    }
    res.end();
  }
});

app.post('/api/generate-mockup-image', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const retryAfter = isMockupRateLimited(getClientIp(req));
  if (retryAfter > 0) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again shortly.',
      retryAfterSeconds: retryAfter
    });
  }

  const imagePrompt = `You are a senior website art director.
Create a polished, modern website mockup screenshot for this request:
${prompt}

Requirements:
- Show a realistic full webpage layout (hero, sections, CTA).
- Clean typography, modern spacing, clear hierarchy.
- Professional conversion-focused design.
- No watermarks or UI from other products.
- Output one final image only.`;

  try {
    let imageUrl = null;

    if (KIE_API_KEY) {
      try {
        imageUrl = await callKie4oImageOutput(imagePrompt, null, 'image/png');
      } catch (kieErr) {
        console.warn('[MOCKUP-IMAGE] Kie image failed:', kieErr?.message || kieErr);
      }
    }

    if (!imageUrl && GEMINI_API_KEY) {
      try {
        imageUrl = await callGeminiImageOutput(imagePrompt, null, 'image/png');
      } catch (gemErr) {
        console.warn('[MOCKUP-IMAGE] Gemini image failed:', gemErr?.message || gemErr);
      }
    }

    if (!imageUrl) {
      return res.status(502).json({
        error: 'Image generation unavailable right now. Please try again in a minute.'
      });
    }

    return res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('[MOCKUP-IMAGE] Unexpected error:', error);
    return res.status(500).json({ error: 'Failed to generate mockup image.' });
  }
});

app.post('/api/export-10web-package', async (req, res) => {
  const { siteName, pages, metadata } = req.body || {};
  const requiredPages = ['home', 'services', 'about', 'contact'];
  const hasPages = pages && requiredPages.every((key) => typeof pages[key] === 'string' && pages[key].trim().length > 0);
  if (!hasPages) {
    return res.status(400).json({ error: 'pages.home/services/about/contact are required.' });
  }

  const safeSiteName = String(siteName || 'adhello-site')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'adhello-site';
  const packageId = `${safeSiteName}-${Date.now()}`;
  const tempRoot = path.join(os.tmpdir(), `adhello-10web-${crypto.randomUUID()}`);
  const packageDir = path.join(tempRoot, packageId);
  const zipPath = path.join(tempRoot, `${packageId}.zip`);

  const pageDoc = (content, pageTitle) => `<!doctype html>
<html class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { darkMode: 'class' };</script>
    <style>html,body{margin:0;padding:0;background:#0a0a0a;}</style>
  </head>
  <body>
    ${content}
  </body>
</html>`;

  const manifest = {
    name: siteName || 'AdHello 10Web Export',
    exportedAt: new Date().toISOString(),
    generator: 'AdHello Vibe Builder',
    target: '10web',
    files: ['home.html', 'services.html', 'about.html', 'contact.html', 'manifest.json', 'README.md'],
    metadata: metadata || {}
  };

  const readme = `# 10Web Import Package

This package was generated by AdHello Vibe Builder.

## Files
- home.html
- services.html
- about.html
- contact.html
- manifest.json

## 10Web Usage
1. Create/open your 10Web project.
2. Use AI Builder custom HTML blocks or page import flow.
3. Paste/import each page HTML into matching 10Web page.
4. Re-map navigation links and forms inside 10Web as needed.
5. Publish.

## Notes
- Tailwind CDN is included in each page.
- Pages are generated with shared style memory for visual consistency.
`;

  try {
    await fs.mkdir(packageDir, { recursive: true });
    await Promise.all([
      fs.writeFile(path.join(packageDir, 'home.html'), pageDoc(pages.home, `${siteName || 'Site'} - Home`), 'utf8'),
      fs.writeFile(path.join(packageDir, 'services.html'), pageDoc(pages.services, `${siteName || 'Site'} - Services`), 'utf8'),
      fs.writeFile(path.join(packageDir, 'about.html'), pageDoc(pages.about, `${siteName || 'Site'} - About`), 'utf8'),
      fs.writeFile(path.join(packageDir, 'contact.html'), pageDoc(pages.contact, `${siteName || 'Site'} - Contact`), 'utf8'),
      fs.writeFile(path.join(packageDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8'),
      fs.writeFile(path.join(packageDir, 'README.md'), readme, 'utf8')
    ]);

    await execFileAsync('zip', ['-r', zipPath, packageId], { cwd: tempRoot });
    const zipBuffer = await fs.readFile(zipPath);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${packageId}.zip"`);
    res.send(zipBuffer);
  } catch (error) {
    console.error('[10WEB-EXPORT] Failed:', error);
    res.status(500).json({ error: 'Failed to export 10Web package.' });
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => {});
  }
});

app.post('/api/ad-brief/analyze', async (req, res) => {
  const { image, imageBase64, mimeType, service } = req.body;
  const imageData = image || imageBase64;
  if (!imageData) return res.status(400).json({ error: 'Image is required.' });

  const mime = typeof mimeType === 'string' && mimeType.includes('/') ? mimeType : 'image/jpeg';

  const serviceHint =
    typeof service === 'string' && service.trim()
      ? `\n\nAdvertiser context (trade/service): ${service.trim()}. Tailor audiences, hooks, and copy angles for this category.`
      : '';

  const prompt = `CRITICAL: Analyze the attached product image.${serviceHint}
  1. Identify the EXACT product (name and type). DO NOT invent a new product or use placeholders unless they appear in the image.
  2. Generate a comprehensive Ad Brief for this EXACT product.
  
  Output your response as PURE JSON matching this exactly:
  {
    "productAnalysis": "string explaining exactly what the product is and its vibe",
    "visualPrompt": "a detailed text-to-image prompt to recreate THIS SPECIFIC PRODUCT in a high-end lifestyle setting",
    "targetAudience": ["audience 1", "audience 2", "audience 3"],
    "marketInsights": ["insight 1", "insight 2", "insight 3"],
    "competitiveAdvantages": ["advantage 1", "advantage 2", "advantage 3"],
    "adConcepts": [
      { "platform": "Instagram", "headline": "string headline for THIS product", "body": "string ad body", "cta": "string" },
      { "platform": "Facebook", "headline": "string headline for THIS product", "body": "string ad body", "cta": "string" },
      { "platform": "TikTok", "headline": "string hook for THIS product", "body": "string script description", "cta": "string" }
    ]
  }
  Be specific, professional, and stay strictly relevant to the uploaded image.`;

  try {
    const aiResponse = await callAI(prompt, '', [], true, { imageBase64: imageData, mimeType: mime });
    if (!aiResponse) {
      throw new Error('AI analysis failed (empty response). Set KIE_API_KEY (Kie GPT-4o vision) or GEMINI_API_KEY.');
    }

    let briefData;
    try {
      const cleaned = cleanAIResponse(aiResponse);
      const jsonStr = extractJsonObject(cleaned);
      briefData = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('[AD-BRIEF] AI sent malformed JSON, attempting cleanup.', String(aiResponse).slice(0, 500));
      const cleaned = String(aiResponse).match(/\{[\s\S]*\}/)?.[0] || aiResponse;
      briefData = JSON.parse(cleaned);
    }

    const normalized = normalizeAdBriefPayload(briefData);
    res.json(normalized);
  } catch (error) {
    console.error('[AD-BRIEF] Analysis Error:', error);
    res.status(500).json({ error: error.message, detail: error.message });
  }
});

// --- STATIC ASSETS ---
// 1. Specific handler for images/assets to prevent falling back to index.html (tiny thumbnail bug)
app.get(/\.(png|jpg|jpeg|gif|svg|webp|ico|json|css|js)$/, (req, res, next) => {
  // If we reach here, it means express.static below didn't find the file
  // but we want to check if it exists in dist or public before giving up
  next();
});

// 2. Serve from dist (compiled)
app.use(express.static(DIST_DIR));

// 3. Fallback to public (source) just in case
app.use(express.static(path.join(__dirname, 'public')));

// 4. Image 404 - If an image was requested but not found in dist or public, 
// return a real 404 instead of index.html
app.get(/\.(png|jpg|jpeg|gif|svg|webp)$/, (req, res) => {
  res.status(404).send('Not Found');
});

// 5. SPA Fallback
app.get('*', (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[V2.6] AdHello Server running on port ${PORT}`);
  console.log(`[V2.6] Static DIR: ${DIST_DIR}`);
});

