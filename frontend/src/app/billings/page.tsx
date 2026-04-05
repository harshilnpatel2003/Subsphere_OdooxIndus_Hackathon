
'use client';
import React, { useState, useMemo } from 'react';

// --- 1. Types ---
interface InvoiceItem {
    id: number;
    description: string;
    details: string;
    qty: number;
    unitPrice: number;
    taxRate: number;
}

export default function BillingPage() {
    // --- 2. State Management ---
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    // Invoice Items State
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: 1, description: 'Enterprise Subscription - Tier III', details: 'Annual billing cycle (Oct 2026 - Oct 2027)', qty: 1, unitPrice: 450000, taxRate: 18 },
        { id: 2, description: 'Advanced API Integration Module', details: 'Unlimited endpoints with prioritized queueing', qty: 12, unitPrice: 2500, taxRate: 18 },
        { id: 3, description: 'Onboarding & Security Audit', details: 'One-time specialized consulting fee', qty: 1, unitPrice: 15000, taxRate: 12 },
    ]);

    // Discount & Settings State
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState<number>(10);
    const [notes, setNotes] = useState('');

    // --- 3. Dynamic Calculations ---
    const { subtotal, discountAmount, taxableValue, totalTax, cgst, sgst, grandTotal } = useMemo(() => {
        // 1. Calculate raw subtotal
        const sub = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

        // 2. Calculate discount amount
        let disc = 0;
        if (discountType === 'percentage') {
            disc = sub * (discountValue / 100);
        } else {
            disc = discountValue;
        }
        // Prevent discount from exceeding subtotal
        disc = Math.min(disc, sub);

        // 3. Taxable value
        const taxable = sub - disc;

        // 4. Calculate accurate tax by applying discount proportionally across items
        let tax = 0;
        items.forEach(item => {
            const itemTotal = item.qty * item.unitPrice;
            const proportion = sub > 0 ? itemTotal / sub : 0;
            const itemTaxable = taxable * proportion;
            tax += itemTaxable * (item.taxRate / 100);
        });

        return {
            subtotal: sub,
            discountAmount: disc,
            taxableValue: taxable,
            totalTax: tax,
            cgst: tax / 2, // Assuming even split for UI purposes
            sgst: tax / 2,
            grandTotal: taxable + tax
        };
    }, [items, discountType, discountValue]);

    // --- 4. Handlers ---
    const handleItemChange = (id: number, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleAddRow = () => {
        setItems([
            ...items,
            { id: Date.now(), description: '', details: '', qty: 1, unitPrice: 0, taxRate: 18 }
        ]);
    };

    const handleRemoveRow = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    // Action: Save as Draft
    const handleSaveDraft = () => {
        setIsSaving(true);
        // Simulate API call delay
        setTimeout(() => {
            setIsSaving(false);
            const now = new Date();
            setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
    };

    // Action: Generate PDF (Using native print which can be saved as PDF)
    const handleGeneratePDF = () => {
        window.print();
    };

    // Formatting utility
    const formatINR = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
    };

    return (
        <>
            {/* We add a print stylesheet to hide UI elements when generating the PDF */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-full-width { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important;}
          .print-shadow-none { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}} />

            <div className="w-full max-w-[1400px] mx-auto text-[#1c1b1b] font-body bg-[#fcf8f8] min-h-screen relative print-full-width">

                {/* Billing Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 px-4 md:px-8 pt-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight text-[#1c1b1b]">Invoice #INV-2026-0012</h2>
                            <span className="px-3 py-1 bg-[#ebe7e7] text-[#444748] text-[10px] font-bold uppercase tracking-widest rounded-full">Draft</span>
                        </div>
                        <p className="text-[#444748] text-sm">
                            Created on April 24, 2026 · Due in 14 days
                            {lastSaved && <span className="ml-2 text-emerald-600 font-medium">✓ Saved at {lastSaved}</span>}
                        </p>
                    </div>

                    <div className="flex gap-4 no-print">
                        <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#c4c7c8] text-[#1c1b1b] font-semibold hover:bg-[#f1edec] transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">{isSaving ? 'sync' : 'save'}</span>
                            {isSaving ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button
                            onClick={handleGeneratePDF}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-br from-[#767777] to-[#001453] text-white font-bold shadow-lg hover:opacity-90 transition-opacity active:scale-95"
                        >
                            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                            Generate PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8 px-4 md:px-8 pb-12">

                    {/* Left Column: Subscriber Details & Items */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">

                        {/* Subscriber Identity Card */}
                        <section className="bg-white p-8 rounded-xl shadow-sm border border-[#c4c7c8]/30 print-shadow-none">
                            <h3 className="text-xs font-bold font-headline uppercase tracking-[0.2em] text-[#444748] mb-6">Subscriber Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#747878] tracking-wider">Firm Name</label>
                                    <p className="text-lg font-bold font-headline text-[#1c1b1b]">Starlight Aerospace Systems</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#747878] tracking-wider">GST Number</label>
                                    <p className="text-lg font-bold font-headline text-[#1c1b1b]">27AAACS1234A1Z1</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#747878] tracking-wider">Owner / Contact Person</label>
                                    <p className="text-[#1c1b1b] font-medium">Mr. Arvind Subramaniam</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#747878] tracking-wider">Contact Number</label>
                                    <p className="text-[#1c1b1b] font-medium">+91 98765 43210</p>
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-[#747878] tracking-wider">Full Address</label>
                                    <p className="text-[#1c1b1b] leading-relaxed max-w-md">Plot 45, IT Park Phase II, Gachibowli, Hyderabad, Telangana - 500032, India</p>
                                </div>
                            </div>
                        </section>

                        {/* Billing Items Table */}
                        <section className="bg-white rounded-xl shadow-sm border border-[#c4c7c8]/30 overflow-hidden print-shadow-none">
                            <div className="px-8 py-6 border-b border-[#f1edec]">
                                <h3 className="text-xs font-bold font-headline uppercase tracking-[0.2em] text-[#444748]">Billing Items</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead>
                                        <tr className="bg-[#f6f3f2]">
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#444748]">Description</th>
                                            <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[#444748] text-center w-24">QTY</th>
                                            <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[#444748] text-right w-36">Unit Price</th>
                                            <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-[#444748] text-right w-24">Tax %</th>
                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#444748] text-right w-36">Total</th>
                                            <th className="px-4 py-4 w-10 no-print"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1edec]">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#fcf8f8] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <input
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                        className="w-full font-bold text-[#1c1b1b] bg-transparent border-transparent focus:border-[#c4c7c8] rounded p-1"
                                                        placeholder="Item Name"
                                                    />
                                                    <input
                                                        value={item.details}
                                                        onChange={(e) => handleItemChange(item.id, 'details', e.target.value)}
                                                        className="w-full text-xs text-[#444748] bg-transparent border-transparent focus:border-[#c4c7c8] rounded p-1 mt-1"
                                                        placeholder="Item Details"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number" min="1"
                                                        value={item.qty}
                                                        onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                                                        className="w-full text-center text-[#1c1b1b] bg-transparent border-[#c4c7c8]/50 rounded p-1 focus:ring-[#5d5f5f]"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <input
                                                        type="number" min="0"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-full text-right text-[#1c1b1b] bg-transparent border-[#c4c7c8]/50 rounded p-1 focus:ring-[#5d5f5f]"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end">
                                                        <input
                                                            type="number" min="0" max="100"
                                                            value={item.taxRate}
                                                            onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                                                            className="w-16 text-right text-[#1c1b1b] bg-transparent border-[#c4c7c8]/50 rounded p-1 focus:ring-[#5d5f5f]"
                                                        />
                                                        <span className="ml-1 text-xs font-bold text-[#444748]">%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-[#1c1b1b]">
                                                    ₹ {formatINR(item.qty * item.unitPrice)}
                                                </td>
                                                <td className="px-4 py-4 text-center no-print">
                                                    <button
                                                        onClick={() => handleRemoveRow(item.id)}
                                                        className="text-[#c4c7c8] hover:text-[#ba1a1a] transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-8 py-4 bg-[#f6f3f2] flex justify-end no-print">
                                <button
                                    onClick={handleAddRow}
                                    className="flex items-center gap-1 text-[#5d5f5f] text-xs font-bold uppercase tracking-wider hover:text-[#1c1b1b] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                    Add Row
                                </button>
                            </div>
                        </section>

                    </div>

                    {/* Right Column: Discounts & Financial Summary */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">

                        {/* Applied Discount Section (Hidden on Print if no discount) */}
                        <section className={`bg-[#f6f3f2] p-6 rounded-xl border border-[#c4c7c8]/30 ${discountValue === 0 ? 'print:hidden' : ''}`}>
                            <h3 className="text-xs font-bold font-headline uppercase tracking-[0.2em] text-[#444748] mb-4">Provider Applied Discount</h3>
                            <div className="space-y-4 no-print">
                                <div className="flex gap-2 p-1 bg-[#ebe7e7] rounded-lg">
                                    <button
                                        onClick={() => setDiscountType('percentage')}
                                        className={`flex-1 py-1.5 rounded shadow-sm text-xs font-bold transition-all ${discountType === 'percentage' ? 'bg-white text-[#1c1b1b]' : 'text-[#747878] hover:text-[#1c1b1b]'}`}
                                    >
                                        Percentage (%)
                                    </button>
                                    <button
                                        onClick={() => setDiscountType('fixed')}
                                        className={`flex-1 py-1.5 rounded shadow-sm text-xs font-bold transition-all ${discountType === 'fixed' ? 'bg-white text-[#1c1b1b]' : 'text-[#747878] hover:text-[#1c1b1b]'}`}
                                    >
                                        Fixed (₹)
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white border-[#c4c7c8] focus:ring-[#5d5f5f] focus:border-[#5d5f5f] rounded-lg text-lg font-bold font-headline pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#747878] font-bold">
                                        {discountType === 'percentage' ? '%' : '₹'}
                                    </span>
                                </div>
                            </div>
                            <div className="hidden print:block text-[#1c1b1b] font-bold">
                                Discount Applied: {discountType === 'percentage' ? `${discountValue}%` : `₹ ${formatINR(discountValue)}`}
                            </div>
                        </section>

                        {/* Financial Summary Ledger */}
                        <section className="bg-[#1c1b1b] p-8 rounded-xl shadow-2xl text-white print:bg-white print:text-black print:border print:border-[#c4c7c8] print:shadow-none">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 print:text-[#747878] mb-8">Financial Summary</h3>
                            <div className="space-y-4 font-body">
                                <div className="flex justify-between items-center text-white/80 print:text-[#1c1b1b]">
                                    <span className="text-sm">Subtotal</span>
                                    <span className="font-medium">₹ {formatINR(subtotal)}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-[#ffdad6] print:text-[#ba1a1a]">
                                        <span className="text-sm">Discount</span>
                                        <span className="font-medium">- ₹ {formatINR(discountAmount)}</span>
                                    </div>
                                )}

                                <div className="h-[1px] bg-white/20 print:bg-[#c4c7c8] my-2"></div>

                                <div className="flex justify-between items-center text-white/80 print:text-[#1c1b1b]">
                                    <span className="text-sm">Taxable Value</span>
                                    <span className="font-medium">₹ {formatINR(taxableValue)}</span>
                                </div>

                                {totalTax > 0 && (
                                    <div className="space-y-2 pl-4 border-l border-white/20 print:border-[#c4c7c8]">
                                        <div className="flex justify-between items-center text-white/60 print:text-[#444748] text-xs">
                                            <span>CGST</span>
                                            <span>₹ {formatINR(cgst)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-white/60 print:text-[#444748] text-xs">
                                            <span>SGST</span>
                                            <span>₹ {formatINR(sgst)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/20 print:border-[#c4c7c8]">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 print:text-[#747878]">Grand Total</label>
                                <div className="flex justify-between items-end mt-1">
                                    <span className="text-4xl font-black font-headline print:text-black">₹ {formatINR(grandTotal)}</span>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions / Notes */}
                        <div className="p-6 bg-[#ebe7e7]/50 rounded-xl space-y-4 print:bg-white print:border print:border-[#c4c7c8]">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#444748]">Terms & Notes</h4>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-transparent border border-transparent hover:border-[#c4c7c8] focus:border-[#c4c7c8] focus:ring-0 text-sm text-[#444748] p-2 rounded placeholder:italic transition-colors resize-none"
                                rows={3}
                                placeholder="Add specific payment terms or notes for the customer..."
                            ></textarea>
                        </div>

                    </div>
                </div>

                {/* Right Drawer (Hidden on Print) */}
                <div className="fixed right-0 top-0 h-screen w-16 bg-[#f6f3f2] border-l border-[#c4c7c8]/30 flex flex-col items-center py-8 gap-6 group hover:w-72 transition-all duration-300 z-50 shadow-2xl overflow-hidden no-print">
                    <span className="material-symbols-outlined text-[#444748]">history</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full px-6">
                        <h4 className="text-xs font-bold font-headline uppercase tracking-widest mb-6 whitespace-nowrap text-[#1c1b1b]">Audit Log</h4>
                        <div className="space-y-6">
                            <div className="relative pl-4 border-l border-[#c4c7c8]">
                                <p className="text-[10px] font-bold uppercase text-[#1c1b1b]">Invoice Drafted</p>
                                <p className="text-[10px] text-[#747878]">Oct 24, 10:20 AM · By Admin</p>
                            </div>
                            <div className="relative pl-4 border-l border-[#c4c7c8]">
                                <p className="text-[10px] font-bold uppercase text-[#1c1b1b]">Discount Applied</p>
                                <p className="text-[10px] text-[#747878]">Oct 24, 10:25 AM · By Finance</p>
                            </div>
                            {lastSaved && (
                                <div className="relative pl-4 border-l border-[#c4c7c8]">
                                    <p className="text-[10px] font-bold uppercase text-[#1c1b1b]">Draft Saved</p>
                                    <p className="text-[10px] text-[#747878]">Today, {lastSaved} · By Admin</p>
                                </div>
                            )}
                            <div className="relative pl-4 border-l-2 border-[#5d5f5f]">
                                <p className="text-[10px] font-bold uppercase text-[#5d5f5f]">Awaiting Review</p>
                                <p className="text-[10px] text-[#747878]">Current State</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}