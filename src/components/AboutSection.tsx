import React from 'react';
import { Sparkles, Compass, Shield, Award, Cpu, Eye } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="py-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Architectural Philosophy</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk']">
            Redefining Modern Living Through Futuristic Form
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Founded at the intersection of Milanese craftsmanship and cyberpunk architectural minimalism, AURA engineers furniture not merely for dwelling, but for transformative spatial resonance.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4 hover:border-cyan-400/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Aerospace Structural Alloys
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every sectional chassis and cantilever dining base is fabricated from CNC-milled carbon steel and titanium-infused alloys, guaranteed for over a decade of deflection-free resilience.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4 hover:border-cyan-400/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Ambient Luminescence
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subtle under-glow lighting channels integrated into floating headboards, credenzas, and lounge frames create immersive twilight environments tailored to psychological relaxation.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-4 hover:border-cyan-400/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Sensory Tactility
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Waterproof Italian bouclé, stain-resistant Nappa hide, and monolithic Mohs-9 sintered stone deliver timeless luxury impervious to daily wear and domestic life.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
