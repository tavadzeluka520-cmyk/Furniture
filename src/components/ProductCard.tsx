import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, toggleWishlist, isWishlisted, settings } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const primaryColor = settings?.primaryColor || '#00f0ff';

  // Handle Add to cart with visual confirmation
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Switch image on hover if secondary image exists
  const currentImage = (isHovered && product.images.length > 1) ? product.images[1] : product.images[0];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView(product)}
      className="group relative rounded-2xl glass-card border border-white/10 p-3.5 flex flex-col justify-between transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_10px_35px_-5px_rgba(0,240,255,0.25)] hover:-translate-y-1.5 cursor-pointer select-none"
    >
      {/* Visual Asset Container */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 mb-3.5">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-all duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.discount && product.discount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-[11px] font-mono shadow-[0_0_12px_rgba(0,240,255,0.5)]">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-400/40 text-blue-200 font-bold text-[10px] uppercase tracking-wider backdrop-blur-md">
              NEW
            </span>
          )}
        </div>

        {/* Top Right Action: Wishlist Heart */}
        <button
          onClick={handleFavorite}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all z-10 cursor-pointer ${
            wishlisted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
              : 'bg-black/40 text-slate-300 border border-white/10 hover:text-cyan-400 hover:border-cyan-400/40'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Floating Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 px-3 rounded-lg glass-panel border border-cyan-400/40 text-xs font-semibold text-cyan-200 hover:text-white hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Information Content */}
      <div className="flex flex-col flex-grow">
        
        {/* Category & Brand line */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="font-mono text-cyan-400/80">{product.category}</span>
          <span className="truncate max-w-[120px]">{product.brand}</span>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {product.name}
        </h3>

        {/* Material & Color Snippet */}
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
          {product.material}
        </p>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-bold text-slate-200">{product.rating}</span>
          <span className="text-[11px] text-slate-500">({product.reviewsCount})</span>

          {/* Stock Tag */}
          <span className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded ${
            product.stock > 3 
              ? 'text-emerald-400 bg-emerald-950/40' 
              : product.stock > 0 
                ? 'text-amber-400 bg-amber-950/40' 
                : 'text-rose-400 bg-rose-950/40'
          }`}>
            {product.stock > 3 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Sold Out'}
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-[11px] text-slate-500 line-through">
                ${product.oldPrice.toLocaleString()}
              </span>
            )}
            <span className="text-base font-extrabold text-cyan-300 font-mono tracking-tight">
              ${product.price.toLocaleString()}
            </span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : product.stock === 0
                  ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95'
            }`}
            title="Add to Cart"
          >
            {addedAnimation ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
