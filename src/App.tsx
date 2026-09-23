import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategorySlider } from './components/CategorySlider';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { AiAssistant } from './components/AiAssistant';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Product } from './types';
import { 
  Sparkles, 
  Flame, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Filter, 
  Tag, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Zap
} from 'lucide-react';

const MainStoreContent: React.FC = () => {
  const { 
    products, 
    categories, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    selectedProduct, 
    setSelectedProduct, 
    isCartOpen, 
    setIsCartOpen, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    settings 
  } = useStore();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);

  // Smooth scroll helper
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products by Category, Search, InStock, Discount
  const filteredProducts = products.filter(p => {
    // Category match
    if (activeCategory !== 'All' && p.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchMaterial = p.material.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCategory && !matchMaterial) return false;
    }
    // Filter toggles
    if (onlyInStock && p.stock <= 0) return false;
    if (onlyDiscounted && (!p.discount || p.discount <= 0)) return false;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    // Default featured
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  // Featured and Discounted showcase lists
  const featuredShowcase = products.filter(p => p.isFeatured).slice(0, 4);
  const discountShowcase = products.filter(p => p.discount && p.discount > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Primary Sticky Header */}
      <Header 
        onOpenAdmin={() => setIsAdminOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero 
          onShopNow={() => handleNavigateSection('products-section')}
          onExplore={() => handleNavigateSection('categories-section')}
        />

        {/* 17 Curated Categories Showcase */}
        <CategorySlider 
          onSelectCategory={(catName) => {
            setActiveCategory(catName);
            handleNavigateSection('products-section');
          }}
        />

        {/* Full Architectural Production Catalog - UP At Top */}

        {/* Full Interactive Product Catalog */}
        <section id="products-section" className="py-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            {/* Catalog Headline */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Comprehensive Inventory</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
                  Architectural Product Catalog
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Showing {sortedProducts.length} of {products.length} masterworks
                </p>
              </div>

              {/* Sorting & Filter Tools */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* In Stock toggle */}
                <button
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    onlyInStock
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock Only</span>
                </button>

                {/* On Discount toggle */}
                <button
                  onClick={() => setOnlyDiscounted(!onlyDiscounted)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    onlyDiscounted
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>On Discount</span>
                </button>

                {/* Sort Dropdown */}
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-[#0b101d] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="featured">Sort: Featured First</option>
                    <option value="newest">Sort: Newest Arrivals</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Customer Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'All'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                    : 'glass-panel border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/30'
                }`}
              >
                All Furniture ({products.length})
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                      : 'glass-panel border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/30'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.itemCount !== undefined && (
                    <span className="ml-1.5 opacity-60 font-mono text-[10px]">({cat.itemCount})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Active Search / Filter Feedback */}
            {searchQuery && (
              <div className="flex items-center gap-2 text-xs text-slate-300 glass-card px-4 py-2.5 rounded-xl border border-cyan-400/30">
                <span>Filtering by query: <strong className="text-cyan-400 font-mono">"{searchQuery}"</strong></span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-auto text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Product Cards Grid */}
            {products.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-3xl border border-white/10 space-y-5 max-w-xl mx-auto p-8">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                    Next Architectural Collection In Conception
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    All previous production catalog has been cleared. Our ateliers in Milan and Tokyo are preparing the next seasonal showcase. Bespoke architectural commissions remain open.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black text-xs font-bold hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
                  >
                    Admin Hub: Add New Furniture
                  </button>
                  <button
                    onClick={() => handleNavigateSection('contact-section')}
                    className="px-5 py-2.5 rounded-xl glass-panel border border-white/15 text-slate-300 text-xs font-semibold hover:text-white hover:border-cyan-400/40 cursor-pointer"
                  >
                    Bespoke Commission Inquiry
                  </button>
                </div>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-24 glass-card rounded-3xl border border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Filter className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No products match your criteria</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Try clearing filters or search term to discover our complete architectural inventory.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                    setOnlyInStock(false);
                    setOnlyDiscounted(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-semibold hover:bg-cyan-500/30 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}

          </div>
        </section>

        {/* White-Glove Atelier & Production Privilege Banner */}
        <section className="py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-[#0d1627] via-[#091122] to-[#0d1627] shadow-[0_0_50px_rgba(0,240,255,0.1)]">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                    <Flame className="w-3.5 h-3.5 fill-current text-rose-400" />
                    <span>White-Glove Architecture Service</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                    White-Glove Delivery & Installation Included
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    All acquisitions include private room staging, unboxing, placement, and a 10-year structural atelier warranty.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => {
                      handleNavigateSection('products-section');
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.3)] text-center whitespace-nowrap"
                  >
                    View All Masterpieces (Up Top)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <AboutSection />

        {/* Contact & Consultation Section */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer 
        onNavigateSection={handleNavigateSection}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Multilingual AI Customer Assistant (floating button & window) */}
      <AiAssistant />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectRelated={(p) => setSelectedProduct(p)}
          onDirectBuy={() => setIsCheckoutOpen(true)}
        />
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Secure Acquisition Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Administrator Private Command Center */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainStoreContent />
    </StoreProvider>
  );
}
