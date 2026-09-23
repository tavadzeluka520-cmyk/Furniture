import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout
}) => {
  const { 
    cart, 
    cartSubtotal, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart 
  } = useStore();

  if (!isOpen) return null;

  const estimatedTax = Math.round(cartSubtotal * 0.08);
  const estimatedShipping = cartSubtotal > 2000 ? 0 : (cartSubtotal > 0 ? 150 : 0);
  const orderTotal = cartSubtotal + estimatedTax + estimatedShipping;
  const freeShippingThreshold = 2000;
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-white/10 shadow-2xl flex flex-col justify-between">
          
          {/* Cart Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Your Architectural Cart
                </h2>
                <span className="text-xs text-slate-400">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cart.length > 0 && (
            <div className="px-5 py-3 bg-cyan-950/30 border-b border-cyan-500/20 text-xs">
              <div className="flex items-center justify-between text-cyan-300 mb-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {cartSubtotal >= freeShippingThreshold ? (
                    <span className="font-bold text-emerald-400">Complimentary White-Glove Shipping Unlocked!</span>
                  ) : (
                    <span>Add ${(freeShippingThreshold - cartSubtotal).toLocaleString()} for Free White-Glove Setup</span>
                  )}
                </span>
                <span className="font-mono">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.7)]" 
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="overflow-y-auto p-5 space-y-4 flex-grow">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Your cart is empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Explore our visionary furniture pieces to elevate your living environment.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div 
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                  className="glass-card rounded-2xl p-3.5 border border-white/5 flex gap-3.5 relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between flex-grow min-w-0 pr-6">
                    <div>
                      <div className="text-[11px] font-mono text-cyan-400 truncate">
                        {item.product.category}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate font-['Space_Grotesk']">
                        {item.product.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5 space-x-2">
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>· Size: {item.selectedSize}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg bg-white/5 border border-white/10 p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs text-slate-300 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                          className="w-6 h-6 rounded flex items-center justify-center text-xs text-slate-300 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-mono font-bold text-cyan-300">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/10 glass-panel shrink-0 space-y-3.5 bg-black/40">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">${cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono text-white">${estimatedTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>White-Glove Delivery</span>
                  <span className="font-mono text-cyan-400">
                    {estimatedShipping === 0 ? 'FREE' : `$${estimatedShipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Estimated Total</span>
                  <span className="font-mono text-cyan-300 text-base">
                    ${orderTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={onProceedCheckout}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>256-bit encrypted secure architectural checkout</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
