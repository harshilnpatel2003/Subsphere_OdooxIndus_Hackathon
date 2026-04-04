export function formatINR(a: number | string): string { return `₹${Number(a).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`; }
export function formatDate(iso: string): string { if(!iso) return '-'; return new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
