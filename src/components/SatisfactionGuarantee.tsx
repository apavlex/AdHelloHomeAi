import React from 'react';
import { ShieldCheck, HeartHandshake, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface SatisfactionGuaranteeProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function SatisfactionGuarantee({ className = "", variant = 'full' }: SatisfactionGuaranteeProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative ${className}`}
    >
      {variant === 'full' ? (
        <div className="bg-white rounded-[3rem] p-10 md:p-14 border-2 border-primary shadow-2xl relative overflow-hidden text-left">
          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary text-brand-dark text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                100% Satisfaction Guarantee
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black text-brand-dark leading-tight">
                Your money back if<br />
                <span className="text-primary-dark italic underline decoration-primary decoration-8 underline-offset-4">you're not delighted.</span>
              </h3>
              
              <p className="text-xl text-brand-dark/70 font-medium leading-relaxed max-w-2xl">
                We're so confident in the AdHello platform that we offer a full, prompt refund within 30 days—no questions asked. 
                <span className="font-black text-brand-dark"> If it doesn't beat your best ads or save you hours of work, it's ON US.</span>
              </p>

              <div className="flex flex-col items-start pt-6 border-t border-brand-dark/5">
                <span className="digital-signature text-5xl">Alex Pavlenko</span>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-12 h-12 rounded-full bg-brand-dark/5 flex items-center justify-center border border-brand-dark/10">
                    <img 
                      src="/logo-dark.png" 
                      alt="Founder" 
                      className="w-8 h-auto grayscale opacity-50"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-black tracking-widest uppercase text-brand-dark/40">Founder of AdHello.ai</span>
                    <span className="block text-[10px] font-bold text-primary-dark">Direct Accountability</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-6">
              <div className="yellow-burst scale-110 md:scale-125 mb-4">
                IT MUST BEAT<br/>YOUR BEST ADS<br/>OR IT'S FREE!
              </div>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-primary text-primary" />
                ))}
                <span className="ml-2 font-black text-brand-dark text-sm uppercase tracking-tighter">Trusted by 500+ Local Pros</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Compact Version for Footer or Sidebars */
        <div className="space-y-6">
          <p className="text-lg leading-relaxed font-bold text-brand-dark">
            Your money back if you're not delighted!
          </p>
          <p className="text-base leading-relaxed text-brand-dark/70">
            Just message us within 30 days for a full, prompt refund—no questions asked! <span className="font-black text-brand-dark underline decoration-primary decoration-4">Try it NOW.</span>
          </p>
          
          <div className="py-2">
            <div className="yellow-burst scale-90 origin-left">
              IT MUST BEAT YOUR BEST ADS<br/>OR IT'S FREE!
            </div>
          </div>

          <div className="flex flex-col items-start pt-4">
            <span className="digital-signature text-3xl">Alex Pavlenko</span>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-dark/40 ml-1 mt-[15px]">Founder, AdHello.ai</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
