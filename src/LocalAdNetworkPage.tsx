import { useAnalytics } from './hooks/useAnalytics';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Coffee,
  QrCode,
  MapPin,
  Mail,
  TrendingUp,
  Users,
  Gift,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star,
  Zap,
  BarChart3,
  Building2,
  Handshake,
} from 'lucide-react';
import { Logo } from './components/Logo';
import SEO from './components/SEO';
import { SITE_ORIGIN } from './lib/site';

export default function LocalAdNetworkPage() {
  useAnalytics();
  const navigate = useNavigate();

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${SITE_ORIGIN}/local-ad-network#service`,
      name: 'Presso Local Ad Network',
      url: `${SITE_ORIGIN}/local-ad-network`,
      description: 'Hyper-local advertising network for Camas/Vancouver businesses. Reach 5,000+ loyalty members through weekly newsletters, QR code campaigns, and geofenced promotions.',
      provider: { '@type': 'Organization', name: 'AdHello.ai', url: SITE_ORIGIN },
      areaServed: { '@type': 'City', name: 'Camas, WA' },
    },
  ];

  return (
    <div className="min-h-screen bg-warm-cream selection:bg-primary/40 text-brand-dark font-sans overflow-x-hidden">
      <SEO
        title="Presso Local Ad Network — Reach 5,000+ Camas/Vancouver Customers"
        description="Hyper-local advertising for Camas & Vancouver businesses. Sponsor the Presso Weekly newsletter, run QR code giveaway campaigns, and reach 5,000+ local loyalty members. Starting at $75/mo."
        canonical={`${SITE_ORIGIN}/local-ad-network`}
        schema={schema}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-brand-dark/5 px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <Logo variant="dark" />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors">How It Works</a>
          <a href="#packages" className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors">Packages</a>
          <a href="#faq" className="text-sm font-bold text-brand-dark/70 hover:text-brand-dark transition-colors">FAQ</a>
        </div>
        <a
          href="mailto:alex@adhello.ai?subject=Presso%20Ad%20Network%20-%20Sponsorship%20Inquiry"
          className="bg-primary hover:bg-primary-hover text-brand-dark text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(243,221,109,0.4)] hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Handshake className="w-4 h-4" />
          Become a Sponsor
        </a>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{ x: [0, 100, -50, 0], y: [0, 80, -30, 0], scale: [1, 1.3, 0.9, 1], rotate: [0, 30, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute top-[5%] left-[10%] w-72 h-72 bg-amber-200/40 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -80, 60, 0], y: [0, 120, 50, 0], scale: [1, 1.2, 0.8, 1], rotate: [0, -20, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-primary/30 rounded-full blur-[120px]"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-6 border border-amber-200"
            >
              <Coffee className="w-4 h-4" />
              Presented by Presso Coffee Co.
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.08]"
            >
              Reach <span className="text-amber-600">5,000+ Local Customers</span> Every Week
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg sm:text-xl text-brand-dark/70 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              The Presso Local Ad Network connects your business with engaged Camas & Vancouver residents through weekly newsletters, QR code giveaway campaigns on every coffee cup, and smart geofenced promotions — all powered by the 5,000-member Presso loyalty community.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="mailto:alex@adhello.ai?subject=Presso%20Ad%20Network%20-%20Sponsorship%20Inquiry&body=Hi%20Alex%2C%0A%0AI'm%20interested%20in%20becoming%20a%20sponsor%20in%20the%20Presso%20Ad%20Network.%20Here's%20my%20business%20info%3A%0A%0ABusiness%20name%3A%20%0AAddress%3A%20%0AOffer%2Fdeal%20I'd%20like%20to%20promote%3A%20%0A%0AThanks!"
                className="px-8 py-4 bg-brand-dark hover:bg-black text-white font-bold rounded-full transition-all shadow-[6px_6px_0px_rgba(45,52,54,0.15)] hover:shadow-none hover:translate-y-[4px] flex items-center justify-center gap-2 text-lg"
              >
                <Mail className="w-5 h-5" />
                Apply to Sponsor
              </a>
              <a
                href="#packages"
                className="px-8 py-4 bg-white hover:bg-gray-50 text-brand-dark font-bold rounded-full transition-all shadow-[6px_6px_0px_rgba(45,52,54,0.1)] hover:shadow-none hover:translate-y-[4px] flex items-center justify-center gap-2 text-lg border-2 border-brand-dark/5"
              >
                View Packages
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center justify-center gap-6 mt-8 text-sm font-bold text-brand-dark/50"
            >
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 5,000+ Members</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Camas & Vancouver</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> Weekly Reach</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-black uppercase tracking-widest text-amber-600 mb-3 block">How It Works</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">Three Channels. One Hyper-Local Network.</h2>
            <p className="text-lg text-brand-dark/60 max-w-2xl mx-auto">Your business reaches the right people at the right time — in their inbox, on their coffee cup, and when they're nearby.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Channel 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-warm-cream rounded-3xl p-8 border border-brand-dark/5 hover:border-amber-300 transition-all"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-extrabold mb-3">📰 Weekly Newsletter</h3>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Sponsored section in the Presso Weekly — delivered to 5,000+ loyalty members every Friday. Your business, your offer, your QR code, right in their inbox.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Dedicated sponsor section with your branding</li>
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Unique QR code linking to your giveaway</li>
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Click & scan analytics tracked weekly</li>
              </ul>
            </motion.div>

            {/* Channel 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-warm-cream rounded-3xl p-8 border border-brand-dark/5 hover:border-amber-300 transition-all"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
                <QrCode className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-extrabold mb-3">☕ QR Code on Every Cup</h3>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                Your QR code printed on Presso cup sleeves & table tents. Customers scan to enter your giveaway, claim a reward, or unlock an exclusive deal — right from their coffee.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Scannable code on every drink served</li>
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Instant giveaway entry + your offer</li>
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Print-ready QR codes we generate for you</li>
              </ul>
            </motion.div>

            {/* Channel 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-warm-cream rounded-3xl p-8 border border-brand-dark/5 hover:border-amber-300 transition-all"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
                <MapPin className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-xl font-extrabold mb-3">📍 Geofenced Promotions</h3>
              <p className="text-brand-dark/70 leading-relaxed mb-4">
                When loyalty members are near your business, they get a push notification with your exclusive deal. Right place, right time, right offer.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Geo-tagged to your business location</li>
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Push to nearby loyalty members via Wallet pass</li>
                <li className="flex items-start gap-2 text-sm text-brand-dark/60"><CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> Impression & redemption analytics</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Member Journey Visual */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-80 h-80 bg-amber-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <span className="text-sm font-black uppercase tracking-widest text-primary mb-3 block">The Customer Journey</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">From Coffee Cup to Your Door</h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">Here's how a loyalty member discovers and engages with your business through the network.</p>
          </div>

          <div className="space-y-6">
            {[
              { step: '01', icon: <Mail className="w-6 h-6" />, title: 'Friday Newsletter', desc: '5,000+ members open the Presso Weekly. They see your sponsor section with your offer and QR code.' },
              { step: '02', icon: <Coffee className="w-6 h-6" />, title: 'At Presso', desc: 'They visit Presso for coffee. Their cup has your QR code. They scan to enter your giveaway or claim a reward.' },
              { step: '03', icon: <QrCode className="w-6 h-6" />, title: 'Scan & Enter', desc: 'The QR code takes them to your giveaway landing page. They enter their email, see your offer, and get directions to your business.' },
              { step: '04', icon: <MapPin className="w-6 h-6" />, title: 'On Their Way', desc: 'When they\'re near your business, the loyalty Wallet pass pushes your deal notification. They walk in and redeem.' },
              { step: '05', icon: <TrendingUp className="w-6 h-6" />, title: 'You Track It All', desc: 'Newsletter scans, QR code visits, geo-trigger impressions, redemptions — all visible in your sponsor dashboard.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-5 bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-brand-dark">
                    {item.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{item.step}</span>
                    <h4 className="text-lg font-extrabold">{item.title}</h4>
                  </div>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-black uppercase tracking-widest text-amber-600 mb-3 block">Sponsorship Packages</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">Start Local. Scale With Results.</h2>
            <p className="text-lg text-brand-dark/60 max-w-2xl mx-auto">Monthly sponsorships. No contracts. Cancel anytime. All packages include a unique QR code and giveaway landing page.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl p-8 border border-brand-dark/5 relative"
            >
              <div className="text-sm font-black uppercase tracking-widest text-brand-dark/40 mb-2">Starter</div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-extrabold">$75</span>
                <span className="text-brand-dark/50 font-bold">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> Mention in weekly newsletter</li>
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> QR code on giveaway page</li>
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> Mobile-optimized landing page</li>
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> Monthly scan analytics</li>
              </ul>
              <a
                href="mailto:alex@adhello.ai?subject=Starter%20Sponsorship%20-%20Presso%20Ad%20Network"
                className="block w-full text-center py-3 bg-brand-dark/5 hover:bg-brand-dark/10 text-brand-dark font-bold rounded-full transition-all text-sm"
              >
                Get Started
              </a>
            </motion.div>

            {/* Featured */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 border-2 border-amber-400 relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-brand-dark text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Most Popular
              </div>
              <div className="text-sm font-black uppercase tracking-widest text-amber-600 mb-2">Featured</div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-extrabold">$150</span>
                <span className="text-brand-dark/50 font-bold">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> Dedicated sponsor section in newsletter</li>
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> QR code on Presso cup sleeves (1 location)</li>
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> Custom giveaway landing page</li>
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> Geo-tagged deal notification</li>
                <li className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> Weekly scan + click analytics</li>
              </ul>
              <a
                href="mailto:alex@adhello.ai?subject=Featured%20Sponsorship%20-%20Presso%20Ad%20Network"
                className="block w-full text-center py-3 bg-primary hover:bg-primary-hover text-brand-dark font-bold rounded-full transition-all text-sm shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-y-[2px]"
              >
                Get Started
              </a>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-brand-dark rounded-3xl p-8 border border-brand-dark/20 text-white relative"
            >
              <div className="text-sm font-black uppercase tracking-widest text-primary mb-2">Premium</div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-extrabold text-white">$300</span>
                <span className="text-white/50 font-bold">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Featured hero section in newsletter</li>
                <li className="flex items-start gap-2 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> QR code on cup sleeves (all 3 locations)</li>
                <li className="flex items-start gap-2 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Premium landing page + custom giveaway</li>
                <li className="flex items-start gap-2 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Geo-fence at your location + Presso</li>
                <li className="flex items-start gap-2 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Table tent / window sticker assets</li>
                <li className="flex items-start gap-2 text-sm text-white/80"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Priority support + monthly strategy call</li>
              </ul>
              <a
                href="mailto:alex@adhello.ai?subject=Premium%20Sponsorship%20-%20Presso%20Ad%20Network"
                className="block w-full text-center py-3 bg-white hover:bg-gray-100 text-brand-dark font-bold rounded-full transition-all text-sm"
              >
                Get Started
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Perfect For Local Businesses Like...</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🍕', label: 'Restaurants & Cafés' },
              { icon: '💪', label: 'Gyms & Fitness' },
              { icon: '💇', label: 'Salons & Barbers' },
              { icon: '🏠', label: 'Real Estate Agents' },
              { icon: '🐕', label: 'Pet Services' },
              { icon: '🎓', label: 'Tutoring & Classes' },
              { icon: '🚗', label: 'Auto Services' },
              { icon: '🛍️', label: 'Boutiques & Retail' },
            ].map((item, i) => (
              <div key={i} className="bg-warm-cream rounded-2xl p-5 text-center border border-brand-dark/5 hover:border-amber-300 transition-all">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-bold text-brand-dark/80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-warm-cream">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How quickly can I get started?', a: 'Most sponsors are live within 3-5 business days. We\'ll set up your landing page, generate your QR code, and schedule your first newsletter mention.' },
              { q: 'Do I need to provide my own artwork?', a: 'Nope — we handle the design. Just give us your logo (or we can work without one), your offer details, and we\'ll create everything: landing page, QR codes, and newsletter copy.' },
              { q: 'How do I track results?', a: 'You\'ll get a monthly analytics report showing newsletter impressions, QR code scans, landing page views, and geo-trigger data. Premium sponsors get weekly updates.' },
              { q: 'Can I change my offer each week?', a: 'Starter plan gets one mention per week with a static offer. Featured and Premium can rotate offers bi-weekly. Just send us the new details by Wednesday.' },
              { q: 'Is there a contract?', a: 'No contracts. Month-to-month. Cancel anytime with 7 days notice.' },
              { q: 'How do I get my QR codes on the cups?', a: 'We provide print-ready QR code files. Premium sponsors get professionally printed cup sleeves and table tents delivered to Presso locations.' },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-2xl border border-brand-dark/5 group">
                <summary className="px-6 py-4 cursor-pointer font-bold text-base flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-brand-dark/30 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-4 text-brand-dark/70 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-[10%] left-[20%] w-96 h-96 bg-amber-600/15 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Limited sponsor slots available
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Reach 5,000+ Local Customers?
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Only a few sponsor slots open each month. Lock in your spot in the Presso Ad Network and start getting in front of the Camas/Vancouver community.
          </p>
          <a
            href="mailto:alex@adhello.ai?subject=Presso%20Ad%20Network%20-%20Ready%20to%20Sponsor&body=Hi%20Alex%2C%0A%0AI'm%20ready%20to%20become%20a%20sponsor.%20Here's%20my%20info%3A%0A%0ABusiness%20name%3A%20%0AAddress%3A%20%0APackage%20interest%20(Starter%2FFeatured%2FPremium)%3A%20%0AOffer%2Fdeal%20I'd%20promote%3A%20%0A%0ALet's%20do%20this!"
            className="inline-flex items-center gap-2 px-10 py-5 bg-primary hover:bg-primary-hover text-brand-dark font-bold rounded-full transition-all shadow-[6px_6px_0px_rgba(243,221,109,0.2)] hover:shadow-none hover:translate-y-[4px] text-xl"
          >
            <Mail className="w-6 h-6" />
            Apply to Sponsor Now
          </a>
          <p className="text-sm text-white/40 mt-4">Questions first? Just reply to the email. Alex responds personally.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-brand-dark border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">☕</div>
            <span className="text-white/50 text-sm font-bold">Presso Ad Network by AdHello.ai • Camas, WA</span>
          </div>
          <a href="/" className="text-white/40 hover:text-white/70 text-sm font-bold transition-colors">
            Back to AdHello.ai →
          </a>
        </div>
      </footer>
    </div>
  );
}