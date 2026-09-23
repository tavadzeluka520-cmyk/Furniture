import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles, 
  SlidersHorizontal,
  ShieldCheck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  onOpenAdmin: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onNavigateSection }) => {
  const { 
    settings, 
    cartCount, 
    wishlist, 
    currentUser, 
    isAdmin, 
    setIsCartOpen, 
    setIsAuthModalOpen,
    searchQuery,
    setSearchQuery,
    categories,
    setActiveCategory
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdown, setCategoriesDropdown] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState(false);

  const primaryColor = settings?.primaryColor || '#00f0ff';

  const handleNavClick = (sectionId: string) => {
    onNavigateSection(sectionId);
    setMobileMenuOpen(false);
    setCategoriesDropdown(false);
  };

  const handleCategorySelect = (categoryName: string) => {
    setActiveCategory(categoryName);
    onNavigateSection('products-section');
    setCategoriesDropdown(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Announcement Bar */}
      {!isAnnouncementDismissed && settings?.showAnnouncement && settings?.announcementText && (
        <div 
          className="w-full py-2 px-4 text-xs font-medium text-center text-cyan-200 border-b border-cyan-500/20 relative overflow-hidden"
          style={{ background: 'linear-gradient(90deg, #07090e 0%, #0c182b 50%, #07090e 100%)' }}
        >
          <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto px-6">
            <span>{settings.announcementText}</span>
          </div>
          <button
            onClick={() => setIsAnnouncementDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cyan-300/70 hover:text-white transition-colors cursor-pointer"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation Bar with Glassmorphism */}
      <div className="glass-panel border-b border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo Area */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            {settings?.logoImageUrl ? (
              <img 
                src={settings.logoImageUrl} 
                alt={settings.logoText || 'AURA'} 
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-400/30 transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(37,99,235,0.25) 100%)' }}
              >
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-wider text-white font-['Space_Grotesk'] flex items-center gap-1.5">
                {settings?.logoText || 'AURA'}
                <span className="text-cyan-400 inline-block text-xs font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30">
                  DESIGN
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium -mt-1 hidden sm:block">
                Modern Living
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button 
              onClick={() => handleNavClick('hero')}
              className="hover:text-cyan-400 transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-400 hover:after:w-full after:transition-all"
            >
              Home
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setCategoriesDropdown(!categoriesDropdown)}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer py-1"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesDropdown ? 'rotate-180 text-cyan-400' : ''}`} />
              </button>

              {categoriesDropdown && (
                <div 
                  className="absolute top-full left-0 mt-3 w-72 glass-panel rounded-2xl p-3 border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setCategoriesDropdown(false)}
                >
                  <div className="text-xs uppercase font-mono tracking-wider text-slate-400 px-3 py-1.5 border-b border-white/5 mb-1.5 flex justify-between items-center">
                    <span>{categories.length > 0 ? `${categories.length} Collections` : 'Architectural Suites'}</span>
                    <span className="text-cyan-400">{categories.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto pr-1 space-y-1">
                    <button
                      onClick={() => handleCategorySelect('All')}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold text-white">All Masterpieces</span>
                    </button>
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-500 italic">
                        No categories created yet
                      </div>
                    ) : (
                      categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.name)}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors flex items-center justify-between text-slate-300"
                        >
                          <span>{cat.name}</span>
                          {cat.itemCount !== undefined && cat.itemCount > 0 && (
                            <span className="text-xs text-slate-500 font-mono">{cat.itemCount}</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleNavClick('products-section')}
              className="hover:text-cyan-400 transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-400 hover:after:w-full after:transition-all"
            >
              Products
            </button>

            <button 
              onClick={() => handleNavClick('discounts-section')}
              className="hover:text-cyan-400 transition-colors cursor-pointer py-1 text-cyan-300 flex items-center gap-1.5"
            >
              <span>Discounts</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </button>

            <button 
              onClick={() => handleNavClick('about-section')}
              className="hover:text-cyan-400 transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-400 hover:after:w-full after:transition-all"
            >
              About Us
            </button>

            <button 
              onClick={() => handleNavClick('contact-section')}
              className="hover:text-cyan-400 transition-colors cursor-pointer py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-cyan-400 hover:after:w-full after:transition-all"
            >
              Contact
            </button>
          </nav>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Inline Quick Search (Desktop) */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <input
                type="text"
                placeholder="Search furniture, brand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => onNavigateSection('products-section')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.08] transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all md:hidden"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('products-section')}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer group"
              title="Saved Favorites"
            >
              <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-black font-bold text-[10px] flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer group flex items-center gap-2"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-400" />
              <span className="hidden sm:inline text-xs font-semibold text-white">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-bold text-[11px] flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.7)] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Portal Button - Visible ONLY to authorized administrator */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all cursor-pointer animate-in fade-in"
                title="Administrator Command Center"
              >
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Admin Hub</span>
              </button>
            )}

            {/* User Account / Sign In */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                currentUser 
                  ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)]' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30'
              }`}
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign In'}
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {isSearchActive && (
          <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search furniture, brand, material..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white/10 border border-cyan-400/50 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <div 
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-sm bg-[#07090e]/95 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col justify-between shadow-[0_0_50px_rgba(0,240,255,0.15)] lg:hidden animate-in slide-in-from-right duration-300 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-sm font-bold uppercase tracking-widest text-cyan-400 font-mono">
                  AURA Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('hero')}
                  className="text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-cyan-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleNavClick('products-section')}
                  className="text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-cyan-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>All Products</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleNavClick('discounts-section')}
                  className="text-left px-4 py-3 rounded-xl text-sm font-bold text-cyan-400 hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>⚡ Discounts & Deals</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleNavClick('about-section')}
                  className="text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-cyan-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>About AURA</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleNavClick('contact-section')}
                  className="text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-white/5 hover:text-cyan-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span>Contact</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-extrabold text-black bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.35)] flex items-center gap-2 mt-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Hub</span>
                  </button>
                )}
              </div>

              {/* Categories Navigation */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-3">
                  Browse Suite Categories
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[35vh] overflow-y-auto pr-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.name)}
                      className="text-left px-3 py-2.5 rounded-xl text-xs text-slate-300 bg-white/[0.03] border border-white/5 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all cursor-pointer truncate"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Sign in status inside drawer */}
            <div className="pt-4 border-t border-white/10">
              {currentUser ? (
                <div className="flex items-center gap-3 p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl text-xs text-cyan-300">
                  <UserIcon className="w-4 h-4 shrink-0 text-cyan-400" />
                  <div className="truncate">
                    <div className="font-semibold">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl border border-white/10 hover:border-cyan-400/40 bg-white/5 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Access Account</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
