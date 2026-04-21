import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Download, Loader2, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';

const EMPTY_MOCKUP = `<div class="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-8">
  <div class="max-w-lg text-center space-y-3">
    <p class="text-2xl font-semibold">Vibe Design Generator</p>
    <p class="text-neutral-400">Describe your dream website and watch the mockup stream live.</p>
  </div>
</div>`;

const DEVICE_WIDTHS: Record<'mobile' | 'tablet' | 'desktop', string> = {
  mobile: '390px',
  tablet: '768px',
  desktop: '100%'
};

type MockupVersion = {
  id: string;
  name?: string;
  prompt: string;
  html: string;
  createdAt: number;
  mode: 'fresh' | 'refine';
  diffSummary: string;
  pinned?: boolean;
};

type PublishedArtifact = {
  id: string;
  filename: string;
  createdAt: number;
  versionId: string;
  versionName?: string;
  html: string;
};
type SitePageKey = 'home' | 'services' | 'about' | 'contact';
type MultiPageSet = Record<SitePageKey, string>;

const LOCAL_STORAGE_KEY = 'adhello-vibe-builder-state-v1';

function buildSrcDoc(content: string) {
  return `<!doctype html>
<html class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = { darkMode: 'class' };
    </script>
    <style>html,body{margin:0;padding:0;background:#0a0a0a;}</style>
  </head>
  <body>
    ${content || EMPTY_MOCKUP}
  </body>
</html>`;
}

function summarizeDiff(previousHtml: string, nextHtml: string) {
  if (!previousHtml?.trim()) {
    return 'Initial generation';
  }
  const prevLines = previousHtml.split('\n').length;
  const nextLines = nextHtml.split('\n').length;
  const delta = nextLines - prevLines;
  const deltaLabel = delta === 0 ? 'no line delta' : `${delta > 0 ? '+' : ''}${delta} lines`;
  const prevLen = previousHtml.length;
  const nextLen = nextHtml.length;
  const sizeDelta = nextLen - prevLen;
  const sizeLabel = sizeDelta === 0 ? 'same size' : `${sizeDelta > 0 ? '+' : ''}${sizeDelta} chars`;
  return `${deltaLabel}, ${sizeLabel}`;
}

export default function MockupCanvas() {
  const [prompt, setPrompt] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [versions, setVersions] = useState<MockupVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [publishedArtifacts, setPublishedArtifacts] = useState<PublishedArtifact[]>([]);
  const [artifactQuery, setArtifactQuery] = useState('');
  const [artifactSort, setArtifactSort] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [errorText, setErrorText] = useState('');
  const [versionNameInput, setVersionNameInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [multiPageMode, setMultiPageMode] = useState(false);
  const [activePage, setActivePage] = useState<SitePageKey>('home');
  const [siteName, setSiteName] = useState('AdHello Site');
  const [multiPages, setMultiPages] = useState<MultiPageSet>({ home: '', services: '', about: '', contact: '' });
  const [multiPageStyleMemory, setMultiPageStyleMemory] = useState('');
  const [multiPageGenerating, setMultiPageGenerating] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const throttleTimer = useRef<number | null>(null);
  const bufferedRef = useRef('');
  const previousHtmlRef = useRef('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        prompt: string;
        htmlCode: string;
        versions: MockupVersion[];
        activeVersionId: string | null;
        publishedArtifacts?: PublishedArtifact[];
        multiPageMode?: boolean;
        activePage?: SitePageKey;
        siteName?: string;
        multiPages?: MultiPageSet;
        multiPageStyleMemory?: string;
      };
      if (parsed.prompt) setPrompt(parsed.prompt);
      if (parsed.htmlCode) setHtmlCode(parsed.htmlCode);
      if (Array.isArray(parsed.versions)) setVersions(parsed.versions);
      if (parsed.activeVersionId) setActiveVersionId(parsed.activeVersionId);
      if (Array.isArray(parsed.publishedArtifacts)) setPublishedArtifacts(parsed.publishedArtifacts);
      if (typeof parsed.multiPageMode === 'boolean') setMultiPageMode(parsed.multiPageMode);
      if (parsed.activePage) setActivePage(parsed.activePage);
      if (parsed.siteName) setSiteName(parsed.siteName);
      if (parsed.multiPages) setMultiPages(parsed.multiPages);
      if (parsed.multiPageStyleMemory) setMultiPageStyleMemory(parsed.multiPageStyleMemory);
    } catch (_) {
      // Ignore persistence parse errors.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        prompt,
        htmlCode,
        versions,
        activeVersionId,
        publishedArtifacts,
        multiPageMode,
        activePage,
        siteName,
        multiPages,
        multiPageStyleMemory
      })
    );
  }, [prompt, htmlCode, versions, activeVersionId, publishedArtifacts, multiPageMode, activePage, siteName, multiPages, multiPageStyleMemory]);

  useEffect(() => {
    return () => {
      if (throttleTimer.current) {
        window.clearTimeout(throttleTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!multiPageMode) return;
    const pageHtml = multiPages[activePage];
    if (pageHtml) {
      setHtmlCode(pageHtml);
    }
  }, [activePage, multiPageMode, multiPages]);

  useEffect(() => {
    if (!multiPageMode) return;
    setMultiPages((prev) => {
      if (prev[activePage] === htmlCode) return prev;
      return { ...prev, [activePage]: htmlCode };
    });
  }, [activePage, htmlCode, multiPageMode]);

  const flushBuffered = () => {
    setHtmlCode(bufferedRef.current);
    throttleTimer.current = null;
  };

  const queueFrameUpdate = () => {
    if (throttleTimer.current) return;
    throttleTimer.current = window.setTimeout(flushBuffered, 200);
  };

  const onGenerate = async (mode: 'fresh' | 'refine' = 'fresh') => {
    if (!prompt.trim() || streaming) return;
    setStreaming(true);
    setErrorText('');
    previousHtmlRef.current = htmlCode;
    bufferedRef.current = '';
    setHtmlCode('');

    try {
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          previousHtml: mode === 'refine' ? htmlCode : undefined,
          mode
        })
      });

      if (!response.ok || !response.body) {
        const error = await response.text();
        throw new Error(error || 'Unable to generate mockup.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bufferedRef.current += decoder.decode(value, { stream: true });
        queueFrameUpdate();
      }

      const finalHtml = bufferedRef.current;
      setHtmlCode(finalHtml);
      const diffSummary = summarizeDiff(previousHtmlRef.current, finalHtml);
      const version: MockupVersion = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        prompt: prompt.trim(),
        html: finalHtml,
        createdAt: Date.now(),
        mode,
        diffSummary
      };
      setVersions((prev) => [version, ...prev].slice(0, 12));
      setActiveVersionId(version.id);
      if (!compareVersionId && versions.length > 0) {
        setCompareVersionId(versions[0].id);
      }
    } catch (err) {
      console.error('[MockupCanvas] generation failed', err);
      setErrorText(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setStreaming(false);
      if (throttleTimer.current) {
        window.clearTimeout(throttleTimer.current);
      }
      flushBuffered();
    }
  };

  const requestMockupHtml = async (args: {
    promptText: string;
    pageType?: SitePageKey;
    previousHtml?: string;
    styleMemory?: string;
    mode?: 'fresh' | 'refine';
  }) => {
    const response = await fetch('/api/generate-mockup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: args.promptText,
        pageType: args.pageType,
        previousHtml: args.previousHtml,
        styleMemory: args.styleMemory,
        mode: args.mode || 'fresh'
      })
    });
    if (!response.ok || !response.body) {
      const error = await response.text();
      throw new Error(error || 'Unable to generate page.');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let out = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      out += decoder.decode(value, { stream: true });
    }
    return out;
  };

  const onGenerateMultiPageSet = async () => {
    if (!prompt.trim() || multiPageGenerating || streaming) return;
    setMultiPageGenerating(true);
    setErrorText('');
    try {
      const styleMemoryPrompt = `Create concise style memory bullets from this brief and ensure consistency across all pages:
${prompt.trim()}
Include typography mood, color palette direction, spacing rhythm, border radius style, and CTA tone.`;
      const styleMemory = await requestMockupHtml({ promptText: styleMemoryPrompt, mode: 'fresh' });
      setMultiPageStyleMemory(styleMemory);

      const pagePrompts: Record<SitePageKey, string> = {
        home: `${prompt}\nBuild a HOME page with hero, service highlights, trust proof, and primary CTA.`,
        services: `${prompt}\nBuild a SERVICES page with service cards, process, pricing hints, and conversion CTA.`,
        about: `${prompt}\nBuild an ABOUT page with company story, values, team credibility, and CTA.`,
        contact: `${prompt}\nBuild a CONTACT page with contact methods, service area, form-like section, and CTA.`
      };

      const nextPages: MultiPageSet = { home: '', services: '', about: '', contact: '' };
      const order: SitePageKey[] = ['home', 'services', 'about', 'contact'];
      for (const key of order) {
        const pageHtml = await requestMockupHtml({
          promptText: pagePrompts[key],
          pageType: key,
          styleMemory,
          mode: 'fresh'
        });
        nextPages[key] = pageHtml;
      }

      setMultiPages(nextPages);
      setActivePage('home');
      setHtmlCode(nextPages.home);
      setMultiPageMode(true);
    } catch (err) {
      console.error('[MockupCanvas] multipage generation failed', err);
      setErrorText(err instanceof Error ? err.message : 'Failed to generate multi-page set.');
    } finally {
      setMultiPageGenerating(false);
    }
  };

  const onRegenerateActivePage = async () => {
    if (!multiPageMode || multiPageGenerating || streaming || !prompt.trim()) return;
    setMultiPageGenerating(true);
    setErrorText('');
    try {
      let styleMemory = multiPageStyleMemory;
      if (!styleMemory.trim()) {
        const styleMemoryPrompt = `Create concise style memory bullets from this brief and ensure consistency across all pages:
${prompt.trim()}
Include typography mood, color palette direction, spacing rhythm, border radius style, and CTA tone.`;
        styleMemory = await requestMockupHtml({ promptText: styleMemoryPrompt, mode: 'fresh' });
        setMultiPageStyleMemory(styleMemory);
      }

      const pagePrompts: Record<SitePageKey, string> = {
        home: `${prompt}\nBuild a HOME page with hero, service highlights, trust proof, and primary CTA.`,
        services: `${prompt}\nBuild a SERVICES page with service cards, process, pricing hints, and conversion CTA.`,
        about: `${prompt}\nBuild an ABOUT page with company story, values, team credibility, and CTA.`,
        contact: `${prompt}\nBuild a CONTACT page with contact methods, service area, form-like section, and CTA.`
      };

      const nextHtml = await requestMockupHtml({
        promptText: pagePrompts[activePage],
        pageType: activePage,
        styleMemory,
        previousHtml: multiPages[activePage],
        mode: 'refine'
      });

      setMultiPages((prev) => ({ ...prev, [activePage]: nextHtml }));
      setHtmlCode(nextHtml);
    } catch (err) {
      console.error('[MockupCanvas] regenerate active page failed', err);
      setErrorText(err instanceof Error ? err.message : 'Failed to regenerate active page.');
    } finally {
      setMultiPageGenerating(false);
    }
  };

  const onExport10WebPackage = async () => {
    if (!multiPages.home || !multiPages.services || !multiPages.about || !multiPages.contact) {
      setErrorText('Generate a complete multi-page set first.');
      return;
    }
    try {
      const response = await fetch('/api/export-10web-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          pages: multiPages,
          metadata: {
            prompt,
            generatedAt: new Date().toISOString(),
            source: 'vibe-builder-multipage'
          }
        })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Export failed.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '10web-package'}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setErrorText('');
    } catch (err) {
      console.error('[MockupCanvas] 10web export failed', err);
      setErrorText(err instanceof Error ? err.message : 'Failed to export 10Web package.');
    }
  };

  const onRemix = (style: 'minimal' | 'luxury' | 'conversion' | 'playful') => {
    const stylePromptMap = {
      minimal: 'Remix this into a minimal, clean, whitespace-heavy design with restrained typography and subtle neutral palette.',
      luxury: 'Remix this into a premium luxury style with elevated typography, rich contrast, and editorial spacing.',
      conversion: 'Remix this for maximum conversions: stronger CTAs, urgency sections, social proof, and lead form prominence.',
      playful: 'Remix this into a playful vibrant style with bolder colors, rounded components, and energetic visual hierarchy.'
    };
    const base = prompt.trim() || 'Remix the current mockup';
    setPrompt(`${base}\n\n${stylePromptMap[style]}`);
  };

  const onRenameVersion = () => {
    if (!activeVersionId || !versionNameInput.trim()) return;
    setVersions((prev) =>
      prev.map((v) => (v.id === activeVersionId ? { ...v, name: versionNameInput.trim() } : v))
    );
    setVersionNameInput('');
  };

  const onDeleteVersion = (id: string) => {
    setVersions((prev) => {
      const next = prev.filter((v) => v.id !== id);
      if (next.length === 0) {
        setActiveVersionId(null);
        setCompareVersionId(null);
        setHtmlCode('');
        return [];
      }
      if (activeVersionId === id) {
        const fallback = next[0];
        setActiveVersionId(fallback.id);
        setHtmlCode(fallback.html);
        setPrompt(fallback.prompt);
      }
      if (compareVersionId === id) {
        setCompareVersionId(next[0].id);
      }
      return next;
    });
  };

  const onDuplicateVersion = (id: string) => {
    const source = versions.find((v) => v.id === id);
    if (!source) return;
    const copy: MockupVersion = {
      ...source,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: source.name ? `${source.name} (Copy)` : undefined,
      createdAt: Date.now(),
      diffSummary: 'Duplicated from existing version'
    };
    setVersions((prev) => [copy, ...prev].slice(0, 50));
    setActiveVersionId(copy.id);
    setHtmlCode(copy.html);
    setPrompt(copy.prompt);
  };

  const onTogglePinVersion = (id: string) => {
    setVersions((prev) => {
      const updated = prev.map((v) => (v.id === id ? { ...v, pinned: !v.pinned } : v));
      updated.sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
      return updated;
    });
  };

  const onExportBundle = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      versions,
      activeVersionId,
      siteName,
      multiPages,
      multiPageStyleMemory
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibe-builder-bundle.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportBundle = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        versions?: MockupVersion[];
        activeVersionId?: string | null;
        siteName?: string;
        multiPages?: MultiPageSet;
        multiPageStyleMemory?: string;
      };
      const importedVersions = Array.isArray(parsed.versions) ? parsed.versions : [];
      if (importedVersions.length === 0) {
        setErrorText('Bundle has no versions.');
        return;
      }
      setVersions(importedVersions.slice(0, 50));
      const nextActiveId = parsed.activeVersionId || importedVersions[0].id;
      setActiveVersionId(nextActiveId);
      const active = importedVersions.find((v) => v.id === nextActiveId) || importedVersions[0];
      setHtmlCode(active.html || '');
      setPrompt(active.prompt || '');
      if (parsed.siteName) setSiteName(parsed.siteName);
      if (parsed.multiPages) setMultiPages(parsed.multiPages);
      if (parsed.multiPageStyleMemory) setMultiPageStyleMemory(parsed.multiPageStyleMemory);
      setErrorText('');
    } catch (_) {
      setErrorText('Failed to import bundle. Check JSON format.');
    }
  };

  const onPublishSelected = () => {
    const active = versions.find((v) => v.id === activeVersionId);
    const selected = active || (htmlCode ? {
      id: 'live-preview',
      name: 'Live Preview',
      prompt,
      html: htmlCode,
      createdAt: Date.now(),
      mode: 'fresh' as const,
      diffSummary: 'Live preview export'
    } : null);

    if (!selected) {
      setErrorText('No selected version to publish.');
      return;
    }

    const metadata = {
      exportedAt: new Date().toISOString(),
      versionId: selected.id,
      versionName: selected.name || null,
      prompt: selected.prompt,
      mode: selected.mode,
      diffSummary: selected.diffSummary
    };

    const publishedDoc = `<!doctype html>
<html class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="generator" content="AdHello Vibe Builder" />
    <meta name="adhello:published-metadata" content='${JSON.stringify(metadata).replace(/'/g, '&#39;')}' />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { darkMode: 'class' };</script>
    <style>html,body{margin:0;padding:0;background:#0a0a0a;}</style>
  </head>
  <body>
    ${selected.html}
  </body>
</html>`;

    const filename = `${(selected.name || 'published-mockup').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'published-mockup'}.html`;
    const blob = new Blob([publishedDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    const artifact: PublishedArtifact = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      filename,
      createdAt: Date.now(),
      versionId: selected.id,
      versionName: selected.name,
      html: publishedDoc
    };
    setPublishedArtifacts((prev) => [artifact, ...prev].slice(0, 30));
    setErrorText('');
  };

  const downloadPublishedArtifact = (artifact: PublishedArtifact) => {
    const blob = new Blob([artifact.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredArtifacts = useMemo(() => {
    const q = artifactQuery.trim().toLowerCase();
    const base = !q
      ? [...publishedArtifacts]
      : publishedArtifacts.filter((artifact) => {
      const source = `${artifact.filename} ${artifact.versionName || ''} ${artifact.versionId}`.toLowerCase();
      return source.includes(q);
    });
    base.sort((a, b) => {
      if (artifactSort === 'oldest') return a.createdAt - b.createdAt;
      if (artifactSort === 'name') return a.filename.localeCompare(b.filename);
      return b.createdAt - a.createdAt;
    });
    return base;
  }, [artifactQuery, artifactSort, publishedArtifacts]);

  const clearFilteredArtifacts = () => {
    if (filteredArtifacts.length === 0) return;
    const confirmed = window.confirm(`Delete ${filteredArtifacts.length} filtered artifact(s)?`);
    if (!confirmed) return;
    const ids = new Set(filteredArtifacts.map((artifact) => artifact.id));
    setPublishedArtifacts((prev) => prev.filter((artifact) => !ids.has(artifact.id)));
  };

  const clearAllArtifacts = () => {
    if (publishedArtifacts.length === 0) return;
    const confirmed = window.confirm('Delete all published artifacts?');
    if (!confirmed) return;
    setPublishedArtifacts([]);
  };

  const onCopy = async () => {
    if (!htmlCode) return;
    await navigator.clipboard.writeText(htmlCode);
  };

  const onDownload = () => {
    const doc = buildSrcDoc(htmlCode || EMPTY_MOCKUP);
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibe-mockup.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const srcDoc = useMemo(() => buildSrcDoc(htmlCode || EMPTY_MOCKUP), [htmlCode]);
  const compareHtml = versions.find((v) => v.id === compareVersionId)?.html || '';
  const compareSrcDoc = useMemo(() => buildSrcDoc(compareHtml || EMPTY_MOCKUP), [compareHtml]);
  const quickPrompts = [
    'Modern HVAC homepage with emergency 24/7 CTA and trust badges',
    'Luxury plumbing landing page with hero, services, testimonials, and quote form',
    'Minimal electrician site with dark theme and conversion-focused above-the-fold'
  ];
  const nicheTemplates = [
    {
      label: 'HVAC',
      prompt:
        'Design a high-converting HVAC homepage with emergency service CTA, financing options, maintenance plans, trust badges, and service-area proof.'
    },
    {
      label: 'Plumbing',
      prompt:
        'Design a plumber website with leak/emergency hero, upfront pricing section, customer testimonials, and a sticky book-now CTA.'
    },
    {
      label: 'Roofing',
      prompt:
        'Design a roofing contractor site with storm-damage messaging, insurance-claim help section, before/after gallery, and quote form.'
    },
    {
      label: 'Electrical',
      prompt:
        'Design an electrician website with residential/commercial service cards, safety-first trust cues, and conversion-focused lead form.'
    },
    {
      label: 'Flooring',
      prompt:
        'Design a premium flooring website with materials showcase, style quiz CTA, project gallery, and free estimate funnel.'
    },
    {
      label: 'Painting',
      prompt:
        'Design a painting contractor site with color consultation CTA, before/after portfolio, social proof, and strong mobile conversion flow.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex max-w-[1500px] gap-6 p-4 md:p-6">
        <aside className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-white/80">Vibe Design</p>
          <h1 className="mt-1 text-2xl font-bold">Smart Site Mockup Generator</h1>
          <p className="mt-2 text-sm text-white/60">Prompt the AI and stream a live Tailwind mockup in the canvas.</p>

          <div className="mt-6 space-y-3">
            <Input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Site name"
            />
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Premium plumbing homepage with emergency CTA..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') onGenerate();
              }}
            />
            <Button onClick={() => onGenerate('fresh')} className="w-full" disabled={streaming || !prompt.trim()}>
              {streaming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {streaming ? 'Generating...' : 'Generate Mockup'}
            </Button>
            <Button
              variant="secondary"
              onClick={onGenerateMultiPageSet}
              className="w-full"
              disabled={multiPageGenerating || streaming || !prompt.trim()}
            >
              {multiPageGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {multiPageGenerating ? 'Generating 4-Page Set...' : 'Generate Multi-Page Set'}
            </Button>
            <Button
              variant="outline"
              onClick={onRegenerateActivePage}
              className="w-full"
              disabled={!multiPageMode || multiPageGenerating || streaming || !prompt.trim()}
            >
              {multiPageGenerating && multiPageMode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Regenerate This Page
            </Button>
            <Button
              variant="outline"
              onClick={() => onGenerate('refine')}
              className="w-full"
              disabled={streaming || !prompt.trim() || !htmlCode}
            >
              Refine Current Design
            </Button>
            <Button
              variant="outline"
              onClick={onExport10WebPackage}
              className="w-full"
              disabled={multiPageGenerating || !multiPages.home || !multiPages.services || !multiPages.about || !multiPages.contact}
            >
              Export 10Web Package (.zip)
            </Button>
            {errorText ? <p className="text-xs text-red-300">{errorText}</p> : null}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Quick prompts</p>
            <div className="space-y-2">
              {quickPrompts.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => setPrompt(qp)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-xs text-white/75 hover:bg-white/[0.06]"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Remix presets</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="text-xs" onClick={() => onRemix('minimal')}>
                Minimal
              </Button>
              <Button variant="outline" className="text-xs" onClick={() => onRemix('luxury')}>
                Luxury
              </Button>
              <Button variant="outline" className="text-xs" onClick={() => onRemix('conversion')}>
                Conversion
              </Button>
              <Button variant="outline" className="text-xs" onClick={() => onRemix('playful')}>
                Playful
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Niche templates</p>
            <div className="grid grid-cols-2 gap-2">
              {nicheTemplates.map((tpl) => (
                <Button
                  key={tpl.label}
                  variant="outline"
                  className="text-xs"
                  onClick={() => setPrompt(tpl.prompt)}
                >
                  {tpl.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={onCopy} className="flex-1" disabled={!htmlCode}>
              <Copy className="mr-2 h-4 w-4" /> Copy Code
            </Button>
            <Button variant="outline" onClick={onDownload} className="flex-1" disabled={!htmlCode}>
              <Download className="mr-2 h-4 w-4" /> Download HTML
            </Button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-xs" onClick={onExportBundle} disabled={versions.length === 0}>
              Export Bundle
            </Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10">
              Import Bundle
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImportBundle(file);
                  e.currentTarget.value = '';
                }}
              />
            </label>
          </div>
          <div className="mt-2">
            <Button variant="secondary" className="w-full text-xs" onClick={onPublishSelected} disabled={!htmlCode && versions.length === 0}>
              Publish Selected Version
            </Button>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Prompt history</p>
            <div className="mb-2 flex gap-2">
              <Input
                value={versionNameInput}
                onChange={(e) => setVersionNameInput(e.target.value)}
                placeholder="Name active version..."
                className="h-9 text-xs"
              />
              <Button variant="outline" className="h-9 text-xs" onClick={onRenameVersion} disabled={!activeVersionId}>
                Save
              </Button>
            </div>
            <div className="max-h-52 space-y-2 overflow-auto pr-1">
              {versions.length === 0 ? (
                <p className="text-xs text-white/40">No versions yet.</p>
              ) : (
                versions.map((v, index) => (
                  <div
                    key={v.id}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                      activeVersionId === v.id
                        ? 'border-primary/80 bg-primary/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveVersionId(v.id);
                        setHtmlCode(v.html);
                        setPrompt(v.prompt);
                      }}
                      className="w-full text-left"
                    >
                      <p className="font-semibold">
                        {v.pinned ? '📌 ' : ''}
                        {v.name ? v.name : `Version ${versions.length - index}`}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{v.mode}</p>
                      <p className="mt-1 line-clamp-2 text-white/60">{v.prompt}</p>
                      <p className="mt-1 text-[10px] text-white/45">{v.diffSummary}</p>
                    </button>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      <Button variant="outline" className="h-7 px-2 text-[10px]" onClick={() => onTogglePinVersion(v.id)}>
                        {v.pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button variant="outline" className="h-7 px-2 text-[10px]" onClick={() => onDuplicateVersion(v.id)}>
                        Copy
                      </Button>
                      <Button variant="outline" className="h-7 px-2 text-[10px]" onClick={() => onDeleteVersion(v.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Published artifacts</p>
            <div className="mb-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] text-white/45">
                  Showing {filteredArtifacts.length} of {publishedArtifacts.length}
                </p>
                <select
                  className="h-8 rounded-lg border border-white/20 bg-black/50 px-2 text-[10px] text-white"
                  value={artifactSort}
                  onChange={(e) => setArtifactSort(e.target.value as 'newest' | 'oldest' | 'name')}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <Input
                value={artifactQuery}
                onChange={(e) => setArtifactQuery(e.target.value)}
                placeholder="Search by filename or version..."
                className="h-9 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-8 px-2 text-[10px]"
                  onClick={clearFilteredArtifacts}
                  disabled={filteredArtifacts.length === 0}
                >
                  Clear Filtered
                </Button>
                <Button
                  variant="outline"
                  className="h-8 px-2 text-[10px]"
                  onClick={clearAllArtifacts}
                  disabled={publishedArtifacts.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>
            <div className="max-h-44 space-y-2 overflow-auto pr-1">
              {filteredArtifacts.length === 0 ? (
                <p className="text-xs text-white/40">No published artifacts yet.</p>
              ) : (
                filteredArtifacts.map((artifact) => (
                  <div key={artifact.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
                    <p className="truncate text-[11px] font-semibold text-white/80">{artifact.filename}</p>
                    <p className="mt-1 text-[10px] text-white/45">
                      {new Date(artifact.createdAt).toLocaleString()} · {artifact.versionName || artifact.versionId}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2 h-7 w-full px-2 text-[10px]"
                      onClick={() => downloadPublishedArtifact(artifact)}
                    >
                      Download Again
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/70">
                {multiPageMode ? `Multi-Page Preview (${activePage})` : 'Live Preview'}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="text-xs" onClick={() => setMultiPageMode((v) => !v)}>
                  {multiPageMode ? 'Single Page Mode' : 'Multi-Page Mode'}
                </Button>
              </div>
            </div>
            {multiPageMode ? (
              <Tabs value={activePage} onValueChange={(value) => setActivePage(value as SitePageKey)}>
                <TabsList>
                  <TabsTrigger value="home">Home</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : null}
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-xs" onClick={() => setCompareEnabled((v) => !v)}>
                {compareEnabled ? 'Single View' : 'Compare View'}
              </Button>
              <Tabs value={device} onValueChange={(value) => setDevice(value as 'mobile' | 'tablet' | 'desktop')}>
                <TabsList>
                  <TabsTrigger value="mobile">
                    <Smartphone className="mr-1 inline h-3.5 w-3.5" /> Mobile
                  </TabsTrigger>
                  <TabsTrigger value="tablet">
                    <Tablet className="mr-1 inline h-3.5 w-3.5" /> Tablet
                  </TabsTrigger>
                  <TabsTrigger value="desktop">
                    <Monitor className="mr-1 inline h-3.5 w-3.5" /> Desktop
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {compareEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-xs text-white/60">Compare against</p>
                <select
                  className="rounded-lg border border-white/20 bg-black/50 px-2 py-1 text-xs text-white"
                  value={compareVersionId || ''}
                  onChange={(e) => setCompareVersionId(e.target.value || null)}
                >
                  <option value="">Select version</option>
                  {versions.map((v, i) => (
                    <option key={v.id} value={v.id}>
                      {v.name ? v.name : `Version ${versions.length - i}`}: {v.prompt.slice(0, 45)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid min-h-[75vh] grid-cols-1 gap-3 rounded-xl border border-white/10 bg-neutral-900/60 p-3 lg:grid-cols-2">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-white/60">Current</p>
                  <iframe
                    title="mockup-preview-current"
                    className="h-[68vh] rounded-lg border border-white/10 bg-white"
                    style={{ width: DEVICE_WIDTHS[device] }}
                    srcDoc={srcDoc}
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-white/60">Selected Version</p>
                  <iframe
                    title="mockup-preview-compare"
                    className="h-[68vh] rounded-lg border border-white/10 bg-white"
                    style={{ width: DEVICE_WIDTHS[device] }}
                    srcDoc={compareSrcDoc}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[75vh] justify-center rounded-xl border border-white/10 bg-neutral-900/60 p-3">
              <iframe
                title="mockup-preview"
                className="h-[72vh] rounded-lg border border-white/10 bg-white"
                style={{ width: DEVICE_WIDTHS[device] }}
                srcDoc={srcDoc}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
