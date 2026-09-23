import React, { useState } from 'react';
import { X, CheckCircle, Shield, Truck, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartSubtotal, placeOrder, currentUser } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace, Penthouse 4B');
  const [city, setCity] = useState('New York');
  const [postalCode, setPostalCode] = useState('10001');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'wire'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const estimatedTax = Math.round(cartSubtotal * 0.08);
  const estimatedShipping = cartSubtotal > 2000 ? 0 : (cartSubtotal > 0 ? 150 : 0);
  const orderTotal = cartSubtotal + estimatedTax + estimatedShipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !shippingAddress) return;

    setIsSubmitting(true);
    const fullAddress = `${shippingAddress}, ${city} ${postalCode}`;

    const order = await placeOrder({
      customerName,
      customerEmail,
      shippingAddress: fullAddress
    });

    setIsSubmitting(false);
    if (order) {
      setCompletedOrder(order);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mx-auto text-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.4)] animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block mb-1">
                Order Acquisition Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                Thank You, {completedOrder.customerName}
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Your luxury furniture pieces have been registered with reference ID:
              </p>
              <div className="mt-3 inline-block px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-mono text-base font-bold">
                {completedOrder.id}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Confirmation Sent To:</span>
                <span className="text-white font-medium">{completedOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Location:</span>
                <span className="text-white font-medium truncate max-w-xs">{completedOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount Charged:</span>
                <span className="text-cyan-300 font-mono font-bold">${completedOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Logistics Team:</span>
                <span className="text-emerald-400 font-semibold">White-Glove In-Home Positioning</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
            >
              Return to Furniture Gallery
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypted Acquisition Portal</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
                Complete Your Acquisition
              </h2>
            </div>

            {/* Customer Contact */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                1. Client Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Julian Thorne"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                2. Residential Placement Address
              </h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Street Address & Suite</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="e.g. 888 Avenue of Americas, Penthouse B"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                3. Settlement Method
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Card / Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'apple'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'wire'
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>Bank Wire</span>
                </button>
              </div>
            </div>

            {/* Summary Box */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal ({cart.length})</span>
                <span className="font-mono text-white">${cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sales Tax (8%)</span>
                <span className="font-mono text-white">${estimatedTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>White-Glove Delivery</span>
                <span className="font-mono text-cyan-400">{estimatedShipping === 0 ? 'FREE' : `$${estimatedShipping}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total Amount</span>
                <span className="font-mono text-cyan-300 text-base">${orderTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Confirming Order...' : `Confirm Order · $${orderTotal.toLocaleString()}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
