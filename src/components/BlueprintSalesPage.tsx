import { useAnalytics } from '../hooks/useAnalytics';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Layout, 
  ChevronRight, 
  Lock, 
  MousePointerClick,
  Palette,
  FileText,
  Search,
  ShieldCheck
} from 'lucide-react';
import { Logo } from './Logo';

export default function BlueprintSalesPage() {
  useAnalytics();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bizRaw = searchParams.get('biz') || 'Your Business';
  const bizName = bizRaw
    .replace(/(\. )([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  const scoreRaw = searchParams.get('score');
  const score = scoreRaw ? parseInt(scoreRaw) : 78;
  const city = searchParams.get('city') || '';
  const themes = searchParams.get('themes') || '';
  
  // Calculate revenue leak (X%)
  // Logic: Lower the score, higher the leak. 
  // If score is 95, leak is maybe 5%. If score is 40, leak is 60%.
  const revenueLeak = 100 - score;

  return (
    <div className="min-h-screen bg-warm-cream selection:bg-primary/40 text-brand-dark font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-brand-dark/5 px-6 py-4 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <Logo variant="dark" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-brand-dark/40 uppercase tracking-widest hidden sm:inline">Blueprint ID: #B44-{Math.floor(Math.random() * 9000) + 1000}</span>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified Report
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary-dark text-sm font-black mb-6 border border-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            Personalized for {bizName}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.95] tracking-tight"
          >
            Your Audit is Done. <br />
            <span className="text-primary italic">Here is the Fix.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-brand-dark/70 max-w-3xl mx-auto leading-relaxed font-medium mb-12"
          >
            Your audit exposed exactly what's broken. Now you have two options: hire a pro to fix it <span className="font-black text-brand-dark">for you</span>, or grab the exact strategy to handle it yourself.
          </motion.p>

          {/* Dual Path CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <button 
              onClick={() => navigate(`/strategy?biz=${bizRaw}&score=${score}&city=${city}`)}
              className="bg-brand-dark hover:bg-black text-white px-10 py-5 rounded-full font-black text-xl flex items-center gap-3 transition-all hover:scale-105 shadow-2xl w-full sm:w-auto group"
            >
              <Sparkles className="w-6 h-6 text-primary" />
              Have AdHello Build It For Me
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate(`/fulfillment?biz=${bizRaw}&score=${score}&city=${city}&themes=${themes}`)}
              className="bg-white border border-brand-dark/20 text-brand-dark px-8 py-5 rounded-full font-black text-lg flex items-center gap-2 transition-all hover:bg-warm-cream w-full sm:w-auto"
            >
              Get DIY Blueprint ($27)
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
          <p className="mt-4 text-sm font-bold text-brand-dark/40 italic">Most contractors choose the Done-For-You path. <span className="not-italic text-brand-dark/60">"I wish I did this sooner."</span></p>
        </div>

        <div className="pdf-page-break html2pdf__page-break" />

        {/* Section 1: The Problem */}
        <section className="mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-brand-dark organic-shape-1 -rotate-3 -z-10 hidden lg:block" />
          <div className="bg-brand-dark text-white p-10 md:p-20 rounded-[4rem] flex flex-col lg:flex-row items-center gap-16 shadow-2xl relative overflow-hidden">
            {/* Visual Score Representation */}
            <div className="lg:w-1/3 flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-white/10"
                    strokeWidth="8"
                    cx="50" cy="50" r="42"
                    fill="transparent"
                    stroke="currentColor"
                  />
                  <motion.circle
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-primary"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50" cy="50" r="42"
                    fill="transparent"
                    stroke="currentColor"
                    strokeDasharray="264"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-6xl sm:text-7xl font-black">{score}</span>
                  <span className="block text-sm font-black uppercase tracking-widest text-primary">Audit Score</span>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3">
              <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
                The <span className="text-primary italic">Revenue Leak</span> in {bizName}
              </h2>
              <div className="space-y-6 text-xl text-white/70 leading-relaxed font-medium">
                <p>
                  Your audit showed a <span className="text-white font-black underline decoration-primary underline-offset-4">{score} Score</span>. In plain English, that means for every 100 people who visit your site, you are losing <span className="text-primary font-black">{revenueLeak}%</span> of them to a competitor with a better 'Vibe' and clearer 'Trust Bar.'
                </p>
                <p>
                  You don't need a new hobby; you need a professional storefront that works while you sleep.
                </p>
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                  <p className="text-2xl font-black text-primary">{revenueLeak}%</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Lost Opportunity</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                  <p className="text-2xl font-black text-white">95+</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Target Optimization</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: What's Inside */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              What’s Inside the <span className="text-primary">$27 Blueprint?</span>
            </h2>
            <p className="text-brand-dark/60 text-xl font-bold">
              We’ve used the data from your audit to architect a custom solution:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-brand-dark/5 shadow-xl hover:translate-y-[-8px] transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4">3 High-Fidelity Design Variants</h3>
              <p className="text-brand-dark/60 text-lg leading-relaxed font-medium">
                Professional Desktop and Mobile mockups tailored to your industry. No generic templates—these are built for your brand, maintaining your legacy while modernizing your vibe.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-brand-dark/5 shadow-xl hover:translate-y-[-8px] transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4">The 'Customer Gold' Copy Pack</h3>
              <p className="text-brand-dark/60 text-lg leading-relaxed font-medium">
                We’ve analyzed your top reviews to write headlines that actually make people click "Book Now." High-converting copy that addresses {bizName}'s customer pain points instantly.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-brand-dark/5 shadow-xl hover:translate-y-[-8px] transition-all duration-300 group md:col-span-1">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4">The Base44 'Vibe Code'</h3>
              <p className="text-brand-dark/60 text-lg leading-relaxed font-medium">
                A proprietary prompt string. Copy and paste it into Base44 to generate your pixel-perfect site instantly. Your new identity, architected by AI.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-brand-dark/5 shadow-xl hover:translate-y-[-8px] transition-all duration-300 group md:col-span-1">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4">The Local SEO Starter Kit</h3>
              <p className="text-brand-dark/60 text-lg leading-relaxed font-medium">
                Pre-written Meta Titles and Descriptions optimized for your specific city and service. Dominate Google and AI search from Day 1.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: AdHello Managed Service — PRIMARY PITCH */}
        <section className="mb-20 relative">
          <div className="bg-brand-dark rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest mb-8">
                  <Sparkles className="w-3.5 h-3.5" /> Recommended Path
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  Skip the DIY Struggle.<br /><span className="text-primary italic">We Build It For You.</span>
                </h2>
                <p className="text-white/70 text-xl font-medium leading-relaxed mb-8">
                  Contractors don't have time to learn web design, hosting, and GEO-optimization. That's exactly why AdHello exists — we handle every technical detail so you can stay on the job site.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    { label: 'Professional build in 7 days', sub: 'Not 7 weeks. Not months. 7 days.' },
                    { label: 'Managed hosting & SSL included', sub: 'We handle all the technical infrastructure.' },
                    { label: 'Ongoing GEO-rank optimization', sub: 'We update and optimize your site monthly.' },
                    { label: '24/7 AI webchat for lead capture', sub: "Capture leads while you're on the job." },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-black text-white block">{item.label}</span>
                        <span className="text-white/40 font-bold text-sm">{item.sub}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-5xl font-black text-primary">$0</span>
                  <span className="text-white/60 font-bold">Setup · Then $97/mo · No Contracts</span>
                </div>
                <button
                  onClick={() => navigate(`/strategy?biz=${bizRaw}&score=${score}&city=${city}`)}
                  className="bg-primary hover:bg-primary-hover text-brand-dark px-10 py-5 rounded-full font-black text-xl flex items-center gap-3 transition-all hover:scale-105 shadow-2xl shadow-primary/30 w-fit group"
                >
                  Start My Professional Build
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { metric: '$0', label: 'Setup Fee', note: 'Limited Time Offer' },
                  { metric: '7 Days', label: 'Go Live', note: 'Full build to launch' },
                  { metric: '$97/mo', label: 'All-In Cost', note: 'Hosting, GEO & Support' },
                  { metric: '95+', label: 'Target Score', note: 'vs your current score' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <p className="text-3xl font-black text-primary mb-1">{stat.metric}</p>
                    <p className="font-bold text-white">{stat.label}</p>
                    <p className="text-xs text-white/40 font-bold mt-1">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Speed Guarantee */}
        <section className="mb-32 text-center bg-white border border-brand-dark/5 p-12 md:p-24 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <Zap className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">The "Speed to Market" Guarantee</h2>
            <p className="text-2xl md:text-4xl font-medium text-brand-dark/80 max-w-4xl mx-auto leading-tight italic">
              "Most agencies take 30 days and $3,000 to get to this stage. You’re getting the exact same strategic output for the cost of a pizza—delivered to your inbox in seconds."
            </p>
          </div>
        </section>

        {/* Section 5: Strategic Upsell — reduced to secondary */}
        <section className="mb-32 grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h3 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
              Rather build it yourself?
            </h3>
            <p className="text-xl text-brand-dark/70 leading-relaxed font-medium mb-8">
              The $27 Blueprint gives you the world-class strategy for your business in a copy-paste format. If you'd prefer to build it yourself on Base44, this is the perfect starting point.
            </p>
            <div className="flex items-center gap-4 text-primary font-black text-sm uppercase tracking-widest">
              <div className="w-10 h-1bg-primary rounded-full" />
              Executive Agency Upgrade Available
            </div>
          </div>
          <div className="bg-brand-dark rounded-[3.5rem] p-10 text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
             <div className="relative z-10">
               <h4 className="text-2xl font-black mb-6">Executive Agency Plan</h4>
               <ul className="space-y-4 mb-10">
                 {[
                   "Managed Automated Traffic",
                   "24/7 AI Lead Management",
                   "Deep CRM Synchronization",
                   "Dedicated Success Partner"
                 ].map((feat, i) => (
                   <li key={i} className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-primary" />
                     <span className="font-bold">{feat}</span>
                   </li>
                 ))}
               </ul>
               <button className="w-full py-4 bg-white text-brand-dark font-black rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                 Learn More in Checkout
                 <ChevronRight className="w-5 h-5" />
               </button>
             </div>
          </div>
        </section>

        <div id="pricing" className="text-center pt-20 border-t border-brand-dark/5 scroll-mt-24">
          <div className="pdf-page-break html2pdf__page-break" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block w-full"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-12">Ready to get your <span className="text-primary italic">{score} score</span> to a <span className="italic underline underline-offset-8 decoration-primary">95</span>?</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10">
              {/* Primary: AdHello Build */}
              <div className="bg-brand-dark text-white p-10 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest mb-5">
                    ⭐ Recommended
                  </div>
                  <h3 className="text-2xl font-black mb-2">AdHello Concierge Build</h3>
                  <p className="text-4xl font-black text-primary mb-1">$0 Setup</p>
                  <p className="text-white/50 font-bold text-sm mb-6">then $97/mo — No Contracts</p>
                  <button
                    onClick={() => navigate(`/strategy?biz=${bizRaw}&score=${score}&city=${city}`)}
                    className="w-full py-4 bg-primary hover:bg-primary-hover text-brand-dark font-black rounded-2xl text-lg transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2 mb-3"
                  >
                    <Sparkles className="w-5 h-5" />
                    Build My Site Professionally
                  </button>
                  <p className="text-white/30 text-xs font-bold text-center">Live in 7 days · Fully managed</p>
                </div>
              </div>
              {/* Secondary: DIY Blueprint */}
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-brand-dark/5">
                <p className="text-brand-dark/40 font-bold text-sm mb-4 uppercase tracking-widest">DIY Path</p>
                <h3 className="text-2xl font-black mb-2">Base44 Blueprint</h3>
                <p className="text-4xl font-black text-brand-dark mb-1">$27</p>
                <p className="text-brand-dark/40 font-bold text-sm mb-6">One-time payment</p>
                <button 
                 onClick={() => navigate(`/fulfillment?biz=${bizRaw}&score=${score}&city=${city}&themes=${themes}`)}
                 className="w-full py-4 bg-warm-cream border border-brand-dark/10 text-brand-dark font-black rounded-2xl text-lg transition-all hover:bg-brand-dark/5 flex items-center justify-center gap-2 mb-3"
                >
                  <MousePointerClick className="w-5 h-5" /> Get DIY Blueprint
                </button>
                <p className="text-brand-dark/30 text-xs font-bold text-center">Build it yourself · Requires technical time</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="py-12 border-t border-brand-dark/5 text-center px-4">
        <p className="text-sm font-bold text-brand-dark/40 uppercase tracking-widest">© 2024 AdHello.ai &bull; Base44 Blueprint Division &bull; Built for growth.</p>
      </footer>
    </div>
  );
}
