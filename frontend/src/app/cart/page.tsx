'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, Cart as CartObj } from '@/lib/cart';
import { formatINR } from '@/lib/formatters';
import { openRazorpayCheckout } from '@/lib/razorpay';
import withAuth from '@/components/withAuth';

function CartPage() {
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
    refreshCart();
  }, []);

  const handleApplyDiscount = async () => {
    if (!cart || !discountCode) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/discounts/validate/', {
        code: discountCode,
        cart_total: getCartTotal(cart)
      });
      // Store discount amount in cart for logic?
      // For this hackathon, we manually update temporary state
      setStatus(`✓ Discount applied: -${formatINR(res.data.discount_amount)}`);
      // Update cart state locally
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
        plan_id: cart.items.find(i => i.planId)?.planId || null // Simple logic: use first plan found
      });
      
      const { subscription_id, invoice_id } = subRes.data;
      
      // Step 2 & 3: Payment process
      await openRazorpayCheckout(
        invoice_id, 
        (verifyRes) => {
          // Success!
          clearCart();
          router.push(`/order/success?sub=${subscription_id}`);
        },
        () => {
          // Cancelled
          setStatus('Payment cancelled. Your subscription is preserved in "Draft/Confirmed" status.');
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Checkout failed');
      setLoading(false);
    }
  };

  if (!cart) return <div><PortalNav /><div style={{padding:'20px'}}>Loading...</div></div>;

  const subtotal = getCartTotal(cart);
  const total = Math.max(0, subtotal - cart.discountAmount);

  return (
    <div>
      <PortalNav />
      <div style={{padding:'20px', maxWidth:'1000px', margin:'0 auto'}}>
        <h1>Shopping Cart</h1>
        
        {cart.items.length === 0 ? (
          <div>
            <p>Your cart is empty.</p>
            <Link href="/shop" style={{color:'#0070f3'}}>Browse products</Link>
          </div>
        ) : (
          <div style={{display:'flex', gap:'40px', marginTop:'20px'}}>
            <div style={{flex: 1}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9f9f9', borderBottom:'1px solid #ddd'}}>
                    <th style={{padding:'10px', textAlign:'left'}}>Image</th>
                    <th style={{padding:'10px', textAlign:'left'}}>Product</th>
                    <th style={{padding:'10px', textAlign:'center'}}>Qty</th>
                    <th style={{padding:'10px', textAlign:'right'}}>Price</th>
                    <th style={{padding:'10px', textAlign:'right'}}>Total</th>
                    <th style={{padding:'10px', textAlign:'center'}}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item, idx) => (
                    <tr key={idx} style={{borderBottom:'1px solid #eee'}}>
                      <td style={{padding:'10px'}}>
                        <div style={{width:'50px', height:'50px', background:'#f5f5f5', borderRadius:'4px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
                          {item.productPhoto ? (
                            <img src={item.productPhoto} alt={item.productName} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          ) : (
                            <span className="material-icons" style={{fontSize: 24, color:'#ccc', fontFamily:'Material Icons'}}>image</span>
                          )}
                        </div>
                      </td>
                      <td style={{padding:'10px'}}>
                        <strong>{item.productName}</strong>
                        {item.planName && <div style={{fontSize:'0.8em', color:'#666'}}>{item.planName} ({item.billingPeriod})</div>}
                      </td>
                      <td style={{padding:'10px', textAlign:'center'}}>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => {
                            updateQuantity(item.productId, item.planId, parseInt(e.target.value) || 1);
                            refreshCart();
                          }}
                          style={{width:'50px', padding:'5px'}}
                        />
                      </td>
                      <td style={{padding:'10px', textAlign:'right'}}>{formatINR(item.unitPrice)}</td>
                      <td style={{padding:'10px', textAlign:'right'}}>{formatINR(item.unitPrice * item.quantity)}</td>
                      <td style={{padding:'10px', textAlign:'center'}}>
                        <button 
                          onClick={() => { removeFromCart(item.productId, item.planId); refreshCart(); }}
                          style={{color:'red', border:'none', background:'none', cursor:'pointer'}}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{marginTop:'30px', padding:'15px', border:'1px solid #ddd', borderRadius:'4px', maxWidth:'400px'}}>
                <h4>Discount Code</h4>
                <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    style={{flex: 1, padding:'8px'}}
                  />
                  <button 
                    onClick={handleApplyDiscount} 
                    disabled={loading}
                    style={{padding:'8px 15px', cursor:'pointer'}}
                  >
                    Apply
                  </button>
                </div>
                {status && <p style={{color:'green', fontSize:'0.9em', marginTop:'5px'}}>{status}</p>}
                {error && <p style={{color:'red', fontSize:'0.9em', marginTop:'5px'}}>{error}</p>}
              </div>
            </div>

            <div style={{width:'300px'}}>
              <div style={{padding:'20px', border:'1px solid #ddd', borderRadius:'4px', background:'#fafafa'}}>
                <h3 style={{marginTop:0}}>Summary</h3>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                  <span>Subtotal:</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', color:'green'}}>
                    <span>Discount:</span>
                    <span>-{formatINR(cart.discountAmount)}</span>
                  </div>
                )}
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', color:'#666', fontSize:'0.9em'}}>
                  <span>Estimated Tax:</span>
                  <span>(Calculated at checkout)</span>
                </div>
                <hr />
                <div style={{display:'flex', justifyContent:'space-between', marginTop:'15px', fontSize:'1.3em', fontWeight:'bold'}}>
                  <span>Total:</span>
                  <span>{formatINR(total)}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{
                    width:'100%', 
                    padding:'12px', 
                    background:'#28a745', 
                    color:'#fff', 
                    border:'none', 
                    borderRadius:'4px', 
                    marginTop:'20px', 
                    cursor:'pointer',
                    fontWeight:'bold'
                  }}
                >
                  {loading ? 'Processing...' : 'Proceed to Pay'}
                </button>
                <p style={{fontSize:'0.75em', color:'#888', marginTop:'10px', textAlign:'center'}}>
                  Powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';

export default withAuth(CartPage);
