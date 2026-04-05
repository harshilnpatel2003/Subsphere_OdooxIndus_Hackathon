export interface CartItem {
  productId: string;
  productName: string;
  planId: string | null;
  planName: string | null;
  billingPeriod: string | null;
  quantity: number;
  unitPrice: number;
  taxId: string | null;
  variantId: string | null;
  productPhoto: string | null;
}
export interface Cart { 
  items: CartItem[]; 
  discountCode: string | null; 
  discountAmount: number; 
  discountType?: 'fixed' | 'percentage';
  discountValue?: number;
}
const CART_KEY = 'subsphere_cart';
export function getCart(): Cart {
  if (typeof window === 'undefined') return { items: [], discountCode: null, discountAmount: 0 };
  try { return JSON.parse(localStorage.getItem(CART_KEY) || 'null') || { items: [], discountCode: null, discountAmount: 0 }; }
  catch { return { items: [], discountCode: null, discountAmount: 0 }; }
}
function saveCart(cart: Cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
export function addToCart(item: CartItem) {
  const cart = getCart();
  const idx = cart.items.findIndex(i => i.productId === item.productId && i.planId === item.planId);
  if (idx >= 0) cart.items[idx].quantity += item.quantity; else cart.items.push(item);
  saveCart(cart);
}
export function removeFromCart(productId: string, planId: string | null = null) {
  const cart = getCart();
  cart.items = cart.items.filter(i => !(i.productId === productId && i.planId === planId));
  saveCart(cart);
}
export function updateQuantity(productId: string, planId: string | null, qty: number) {
  const cart = getCart();
  const item = cart.items.find(i => i.productId === productId && i.planId === planId);
  if (item) item.quantity = qty;
  saveCart(cart);
}
export function clearCart() { localStorage.removeItem(CART_KEY); }
export function getCartTotal(cart: Cart): number { return cart.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0); }
export function applyDiscount(code: string, amount: number, type?: 'fixed' | 'percentage', value?: number) {
  const cart = getCart(); 
  cart.discountCode = code; 
  cart.discountAmount = amount; 
  cart.discountType = type;
  cart.discountValue = value;
  saveCart(cart);
}
export function getCartCount(): number { return getCart().items.reduce((s, i) => s + i.quantity, 0); }
