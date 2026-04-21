import React, { useState } from 'react';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export default function MockupImageCanvas() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setErrorText('');
    try {
      const res = await fetch('/api/generate-mockup-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Generation failed.');
      }
      if (!data?.imageUrl) {
        throw new Error('No image returned from provider.');
      }
      setImageUrl(data.imageUrl);
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vibe-mockup.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {
      setErrorText('Could not download image.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex max-w-[1400px] gap-6 p-4 md:p-6">
        <aside className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-white/80">Vibe Design</p>
          <h1 className="mt-1 text-2xl font-bold">Smart Site Image Generator</h1>
          <p className="mt-2 text-sm text-white/60">
            Generate a visual website concept image quickly and reliably.
          </p>

          <div className="mt-6 space-y-3">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Premium flooring company homepage, dark luxury style"
              onKeyDown={(e) => {
                if (e.key === 'Enter') generate();
              }}
            />
            <Button onClick={generate} className="w-full" disabled={loading || !prompt.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Generating...' : 'Generate Image'}
            </Button>
            <Button variant="outline" onClick={generate} className="w-full" disabled={loading || !prompt.trim()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
            <Button variant="secondary" onClick={downloadImage} className="w-full" disabled={!imageUrl}>
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            {errorText ? <p className="text-xs text-red-300">{errorText}</p> : null}
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="mb-4 text-sm font-medium text-white/70">Mockup Preview</p>
          <div className="flex min-h-[78vh] items-center justify-center rounded-xl border border-white/10 bg-neutral-900/60 p-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated website mockup"
                className="max-h-[74vh] w-auto rounded-lg border border-white/10 object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="text-xl font-semibold">No preview yet</p>
                <p className="mt-2 text-neutral-400">Enter a prompt and generate your first mockup image.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
