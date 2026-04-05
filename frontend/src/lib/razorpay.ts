import api from './api';

const SUBSPHERE_PRIMARY = '#6750a4'; // SubSphere brand purple

/** Opens standard Razorpay checkout for a one-time invoice payment. */
export async function openRazorpayCheckout(
  invoiceId: string | number,
  onSuccess: (response: any) => void,
  onCancel?: () => void,
  onFailure?: (msg: string) => void
) {
  try {
    const res = await api.post('/payments/create-order/', { invoice_id: invoiceId });
    const order = res.data;

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'SubSphere',
      description: `Payment for Invoice #${invoiceId}`,
      image: '/logo.png',
      order_id: order.razorpay_order_id,
      prefill: {
        name: order.customer_name || '',
        email: order.customer_email || '',
        contact: '',
      },
      theme: { color: SUBSPHERE_PRIMARY },
      config: {
        display: {
          // UPI first, then card, netbanking
          blocks: {
            utib: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] },
            other: {
              name: 'Other Payment Methods',
              instruments: [
                { method: 'card' },
                { method: 'netbanking' },
                { method: 'wallet' },
              ],
            },
          },
          sequence: ['block.utib', 'block.other'],
          preferences: { show_default_blocks: false },
        },
      },
      handler: async (response: any) => {
        try {
          await api.post('/payments/verify/', { ...response, invoice_id: invoiceId });
          onSuccess(response);
        } catch (err: any) {
          const msg = err.response?.data?.error || 'Payment verification failed.';
          if (onFailure) onFailure(msg);
          else console.error('[Razorpay] Verify failed:', msg);
        }
      },
      modal: {
        ondismiss: () => { if (onCancel) onCancel(); },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      const msg =
        response?.error?.description ||
        response?.error?.reason ||
        'Payment failed. Try a different method.';
      if (onFailure) onFailure(msg);
      else console.error('[Razorpay] Payment failed:', msg);
    });
    rzp.open();
  } catch (err: any) {
    const msg = err.response?.data?.error || 'Failed to initiate payment.';
    if (onFailure) onFailure(msg);
    else console.error('[Razorpay] Init failed:', msg);
  }
}

/** Opens Razorpay checkout in Subscription (mandate) mode.
 *  Customer registers UPI Autopay / e-NACH mandate.
 *  Subsequent billing cycles are auto-debited and handled via webhook. */
export async function openRazorpaySubscription(
  subscriptionId: string | number,
  onSuccess: (response: any) => void,
  onCancel?: () => void,
  onFailure?: (msg: string) => void
) {
  try {
    const res = await api.post('/payments/create-subscription/', { subscription_id: subscriptionId });
    const data = res.data;

    if (!data.razorpay_subscription_id) {
      throw new Error('No Razorpay subscription ID returned');
    }

    const options = {
      key: data.key_id,
      subscription_id: data.razorpay_subscription_id,
      name: 'SubSphere',
      description: 'Recurring Subscription — Mandate Registration',
      image: '/logo.png',
      prefill: {
        name: data.customer_name || '',
        email: data.customer_email || '',
        contact: '',
      },
      theme: { color: SUBSPHERE_PRIMARY },
      // UPI Autopay preferred for mandate
      config: {
        display: {
          blocks: {
            upi: { name: 'UPI Autopay (Recommended)', instruments: [{ method: 'upi', flows: ['collect', 'intent', 'qr'] }] },
            emandate: { name: 'Bank Mandate (eNACH)', instruments: [{ method: 'emandate' }] },
            other: { name: 'Card / Netbanking', instruments: [{ method: 'card' }, { method: 'netbanking' }] },
          },
          sequence: ['block.upi', 'block.emandate', 'block.other'],
          preferences: { show_default_blocks: false },
        },
      },
      recurring: 1,
      handler: async (response: any) => {
        try {
          // Verify the mandate authentication signature
          await api.post('/payments/verify-subscription/', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
            subscription_id: subscriptionId,
          });
          onSuccess(response);
        } catch (err: any) {
          const msg = err.response?.data?.error || 'Mandate verification failed.';
          if (onFailure) onFailure(msg);
          else console.error('[Razorpay] Subscription verify failed:', msg);
        }
      },
      modal: {
        ondismiss: () => { if (onCancel) onCancel(); },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      const msg =
        response?.error?.description ||
        response?.error?.reason ||
        'Mandate registration failed.';
      if (onFailure) onFailure(msg);
      else console.error('[Razorpay] Mandate failed:', msg);
    });
    rzp.open();
  } catch (err: any) {
    const msg = err.response?.data?.error || 'Failed to initiate subscription mandate.';
    if (onFailure) onFailure(msg);
    else console.error('[Razorpay] Sub init failed:', msg);
  }
}
