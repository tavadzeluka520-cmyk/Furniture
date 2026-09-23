import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Zap, 
  Heart, 
  Truck, 
  ShieldCheck, 
  Ruler, 
  Maximize2, 
  Check, 
  MessageSquarePlus,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onSelectRelated: (product: Product) => void;
  onDirectBuy: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onSelectRelated,
  onDirectBuy
}) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isWishlisted, 
    products, 
    addReview, 
    currentUser 
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.color || product.availableColors[0] || 'Default');
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'shipping'>('specs');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review form state
  const [newReviewAuthor, setNewReviewAuthor] = useState(currentUser?.name || '');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const images = product.images && product.images.length > 0 ? product.images : ['/images/sofa_modular_luxury.jpg'];

  // Related products from same category or brand
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    onClose();
    onDirectBuy();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    setReviewSubmitting(true);
    const success = await addReview(product.id, {
      author: newReviewAuthor.trim() || 'Verified Connoisseur',
      rating: newReviewRating,
      comment: newReviewComment.trim()
    });

    setReviewSubmitting(false);
    if (success) {
      setReviewSuccess(true);
      setNewReviewComment('');
      setTimeout(() => setReviewSuccess(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-white/15 shadow-2xl overflow-hidden my-auto z-10 max-h-[92vh] flex flex-col">
        
        {/* Header bar with close button */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>{product.brand}</span>
            <span>/</span>
            <span className="text-slate-300">{product.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-8 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Discount Badge */}
                {product.discount && product.discount > 0 && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-cyan-400 text-black font-extrabold text-xs font-mono shadow-[0_0_15px_rgba(0,240,255,0.7)]">
                    -{product.discount}% OFF
                  </span>
                )}

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                    wishlisted
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-black/50 text-slate-300 border border-white/10 hover:text-cyan-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx 
                          ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-105' 
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Assurance Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="glass-card rounded-xl p-3 flex items-center gap-3 border border-white/5">
                  <Truck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs">
                    <div className="font-semibold text-white">White-Glove Delivery</div>
                    <div className="text-slate-400">Free placement & assembly</div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-3 flex items-center gap-3 border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs">
                    <div className="font-semibold text-white">10-Year Warranty</div>
                    <div className="text-slate-400">Comprehensive chassis</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Details & Purchase Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                  {product.name}
                </h1>
                
                {/* Rating & Reviews row */}
                <div className="flex items-center gap-3 mt-2.5">
                  <div className="flex items-center text-amber-400 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-600'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">{product.rating}</span>
                  <span className="text-xs text-slate-400">
                    ({product.reviewsCount} customer reviews)
                  </span>
                  
                  <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded-full ${
                    product.stock > 3 
                      ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30' 
                      : product.stock > 0 
                        ? 'text-amber-300 bg-amber-950/60 border border-amber-500/30' 
                        : 'text-rose-300 bg-rose-950/60 border border-rose-500/30'
                  }`}>
                    {product.stock > 0 ? `${product.stock} units available` : 'Currently Backordered'}
                  </span>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-mono">Current Price</div>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-extrabold text-cyan-300 font-mono tracking-tight">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-slate-500 line-through">
                        ${product.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {product.discount && product.discount > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-cyan-400 block font-mono">Total Savings</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ${(product.oldPrice ? product.oldPrice - product.price : 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.availableColors && product.availableColors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Color Finish:</span>
                    <span className="font-mono text-cyan-400">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.availableColors.map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          selectedColor === col
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Configuration */}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Dimensions & Scale:</span>
                    <span className="font-mono text-cyan-400">{selectedSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Buttons */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl glass-card border border-white/10 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-sm text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    Max {product.stock} units per residential order
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      addedAnimation
                        ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : product.stock === 0
                          ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black hover:brightness-110 shadow-[0_0_25px_rgba(0,240,255,0.35)]'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="py-4 px-6 rounded-xl glass-panel border border-cyan-400/40 text-cyan-300 font-bold text-sm hover:bg-cyan-500/10 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Instant Checkout</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Deep Tabs: Specs, Shipping, Reviews */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex border-b border-white/10 gap-8 mb-6">
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
                  activeTab === 'specs'
                    ? 'text-cyan-400 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Specifications & Dimensions
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'text-cyan-400 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Reviews</span>
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  {product.reviews?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
                  activeTab === 'shipping'
                    ? 'text-cyan-400 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Delivery & Care
              </button>
            </div>

            {/* Tab: Specs */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    <span>Physical Dimensions</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.02]">
                      <span className="text-slate-400 block">Overall Width</span>
                      <span className="text-white font-mono font-bold mt-0.5 block">{product.width}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02]">
                      <span className="text-slate-400 block">Overall Height</span>
                      <span className="text-white font-mono font-bold mt-0.5 block">{product.height}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02]">
                      <span className="text-slate-400 block">Depth</span>
                      <span className="text-white font-mono font-bold mt-0.5 block">{product.depth}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.02]">
                      <span className="text-slate-400 block">Total Mass / Weight</span>
                      <span className="text-white font-mono font-bold mt-0.5 block">{product.weight}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
                  <h4 className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Architectural Materials</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {product.material}
                  </p>
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="space-y-2 text-xs border-t border-white/5 pt-3">
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center py-1 border-b border-white/[0.02]">
                          <span className="text-slate-400">{key}:</span>
                          <span className="text-slate-200 font-medium text-right">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Submit Review Box */}
                <form onSubmit={handleReviewSubmit} className="glass-card rounded-2xl p-5 border border-cyan-400/20 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
                    <span>Share Your Review</span>
                  </h4>

                  {reviewSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                      Thank you! Your verified review has been published.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Your Name</label>
                      <input
                        type="text"
                        value={newReviewAuthor}
                        onChange={e => setNewReviewAuthor(e.target.value)}
                        placeholder="e.g. Julian Vance"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Rating</label>
                      <select
                        value={newReviewRating}
                        onChange={e => setNewReviewRating(Number(e.target.value))}
                        className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value={5}>5 Stars - Architectural Perfection</option>
                        <option value={4}>4 Stars - Exceptional Quality</option>
                        <option value={3}>3 Stars - Satisfactory</option>
                        <option value={2}>2 Stars - Below Expectations</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Your Feedback & Experience</label>
                    <textarea
                      rows={3}
                      value={newReviewComment}
                      onChange={e => setNewReviewComment(e.target.value)}
                      placeholder="Comment on fabric texture, firmness, ergonomic feel..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs hover:brightness-110 transition-all cursor-pointer"
                  >
                    {reviewSubmitting ? 'Publishing...' : 'Submit Verified Review'}
                  </button>
                </form>

                {/* Existing Reviews List */}
                <div className="space-y-3">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map(rev => (
                      <div key={rev.id} className="glass-card rounded-2xl p-4 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{rev.author}</span>
                            {rev.verified && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">{rev.date}</span>
                        </div>

                        <div className="flex items-center text-amber-400 gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-500">
                      Be the first to leave an architectural review for this masterpiece.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Tab: Shipping */}
            {activeTab === 'shipping' && (
              <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>Complimentary White-Glove In-Home Logistics</span>
                </h4>
                <p>
                  Every piece in our architectural collection undergoes precision pre-inspection and custom wooden crating. Our specialized team coordinates directly with your schedule to deliver, assemble, and position the furniture inside your chosen room.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-white block mb-1">Standard Transit</span>
                    <span className="text-slate-400">3 to 7 business days worldwide</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-white block mb-1">30-Day Guarantee</span>
                    <span className="text-slate-400">Hassle-free return policy</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="font-bold text-white block mb-1">Packaging Removal</span>
                    <span className="text-slate-400">100% recycled eco crate removal</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Furniture Recommendations */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-white/10">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-4 flex items-center gap-2">
                <span>Complementary Living Pieces</span>
                <span className="text-xs font-mono text-cyan-400">({relatedProducts.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="glass-card rounded-2xl p-3 border border-white/10 hover:border-cyan-400/40 cursor-pointer group transition-all"
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 mb-2">
                      <img
                        src={rel.images[0]}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                      {rel.name}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-400">{rel.category}</span>
                      <span className="font-mono font-bold text-cyan-300">${rel.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
