import React, { useState } from 'react';
import { Sparkles, Mail, ShieldCheck, Heart, ArrowUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection, onOpenAdmin }) => {
  const { settings, categories, setActiveCategory, isAdmin, setIsAuthModalOpen } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#05070a] border-t border-white/10 pt-16 pb-12 overflow-hidden text-xs text-slate-400">
      
      {/* Background cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {settings?.logoImageUrl ? (
                <img src={settings.logoImageUrl} alt={settings.logoText || 'AURA'} className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <span className="text-xl font-extrabold text-white font-['Space_Grotesk'] tracking-wider">
                {settings?.logoText || 'AURA'}
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Conceiving futuristic living environments with sculptural geometry, aeronautic-grade alloys, and intelligent luminescence. Handcrafted for modern visionaries.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-2 pt-2">
              <span className="text-white font-semibold text-xs block">Architectural Gazette</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your private email..."
                  className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 flex-grow"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-all font-semibold"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <span className="text-[11px] text-emerald-400 block font-medium">
                  Welcome to the AURA inner architectural circle.
                </span>
              )}
            </form>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
              Curated Suites
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(c.name);
                      onNavigateSection('products-section');
                    }}
                    className="hover:text-cyan-300 transition-colors cursor-pointer text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
              Concierge Care
            </h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigateSection('about-section')} className="hover:text-cyan-300">White-Glove Global Delivery</button></li>
              <li><button onClick={() => onNavigateSection('about-section')} className="hover:text-cyan-300">10-Year Chassis Guarantee</button></li>
              <li><button onClick={() => onNavigateSection('about-section')} className="hover:text-cyan-300">100-Night Mattress Trial</button></li>
              <li><button onClick={() => onNavigateSection('contact-section')} className="hover:text-cyan-300">Bespoke Material Studio</button></li>
              <li><button onClick={() => onNavigateSection('contact-section')} className="hover:text-cyan-300">Direct Architectural Support</button></li>
            </ul>
          </div>

          {/* Contact / Office */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">
              Design Studios
            </h4>
            <div className="space-y-1.5 text-slate-400">
              <p className="text-white font-medium">Milan Atelier</p>
              <p>Via Tortona 31, 20144 Milano</p>
              <p className="text-white font-medium pt-2">Tokyo Cyber Lab</p>
              <p>Minato-ku, Roppongi 6-10-1</p>
              <p className="text-cyan-400 font-mono pt-2">concierge@aura-furniture.com</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>© 2026 {settings?.siteName || 'AURA Furniture'}. All rights reserved.</span>
            <span>·</span>
            <span className="text-slate-400">Black & Blue Futuristic Collection</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Discreet Admin Login Trigger */}
            {isAdmin ? (
              <button
                onClick={onOpenAdmin}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
              >
                Staff Portal
              </button>
            )}

            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Return to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
