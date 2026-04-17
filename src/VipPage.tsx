import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Zap,
  Globe,
  Bot,
  Star,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { Logo } from './components/Logo';

export default function VipPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-light text-brand-dark">
      {/* Header - Same as Homepage */}
      <header className="sticky top-0 z-50 bg-brand-light/80 backdrop-blur-xl border-b border-brand-dark/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">Home</Link>
              <Link to="/templates" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">Templates</Link>
              <Link to="/studio" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">Ad Studio</Link>
              <a 
                href="https://cal.com/adhello/demo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-hover text-brand-dark px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-primary/20"
              >
                Book a Demo
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-dark"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-brand-dark/5">
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">Home</Link>
                <Link to="/templates" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">Templates</Link>
                <Link to="/studio" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">Ad Studio</Link>
                <a 
                  href="https://cal.com/adhello/demo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary-hover text-brand-dark px-5 py-2.5 rounded-full font-bold text-sm transition-all text-center"
                >
                  Book a Demo
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4">
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
            className="text-xl md:text-2xl text-brand-dark/60 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Get a high-converting homepage AND custom AI automations built{' '}
            <em className="text-brand-dark font-medium">live, right in front of you</em> — in a single VIP session.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a
              href="https://cal.com/adhello/vip"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-brand-dark px-10 py-5 rounded-full font-black text-xl transition-all hover:scale-105 shadow-[0_20px_50px_rgba(250,218,91,0.35)]"
            >
              <Calendar className="w-6 h-6" />
              BOOK YOUR VIP SESSION — $1,997
            </a>
            <p className="mt-4 text-brand-dark/40 text-sm">Limited to 4 spots per week</p>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
            Sound Familiar?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Your website looks like it was built in 2010",
              "You're losing jobs to competitors with better online presence",
              "You spend hours every week on invoicing, scheduling, and follow-ups",
              "You know you need AI but don't know where to start"
            ].map((problem, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-red-50 rounded-2xl border border-red-100">
                <X className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <p className="text-brand-dark/80 font-medium">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            The VIP Session: <span className="text-primary">Done With You, Live</span>
          </h2>
          <p className="text-xl text-brand-dark/60 mb-12 max-w-2xl mx-auto">
            In 90 minutes, you'll walk away with a professional website AND working AI automations — built right in front of you.
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Website Card */}
            <div className="bg-brand-light rounded-3xl p-8 border border-brand-dark/5">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4">Smart Website</h3>
              <p className="text-brand-dark/60 mb-6">Value: $997</p>
              <ul className="space-y-3">
                {[
                  "Custom homepage design built live",
                  "Mobile-optimized & fast-loading",
                  "SEO foundations for local search",
                  "Lead capture forms & CTAs",
                  "Google Business integration"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-brand-dark/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Automation Card */}
            <div className="bg-brand-light rounded-3xl p-8 border border-brand-dark/5">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4">AI Automation</h3>
              <p className="text-brand-dark/60 mb-6">Value: $1,297</p>
              <ul className="space-y-3">
                {[
                  "24/7 AI chatbot for lead capture",
                  "Automated quote follow-ups",
                  "Review request sequences",
                  "Appointment booking automation",
                  "Custom workflows for your business"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-brand-dark/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Investment */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-8">
            Your Investment
          </h2>
          <div className="bg-white rounded-3xl p-10 border border-brand-dark/5 shadow-xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-2xl text-brand-dark/40 line-through">$2,294</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Save $300</span>
            </div>
            <div className="text-6xl font-black text-brand-dark mb-4">$1,997</div>
            <p className="text-brand-dark/60 mb-8">One-time payment. No monthly fees. No surprises.</p>
            <a
              href="https://cal.com/adhello/vip"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-brand-dark px-10 py-5 rounded-full font-black text-xl transition-all hover:scale-105 shadow-[0_20px_50px_rgba(250,218,91,0.35)]"
            >
              <Calendar className="w-6 h-6" />
              BOOK NOW
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Book Your Slot", desc: "Pick a 90-minute window that works for you" },
              { step: "2", title: "We Build Live", desc: "Watch your website and automations come to life" },
              { step: "3", title: "Go Live Same Day", desc: "Launch immediately and start getting leads" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary text-brand-dark rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-brand-dark/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-3xl p-8 border border-green-100">
              <h3 className="text-2xl font-black mb-6 text-green-700">This IS for you if:</h3>
              <ul className="space-y-4">
                {[
                  "You're a home service pro ready to grow",
                  "You want results, not another DIY project",
                  "You value your time over tinkering",
                  "You're ready to invest in your business"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-brand-dark/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
              <h3 className="text-2xl font-black mb-6 text-red-700">This is NOT for you if:</h3>
              <ul className="space-y-4">
                {[
                  "You want to build it yourself",
                  "You're not ready to take action",
                  "You expect magic without any input",
                  "You're looking for the cheapest option"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-brand-dark/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            The "Done-And-Working" Guarantee
          </h2>
          <p className="text-xl text-brand-dark/60 leading-relaxed">
            If you're not 100% happy with what we build in your VIP session, we'll keep working until you are — at no extra charge. We don't stop until it's live and you're thrilled.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Ready to Stop Losing Jobs?
          </h2>
          <p className="text-xl text-brand-dark/60 mb-10">
            Book your VIP session now and get your website + AI automations live today.
          </p>
          <a
            href="https://cal.com/adhello/vip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-brand-dark px-10 py-5 rounded-full font-black text-xl transition-all hover:scale-105 shadow-[0_20px_50px_rgba(250,218,91,0.35)]"
          >
            <Calendar className="w-6 h-6" />
            BOOK YOUR VIP SESSION — $1,997
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-brand-dark/5">
        <div className="max-w-4xl mx-auto text-center">
          <Logo className="mx-auto scale-75 mb-4" />
          <p className="text-brand-dark/40 text-sm">
            © {new Date().getFullYear()} AdHello.ai — AI-Powered Marketing for Home Service Pros
          </p>
        </div>
      </footer>
    </div>
  );
}
