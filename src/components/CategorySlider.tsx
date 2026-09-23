import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CategorySliderProps {
  onSelectCategory: (categoryName: string) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({ onSelectCategory }) => {
  const { categories, activeCategory, settings } = useStore();

  const sectionConfig = settings?.homeSections?.categories;
  if (sectionConfig && !sectionConfig.enabled) {
    return null;
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  const title = sectionConfig?.title || 'Curated Categories';
  const subtitle = sectionConfig?.subtitle || 'Explore visionary architectural designs tailored for every living space';

  return (
    <section id="categories-section" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-2">
              <Layers className="w-4 h-4" />
              <span>Living Environments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              {title}
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              {subtitle}
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('All')}
            className="self-start md:self-end text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>View All Collections ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`group relative rounded-2xl overflow-hidden glass-card p-2 border transition-all duration-300 cursor-pointer select-none ${
                  isSelected 
                    ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_25px_rgba(0,240,255,0.3)]' 
                    : 'border-white/10 hover:border-cyan-500/40 hover:-translate-y-1'
                }`}
              >
                {/* Thumbnail container */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Subtle Neon Dot */}
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400/80 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
                </div>

                {/* Category Meta */}
                <div className="px-1 pb-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {cat.name}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                    <span>Explore suite</span>
                    {cat.itemCount !== undefined && (
                      <span className="font-mono text-cyan-400/80">{cat.itemCount} items</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
