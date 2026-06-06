import React from 'react';
import { ArrowRight, Clock, Wrench, Headphones, Sparkles, CheckCircle2 } from 'lucide-react';
import { BOOK_CTA, BOOK_URL } from '../constants/bookCta';

export function DiscoveryCall() {
  return (
    <section className="py-24 bg-warm-cream relative overflow-hidden" id="discovery-call">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-200/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-brand-dark text-sm font-bold mb-6 border border-primary/30">
            <Sparkles className="w-4 h-4" />
            Marketing Agents Live in 5 Business Days
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark mb-6 leading-[1.1] tracking-tight">
            AI Employees. Live in 5 Business Days.<br />
            <span className="text-primary">Hands-On Setup. Zero Guesswork.</span>
          </h2>
          <p className="text-xl md:text-2xl text-brand-dark/70 max-w-3xl mx-auto leading-relaxed">
            We embed with your team, connect your tools, and deploy AI employees built around your channels, your leads, and your growth — not a one-size-fits-all template.
          </p>
        </div>

        {/* Three tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Assessment */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 hover:border-primary/40 transition-all shadow-sm group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Headphones className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-brand-dark mb-3">{BOOK_CTA.title}</h3>
            <p className="text-brand-dark/70 leading-relaxed mb-4">
              {BOOK_CTA.description}
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-brand-dark/50">
              <Clock className="w-4 h-4" /> 30 minutes, no commitment
            </div>
          </div>

          {/* Show the tool */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 hover:border-primary/40 transition-all shadow-sm group">
            <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-brand-dark mb-3">2. See the Tool</h3>
            <p className="text-brand-dark/70 leading-relaxed mb-4">
              We show you the exact agents, dashboards, and data pipelines we'll build. You get a live demo scoped to your business — before any commitment.
            </p>
            <div className="flex items-center gap-2 text-sm font-bold text-brand-dark/50">
              <CheckCircle2 className="w-4 h-4" /> See it before you buy
            </div>
          </div>

          {/* Do it for them (Premium) */}
          <div className="bg-brand-dark rounded-[2rem] p-8 border border-brand-dark text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">3. We Do It For You</h3>
              <p className="text-white/60 leading-relaxed mb-4">
                Premium engagement. Our engineers deploy, configure, and manage your AI marketing agents — data pipelines, warehouse, hosting, and all. Fully managed.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <Wrench className="w-4 h-4" /> Fully managed, end to end
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-sm">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3">
              <h3 className="text-2xl md:text-3xl font-black text-brand-dark mb-3">
                {BOOK_CTA.title}
              </h3>
              <p className="text-brand-dark/70 text-lg mb-4 max-w-2xl">
                {BOOK_CTA.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-brand-dark/60">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data pipelines & warehouse included</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Hands-on setup for sources, agents, dashboards</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pricing scoped after assessment</span>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <a
                href={BOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-brand-dark font-black text-lg px-8 py-4 rounded-full transition-all shadow-[6px_6px_0px_rgba(45,52,54,0.1)] hover:shadow-none hover:translate-y-[4px] group"
              >
                {BOOK_CTA.buttonLabel}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
