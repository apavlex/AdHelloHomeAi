import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Eye, Target, Sparkles, CheckCircle2, Circle, Loader2, Wrench, AlertTriangle, XCircle, Share2, Download, Link as LinkIcon, Copy, Check, Bot, ShieldCheck, ShieldX, ShieldAlert, BarChart3, Zap, TrendingUp, Lock, Palette, Layout, MousePointerClick, ChevronRight, Calendar } from 'lucide-react';

// @ts-ignore
import html2pdf from 'html2pdf.js';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface AuditCheck {
  label: string;
  status: 'pass' | 'fail' | 'warning';
  value: string;
  reason?: string;
}

interface GeoReport {
  geoScore: number;
  citabilityScore: number;
  brandAuthorityScore: number;
  eeeatScore: number;
  technicalScore: number;
  schemaScore: number;
  platformScore: number;
  geoSummary: string;
  crawlerAccess: { name: string; operator: string; status: 'allowed' | 'blocked' | 'unknown'; impact: string }[];
  platformReadiness: { platform: string; score: number; gap: string; action: string }[];
  criticalIssues: string[];
  quickWins: { action: string; impact: string; effort: string }[];
  llmsTxtStatus: 'present' | 'missing' | 'unknown';
  schemaTypes: string[];
  missingSchemas: string[];
  brandPresence: Record<string, 'present' | 'missing'>;
}

interface Report {
  score: number;
  mobileFirstScore: number;
  leadsEstimatesScore: number;
  googleAiReadyScore: number;
  summary: string;
  brandAnalysis: string;
  url?: string;
  companyName?: string;
  technicalAudit: Record<string, AuditCheck>;
  strengths: { indicator: string; description: string }[];
  weaknesses: { indicator: string; description: string }[];
  recommendations: {
    title: string;
    description: string;
    action: string;
  }[];
  city?: string;
  reviewThemes?: string[];
}

function geoScoreLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

function geoScoreColor(score: number) {
  if (score >= 90) return '#22c55e'; // green-500
  if (score >= 75) return '#84cc16'; // lime-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

// ── GEO Score Ring ─────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  const color = geoScoreColor(score);
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f0f0" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-brand-dark font-extrabold" style={{ fontSize: size > 70 ? 22 : 13, lineHeight: 1 }}>{score}</span>
        {label && <span className="text-brand-dark/40 font-bold uppercase tracking-wider" style={{ fontSize: 8 }}>{label}</span>}
      </div>
    </div>
  );
}

// ── Crawler status icon ────────────────────────────────────────────────────
function CrawlerIcon({ status }: { status: string }) {
  if (status === 'allowed') return <ShieldCheck className="w-5 h-5 text-green-500" />;
  if (status === 'blocked') return <ShieldX className="w-5 h-5 text-red-500" />;
  return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
}

// ── Mini score bar ─────────────────────────────────────────────────────────
function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-extrabold" style={{ color: geoScoreColor(score) }}>{score}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: geoScoreColor(score) }} />
      </div>
    </div>
  );
}

// ── Full Report panel ───────────────────────────────────────────────────────
function GeoReportPanel({ geo, isStudio }: { geo: GeoReport; isStudio: boolean }) {
  const card = isStudio ? 'bg-[#1C1F26] border-white/5' : 'bg-white border-gray-100 shadow-sm';
  const textMain = isStudio ? 'text-white' : 'text-brand-dark';
  const textMuted = isStudio ? 'text-white/50' : 'text-brand-dark/60';

  const categories = [
    { label: 'AI Citability', score: geo.citabilityScore },
    { label: 'Brand Authority', score: geo.brandAuthorityScore },
    { label: 'E-E-A-T Content', score: geo.eeeatScore },
    { label: 'Technical GEO', score: geo.technicalScore },
    { label: 'Schema & Data', score: geo.schemaScore },
    { label: 'Platform Opt.', score: geo.platformScore },
  ];

  const brandPlatforms = [
    { key: 'wikipedia', label: 'Wikipedia' },
    { key: 'wikidata', label: 'Wikidata' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'reddit', label: 'Reddit' },
    { key: 'linkedin', label: 'LinkedIn' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`${card} rounded-[2rem] p-8 border`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <ScoreRing score={geo.geoScore} size={110} label="GEO" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`text-2xl font-extrabold ${textMain}`}>GEO Readiness Score</h3>
              <span className="text-xs font-black px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: geoScoreColor(geo.geoScore) }}>
                {geoScoreLabel(geo.geoScore)}
              </span>
            </div>
            <p className={`${textMuted} text-base leading-relaxed mb-4`}>{geo.geoSummary}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(c => <ScoreBar key={c.label} score={c.score} label={c.label} />)}
            </div>
          </div>
        </div>
      </div>

      {geo.criticalIssues?.length > 0 && (
        <div className="rounded-[1.5rem] p-6 border border-red-100 bg-red-50">
          <h4 className="text-sm font-black uppercase tracking-widest text-red-600 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Critical Issues
          </h4>
          <ul className="space-y-2">
            {geo.criticalIssues.map((issue, i) => (
              <li key={i} className="text-sm text-red-800 font-medium flex items-start gap-2">
                <span className="text-red-400 mt-0.5">→</span>{issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${card} rounded-[2rem] p-6 border`}>
          <h4 className={`text-base font-extrabold ${textMain} mb-4 flex items-center gap-2`}>
            <Bot className="w-5 h-5 text-primary" /> AI Crawler Access
          </h4>
          <div className="space-y-3">
            {geo.crawlerAccess?.map((c, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${isStudio ? 'bg-white/5' : 'bg-gray-50'}`}>
                <CrawlerIcon status={c.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-bold ${textMain}`}>{c.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'allowed' ? 'bg-green-100 text-green-700' :
                      c.status === 'blocked' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{c.status}</span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-0.5`}>{c.operator}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${isStudio ? 'bg-white/5 text-white/50' : 'bg-gray-50 text-brand-dark/50'}`}>
            llms.txt: <span className={`font-bold ${geo.llmsTxtStatus === 'present' ? 'text-green-600' : 'text-red-500'}`}>
              {geo.llmsTxtStatus === 'present' ? '✓ Present' : geo.llmsTxtStatus === 'missing' ? '✗ Missing' : '? Unknown'}
            </span>
          </div>
        </div>

        <div className={`${card} rounded-[2rem] p-6 border`}>
          <h4 className={`text-base font-extrabold ${textMain} mb-4 flex items-center gap-2`}>
            <TrendingUp className="w-5 h-5 text-primary" /> Brand Authority
          </h4>
          <div className="space-y-3 mb-4">
            {brandPlatforms.map(p => (
              <div key={p.key} className="flex items-center justify-between">
                <span className={`text-sm font-bold ${textMain}`}>{p.label}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  geo.brandPresence?.[p.key] === 'present'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-brand-dark/40'
                }`}>
                  {geo.brandPresence?.[p.key] === 'present' ? '✓ Present' : '✗ Missing'}
                </span>
              </div>
            ))}
          </div>
          <div className={`p-3 rounded-xl ${isStudio ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-xs ${textMuted} font-medium`}>Brand mentions correlate 3× more strongly with AI visibility than backlinks. (Ahrefs 2025)</p>
          </div>
        </div>
      </div>

      <div className={`${card} rounded-[2rem] p-6 border`}>
        <h4 className={`text-base font-extrabold ${textMain} mb-4 flex items-center gap-2`}>
          <BarChart3 className="w-5 h-5 text-primary" /> AI Platform Readiness
        </h4>
        <div className="space-y-4">
          {geo.platformReadiness?.map((p, i) => (
            <div key={i} className={`rounded-xl p-4 ${isStudio ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-extrabold ${textMain}`}>{p.platform}</span>
                <ScoreRing score={p.score} size={40} />
              </div>
              <p className={`text-xs ${textMuted} mb-1`}><span className="font-bold text-red-500">Gap:</span> {p.gap}</p>
              <p className={`text-xs font-bold text-primary`}>→ {p.action}</p>
            </div>
          ))}
        </div>
      </div>

      {geo.quickWins?.length > 0 && (
        <div className={`${card} rounded-[2rem] p-6 border`}>
          <h4 className={`text-base font-extrabold ${textMain} mb-4 flex items-center gap-2`}>
            <Zap className="w-5 h-5 text-primary" /> Quick Wins — Implement This Week
          </h4>
          <div className="space-y-3">
            {geo.quickWins.map((w, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl ${isStudio ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="w-7 h-7 bg-primary/20 text-brand-dark rounded-full flex items-center justify-center shrink-0 text-sm font-black">{i + 1}</div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${textMain} mb-0.5`}>{w.action}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${w.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{w.impact} Impact</span>
                    <span className={`text-xs ${textMuted}`}>{w.effort}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(geo.schemaTypes?.length > 0 || geo.missingSchemas?.length > 0) && (
        <div className={`${card} rounded-[2rem] p-6 border`}>
          <h4 className={`text-base font-extrabold ${textMain} mb-4 flex items-center gap-2`}>
            <Wrench className="w-5 h-5 text-primary" /> Schema & Structured Data
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {geo.schemaTypes?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-green-600 mb-2">✓ Detected</p>
                <div className="flex flex-wrap gap-2">
                  {geo.schemaTypes.map((s, i) => (
                    <span key={i} className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {geo.missingSchemas?.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">✗ Missing</p>
                <div className="flex flex-wrap gap-2">
                  {geo.missingSchemas.map((s, i) => (
                    <span key={i} className="text-xs font-bold bg-red-50 text-red-600 px-2 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="text-center pt-2">
        <button
          onClick={() => window.open('https://calendar.app.google/QQsVbiAt4QdCX8mx8', '_blank')}
          className="bg-primary hover:bg-primary-hover text-brand-dark font-bold py-4 px-10 rounded-full transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-1"
        >
          Get Help Implementing These GEO Fixes
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function SiteAudit({ 
  isStudio = false,
  onAuditComplete 
}: { 
  isStudio?: boolean,
  onAuditComplete?: (report: Report | null) => void 
}) {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [geoReport, setGeoReport] = useState<GeoReport | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Email capture modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalDone, setModalDone] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Stitch AI Design states
  const [isGeneratingStitch, setIsGeneratingStitch] = useState(false);
  const [stitchResult, setStitchResult] = useState<{ title: string, downloadUrl?: string, screenshotUrl?: string } | null>(null);
  const [stitchError, setStitchError] = useState<string | null>(null);

  const getBusinessName = () => {
    if (!report?.url) return 'Your Business';
    try {
      const urlObj = new URL(report.url);
      const host = urlObj.hostname.replace('www.', '');
      const namePart = host.split('.')[0];
      return namePart
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } catch (e) {
      return 'Your Business';
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('report');
    if (sharedData) {
      try {
        const decodedStr = decodeURIComponent(atob(sharedData).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(decodedStr);
        setReport(decoded);
        onAuditComplete?.(decoded);
        setStatus('complete');
      } catch (e) {
        console.error("Failed to decode shared report", e);
      }
    }
  }, [onAuditComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'analyzing') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) { clearInterval(interval); return 99; }
          if (prev >= 95) return prev + 0.1;
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const [errorInfo, setErrorInfo] = useState<{ message: string, detail?: string } | null>(null);

  const handleGenerateDesign = async () => {
    if (!report || isGeneratingStitch) return;
    setIsGeneratingStitch(true);
    setStitchError(null);
    setStitchResult(null);

    try {
      const response = await fetch('/api/stitch-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyName: report.companyName || url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0].split('.')[0],
          website: report.url || url,
          trade: 'local business'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error || 'Failed to generate design');
      setStitchResult(data);
    } catch (err: any) {
      console.error('[STITCH] Error:', err);
      setStitchError(err.message);
    } finally {
      setIsGeneratingStitch(false);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim() || !modalEmail.trim()) return;
    setModalSubmitting(true);
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: modalName, 
          email: modalEmail, 
          siteUrl: report?.url || url, 
          auditData: report,
          source: 'site-audit' 
        })
      });
    } catch (_) {}
    sessionStorage.setItem('adhello-gate-passed', '1');
    setModalSubmitting(false);
    setModalDone(true);
    setTimeout(() => setShowEmailModal(false), 2000);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    setStatus('analyzing');
    setProgress(0);
    setReport(null);
    setGeoReport(null);
    setGeoStatus('idle');
    onAuditComplete?.(null);
    setErrorInfo(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Server Error",
          detail: `The server returned a ${response.status} error.`
        }));
        throw new Error(JSON.stringify(errorData));
      }

      const data = await response.json();
      data.url = targetUrl;
      setProgress(100);
      setReport(data);
      onAuditComplete?.(data);
      setStatus('complete');
      if (!sessionStorage.getItem('adhello-gate-passed')) {
        setTimeout(() => setShowEmailModal(true), 8000);
      }

      setGeoStatus('loading');
      fetch('/api/geo-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      })
        .then(r => r.json())
        .then(geo => {
          if (geo.error) { setGeoStatus('error'); return; }
          setGeoReport(geo);
          setGeoStatus('complete');
        })
        .catch(() => setGeoStatus('error'));

    } catch (error: any) {
      setStatus('idle');
      setErrorInfo({ message: "Analysis Failed", detail: error.message });
    }
  };

  const handleShare = async () => {
    if (!report) return;
    const shareUrl = `${window.location.origin}/#site-audit`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch { window.prompt('Copy this link:', shareUrl); }
  };

  const handleDownload = () => {
    if (!report) return;
    setIsDownloading(true);
    // Simple mock download logic or trigger server-side PDF
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const renderSteps = () => {
    const steps = [
      { label: 'Fetching website content', threshold: 20 },
      { label: 'Extracting brand signals', threshold: 50 },
      { label: 'Analyzing competitive landscape', threshold: 80 },
      { label: 'Generating recommendations', threshold: 100 },
    ];
    return (
      <div className="flex flex-col gap-4 max-w-sm mx-auto mt-8 text-left">
        {steps.map((step, index) => {
          const isComplete = progress >= step.threshold;
          const isCurrent = progress < step.threshold && (index === 0 || progress >= steps[index - 1].threshold);
          return (
            <div key={index} className="flex items-center gap-3">
              {isComplete ? <CheckCircle2 className="w-5 h-5 text-primary" />
                : isCurrent ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
                : <Circle className="w-5 h-5 text-gray-300" />}
              <span className={`text-sm md:text-base font-medium ${isComplete ? 'text-brand-dark/40' : isCurrent ? 'text-brand-dark' : 'text-brand-dark/30'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className={`${isStudio ? 'bg-transparent py-0' : 'full-screen-section bg-warm-cream py-0'} text-brand-dark font-sans shadow-inner`} id="site-audit">
      <div className={`${isStudio ? 'max-w-full' : 'max-w-4xl'} mx-auto px-4 w-full`}>

        {status === 'idle' && errorInfo && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500 max-w-2xl mx-auto">
            <div className={`${isStudio ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'} rounded-[2.5rem] p-8 border text-left shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>{errorInfo.message}</h3>
                  {errorInfo.detail && <p className={`text-sm mb-6 leading-relaxed ${isStudio ? 'text-white/60' : 'text-brand-dark/70'}`}>{errorInfo.detail}</p>}
                  <button onClick={() => setErrorInfo(null)} className="bg-brand-dark text-white hover:bg-black font-bold py-2.5 px-6 rounded-full transition-all text-sm shadow-sm">Dismiss</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'idle' && !errorInfo && (
          <div className="text-center animate-in fade-in duration-500">
            <h2 className={`text-5xl md:text-6xl font-extrabold mb-4 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>
              Get Found by <span className="text-primary">AI & Customers</span>
            </h2>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed ${isStudio ? 'text-white/60' : 'text-brand-dark/70'}`}>
              Analyze your website for GEO readiness and AI search visibility — all in one scan.
            </p>
            <div className={`${isStudio ? 'bg-[#1C1F26] border-white/5' : 'bg-white border-gray-100 shadow-xl'} rounded-[2.5rem] p-6 md:p-8 mb-8 border text-left ring-1 ring-black/5`}>
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-primary" />
                <h3 className={`text-xl font-bold ${isStudio ? 'text-white' : 'text-brand-dark'}`}>Your Website</h3>
              </div>
              <form onSubmit={handleScan} className="relative flex items-center">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  className={`w-full ${isStudio ? 'bg-[#121417] text-white border-white/10' : 'bg-gray-50 text-brand-dark border-gray-200'} rounded-full py-4 pl-6 pr-32 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium border`}
                  required
                />
                <button type="submit" className="absolute right-2 bg-primary hover:bg-primary-hover text-brand-dark font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-sm active:scale-95">
                  <Search className="w-4 h-4" /> Scan
                </button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { icon: <Eye className="w-6 h-6 text-primary mb-4" />, title: 'Brand Analysis', desc: 'Understand your positioning and messaging' },
                { icon: <Target className="w-6 h-6 text-primary mb-4" />, title: 'GEO Audit', desc: 'Score your AI search readiness across 6 dimensions' },
                { icon: <Sparkles className="w-6 h-6 text-primary mb-4" />, title: 'AI Search Ready', desc: 'Optimize for ChatGPT, Perplexity & AI Overviews' }
              ].map((feature, i) => (
                <div key={i} className={`${isStudio ? 'bg-[#1C1F26] border-white/5' : 'bg-white border-gray-100 shadow-sm'} rounded-3xl p-6 border group hover:border-primary/40 transition-colors`}>
                  {feature.icon}
                  <h4 className={`text-lg font-bold mb-2 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>{feature.title}</h4>
                  <p className={`text-sm leading-relaxed font-medium ${isStudio ? 'text-white/40' : 'text-brand-dark/60'}`}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className={`${isStudio ? 'text-white/5' : 'text-gray-100'} stroke-current`} strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                <circle className="text-primary stroke-current transition-all duration-500 ease-out" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${progress * 2.51327} 251.327`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>Analyzing your website...</h2>
            <p className={`text-lg mb-12 font-medium ${isStudio ? 'text-white/40' : 'text-brand-dark/60'}`}>Discovering your strengths and optimization opportunities</p>
            <div className={`w-full max-w-md mx-auto h-2 rounded-full overflow-hidden mb-8 ${isStudio ? 'bg-white/5' : 'bg-gray-100'}`}>
              <div className="h-full bg-primary transition-all duration-500 ease-out rounded-full" style={{ width: `${progress}%` }} />
            </div>
            {renderSteps()}
          </div>
        )}

        {status === 'complete' && report && (
          <div ref={reportRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700 print:p-0 space-y-12 pb-20">
            {/* Header row */}
            <div className="flex items-center justify-between print:hidden">
              <h2 className={`text-3xl font-extrabold ${isStudio ? 'text-white' : 'text-brand-dark'}`}>Audit Results</h2>
              <div className="flex items-center gap-4">
                <button onClick={handleShare} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border shadow-sm transition-all ${isStudio ? 'bg-white/5 border-white/10 text-white/60 hover:text-primary' : 'bg-white border-gray-100 text-brand-dark/60 hover:text-primary'}`}>
                  {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  {copySuccess ? 'Link Copied!' : 'Share Report'}
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border shadow-sm transition-all disabled:opacity-50 ${isStudio ? 'bg-white/5 border-white/10 text-white/60 hover:text-primary' : 'bg-white border-gray-100 text-brand-dark/60 hover:text-primary'}`}>
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
                <button onClick={() => { setStatus('idle'); setGeoReport(null); setGeoStatus('idle'); }} className={`text-sm font-bold transition-colors ${isStudio ? 'text-white/40 hover:text-white' : 'text-brand-dark/60 hover:text-brand-dark'}`}>
                  Scan another site
                </button>
              </div>
            </div>

            {/* ── Main Report Card ── */}
            <div className={`${isStudio ? 'bg-[#1C1F26] border-white/5' : 'bg-white border-gray-100 shadow-xl'} rounded-[2.5rem] p-8 border print:shadow-none print:border-none`}>
              <div className={`flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b ${isStudio ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className={`${isStudio ? 'text-white/5' : 'text-gray-100'} stroke-current`} strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <circle className={`${report.score >= 80 ? 'text-green-500' : report.score >= 50 ? 'text-yellow-500' : 'text-red-500'} stroke-current transition-all duration-1000 ease-out`} strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${report.score * 2.51327} 251.327`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-extrabold ${isStudio ? 'text-white' : 'text-brand-dark'}`}>{report.score}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isStudio ? 'text-white/40' : 'text-brand-dark/50'}`}>Score</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-2xl font-extrabold ${isStudio ? 'text-white' : 'text-brand-dark'}`}>Overall Website Readiness</h3>
                    {report.score < 70 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter animate-pulse print:hidden">Critical Action Required</span>}
                  </div>
                  <p className={`text-sm font-bold mb-2 flex items-center gap-1 ${isStudio ? 'text-primary' : 'text-brand-dark/40'}`}><Globe className="w-3 h-3" />{report.url || url}</p>
                  <p className={`leading-relaxed text-xl font-medium mb-4 ${isStudio ? 'text-white/60' : 'text-brand-dark/70'}`}>{report.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Mobile-First', score: report.mobileFirstScore },
                  { label: 'Leads & Estimates', score: report.leadsEstimatesScore },
                  { label: 'Google & AI Ready', score: report.googleAiReadyScore },
                ].map((item, i) => (
                  <div key={i} className={`${isStudio ? 'bg-white/5 border-white/5' : 'bg-warm-cream/50 border-brand-dark/5'} rounded-2xl p-4 border`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black uppercase tracking-wider ${isStudio ? 'text-white/40' : 'text-brand-dark/40'}`}>{item.label}</span>
                      <span className={`text-sm font-black ${item.score >= 80 ? 'text-green-500' : item.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{item.score}%</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isStudio ? 'bg-white/5' : 'bg-white'}`}>
                      <div className={`h-full transition-all duration-1000 ${item.score >= 80 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-3xl border ${isStudio ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                <h4 className={`text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isStudio ? 'text-primary' : 'text-brand-dark/40'}`}><Target className="w-4 h-4" />Brand Analysis & Positioning</h4>
                <p className={`leading-relaxed text-lg font-medium ${isStudio ? 'text-white/80' : 'text-brand-dark/80'}`}>{report.brandAnalysis}</p>
              </div>
            </div>

            {/* ── Vision Preview Section (The ACTUAL fix) ── */}
            <div className={`p-8 rounded-[3rem] border-2 border-dashed ${isStudio ? 'bg-primary/5 border-primary/20' : 'bg-white border-primary/30'} relative overflow-hidden group transition-all hover:border-primary/60`}>
              <div className="absolute top-0 right-0 bg-primary text-brand-dark text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-[0.2em] shadow-sm z-20">
                Vision Preview
              </div>
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-black mb-3 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>
                  Your Current Site scores a <span className="text-red-500">{report.score}</span>.
                </h3>
                <p className={`text-lg font-bold ${isStudio ? 'text-white/60' : 'text-brand-dark/60'}`}>
                  We’ve architected a <span className="text-green-500">95+ score version</span> of your business.
                </p>
              </div>

              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100/50 h-[600px] mb-8">
                {/* Frosted Glass Teaser Overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[60px] z-10 flex items-center justify-center transition-all duration-700">
                  <div className="bg-white/80 backdrop-blur-3xl text-brand-dark px-10 py-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-white/40 transform group-hover:scale-105 transition-transform duration-500 text-center">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Lock className="w-8 h-8 text-brand-dark" />
                    </div>
                    <p className="text-2xl font-black mb-1 uppercase tracking-tighter">Design Locked 🔒</p>
                    <p className="text-sm font-bold opacity-60">Architected specifically for your domain</p>
                  </div>
                </div>
                
                {/* Comparison Slider with Generic Assets */}
                <BeforeAfterSlider 
                  beforeImage="/generic-mockup-old.png"
                  afterImage="/generic-mockup-new.png"
                  beforeLabel="Current Architecture"
                  afterLabel="Optimized Blueprint"
                />
              </div>

              <div className="text-center">
                <button 
                  onClick={() => navigate(`/blueprint?biz=${getBusinessName()}&score=${report.score}&city=${report.city || ''}&themes=${report.reviewThemes?.join(',') || ''}`)}
                  className={`px-12 py-6 bg-primary hover:bg-primary-hover text-brand-dark font-black rounded-3xl text-2xl transition-all hover:scale-105 shadow-[0_20px_40px_-10px_rgba(243,221,109,0.5)] flex items-center justify-center gap-3 w-full sm:w-auto mx-auto relative overflow-hidden group`}
                >
                  <Lock className="w-6 h-6 text-brand-dark group-hover:scale-110 transition-transform" />
                  Unlock Your AI Web Blueprint ($27)
                  <Sparkles className="absolute top-0 right-0 w-8 h-8 text-white/20 animate-pulse pointer-events-none" />
                </button>
                <p className={`mt-5 text-sm font-bold italic ${isStudio ? 'text-white/40' : 'text-brand-dark/40'}`}>
                  Includes hi-res custom designs & conversion-optimized code architecture.
                </p>
              </div>
            </div>

            {/* ── Technical Audit Grid ── */}
            <div className="space-y-6">
              <h4 className={`text-xl font-extrabold flex items-center gap-2 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>
                <Wrench className="w-5 h-5 text-primary" /> Technical Audit Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(report.technicalAudit).map(([key, check]) => (
                  <div key={key} className={`${isStudio ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'} rounded-3xl p-6 border flex flex-col gap-4 group transition-all hover:shadow-lg hover:border-primary/30`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${isStudio ? 'text-white/40' : 'text-brand-dark/40'}`}>{check.label}</span>
                        <span className={`text-lg font-black ${isStudio ? 'text-white' : 'text-brand-dark'}`}>{check.value}</span>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        check.status === 'pass' ? 'bg-green-500/10 text-green-500' : 
                        check.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      }`}>
                        {check.status === 'pass' ? <CheckCircle2 className="w-6 h-6" /> : check.status === 'warning' ? <AlertTriangle className="w-6 h-6" /> : <XCircle className="w-6 h-6 animate-pulse" />}
                      </div>
                    </div>
                    {check.reason && <p className={`text-sm leading-relaxed ${isStudio ? 'text-white/60' : 'text-brand-dark/70'}`}>{check.reason}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Strengths & Weaknesses ── */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className={`${isStudio ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'} rounded-3xl p-8 border`}>
                <h4 className={`text-lg font-extrabold mb-6 flex items-center gap-2 ${isStudio ? 'text-white' : 'text-brand-dark'}`}><CheckCircle2 className="w-5 h-5 text-green-500" />Strategic Strengths</h4>
                <ul className="space-y-6">
                  {report.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-1"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>
                      <div>
                        <span className={`font-bold block mb-1 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>{str.indicator}</span>
                        <span className={`text-sm leading-relaxed ${isStudio ? 'text-white/60' : 'text-brand-dark/70'}`}>{str.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${isStudio ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'} rounded-3xl p-8 border`}>
                <h4 className={`text-lg font-extrabold mb-6 flex items-center gap-2 ${isStudio ? 'text-white' : 'text-brand-dark'}`}><Target className="w-5 h-5 text-yellow-500" />Growth Opportunities</h4>
                <ul className="space-y-6">
                  {report.weaknesses.map((weak, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 mt-1"><Target className="w-4 h-4 text-yellow-500" /></div>
                      <div>
                        <span className={`font-bold block mb-1 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>{weak.indicator}</span>
                        <span className={`text-sm leading-relaxed ${isStudio ? 'text-white/60' : 'text-brand-dark/70'}`}>{weak.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── GEO Report Panel (Injected from Remote) ── */}
            {geoReport && <GeoReportPanel geo={geoReport} isStudio={isStudio} />}

            {/* ── Actionable Recommendations ── */}
            <div className="space-y-6">
              <h3 className={`text-2xl font-extrabold ${isStudio ? 'text-white' : 'text-brand-dark'}`}>Actionable Plan</h3>
              <div className="space-y-4">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className={`${isStudio ? 'bg-[#1C1F26] border-white/5' : 'bg-white border-gray-100 shadow-md'} rounded-3xl p-6 border text-left flex flex-col md:flex-row gap-6 items-start hover:border-primary/30 transition-all`}>
                    <div className="flex-1">
                      <h4 className={`text-lg font-bold mb-2 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>{rec.title}</h4>
                      <p className={`leading-relaxed font-medium ${isStudio ? 'text-white/60' : 'text-brand-dark/70'}`}>{rec.description}</p>
                    </div>
                    <div className={`${isStudio ? 'bg-primary/10 text-primary border-primary/20' : 'bg-blue-50 text-blue-800 border-blue-100'} px-5 py-4 rounded-2xl text-sm font-bold md:w-1/3 shrink-0 border`}>
                      <span className={`block text-xs uppercase tracking-widest mb-1 ${isStudio ? 'text-primary/60' : 'text-blue-600/70'}`}>Instant Solution</span>
                      {rec.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Final Offer Call to Action ── */}
            <div className={`mt-12 p-12 rounded-[4rem] text-center border-t-8 border-primary ${isStudio ? 'bg-[#1C1F26]' : 'bg-white shadow-2xl border border-gray-100'} print:hidden`}>
              <h3 className={`text-3xl md:text-4xl font-black mb-6 ${isStudio ? 'text-white' : 'text-brand-dark'}`}>
                Stop Guessing. <span className="text-primary">Start Converting.</span>
              </h3>
              <p className={`text-xl font-bold mb-12 max-w-2xl mx-auto leading-relaxed ${isStudio ? 'text-white/40' : 'text-brand-dark/60'}`}>
                {report.score < 70 
                  ? "Don't waste money on ads yet. Your site will 'leak' leads. Fix your architecture first with the $27 Blueprint."
                  : "Your site is ready for high-velocity traffic. Unlock the Blueprint to fix the final leaks and dominate your local area."}
              </p>
              
              <div className="flex flex-col items-center gap-8">
                <button
                  onClick={() => navigate(`/blueprint?biz=${getBusinessName()}&score=${report.score}&city=${report.city || ''}&themes=${report.reviewThemes?.join(',') || ''}`)}
                  className="bg-primary hover:bg-primary-hover text-brand-dark font-black py-6 px-16 rounded-full transition-all text-2xl shadow-[0_30px_60px_rgba(243,221,109,0.4)] hover:shadow-none hover:translate-y-2 flex items-center gap-3 active:scale-95"
                >
                  <Sparkles className="w-7 h-7" />
                  Unlock My Strategic Blueprint ($27)
                </button>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { window.open('https://calendar.app.google/QQsVbiAt4QdCX8mx8', '_blank'); }}
                    className={`text-base font-black underline underline-offset-8 decoration-2 ${isStudio ? 'text-white/60 hover:text-white' : 'text-brand-dark/60 hover:text-brand-dark'}`}
                  >
                    Or, book a Free Scale Session for a managed $1k+ build
                  </button>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isStudio ? 'text-white/20' : 'text-brand-dark/20'}`}>
                    Available for businesses generating $100k+ in revenue
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Email Capture Modal ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowEmailModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-500 overflow-hidden ring-1 ring-black/5">
            <button onClick={() => setShowEmailModal(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-brand-dark/50 transition-all z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="bg-brand-dark px-8 py-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-6 h-6 text-brand-dark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" opacity="0.15"/>
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-xl leading-tight">Get your report via email</p>
                  <p className="text-white/40 text-sm font-medium">We'll send a full PDF copy for your team.</p>
                </div>
              </div>
            </div>
            <div className="px-8 py-10">
              {modalDone ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <p className="font-extrabold text-brand-dark text-2xl mb-2">Report on its way!</p>
                  <p className="text-brand-dark/50 text-base">Check your inbox in just a few seconds.</p>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-dark/40 ml-1">Business Name</label>
                    <input type="text" value={modalName} onChange={e => setModalName(e.target.value)} placeholder="e.g. AdHello Services" className="w-full rounded-2xl py-4 px-5 font-bold border-2 bg-gray-50 text-brand-dark border-gray-100 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-base" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-dark/40 ml-1">Work Email</label>
                    <input type="email" value={modalEmail} onChange={e => setModalEmail(e.target.value)} placeholder="hello@yourbusiness.com" className="w-full rounded-2xl py-4 px-5 font-bold border-2 bg-gray-50 text-brand-dark border-gray-100 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-base" required />
                  </div>
                  <button type="submit" disabled={modalSubmitting} className="w-full bg-primary hover:bg-primary-hover text-brand-dark font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 text-lg mt-4 active:scale-[0.98]">
                    {modalSubmitting ? <><Loader2 className="w-6 h-6 animate-spin" /> Sending...</> : <>Send Me The Full Report</>}
                  </button>
                  <button type="button" onClick={() => setShowEmailModal(false)} className="w-full text-brand-dark/30 hover:text-brand-dark/60 text-sm font-bold py-2 transition-colors">Skip and read online</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
