'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, Cart as CartObj } from '@/lib/cart';
import { formatINR } from '@/lib/formatters';
import { openRazorpayCheckout } from '@/lib/razorpay';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartObj | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCart = () => {
    setCart(getCart());
  };

  useEffect(() => {
    if (isOpen) {
      refreshCart();
      // Reset status/error when opening
      setStatus('');
      setError('');
    }
  }, [isOpen]);

  const handleApplyDiscount = async () => {
    if (!cart || !discountCode) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/discounts/validate/', {
        code: discountCode,
        cart_total: getCartTotal(cart)
      });
      setStatus(`✓ Discount applied: -${formatINR(res.data.discount_amount)}`);
      const updatedCart = { ...cart, discountCode: discountCode, discountAmount: res.data.discount_amount };
      setCart(updatedCart);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired code');
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Create subscription and invoice from cart
      const subRes = await api.post('/subscriptions/from-cart/', {
        items: cart.items,
        plan_id: cart.items.find(i => i.planId)?.planId || null 
      });
      
      const { subscription_id, invoice_id } = subRes.data;
      
      // Step 2 & 3: Payment process
      await openRazorpayCheckout(
        invoice_id, 
        (verifyRes) => {
          clearCart();
          onClose();
          router.push(`/order/success?sub=${subscription_id}`);
        },
        () => {
          setStatus('Payment cancelled. Your subscription is preserved in confirmed status.');
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Checkout failed');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = cart ? getCartTotal(cart) : 0;
  const total = cart ? Math.max(0, subtotal - cart.discountAmount) : 0;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh',
      background: 'var(--surface-container-low)', zIndex: 1000,
      boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid var(--surface-container-high)'
    }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-container-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Your Cart</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {!cart || cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <span className="material-icons" style={{ fontSize: '48px', color: 'var(--on-surface-variant)' }}>shopping_cart</span>
            <p style={{ marginTop: '16px', color: 'var(--on-surface-variant)' }}>Your cart is empty.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--surface-container)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                    {item.productPhoto ? (
                        <img src={item.productPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-icons" style={{ color: '#ccc' }}>image</span>
                        </div>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</div>
                  {item.planName && <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{item.planName} ({item.billingPeriod})</div>}
                  <div style={{ marginTop: '4px', fontSize: '0.85rem', fontWeight: 700 }}>{formatINR(item.unitPrice)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <button onClick={() => { updateQuantity(item.productId, item.planId, Math.max(1, item.quantity - 1)); refreshCart(); }} style={{ padding: '0 8px', border: 'none', background: 'none', cursor: 'pointer' }}>-</button>
                        <span style={{ fontSize: '0.8rem', padding: '0 8px' }}>{item.quantity}</span>
                        <button onClick={() => { updateQuantity(item.productId, item.planId, item.quantity + 1); refreshCart(); }} style={{ padding: '0 8px', border: 'none', background: 'none', cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={() => { removeFromCart(item.productId, item.planId); refreshCart(); }} style={{ color: 'var(--error)', fontSize: '0.75rem', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {cart && cart.items.length > 0 && (
        <div style={{ padding: '24px', borderTop: '1px solid var(--surface-container-high)', background: 'var(--surface-container)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                placeholder="Promo code" 
                value={discountCode} 
                onChange={e => setDiscountCode(e.target.value)} 
                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} 
              />
              <button 
                onClick={handleApplyDiscount} 
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >Apply</button>
            </div>
            {status && <p style={{ fontSize: '0.75rem', color: 'green', margin: '4px 0 0' }}>{status}</p>}
            {error && <p style={{ fontSize: '0.75rem', color: 'var(--error)', margin: '4px 0 0' }}>{error}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          {cart.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'green' }}>
              <span>Discount</span>
              <span>-{formatINR(cart.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 900, fontSize: '1.25rem' }}>
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>

          <button 
            onClick={handleCheckout} 
            disabled={loading}
            style={{ 
              width: '100%', marginTop: '20px', padding: '14px', background: 'var(--primary)', 
              color: 'var(--on-primary)', border: 'none', borderRadius: '8px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {loading ? 'Processing...' : (
                <>
                <span>Secure Checkout</span>
                <span className="material-icons" style={{ fontSize: '18px' }}>lock</span>
                </>
            )}
          </button>
          <div style={{ textAlign: 'center', marginTop: '12px', color: 'var(--on-surface-variant)', fontSize: '0.7rem' }}>
            Powered by Razorpay
          </div>
        </div>
      )}
    </div>
  );
}
