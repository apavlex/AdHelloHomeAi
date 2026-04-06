import React from 'react';
import { CheckCircle2, Instagram, Facebook, ArrowRight, Sparkles } from 'lucide-react';
import { toPng } from 'html-to-image';

interface DtcAdCardProps {
  platform: 'Instagram' | 'Facebook' | 'TikTok';
  headline: string;
  body: string;
  image: string;
  brandColor?: string;
  benefits?: string[];
  vibe?: 'peach' | 'green' | 'cream';
  layout?: 'standard' | 'comparison';
}

export const DtcAdCard = ({ 
  platform, 
  headline, 
  body, 
  image, 
  brandColor = '#E8B84B',
  benefits = ['Clinically Proven', 'Boosts Hydration', 'Visible Results'],
  vibe = 'peach',
  layout = 'standard'
}: DtcAdCardProps) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const vibes = {
    peach: { bg: 'bg-[#FEF1E2]', text: 'text-[#FF8C69]', accent: '#FF8C69' },
    green: { bg: 'bg-[#F1F5E1]', text: 'text-[#2A4D3E]', accent: '#2A4D3E' },
    cream: { bg: 'bg-[#F9F5F1]', text: 'text-[#5A3A2F]', accent: '#5A3A2F' }
  };

  const currentVibe = vibes[vibe];

  const handleDownload = async () => {
    const element = cardRef.current;
    if (!element) return;
    
    try {
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        filter: (node: any) => {
          return !node.classList?.contains('download-exclude');
        }
      });
      
      const link = document.createElement('a');
      link.download = `AdHello-${platform}-${headline.slice(0, 15)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };
  
  const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.38 6.38 0 0 1-1.87-1.5c-.02 3.14-.03 6.28-.04 9.42-.01 1.05-.09 2.1-.44 3.1-.58 1.73-2.02 3.18-3.72 3.79-1.7.61-3.62.54-5.26-.25-1.64-.79-2.92-2.36-3.41-4.12-.49-1.75-.22-3.68.75-5.23.97-1.55 2.59-2.62 4.4-2.81.18-.02.36-.03.54-.03v4.09c-.31.03-.63.08-.93.17-1.14.34-2.02 1.41-2.14 2.6-.12 1.19.46 2.41 1.45 3.07.99.66 2.32.74 3.4.2.98-.49 1.63-1.54 1.75-2.62.12-1.12.11-2.24.11-3.36V.02z"/>
    </svg>
  );

  return (
    <div 
      ref={cardRef}
      className={`group/card relative ${currentVibe.bg} rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl transition-all hover:shadow-primary/10`}
    >
      <div className={`relative ${layout === 'comparison' ? 'aspect-[4/5]' : 'aspect-square'} overflow-hidden`}>
        <img 
          src={image} 
          alt="Ad Visual" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-4 right-6 pointer-events-none opacity-30 select-none">
          <span className="text-brand-dark text-xs font-black tracking-tighter uppercase italic">adhello.ai</span>
        </div>
        <div className="absolute top-4 left-4 right-4 flex flex-col gap-1.5 items-start">
          {benefits.slice(0, 2).map((benefit, idx) => (
            <div 
              key={idx}
              className="bg-white/95 backdrop-blur-md text-brand-dark px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-tight shadow-lg flex items-center gap-1.5 border border-brand-dark/5 max-w-[85%] leading-tight"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-green-600 shrink-0" />
              <span className="truncate">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: currentVibe.accent }}>
            {platform === 'Instagram' ? <Instagram className="w-4 h-4" /> : platform === 'Facebook' ? <Facebook className="w-4 h-4" /> : <TikTokIcon />}
            {platform}
          </div>
          <div className="text-brand-dark/20 text-[10px] font-bold uppercase">Sponsored</div>
        </div>

        <div className={`text-2xl font-black leading-[1.05] tracking-tight mb-3 ${currentVibe.text}`}>
          {headline}
        </div>

        <p className="text-brand-dark/60 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
          {body}
        </p>

        <div className="space-y-4">
          <button 
            className="w-full py-4 rounded-2xl font-black text-sm active:scale-95 flex items-center justify-center gap-2 shadow-xl download-exclude"
            style={{ backgroundColor: currentVibe.accent, color: 'white' }}
          >
            {platform === 'TikTok' ? 'GET STARTED' : 'SHOP NOW'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button 
            onClick={handleDownload}
            className="w-full py-4 bg-white/40 backdrop-blur-md hover:bg-white/60 text-brand-dark/60 hover:text-brand-dark rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 border border-white/20 download-exclude"
          >
            <Sparkles className="w-4 h-4" />
            Download Brand Asset
          </button>
        </div>
      </div>
    </div>
  );
};
