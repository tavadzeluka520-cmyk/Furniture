import React from 'react';
import { ArrowRight, Sparkles, Shield, Truck, Compass, Award } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeroProps {
  onShopNow: () => void;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow, onExplore }) => {
  const { settings } = useStore();

  const title = settings?.heroTitle || 'Modern Furniture For Your Perfect Home';
  const subtitle = settings?.heroSubtitle || 'Architectural silhouettes, premium carbon-infused materials, and electric-blue luminescence crafted for visionary living spaces.';
  const badge = settings?.heroBadge || '2026 Architectural Collection';
  const heroImage = settings?.heroImage || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85';
  const cta = settings?.heroCtaText || 'Shop Now';
  const secondaryCta = settings?.heroSecondaryCtaText || 'Explore Collection';

  return (
    <section id="hero" className="relative overflow-hidden pt-6 pb-16 lg:py-24">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Architectural Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-cyan-400/30 text-xs font-semibold text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="tracking-wider uppercase">{badge}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-[1.12]">
              {title}
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black font-extrabold text-sm tracking-wide shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>{cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplore}
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-white/15 text-white font-semibold text-sm hover:border-cyan-400/50 hover:bg-white/[0.08] hover:text-cyan-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{secondaryCta}</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="flex flex-col items-center lg:items-start gap-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Truck className="w-4 h-4" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">White Glove</span>
                </div>
                <span className="text-xs text-slate-400 text-center lg:text-left">Free In-Home Setup</span>
              </div>

              <div className="flex flex-col items-center lg:items-start gap-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">10-Year</span>
                </div>
                <span className="text-xs text-slate-400 text-center lg:text-left">Chassis Guarantee</span>
              </div>

              <div className="flex flex-col items-center lg:items-start gap-1">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Masterworks</span>
                </div>
                <span className="text-xs text-slate-400 text-center lg:text-left">Hand-Crafted Batch</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Electric blue backlight glow frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              
              {/* Glass Frame holding Hero Image */}
              <div className="relative glass-card rounded-2xl p-2.5 overflow-hidden border border-white/20 shadow-2xl">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={heroImage}
                    alt={title}
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating architectural card overlay */}
                  <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-3.5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
                        Showcase Centerpiece
                      </div>
                      <div className="text-sm font-bold text-white font-['Space_Grotesk']">
                        Nexus Modular Penthouse Suite
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block line-through">$4,600</span>
                      <span className="text-sm font-extrabold text-cyan-300 font-mono">$3,890</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
