import api from './api';

export async function openRazorpayCheckout(
  invoiceId: string | number, 
  onSuccess: (response: any) => void,
  onCancel?: () => void
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
      order_id: order.razorpay_order_id,
      handler: async (response: any) => {
        // verify payment
        try {
          await api.post('/payments/verify/', {
            ...response,
            invoice_id: invoiceId
          });
          onSuccess(response);
        } catch (err: any) {
          alert('Payment verification failed: ' + (err.response?.data?.error || 'Unknown error'));
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#0070f3'
      },
      modal: {
        ondismiss: function() {
          if (onCancel) onCancel();
        }
      }
    };
    
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    console.error(err);
    alert('Failed to initiate payment: ' + (err.response?.data?.error || 'Unknown error'));
  }
}
