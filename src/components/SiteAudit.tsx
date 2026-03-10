import React, { useState, useEffect } from 'react';
import { Search, Globe, Eye, Target, Sparkles, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

interface Report {
  score: number;
  mobileFirstScore: number;
  leadsEstimatesScore: number;
  googleAiReadyScore: number;
  summary: string;
  strengths: { indicator: string; description: string }[];
  weaknesses: { indicator: string; description: string }[];
  recommendations: {
    title: string;
    description: string;
    action: string;
  }[];
}

export function SiteAudit() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'analyzing') {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [status]);

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

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the website ${targetUrl} and provide an AEO (Answer Engine Optimization) report in JSON format.
        
        The JSON must have this exact structure:
        {
          "score": number (0-100),
          "mobileFirstScore": number (0-100),
          "leadsEstimatesScore": number (0-100),
          "googleAiReadyScore": number (0-100),
          "summary": "string",
          "strengths": [{"indicator": "string", "description": "string"}],
          "weaknesses": [{"indicator": "string", "description": "string"}],
          "recommendations": [{"title": "string", "description": "string", "action": "string"}]
        }

        Evaluate:
        1. Mobile-first design (responsiveness, touch targets, speed).
        2. Built for leads & estimates (prominence of lead capture, clear CTAs, easy contact forms).
        3. Ready for Google & AI (structured data, clear service definitions, brand signals).`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json'
        }
      });

      setProgress(100);

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from AI");
      }

      // Robust JSON parsing
      let data;
      try {
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Error:", e, responseText);
        throw new Error("Failed to parse analysis data");
      }

      setReport(data);
      setStatus('complete');
    } catch (error: any) {
      console.error("Error analyzing website:", error);
      setStatus('idle');

      let errorMessage = "Failed to analyze website. Please check the URL and try again.";
      if (error.message?.includes("blocked")) {
        errorMessage = "The website analysis was blocked. This can happen with some protected sites.";
      } else if (error.message?.includes("fetch")) {
        errorMessage = "Could not reach the website. Please ensure it is publicly accessible.";
      }

      alert(errorMessage);
    }
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
          const isPending = progress < (index === 0 ? 0 : steps[index - 1].threshold);

          return (
            <div key={index} className="flex items-center gap-3">
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
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
    <section className="full-screen-section bg-warm-cream py-24 text-brand-dark font-sans" id="site-audit">
      <div className="max-w-4xl mx-auto px-4 w-full">

        {status === 'idle' && (
          <div className="text-center animate-in fade-in duration-500">
            <h2 className="text-5xl md:text-6xl font-extrabold text-brand-dark mb-6">
              Get Found by AI & Customers
            </h2>
            <p className="text-brand-dark/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Analyze your website to discover your brand strengths, find improvement
              opportunities, and optimize for AI search engines like ChatGPT and Perplexity.
            </p>

            {/* Input Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 border border-gray-100 shadow-xl text-left">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-brand-dark">Your Website</h3>
              </div>
              <form onSubmit={handleScan} className="relative flex items-center">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-6 pr-32 text-brand-dark placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-primary hover:bg-primary-hover text-brand-dark font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  Scan
                </button>
              </form>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <Eye className="w-6 h-6 text-primary mb-4" />
                <h4 className="text-lg font-bold text-brand-dark mb-2">Brand Analysis</h4>
                <p className="text-brand-dark/60 text-sm leading-relaxed font-medium">
                  Understand your positioning and messaging
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <Target className="w-6 h-6 text-primary mb-4" />
                <h4 className="text-lg font-bold text-brand-dark mb-2">Improvement Areas</h4>
                <p className="text-brand-dark/60 text-sm leading-relaxed font-medium">
                  Find opportunities to improve
                </p>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <Sparkles className="w-6 h-6 text-primary mb-4" />
                <h4 className="text-lg font-bold text-brand-dark mb-2">AI Search Ready</h4>
                <p className="text-brand-dark/60 text-sm leading-relaxed font-medium">
                  Optimize for ChatGPT & AI search
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-gray-100 stroke-current"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className="text-primary stroke-current transition-all duration-500 ease-out"
                  strokeWidth="8"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray={`${progress * 2.51327} 251.327`}
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
              Analyzing your website...
            </h2>
            <p className="text-brand-dark/60 text-lg mb-12 font-medium">
              Discovering your strengths and optimization opportunities
            </p>

            <div className="w-full max-w-md mx-auto h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {renderSteps()}
          </div>
        )}

        {status === 'complete' && report && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-extrabold text-brand-dark">Audit Results</h2>
              <button
                onClick={() => setStatus('idle')}
                className="text-sm font-bold text-brand-dark/60 hover:text-brand-dark transition-colors"
              >
                Scan another site
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100">
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-100 stroke-current"
                      strokeWidth="8"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <circle
                      className={`${report.score >= 80 ? 'text-green-500' : report.score >= 50 ? 'text-yellow-500' : 'text-red-500'} stroke-current transition-all duration-1000 ease-out`}
                      strokeWidth="8"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={`${report.score * 2.51327} 251.327`}
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-brand-dark">{report.score}</span>
                    <span className="text-xs font-bold text-brand-dark/50 uppercase tracking-wider">Score</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-brand-dark mb-3">AEO Readiness Score</h3>
                  <p className="text-brand-dark/70 leading-relaxed text-lg font-medium mb-6">{report.summary}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Mobile-First', score: report.mobileFirstScore },
                      { label: 'Leads & Estimates', score: report.leadsEstimatesScore },
                      { label: 'Google & AI Ready', score: report.googleAiReadyScore },
                    ].map((item, i) => (
                      <div key={i} className="bg-warm-cream/50 rounded-2xl p-4 border border-brand-dark/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-brand-dark/40 uppercase tracking-wider">{item.label}</span>
                          <span className={`text-sm font-black ${item.score >= 80 ? 'text-green-600' : item.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {item.score}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${item.score >= 80 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-extrabold text-brand-dark mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="space-y-4">
                    {report.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-3 text-brand-dark/70 font-medium">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <span className="font-bold text-brand-dark block mb-0.5">{strength.indicator}</span>
                          <span className="text-sm">{strength.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-brand-dark mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-4">
                    {report.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-start gap-3 text-brand-dark/70 font-medium">
                        <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Target className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <span className="font-bold text-brand-dark block mb-0.5">{weakness.indicator}</span>
                          <span className="text-sm">{weakness.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-extrabold text-brand-dark mb-6">Actionable Recommendations</h3>
            <div className="space-y-4">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-brand-dark mb-2">{rec.title}</h4>
                    <p className="text-brand-dark/70 leading-relaxed font-medium mb-4 md:mb-0">{rec.description}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm font-bold md:w-1/3 shrink-0 border border-blue-100">
                    <span className="block text-blue-600/70 text-xs uppercase tracking-wider mb-1">Action Step</span>
                    {rec.action}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => {
                  try {
                    // @ts-ignore
                    if (window.chatbase) {
                      // @ts-ignore
                      window.chatbase('open');
                    } else {
                      console.warn("Chatbase not loaded");
                    }
                  } catch (e) {
                    console.error("Error opening chat:", e);
                  }
                }}
                className="bg-primary hover:bg-primary-hover text-brand-dark font-bold py-4 px-10 rounded-full transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-1"
              >
                Get Expert Help Implementing This
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
