'use client';
import React, { useState, useMemo } from 'react';

// --- Types ---
interface QuoteItem {
    id: string;
    product: string;
    description: string;
    qty: number;
    unitPrice: number;
    taxRate: number;
    discountRate: number;
}

export default function QuotationIntelligencePage() {
    // --- 1. State Management ---
    const [items, setItems] = useState<QuoteItem[]>([
        { id: '1', product: 'Enterprise Cloud Tier', description: 'Premium infrastructure support', qty: 1, unitPrice: 12500, taxRate: 18, discountRate: 0 },
        { id: '2', product: 'Data Analytics Bundle', description: 'Monthly visualization credits', qty: 5, unitPrice: 450, taxRate: 12, discountRate: 5 },
    ]);

    const [globalDiscount, setGlobalDiscount] = useState<number>(2.5);
    const [referenceNo] = useState('QTN-2026-0892');

    // --- 2. Calculation Engine ---
    const totals = useMemo(() => {
        // Calculate raw total per row (Price * Qty - Row Discount)
        const subtotal = items.reduce((acc, item) => {
            const rowRaw = item.qty * item.unitPrice;
            const rowDisc = rowRaw * (item.discountRate / 100);
            return acc + (rowRaw - rowDisc);
        }, 0);

        const globalDiscountSavings = subtotal * (globalDiscount / 100);
        const taxableValue = subtotal - globalDiscountSavings;

        const cgst = taxableValue * 0.09;
        const sgst = taxableValue * 0.09;
        const grandTotal = taxableValue + cgst + sgst;

        return { subtotal, globalDiscountSavings, taxableValue, cgst, sgst, grandTotal };
    }, [items, globalDiscount]);

    // --- 3. Handlers ---
    const handleItemChange = (id: string, field: keyof QuoteItem, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => {
        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            product: 'API Gateway Access',
            description: 'New service entry',
            qty: 1,
            unitPrice: 0,
            taxRate: 18,
            discountRate: 0,
        };
        setItems([...items, newItem]);
    };

    const handlePrint = () => window.print();

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { border: 1px solid #e5e7eb !important; box-shadow: none !important; }
          .main-content { margin-left: 0 !important; width: 100% !important; }
        }
      `}} />

            <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 main-content pb-20">

                {/* Hero Title Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tighter text-[#1c1b1b] mb-2 font-headline">Create Quotation</h2>
                        <p className="text-[#444748] text-sm max-w-lg">Initiate a formal commercial proposal. All data is recorded in the Sovereign Ledger.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="px-5 py-2.5 text-sm font-medium text-[#454747] hover:bg-[#ebe7e7] transition-colors rounded-lg">Save as Draft</button>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-2.5 text-sm font-bold bg-[#1c1b1b] text-white hover:bg-black transition-all flex items-center gap-2 rounded-lg shadow-lg active:scale-95"
                        >
                            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                            Generate PDF
                        </button>
                        <button className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#5d5f5f] to-[#313030] text-white shadow-md hover:shadow-lg transition-all rounded-lg">
                            Send Quotation
                        </button>
                    </div>
                </div>

                {/* Dynamic Stepper */}
                <section className="bg-[#f6f3f2] p-1 border border-[#c4c7c8]/30 rounded-xl no-print">
                    <div className="flex justify-between items-center bg-white px-12 py-8 relative rounded-lg">
                        <div className="absolute h-[2px] bg-[#c4c7c8]/30 left-24 right-24 top-[52px]"></div>
                        <div className="absolute h-[2px] bg-[#313030] left-24 w-1/4 top-[52px]"></div>
                        <div className="z-10 flex flex-col items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#313030] text-white flex items-center justify-center font-bold text-xs">01</div><span className="text-[10px] font-bold tracking-widest uppercase">Draft</span></div>
                        <div className="z-10 flex flex-col items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#313030] text-white flex items-center justify-center font-bold text-xs">02</div><span className="text-[10px] font-bold tracking-widest uppercase">Quotation</span></div>
                        <div className="z-10 flex flex-col items-center gap-3 opacity-30"><div className="w-10 h-10 rounded-full bg-[#c4c7c8] text-white flex items-center justify-center font-bold text-xs">03</div><span className="text-[10px] font-bold tracking-widest uppercase">Review</span></div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Section 1: Details & Table */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">

                        {/* Subscriber Details */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-[#c4c7c8]/30 print-card">
                            <div className="flex items-center gap-2 mb-6 text-[#444748]">
                                <span className="material-symbols-outlined text-sm">badge</span>
                                <h3 className="text-xs font-bold tracking-widest uppercase">Subscriber Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#444748] uppercase tracking-wider">Firm Name</label>
                                    <input className="w-full bg-[#f6f3f2] border-none focus:ring-1 focus:ring-[#5d5f5f] p-3 text-sm rounded-md font-medium" defaultValue="Acme Corp Int'l" type="text" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#444748] uppercase tracking-wider">GST Number</label>
                                    <input className="w-full bg-[#f6f3f2] border-none focus:ring-1 focus:ring-[#5d5f5f] p-3 text-sm rounded-md uppercase font-mono" defaultValue="22AAAAA0000A1Z5" type="text" />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#444748] uppercase tracking-wider">Full Address</label>
                                    <textarea className="w-full bg-[#f6f3f2] border-none focus:ring-1 focus:ring-[#5d5f5f] p-3 text-sm rounded-md resize-none" rows={2} defaultValue="Building 4, Financial District, Mumbai, MH - 400001"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-[#c4c7c8]/30 overflow-hidden print-card">
                            <div className="px-8 py-6 border-b border-[#f1edec] flex justify-between items-center no-print">
                                <div className="flex items-center gap-2 text-[#444748]">
                                    <span className="material-symbols-outlined text-sm">list_alt</span>
                                    <h3 className="text-xs font-bold tracking-widest uppercase">Line Items</h3>
                                </div>
                                <button onClick={addItem} className="text-xs font-bold text-[#1c1b1b] flex items-center gap-1 hover:opacity-70 transition-all">
                                    <span className="material-symbols-outlined text-xs">add_circle</span>
                                    Add Product/Service
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead className="bg-[#f6f3f2]">
                                        <tr className="text-[10px] font-bold text-[#444748] uppercase tracking-widest">
                                            <th className="px-8 py-4">Product / Plan</th>
                                            <th className="px-4 py-4 text-center">Qty</th>
                                            <th className="px-4 py-4 text-right">Unit Price</th>
                                            <th className="px-4 py-4 text-center">Disc %</th>
                                            <th className="px-8 py-4 text-right">Total (INR)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1edec]">
                                        {items.map((item) => {
                                            const rowTotal = (item.qty * item.unitPrice) * (1 - item.discountRate / 100);
                                            return (
                                                <tr key={item.id} className="group hover:bg-[#fcf8f8] transition-colors">
                                                    <td className="px-8 py-5">
                                                        <input
                                                            className="bg-transparent border-none focus:ring-0 text-sm font-bold p-0 w-full"
                                                            value={item.product}
                                                            onChange={(e) => handleItemChange(item.id, 'product', e.target.value)}
                                                        />
                                                        <input
                                                            className="bg-transparent border-none focus:ring-0 text-xs p-0 w-full text-[#444748] mt-1"
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <input
                                                            type="number" className="bg-transparent border-none focus:ring-0 text-sm text-center p-0 w-12"
                                                            value={item.qty}
                                                            onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-5 text-right font-medium text-sm">
                                                        <input
                                                            type="number" className="bg-transparent border-none focus:ring-0 text-sm text-right p-0 w-24"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <input
                                                            type="number" className="bg-[#f6f3f2] border-none focus:ring-1 focus:ring-[#1c1b1b] text-xs text-center p-1 w-12 rounded font-bold"
                                                            value={item.discountRate}
                                                            onChange={(e) => handleItemChange(item.id, 'discountRate', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-8 py-5 text-right font-bold text-sm text-[#1c1b1b]">
                                                        {rowTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Sidebar Info & Totals */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">

                        {/* Quotation Metadata Card */}
                        <div className="bg-[#f6f3f2] p-6 rounded-xl border border-[#c4c7c8]/30 no-print">
                            <div className="flex items-center gap-2 mb-6 text-[#444748]">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <h3 className="text-xs font-bold tracking-widest uppercase">Quotation Parameters</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-[#c4c7c8]/20">
                                    <span className="text-xs text-[#444748]">Ref No.</span>
                                    <span className="text-sm font-bold font-headline">{referenceNo}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[#444748] uppercase">Validity</label>
                                    <select className="w-full bg-white border-none p-2.5 text-xs rounded-md shadow-sm focus:ring-1 focus:ring-[#5d5f5f]">
                                        <option>15 Days</option>
                                        <option selected>30 Days</option>
                                        <option>60 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary Ledger */}
                        <div className="bg-[#313030] p-8 rounded-xl text-white border border-white/10 shadow-2xl relative overflow-hidden group print-card print:bg-white print:text-black print:border-[#c4c7c8]">
                            <h3 className="text-xs font-bold tracking-widest uppercase mb-8 opacity-60 print:text-[#444748]">Financial Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="opacity-70">Subtotal</span>
                                    <span className="font-medium">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg border border-white/10 no-print">
                                    <span className="text-xs font-bold uppercase tracking-tight text-white/60">Global Discount (%)</span>
                                    <input
                                        type="number" step="0.5"
                                        className="w-16 bg-black border border-white/20 focus:ring-1 focus:ring-white text-sm font-bold p-1 rounded text-right text-white"
                                        value={globalDiscount}
                                        onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>

                                <div className="flex justify-between text-sm py-1 border-b border-white/10">
                                    <span className="text-white/60 print:text-[#444748]">Discount Savings</span>
                                    <span className="font-bold text-emerald-400">-₹{totals.globalDiscountSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="pt-4 space-y-2 text-xs opacity-60 italic print:text-[#444748]">
                                    <div className="flex justify-between"><span>CGST (9%)</span><span>₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between"><span>SGST (9%)</span><span>₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                </div>

                                <div className="pt-8 flex flex-col items-end relative border-t border-white/20">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Grand Total Payable</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg opacity-40 font-light">INR</span>
                                        <span className="text-4xl font-extrabold font-headline tracking-tighter text-white print:text-black">
                                            {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signature Area */}
                        <div className="bg-[#f6f3f2] rounded-xl p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#c4c7c8]/50">
                            <span className="material-symbols-outlined text-4xl text-[#c4c7c8]">ink_pen</span>
                            <p className="text-[11px] font-bold text-[#444748] uppercase tracking-widest mt-2">Authorize Quotation</p>
                            <button className="mt-4 px-4 py-2 text-[10px] font-bold border border-[#c4c7c8] text-[#444748] rounded-md hover:bg-[#313030] hover:text-white transition-all no-print">
                                Sign Digitally
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}