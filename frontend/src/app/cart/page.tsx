'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, applyDiscount, Cart as CartObj } from '@/lib/cart';
import { formatINR } from '@/lib/formatters';
import { openRazorpayCheckout } from '@/lib/razorpay';
import withAuth from '@/components/withAuth';

function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartObj | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  const refreshCart = () => setCart(getCart());

  useEffect(() => { refreshCart(); }, []);

  // Pre-fill discount code field if a code is already applied
  useEffect(() => {
    if (cart?.discountCode) setDiscountCode(cart.discountCode);
  }, [cart?.discountCode]);

  const handleApplyDiscount = async () => {
    if (!cart || !discountCode.trim()) return;
    setPromoLoading(true);
    setPromoStatus(null);
    try {
      const res = await api.post('/discounts/validate/', {
        code: discountCode.trim(),
        cart_total: getCartTotal(cart),
      });
      applyDiscount(discountCode.trim(), res.data.discount_amount);
      refreshCart();
      setPromoStatus({
        type: 'success',
        msg: `✓ "${discountCode.toUpperCase()}" applied — ${formatINR(res.data.discount_amount)} off`,
      });
    } catch (err: any) {
      setPromoStatus({
        type: 'error',
        msg: err.response?.data?.error || 'Invalid or expired code',
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    applyDiscount('', 0);
    setDiscountCode('');
    setPromoStatus(null);
    refreshCart();
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setLoading(true);
    setPaymentError('');

    try {
      const subRes = await api.post('/subscriptions/from-cart/', {
        items: cart.items,
        plan_id: cart.items.find(i => i.planId)?.planId || null,
        discount_code: cart.discountCode || undefined,
        discount_amount: cart.discountAmount || 0,
      });

      const { invoice_id, subscription_id } = subRes.data;

      await openRazorpayCheckout(
        invoice_id,
        () => {
          clearCart();
          router.push(`/order/success?sub=${subscription_id}`);
        },
        () => {
          // User dismissed modal — keep their cart
          setLoading(false);
        },
        (errMsg) => {
          setPaymentError(errMsg);
          setLoading(false);
        }
      );
    } catch (err: any) {
      setPaymentError(err.response?.data?.error || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (!cart) {
    return (
      <div>
        <PortalNav />
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading cart…</div>
      </div>
    );
  }

  const subtotal = getCartTotal(cart);
  const total = Math.max(0, subtotal - (cart.discountAmount || 0));
  const hasAppliedDiscount = cart.discountCode && cart.discountAmount > 0;

  return (
    <div>
      <PortalNav />
      <div style={{ padding: '24px', maxWidth: '1080px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: '#666', marginBottom: 16 }}>Your cart is empty.</p>
            <Link href="/shop" style={{ color: '#0070f3', fontWeight: 600 }}>Browse products →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Items Table */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Product</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Qty</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Unit</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Total</th>
                      <th style={{ padding: '12px 16px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {item.productPhoto
                                ? <img src={item.productPhoto} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span className="material-icons" style={{ fontSize: 22, color: '#ccc' }}>inventory_2</span>
                              }
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</div>
                              {item.planName && (
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                                  {item.planName} · {item.billingPeriod}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              updateQuantity(item.productId, item.planId, parseInt(e.target.value) || 1);
                              refreshCart();
                            }}
                            style={{ width: 56, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, textAlign: 'center', fontSize: '0.875rem' }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.875rem', color: '#374151' }}>{formatINR(item.unitPrice)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: '0.875rem' }}>{formatINR(item.unitPrice * item.quantity)}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => { removeFromCart(item.productId, item.planId); refreshCart(); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                            title="Remove item"
                          >
                            <span className="material-icons" style={{ fontSize: 18 }}>delete_outline</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Promo Code Section */}
              <div style={{ marginTop: 20, background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span className="material-icons" style={{ fontSize: 18, color: '#6b7280' }}>local_offer</span>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>Promo Code</h4>
                </div>

                {hasAppliedDiscount ? (
                  /* Applied state */
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-icons" style={{ fontSize: 18, color: '#16a34a' }}>check_circle</span>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#15803d' }}>{cart.discountCode?.toUpperCase()}</span>
                        <span style={{ fontSize: '0.8rem', color: '#166534', marginLeft: 8 }}>− {formatINR(cart.discountAmount)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveDiscount}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  /* Input state */
                  <>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                        style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={promoLoading || !discountCode.trim()}
                        style={{ padding: '10px 18px', background: '#0b1c30', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', opacity: promoLoading ? 0.7 : 1 }}
                      >
                        {promoLoading ? 'Checking…' : 'Apply'}
                      </button>
                    </div>
                    {promoStatus && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: promoStatus.type === 'success' ? '#16a34a' : '#dc2626' }}>
                        <span className="material-icons" style={{ fontSize: 15 }}>{promoStatus.type === 'success' ? 'check_circle' : 'error_outline'}</span>
                        {promoStatus.msg}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ width: 320, flexShrink: 0 }}>
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, marginTop: 0 }}>Order Summary</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span style={{ fontWeight: 600 }}>{formatINR(subtotal)}</span>
                  </div>

                  {hasAppliedDiscount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#16a34a' }}>
                      <span>Promo ({cart.discountCode})</span>
                      <span style={{ fontWeight: 700 }}>− {formatINR(cart.discountAmount)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#9ca3af' }}>
                    <span>Tax</span>
                    <span>Calculated at payment</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '4px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                    <span>Total</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>

                {/* Payment failure banner */}
                {paymentError && (
                  <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span className="material-icons" style={{ fontSize: 18, color: '#dc2626', flexShrink: 0, marginTop: 1 }}>error</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#991b1b', marginBottom: 4 }}>Payment Failed</div>
                      <div style={{ fontSize: '0.78rem', color: '#b91c1c' }}>{paymentError}</div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.items.length === 0}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: loading ? '#9ca3af' : '#0b1c30',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    marginTop: 20,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="material-icons" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>pending</span>
                      Processing…
                    </>
                  ) : paymentError ? (
                    <>
                      <span className="material-icons" style={{ fontSize: 16 }}>refresh</span>
                      Retry Payment
                    </>
                  ) : (
                    <>
                      <span className="material-icons" style={{ fontSize: 16 }}>lock</span>
                      Pay {formatINR(total)}
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                  <span className="material-icons" style={{ fontSize: 14, color: '#9ca3af' }}>verified_user</span>
                  <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>Secured by Razorpay · SSL encrypted</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CartPage);
