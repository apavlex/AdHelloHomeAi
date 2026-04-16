import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  X, 
  Calendar, 
  Zap, 
  Bot, 
  Globe, 
  Phone, 
  ArrowRight,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { Logo } from './components/Logo';
import { Link } from 'react-router-dom';

export default function VipPage() {
  const calendarUrl = "https://cal.com/adhello/vip";

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo variant="light" className="scale-75" />
          </Link>
          <a 
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary-hover text-brand-dark px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
          >
            Book Your VIP Session
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-bold text-sm tracking-widest mb-6"
          >
            FOR HOME SERVICE PROS: PLUMBERS, HVAC, ROOFERS & ELECTRICIANS
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight"
          >
            Stop Losing Jobs to Ugly Websites & Wasting Your Nights on{' '}
            <span className="text-primary">Admin Work.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Get a high-converting homepage AND custom AI automations built{' '}
            <em className="text-white">live, right in front of you</em>. You walk away with a working 
            system that same day, not a 6-week timeline and a timesheet.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a 
              href="#booking"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-brand-dark px-8 py-4 rounded-full font-black text-lg transition-all hover:scale-105 shadow-[0_10px_40px_rgba(250,218,91,0.3)]"
            >
              <Calendar className="w-5 h-5" />
              Book Your VIP Package Now
            </a>
            <p className="text-white/50 text-sm mt-4 italic">Only 1 slot available per week.</p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-8 text-center">
            You're a master of your trade, but your tech is{' '}
            <span className="text-primary">costing you money.</span>
          </h2>
          <p className="text-xl text-white/70 mb-10 text-center">
            Let's be honest. Right now, two things are probably happening in your business:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-red-400">Your website is leaking leads.</h3>
              <p className="text-white/60">
                Potential customers land on your site, can't figure out why they should hire you, 
                and hit the "back" button to call your competitor.
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-red-400">You are drowning in busywork.</h3>
              <p className="text-white/60">
                You're answering late-night texts, chasing down invoices, and manually booking 
                jobs when you should be at home with your family.
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <p className="text-lg text-white/70">
              Traditional marketing agencies will quote you <span className="text-white font-bold">$5,000+</span> and 
              take two months to fix this.
            </p>
            <p className="text-2xl font-bold text-primary mt-4">
              I fix it with you, live, in a single focused sprint.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Introducing the AdHello <span className="text-primary">VIP Combo</span>
          </h2>
          <p className="text-xl text-white/70 mb-10">Your Business, Upgraded.</p>
          
          {/* Video Placeholder */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 aspect-video flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-white/50">Demo video coming soon</p>
            </div>
          </div>
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            We jump on Zoom. I share my screen. We build exactly what you need to get more calls 
            and save more time—live, together. When we hang up, your new site and automations are 
            live and ready to make you money. No endless email chains, no scope creep.
          </p>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-12 text-center">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Website Card */}
            <div className="bg-brand-dark border border-primary/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-brand-dark px-4 py-1 rounded-bl-xl font-bold text-sm">
                Value: $997
              </div>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-2">The Booking Machine</h3>
              <p className="text-primary font-bold text-sm mb-4">Website VIP Session</p>
              <p className="text-white/70 mb-6">
                In one focused, interactive session, we build a brand-new homepage designed 
                specifically to make your phone ring.
              </p>
              <ul className="space-y-3">
                {[
                  'High-Converting Layout — We organize your best before/after photos and your strongest offers.',
                  'Clear Call-to-Actions — Buttons that actually get people to call or request a quote.',
                  'Mobile-Optimized — Because 80% of your customers are looking you up on their phones.',
                  'Instant Launch — We hit publish before we log off. You walk away with a finished asset.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Card */}
            <div className="bg-brand-dark border border-primary/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-brand-dark px-4 py-1 rounded-bl-xl font-bold text-sm">
                Value: $1,297
              </div>
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-2">The Time-Saver</h3>
              <p className="text-primary font-bold text-sm mb-4">AI Automation Session</p>
              <p className="text-white/70 mb-6">
                We map out your biggest daily headaches and replace them with simple, 
                reliable AI automations built right in front of you.
              </p>
              <ul className="space-y-3">
                {[
                  'Missed Call Text-Back — If you miss a call, AI instantly texts the lead, quotes them, and books the appointment.',
                  'Automated Follow-Ups — Stop chasing estimates. The system follows up with leads automatically.',
                  'Frictionless Invoicing — Connect your existing tools (Jobber, QuickBooks, etc.) so billing happens on autopilot.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-10">
            The Investment
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white/50 text-sm mb-2">The traditional agency way:</p>
              <p className="text-2xl font-bold text-white/70 line-through">$5,000+</p>
              <p className="text-white/50 text-sm mt-2">6–8 weeks of waiting</p>
            </div>
            <div className="bg-primary/10 border-2 border-primary rounded-2xl p-6">
              <p className="text-primary text-sm mb-2 font-bold">The AdHello VIP Combo:</p>
              <p className="text-4xl font-black text-primary">$1,997</p>
              <p className="text-white/70 text-sm mt-2">Same-day delivery</p>
            </div>
          </div>
          <p className="text-lg text-white/70 mb-8">
            Think about your average ticket size. Whether it's a $500 plumbing repair or a $15,000 
            roof replacement, this VIP package pays for itself the moment your new site and 
            automations capture <em className="text-white">just one or two jobs</em> you would have otherwise missed.
          </p>
          <a 
            href="#booking"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-brand-dark px-8 py-4 rounded-full font-black text-lg transition-all hover:scale-105"
          >
            Claim Your VIP Build ($1,997)
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-center">
            How the VIP Process Works
          </h2>
          <p className="text-xl text-white/50 mb-12 text-center">(It's Stupidly Simple)</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Lock in your date.',
                desc: 'Pick your preferred day on the calendar below and pay the deposit to secure your spot.'
              },
              {
                step: '2',
                title: 'The 10-Minute Prep.',
                desc: "I'll send you a quick checklist asking for 6-8 photos, your service areas, and your biggest admin headaches. That's all I need."
              },
              {
                step: '3',
                title: 'We Build It Live.',
                desc: 'We jump on our VIP Zoom call. You watch your new business engine come to life in real-time. Once perfect, we launch it.'
              }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary text-brand-dark rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-12 text-center">
            Straight Talk: Is this for you?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Who this IS for:
              </h3>
              <ul className="space-y-4">
                {[
                  'Serious home service pros (Plumbing, HVAC, Roofing, Electrical, Cleaning).',
                  "Owners who know their trade but don't want to mess with tech.",
                  'Action-takers who want immediate results and tangible assets today.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-red-400 flex items-center gap-2">
                <X className="w-6 h-6" />
                Who this is NOT for:
              </h3>
              <ul className="space-y-4">
                {[
                  'People who want to micromanage font colors for weeks on end.',
                  "Businesses that don't have real photos of their work.",
                  'Bargain hunters looking for a $50 Fiverr website.'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-white/70">
                    <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="bg-primary/10 border-2 border-primary rounded-3xl p-10 text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4">
              The "Done-And-Working" Guarantee
            </h2>
            <p className="text-lg text-white/70">
              I don't do long, drawn-out contracts. I deliver fast, high-quality outcomes. 
              If we log off our VIP session and you don't have a fully functioning homepage 
              and automation system that you love, <strong className="text-white">I will work for free until it is perfect.</strong> Period.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA / Booking */}
      <section id="booking" className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Ready to stop missing leads and start saving hours?
          </h2>
          <p className="text-xl text-white/70 mb-10">
            I only take <strong className="text-white">one VIP client per week</strong> so I can dedicate 
            100% of my focus to building your system.
          </p>
          <p className="text-white/50 mb-8">
            Click the button below to view my live availability and grab your spot on my calendar.
          </p>
          <a 
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-brand-dark px-10 py-5 rounded-full font-black text-xl transition-all hover:scale-105 shadow-[0_10px_40px_rgba(250,218,91,0.3)]"
          >
            <Calendar className="w-6 h-6" />
            View Calendar & Book Your VIP Session
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <Logo variant="light" className="mx-auto scale-75 mb-4" />
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} AdHello.ai — AI-Powered Marketing for Home Service Pros
          </p>
        </div>
      </footer>
    </div>
  );
}
