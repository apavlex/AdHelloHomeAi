import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  HeartHandshake,
  Laptop,
  Mail,
  MapPin,
  Menu,
  MousePointerClick,
  Phone,
  Search,
  Smile,
  Smartphone,
  TrendingUp,
  Unlock,
  Users,
  X,
  Zap,
  BarChart3,
  Wrench,
  Stethoscope,
  Layout,
  Hammer,
  ThermometerSnowflake,
  Home,
  Star,
  Droplets
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteAudit } from './components/SiteAudit';

const HERO_VARIANTS = [
  {
    tagline: "Built for HVAC Services",
    headline: "Get more HVAC leads with a website built for comfort.",
    subheadline: "While you’re fixing an AC or furnace, your smart website helps book your next service. Built to convert local traffic from Google, Maps, and AI search.",
    image: "https://drive.google.com/thumbnail?id=1e4CPR8UPUMtsTQyKGUnil51Cf9qg2S1b&sz=w1000"
  },
  {
    tagline: "Built for Electrical Services",
    headline: "Power up your business with more electrical leads.",
    subheadline: "While you’re wiring a panel or installing lights, your smart website helps book your next job. Built to convert local traffic from Google, Maps, and AI search.",
    image: "https://drive.google.com/thumbnail?id=1zbMCrvpcoCBuzJk60gE9k2_eIFnYZoYB&sz=w1000"
  },
  {
    tagline: "Built for Plumbing Services",
    headline: "Fill your plumbing schedule with high-quality leads.",
    subheadline: "While you’re fixing a leak or installing a heater, your smart website helps book your next job. Built to convert local traffic from Google, Maps, and AI search.",
    image: "https://drive.google.com/thumbnail?id=1iH1uKlOuXDQ2zBjvzjF82eOcJz2u0k6P&sz=w1000"
  },
  {
    tagline: "Built for Roofing Services",
    headline: "Get more roofing estimates without lifting a finger.",
    subheadline: "While you’re on a roof or meeting a client, your smart website helps book your next estimate. Built to convert local traffic from Google, Maps, and AI search.",
    image: "https://drive.google.com/thumbnail?id=1oCWDHteOB-GWTxZAA73MktTXMb0dD6to&sz=w1000"
  },
  {
    tagline: "Built for Flooring Companies",
    headline: "Step up your business with more flooring leads.",
    subheadline: "While you’re installing hardwood or laying tile, your smart website helps book your next job. Built to convert local traffic from Google, Maps, and AI search.",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&q=80&w=800"
  }
];

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_VARIANTS.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    {
      question: "I already have a website. Why do I need AdHello?",
      answer: "Most home service websites are digital brochures — they look nice but don't convert visitors into leads. AdHello sites are built specifically for conversion, optimized for local search, and include AI tools (like Webchat and the Growth Coach) that traditional sites don't have."
    },
    {
      question: "Do I have to build the website myself?",
      answer: "No. We build the entire site for you. You just tell us about your business, your services, and your service area. We handle the design, the copy, and the tech."
    },
    {
      question: "How long does it take to go live?",
      answer: "Your new smart website will be live in 7 days or less."
    },
    {
      question: "What happens if I need to change something on my site?",
      answer: "Just ask your AI Growth Coach or send us a message. We handle updates for you so you don't have to mess with a clunky website builder."
    },
    {
      question: "Am I locked into a contract?",
      answer: "Never. AdHello is month-to-month. If you're not getting value, you can cancel anytime."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const openChat = () => {
    try {
      // @ts-ignore
      if (window.chatbase) {
        // @ts-ignore
        window.chatbase('open');
      } else {
        console.warn("Chatbase not loaded");
        setIsContactModalOpen(true); // Fallback to contact modal
      }
    } catch (e) {
      console.error("Error opening chat:", e);
      setIsContactModalOpen(true);
    }
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
      setTimeout(() => {
        setIsContactModalOpen(false);
        setFormStatus('idle');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="selection:bg-primary/40">
      <div className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-yellow-100 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-brand-dark">
                AdHello<span className="text-yellow-500">.ai</span>
              </h2>
            </div>
            <nav className="hidden md:flex gap-10">
              <a
                className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#how-it-works"
              >
                How It Works
              </a>
              <a
                className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#what-you-get"
              >
                What's Included
              </a>
              <a
                className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#pricing"
              >
                Pricing
              </a>
              <a
                className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#testimonials"
              >
                Success Stories
              </a>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={openChat}
                className="bg-primary hover:bg-primary-hover text-brand-dark text-sm font-bold px-6 py-3 rounded-full transition-all duration-300 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[0_0_15px_rgba(243,221,109,0.6)] hover:-translate-y-0.5 hover:scale-105 flex items-center gap-2"
              >
                Get Your Free Website
              </button>
            </div>
            <button 
              className="md:hidden p-2 text-brand-dark hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </header>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 shadow-lg absolute w-full">
            <nav className="flex flex-col gap-4">
              <a
                className="text-base font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                className="text-base font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#what-you-get"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                What's Included
              </a>
              <a
                className="text-base font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                className="text-base font-bold text-brand-dark/70 hover:text-brand-dark transition-colors"
                href="#testimonials"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Success Stories
              </a>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openChat();
                }}
                className="flex bg-primary hover:bg-primary-hover text-brand-dark text-base font-bold px-6 py-3 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(243,221,109,0.6)] hover:-translate-y-0.5 hover:scale-105 items-center justify-center gap-2 mt-2"
              >
                Get Your Free Website
              </button>
            </nav>
          </div>
        )}
      </div>

      <section className="full-screen-section hero-gradient overflow-hidden pt-32 pb-16" id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left order-2 lg:order-1 relative h-auto lg:h-[450px] flex flex-col justify-center">
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold mb-6 border border-yellow-200 w-fit">
                  The AI Growth Engine for Home Service Businesses
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-dark mb-8 leading-[1.05]">
                  Your Competitors Are Getting the Calls. <span className="hand-underline">Let's Change That.</span>
                </h1>
                <p className="text-xl md:text-2xl text-brand-dark/70 mb-10 leading-relaxed max-w-xl">
                  AdHello gives your home service business a smart website, AI Webchat, and a built-in growth engine - all in one. No agency. No tech headaches. Just more leads.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button 
                    onClick={openChat}
                    className="px-10 py-5 bg-primary hover:bg-primary-hover text-brand-dark font-bold rounded-full transition-all shadow-[6px_6px_0px_rgba(45,52,54,0.1)] hover:shadow-none hover:translate-y-[4px] flex items-center justify-center gap-2 text-xl w-full sm:w-auto border-2 border-transparent"
                  >
                    Get My Free Website
                  </button>
                  <a 
                    href="#how-it-works"
                    className="px-10 py-5 bg-white hover:bg-gray-50 text-brand-dark font-bold rounded-full transition-all shadow-[6px_6px_0px_rgba(45,52,54,0.1)] hover:shadow-none hover:translate-y-[4px] flex items-center justify-center gap-2 text-xl w-full sm:w-auto border-2 border-brand-dark/5"
                  >
                    See How It Works
                  </a>
                </div>
                <p className="text-sm font-bold text-brand-dark/40 ml-4 mt-2">No long-term contracts. Setup in 7 days. Built for HVAC, Plumbing, Electrical, Roofing &amp; More.</p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2 flex flex-col items-center justify-center h-[400px] lg:h-[550px]">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-[8px] border-white max-w-md w-full aspect-[4/5] bg-primary/10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      alt="Home Service Professional"
                      className="w-full h-full object-cover"
                      src={HERO_VARIANTS[heroIndex].image}
                      referrerPolicy="no-referrer"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent flex flex-col justify-end p-8">
                      <div className="inline-block bg-primary text-brand-dark text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 w-fit">
                        {HERO_VARIANTS[heroIndex].tagline}
                      </div>
                      <h3 className="text-white text-2xl font-bold mb-2 leading-tight">
                        {HERO_VARIANTS[heroIndex].headline}
                      </h3>
                      <p className="text-white/80 text-sm font-medium line-clamp-3">
                        {HERO_VARIANTS[heroIndex].subheadline}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute top-10 -right-4 w-24 h-24 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-accent-peach rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
        <div className="scroll-down-indicator animate-bounce text-brand-dark/20">
          <ChevronDown className="w-10 h-10" />
        </div>
      </section>

      <section
        className="py-12 bg-white relative overflow-hidden border-y border-gray-100"
        id="stats"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-50/50 organic-shape-2 -z-10 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-2 text-center p-6 rounded-[2rem] bg-warm-cream border border-gray-100 hover:border-primary transition-all">
              <p className="text-4xl md:text-5xl font-extrabold text-brand-dark">3x</p>
              <p className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">
                More Calls
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center p-6 rounded-[2rem] bg-warm-cream border border-gray-100 hover:border-primary transition-all">
              <p className="text-4xl md:text-5xl font-extrabold text-brand-dark">4.9/5</p>
              <p className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">
                Average Rating
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center p-6 rounded-[2rem] bg-warm-cream border border-gray-100 hover:border-primary transition-all">
              <p className="text-4xl md:text-5xl font-extrabold text-brand-dark">24/7</p>
              <p className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">
                Lead Capture
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center p-6 rounded-[2rem] bg-warm-cream border border-gray-100 hover:border-primary transition-all">
              <p className="text-4xl md:text-5xl font-extrabold text-brand-dark">Local</p>
              <p className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">
                Built for Local Markets
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="hand-divider opacity-20"></div>
      </div>

      <section className="py-24 bg-white overflow-hidden" id="problem">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-8 leading-[1.1] tracking-tight">
              The Hard Truth About Home Service Marketing
            </h2>
            <p className="text-brand-dark/70 text-xl mb-6 leading-relaxed">
              Most home service businesses are losing leads every single day and they don't even know it. Your website looks fine, but it wasn't built to convert. Your phone goes unanswered after hours. You're invisible on AI search tools like ChatGPT and Google's AI overviews. And you're spending money guessing at what marketing actually works.
            </p>
            <p className="text-brand-dark/70 text-xl mb-8 leading-relaxed">
              Meanwhile, the competitor down the street — the one with the newer trucks and busier schedule — isn't smarter than you. They just have a better system.
            </p>
            <p className="text-2xl font-bold text-brand-dark">
              AdHello is that system.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="hand-divider opacity-20"></div>
      </div>

      <section className="py-24 bg-warm-cream relative overflow-hidden" id="what-you-get">
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-6 tracking-tight">
              Everything You Need to Win Locally — Starting at $97/Month
            </h2>
            <p className="text-brand-dark/70 text-xl md:text-2xl">
              One platform. One price. Built to grow with you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-primary transition-all duration-500 group flex flex-col h-full shadow-sm">
              <div className="text-4xl font-black text-yellow-500 mb-6 opacity-50">01</div>
              <h3 className="text-2xl font-black text-brand-dark mb-4">Your Smart Website</h3>
              <p className="text-brand-dark/70 text-lg leading-relaxed">
                A professionally built, mobile-first website designed specifically for home service businesses. Not a template you drag and drop yourself — a real, lead-focused site we build for you, live in 7 days. Optimized for Google, Google Maps, and AI search so customers find you first.
              </p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-primary transition-all duration-500 group flex flex-col h-full shadow-sm">
              <div className="text-4xl font-black text-yellow-500 mb-6 opacity-50">02</div>
              <h3 className="text-2xl font-black text-brand-dark mb-4">AI Webchat (Your 24/7 Receptionist)</h3>
              <p className="text-brand-dark/70 text-lg leading-relaxed">
                Never miss a lead again. AdHello's webchat answers customer questions, captures contact info, and qualifies leads — even at 2am when you're on a job. It's like having a receptionist who never takes a day off and never has a bad morning.
              </p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-primary transition-all duration-500 group flex flex-col h-full shadow-sm">
              <div className="text-4xl font-black text-yellow-500 mb-6 opacity-50">03</div>
              <h3 className="text-2xl font-black text-brand-dark mb-4">Basic Analytics Dashboard</h3>
              <p className="text-brand-dark/70 text-lg leading-relaxed">
                See exactly where your leads are coming from, how your website is performing, and what's working — all in one clean dashboard. No spreadsheets. No guesswork. Just clear data that helps you make smart decisions.
              </p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-primary transition-all duration-500 group flex flex-col h-full shadow-sm">
              <div className="text-4xl font-black text-yellow-500 mb-6 opacity-50">04</div>
              <h3 className="text-2xl font-black text-brand-dark mb-4">AI Growth Coach</h3>
              <p className="text-brand-dark/70 text-lg leading-relaxed mb-4">
                This is where AdHello gets interesting. Your built-in AI Growth Coach analyzes your business, your market, and your competitors — then gives you specific, actionable advice to grow. Think of it as having a marketing strategist in your pocket, available every day, personalized to your business.
              </p>
              <p className="text-brand-dark/70 text-lg leading-relaxed italic">
                "What should I post this week?" "How do I get more reviews?" "Why am I not ranking on Google?" — Ask it anything.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="hand-divider opacity-20"></div>
      </div>

      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-6 tracking-tight">
              Start Simple. Scale When You're Ready.
            </h2>
            <p className="text-brand-dark/60 max-w-2xl mx-auto text-xl md:text-2xl">
              AdHello grows with your business. Start with the foundation, add tools as you need them. No pressure. No lock-in.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Tier 1 */}
            <div className="bg-warm-cream rounded-[3rem] p-10 flex flex-col h-full border-2 border-primary relative">
              <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-primary text-brand-dark font-black px-6 py-2 rounded-full text-sm tracking-widest uppercase shadow-lg">
                Most Popular
              </div>
              <h3 className="text-3xl font-black text-brand-dark mb-2">Starter</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-brand-dark">$97</span>
                <span className="text-brand-dark/60 font-bold">/month</span>
              </div>
              <p className="text-brand-dark/70 text-lg mb-8 font-medium">The foundation every home service business needs.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-primary font-black">•</span> Smart website built for you</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-primary font-black">•</span> AI Webchat (24/7 lead capture)</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-primary font-black">•</span> Basic analytics dashboard</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-primary font-black">•</span> AI Growth Coach</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-primary font-black">•</span> Hosting & updates included</li>
              </ul>
              <button onClick={openChat} className="w-full py-4 bg-brand-dark hover:bg-brand-dark/90 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 text-lg">
                Start Here
              </button>
            </div>

            {/* Tier 2 */}
            <div className="bg-white rounded-[3rem] p-10 flex flex-col h-full border border-gray-100 relative opacity-80">
              <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-gray-200 text-brand-dark/60 font-black px-6 py-2 rounded-full text-sm tracking-widest uppercase">
                Coming Soon
              </div>
              <h3 className="text-3xl font-black text-brand-dark mb-2">Growth</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-brand-dark">TBD</span>
              </div>
              <p className="text-brand-dark/70 text-lg mb-8 font-medium">For businesses ready to scale their marketing.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-gray-300 font-black">•</span> Everything in Starter</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-gray-300 font-black">•</span> Ad Briefs (AI-generated ad strategies ready to run)</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-gray-300 font-black">•</span> Content Studio — create images, video, and audio for your brand</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-gray-300 font-black">•</span> Advanced analytics & competitor tracking</li>
                <li className="flex items-start gap-3 text-brand-dark font-bold"><span className="text-gray-300 font-black">•</span> Credits system — use what you need, buy more as you grow</li>
              </ul>
              <button onClick={openChat} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-brand-dark font-bold rounded-full transition-all flex items-center justify-center gap-2 text-lg">
                Join the Waitlist
              </button>
            </div>

            {/* Tier 3 */}
            <div className="bg-brand-dark rounded-[3rem] p-10 flex flex-col h-full border border-brand-dark relative">
              <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-white text-brand-dark font-black px-6 py-2 rounded-full text-sm tracking-widest uppercase">
                By Application
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Managed</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-white">Custom</span>
              </div>
              <p className="text-white/70 text-lg mb-8 font-medium">We run your entire growth engine for you.</p>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-white font-bold"><span className="text-white/30 font-black">•</span> Everything in Growth</li>
                <li className="flex items-start gap-3 text-white font-bold"><span className="text-white/30 font-black">•</span> Done-for-you ad management</li>
                <li className="flex items-start gap-3 text-white font-bold"><span className="text-white/30 font-black">•</span> Lead generation campaigns</li>
                <li className="flex items-start gap-3 text-white font-bold"><span className="text-white/30 font-black">•</span> Conversion optimization</li>
                <li className="flex items-start gap-3 text-white font-bold"><span className="text-white/30 font-black">•</span> Dedicated growth strategist</li>
                <li className="flex items-start gap-3 text-white font-bold"><span className="text-white/30 font-black">•</span> Monthly performance reporting</li>
                <li className="flex items-start gap-3 text-white font-bold"><span className="text-white/30 font-black">•</span> Agent Automation</li>
              </ul>
              <p className="text-white/50 text-sm mb-6 italic">This isn't for everyone — it's for businesses serious about dominating their local market.</p>
              <button onClick={openChat} className="w-full py-4 bg-white hover:bg-gray-100 text-brand-dark font-bold rounded-full transition-all flex items-center justify-center gap-2 text-lg mt-auto">
                Apply for Managed
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-soft-peach" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-extrabold text-brand-dark mb-6">
              From Sign Up to More Leads in 7 Days
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative">
            <div className="bg-white p-2 rounded-[3.5rem] shadow-xl text-center overflow-hidden flex flex-col h-full border border-gray-100 relative z-10 hover:translate-y-[-8px] transition-transform duration-500">
              <div className="h-56 w-full relative rounded-t-[3rem] overflow-hidden">
                <img
                  alt="Person searching on smartphone"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                />
              </div>
              <div className="p-10 pt-8">
                <h4 className="text-2xl font-black text-brand-dark mb-4">
                  Step 1 — We Build Your Site
                </h4>
                <p className="text-lg text-brand-dark/60 leading-relaxed font-bold">
                  Tell us about your business. We build a professional, lead-focused website tailored to your services and service area. No homework for you.
                </p>
              </div>
            </div>

            <div className="bg-primary p-2 rounded-[3.5rem] shadow-2xl text-center overflow-hidden flex flex-col transform lg:scale-110 z-30 h-full border-4 border-white hover:scale-[1.12] transition-transform duration-500">
              <div className="h-56 w-full relative rounded-t-[3rem] overflow-hidden">
                <img
                  alt="AI Webchat Assistant"
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800"
                />
              </div>
              <div className="p-10 pt-8">
                <h4 className="text-2xl font-black text-brand-dark mb-4">
                  Step 2 — We Activate Your Webchat
                </h4>
                <p className="text-lg text-brand-dark/80 leading-relaxed font-bold">
                  Your AI receptionist goes live instantly. It greets visitors, answers questions, and captures leads around the clock.
                </p>
              </div>
            </div>

            <div className="bg-white p-2 rounded-[3.5rem] shadow-xl text-center overflow-hidden flex flex-col h-full border border-gray-100 z-10 hover:translate-y-[-8px] transition-transform duration-500">
              <div className="h-56 w-full relative rounded-t-[3rem] overflow-hidden">
                <img
                  alt="AdHello Business Growth Dashboard"
                  className="w-full h-full object-cover"
                  src="https://drive.google.com/thumbnail?id=1e4CPR8UPUMtsTQyKGUnil51Cf9qg2S1b&sz=w1000"
                />
              </div>
              <div className="p-10 pt-8">
                <h4 className="text-2xl font-black text-brand-dark mb-4">
                  Step 3 — You Start Seeing Results
                </h4>
                <p className="text-lg text-brand-dark/60 leading-relaxed font-bold">
                  Log into your AdHello dashboard to see your analytics, chat with your AI Growth Coach, and watch your leads grow. When you're ready for more, upgrade with one click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="hand-divider opacity-20"></div>
      </div>

      <section className="py-24 bg-warm-cream" id="comparison">
        <div className="max-w-5xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight">
              Why AdHello?
            </h2>
          </div>
          <div className="bg-white rounded-[3.5rem] overflow-hidden border border-gray-100 shadow-sm">
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-10 text-center text-brand-dark/40 font-black bg-gray-50 text-sm md:text-base uppercase tracking-[0.2em]">
                The Old Way (Agencies & DIY)
              </div>
              <div className="p-10 text-center text-brand-dark font-black bg-primary/20 text-lg md:text-xl uppercase tracking-[0.1em]">
                The AdHello Way
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { old: "Pay $3,000+ upfront for a website", new: "$97/month. No setup fees." },
                { old: "Wait weeks for simple text changes", new: "Updates handled for you" },
                { old: "Miss calls when you're on a job", new: "AI Webchat captures leads 24/7" },
                { old: "Guess what marketing works", new: "AI Growth Coach tells you exactly what to do" },
                { old: "Locked into a 12-month contract", new: "Cancel anytime" }
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-2 divide-x divide-gray-100 group hover:bg-yellow-50/30 transition-colors">
                  <div className="p-8 text-center text-lg md:text-xl text-gray-500 font-medium">
                    {row.old}
                  </div>
                  <div className="p-8 text-center text-lg md:text-xl font-black text-brand-dark flex items-center justify-center gap-3">
                    <CheckCircle2 className="text-green-500 w-6 h-6 shrink-0" /> {row.new}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="hand-divider opacity-20"></div>
      </div>

      <section className="py-24 bg-white" id="niches">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-6 tracking-tight">
              Built for the Trades. Built for You.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: "Plumbers", icon: <Droplets className="w-8 h-8 text-primary" /> },
              { title: "HVAC", icon: <ThermometerSnowflake className="w-8 h-8 text-primary" /> },
              { title: "Electricians", icon: <Zap className="w-8 h-8 text-primary" /> },
              { title: "Roofers", icon: <Home className="w-8 h-8 text-primary" /> },
              { title: "Flooring Companies", icon: <Layout className="w-8 h-8 text-primary" /> }
            ].map((niche, i) => (
              <div key={i} className="bg-warm-cream p-8 rounded-3xl text-center border border-gray-100 hover:border-primary transition-all duration-300 group flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {niche.icon}
                </div>
                <h3 className="text-xl font-black text-brand-dark">{niche.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="hand-divider opacity-20"></div>
      </div>

      <section className="py-24 bg-soft-peach" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-6 tracking-tight">
              Don't Just Take Our Word For It
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 relative">
              <div className="text-yellow-400 flex gap-1 mb-6">
                <Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" />
              </div>
              <p className="text-xl text-brand-dark/80 font-medium italic mb-8 leading-relaxed">
                "I used to pay an agency $500 a month just to host my site and they never answered my emails. AdHello built me a better site in a week, the AI chat books jobs while I'm sleeping, and I'm paying a fraction of the cost. It's a no-brainer."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Mike T." className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-brand-dark">Mike T.</h4>
                  <p className="text-sm text-brand-dark/60 font-bold">Local Plumber</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 relative">
              <div className="text-yellow-400 flex gap-1 mb-6">
                <Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" /><Star className="w-6 h-6 fill-current" />
              </div>
              <p className="text-xl text-brand-dark/80 font-medium italic mb-8 leading-relaxed">
                "The Growth Coach is wild. I asked it how to get more AC tune-up jobs before summer, and it gave me an exact script to text my past customers. Booked 4 jobs the next day. Best $97 I spend every month."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Sarah L." className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-brand-dark">Sarah L.</h4>
                  <p className="text-sm text-brand-dark/60 font-bold">HVAC Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="hand-divider opacity-20"></div>
      </div>

      <section className="py-24 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4 w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-brand-dark/60 text-xl">
              Everything you need to know about growing with AdHello.ai.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  openFaqIndex === index ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-lg font-bold text-brand-dark pr-8">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    openFaqIndex === index ? 'bg-primary text-brand-dark' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-brand-dark/70 text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-dark relative overflow-hidden text-center flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8">
            Stop Guessing. <br />
            <span className="hand-underline">Get More Leads.</span>
          </h2>
          <p className="text-white/70 text-2xl md:text-3xl mb-12 max-w-2xl mx-auto">
            Join the local service businesses that are winning the AI search revolution.
          </p>
          <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white text-lg font-medium mb-12">
            <span className="inline-block w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></span>
            No long-term contracts. Cancel anytime.
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={openChat}
              className="bg-primary hover:bg-primary-hover text-brand-dark font-extrabold py-5 px-12 rounded-full shadow-[0px_0px_20px_rgba(243,221,109,0.3)] hover:shadow-[0px_0px_30px_rgba(243,221,109,0.5)] transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-xl md:text-2xl"
            >
              Get Your Free Website
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-warm-cream text-brand-dark/60 py-12 border-t border-brand-dark/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-3xl font-extrabold text-brand-dark">
                  AdHello.ai
                </h2>
              </div>
              <p className="text-lg leading-relaxed mb-8 italic text-brand-dark/80">
                "Websites built for home service businesses that want more leads."
              </p>
              <div className="flex gap-4">
                <a
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-brand-dark transition-all text-brand-dark"
                  href="#"
                >
                  <Globe className="w-5 h-5" />
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-brand-dark transition-all text-brand-dark"
                  href="#"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-brand-dark text-xl font-extrabold mb-6">
                Product
              </h4>
              <ul className="space-y-4 text-base font-medium">
                <li>
                  <a className="hover:text-primary-dark transition-colors" href="#how-it-works">
                    How It Works
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-dark transition-colors" href="#what-you-get">
                    What's Included
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-dark transition-colors" href="#pricing">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-brand-dark text-xl font-extrabold mb-6">
                Company
              </h4>
              <ul className="space-y-4 text-base font-medium">
                <li>
                  <a className="hover:text-primary-dark transition-colors" href="#testimonials">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-dark transition-colors" href="#">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-brand-dark text-xl font-extrabold mb-6">
                Legal
              </h4>
              <ul className="space-y-4 text-base font-medium">
                <li>
                  <a className="hover:text-primary-dark transition-colors" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-dark transition-colors" href="#">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-brand-dark/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold tracking-widest uppercase">
            <p>© 2024 AdHello.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={() => setIsContactModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 sm:p-8">
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-8">
                <div className="w-12 h-12 bg-primary/20 text-brand-dark rounded-2xl flex items-center justify-center mb-4">
                  <Smile className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark mb-2">Let's grow together</h3>
                <p className="text-brand-dark/70">Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>

              {formStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-brand-dark mb-2">Message Sent!</h4>
                  <p className="text-brand-dark/70">We're excited to chat with you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-brand-dark mb-1">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-brand-dark mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="business" className="block text-sm font-bold text-brand-dark mb-1">Business Name</label>
                    <input 
                      type="text" 
                      id="business" 
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Jane's Flowers"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full py-4 bg-brand-dark text-white font-bold rounded-xl hover:bg-brand-dark/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                  >
                    {formStatus === 'submitting' ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
