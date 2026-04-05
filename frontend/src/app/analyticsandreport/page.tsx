'use client';
import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

// Recharts Type Fixes for React 18/19
const BarChartComponent = BarChart as any;
const BarComponent = Bar as any;
const XAxisComponent = XAxis as any;
const TooltipComponent = Tooltip as any;
const ResponsiveContainerComponent = ResponsiveContainer as any;
const PieChartComponent = PieChart as any;
const PieComponent = Pie as any;
const CellComponent = Cell as any;

// --- 1. TypeScript Interfaces ---
interface Transaction {
    id: string;
    entity: string;
    revenue: number;
    taxes: number;
    discount: number;
    status: 'Completed' | 'Processing' | 'Failed';
}

interface ProductRevenue {
    name: string;
    shortName: string;
    revenue: number;
}

interface ChurnData {
    name: string;
    rate: number;
    color: string;
}

export default function ReportsPage() {
    // --- 2. Dynamic State Data ---
    // In a real app, this data would be fetched from your API/database based on user input elsewhere.
    const [transactions] = useState<Transaction[]>([
        { id: '1', entity: 'Global Dynamics Inc.', revenue: 42000.00, taxes: 3150.00, discount: 0.00, status: 'Completed' },
        { id: '2', entity: 'Nexus Cybernetics', revenue: 18450.00, taxes: 1383.75, discount: 922.50, status: 'Completed' },
        { id: '3', entity: 'Vanguard Research', revenue: 112000.00, taxes: 8400.00, discount: 0.00, status: 'Processing' },
        { id: '4', entity: 'Aetheric Systems', revenue: 5200.00, taxes: 390.00, discount: 0.00, status: 'Completed' },
        { id: '5', entity: 'Stark Industries', revenue: 84000.00, taxes: 6300.00, discount: 4200.00, status: 'Completed' },
    ]);

    const [productRevenue] = useState<ProductRevenue[]>([
        { name: 'Enterprise Ledger', shortName: 'Ent. Ledger', revenue: 850000 },
        { name: 'Cloud Node', shortName: 'Cloud Node', revenue: 600000 },
        { name: 'API Access', shortName: 'API Access', revenue: 450000 },
        { name: 'Compliance Kit', shortName: 'Comp. Kit', revenue: 200000 },
        { name: 'Audit Vault', shortName: 'Vault', revenue: 750000 },
    ]);

    const [churnData] = useState<ChurnData[]>([
        { name: 'Voluntary', rate: 1.1, color: '#ba1a1a' },     // Error Red
        { name: 'Delinquent', rate: 0.8, color: '#b8c4ff' },    // Light Blue
        { name: 'Contract End', rate: 0.5, color: '#607cec' },  // Mid Blue
    ]);

    // Sparkline data for the last 7 days of payment success rates
    const [paymentSuccessRates] = useState([98, 100, 95, 99, 97, 100, 99.2]);

    // --- 3. Dynamic Calculations (Derived from State) ---
    const totals = useMemo(() => {
        return transactions.reduce(
            (acc, curr) => ({
                revenue: acc.revenue + curr.revenue,
                taxes: acc.taxes + curr.taxes,
                discount: acc.discount + curr.discount,
            }),
            { revenue: 0, taxes: 0, discount: 0 }
        );
    }, [transactions]);

    const projectedAnnual = totals.revenue * 12; // Simplified projection
    const totalChurn = churnData.reduce((acc, curr) => acc + curr.rate, 0);

    // --- 4. Formatters ---
    const formatINR = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const formatCompactINR = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
        return formatINR(amount);
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto text-[#0b1c30] font-body bg-[#f8f9ff] min-h-screen p-4 md:p-8 space-y-8 relative">

            {/* Header & Filters Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-headline font-extrabold text-[#0b1c30] tracking-tight">Subsphere Intelligence Report</h2>
                    <p className="text-[#45464d] text-sm mt-1">Institutional data analysis for the fiscal period 2026-Q3.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-[#eff4ff] p-1.5 rounded-lg border border-[#c6c6cd]/30">
                    <button className="px-4 py-2 text-sm font-medium bg-white shadow-sm rounded text-[#0b1c30]">Last 30 Days</button>
                    <button className="px-4 py-2 text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Quarter to Date</button>
                    <button className="px-4 py-2 text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors hidden sm:block">Year to Date</button>
                    <div className="w-px h-6 bg-[#c6c6cd]/50 mx-1"></div>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#45464d] border border-[#c6c6cd]/40 rounded hover:bg-white transition-all bg-transparent">
                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                        Segments
                    </button>
                </div>
            </div>

            {/* Bento Grid: Top Metrics & Revenue */}
            <div className="grid grid-cols-12 gap-6">

                {/* Main Chart: Revenue by Product (Interactive Recharts) */}
                <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-[#c6c6cd]/30 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="font-headline font-bold text-xl text-[#0b1c30]">Revenue by Product</h3>
                            <p className="text-xs text-[#45464d] uppercase tracking-widest font-medium mt-1">Global Distribution</p>
                        </div>
                        <div className="text-right">
                            {/* Calculating total from the chart data */}
                            <span className="text-3xl font-headline font-black text-[#0b1c30]">
                                {formatCompactINR(productRevenue.reduce((a, b) => a + b.revenue, 0))}
                            </span>
                            <div className="flex items-center justify-end gap-1 text-emerald-600 text-xs font-bold mt-1">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                +12.4%
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainerComponent width="100%" height="100%">
                            <BarChartComponent data={productRevenue} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                <XAxisComponent
                                    dataKey="shortName"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#45464d', fontWeight: 600 }}
                                    dy={10}
                                />
                                <TooltipComponent
                                    cursor={{ fill: '#eff4ff' }}
                                    contentStyle={{ backgroundColor: '#0b1c30', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: any) => [formatINR(value), 'Revenue']}
                                />
                                <BarComponent
                                    dataKey="revenue"
                                    fill="#001453"
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={1500}
                                >
                                    {productRevenue.map((entry, index) => (
                                        // Give a slightly different opacity/color to bars to match your HTML aesthetic
                                        <CellComponent key={`cell-${index}`} fillOpacity={1 - (index * 0.15)} />
                                    ))}
                                </BarComponent>
                            </BarChartComponent>
                        </ResponsiveContainerComponent>
                    </div>
                </div>

                {/* Summary Panel: Dynamic Taxes & Discounts */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-[#eff4ff] p-6 rounded-xl border-l-4 border-[#000000] shadow-sm border-y border-r border-[#c6c6cd]/20">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-[#000000]">account_balance</span>
                            <h3 className="font-headline font-bold text-[#0b1c30]">Taxes Collected</h3>
                        </div>
                        <p className="text-3xl font-headline font-black text-[#0b1c30]">{formatINR(totals.taxes)}</p>
                        <p className="text-xs text-[#45464d] mt-2">VAT, GST, and Sales Tax aggregated across dynamic ledgers.</p>
                    </div>

                    <div className="bg-[#eff4ff] p-6 rounded-xl border-l-4 border-[#515f74] shadow-sm border-y border-r border-[#c6c6cd]/20">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-[#515f74]">sell</span>
                            <h3 className="font-headline font-bold text-[#0b1c30]">Discounts Applied</h3>
                        </div>
                        <p className="text-3xl font-headline font-black text-[#0b1c30]">{formatINR(totals.discount)}</p>
                        <p className="text-xs text-[#45464d] mt-2">Promotional codes and bulk enterprise volume discounts.</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#000000] to-[#213145] p-6 rounded-xl text-white shadow-xl relative overflow-hidden">
                        {/* Subtle glow effect */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 blur-2xl rounded-full"></div>

                        <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1 relative z-10">Projected Annual Revenue</p>
                        <h3 className="text-3xl font-headline font-extrabold relative z-10">{formatCompactINR(projectedAnnual)}</h3>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                            <span className="text-xs opacity-80">Confidence Score</span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded">94%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-12 gap-6">

                {/* Dynamic Churn Analysis */}
                <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-headline font-bold text-[#0b1c30]">Churn Analysis</h3>
                        <span className="material-symbols-outlined text-[#45464d] cursor-help">info</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-8">

                        {/* Recharts Doughnut */}
                        <div className="relative w-32 h-32">
                            <ResponsiveContainerComponent width="100%" height="100%">
                                <PieChartComponent>
                                    <PieComponent
                                        data={churnData}
                                        innerRadius={45}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="rate"
                                        stroke="none"
                                    >
                                        {churnData.map((entry, index) => (
                                            <CellComponent key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </PieComponent>
                                    <TooltipComponent
                                        formatter={(value: any) => [`${value}%`, 'Rate']}
                                        contentStyle={{ backgroundColor: '#0b1c30', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                                    />
                                </PieChartComponent>
                            </ResponsiveContainerComponent>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-headline font-black text-[#0b1c30]">{totalChurn.toFixed(1)}%</span>
                                <span className="text-[8px] uppercase tracking-tighter text-[#45464d]">Rate</span>
                            </div>
                        </div>

                        {/* Dynamic Legend */}
                        <div className="flex-1 w-full space-y-4">
                            {churnData.map((data) => (
                                <div key={data.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: data.color }}></div>
                                        <span className="text-xs font-medium text-[#45464d]">{data.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-[#0b1c30]">{data.rate}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dynamic Payment Success Rate */}
                <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-headline font-bold text-[#0b1c30]">Payment Success Rate</h3>
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#000000]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#000000]/30"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#000000]/30"></span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {/* Dynamic Sparkline Bars */}
                        <div className="flex items-end justify-between h-20 gap-2 px-2">
                            {paymentSuccessRates.map((rate, idx) => (
                                <div key={idx} className="flex-1 bg-[#eff4ff] rounded-t-sm w-full relative h-full group overflow-hidden">
                                    <div
                                        className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-500 ${idx === paymentSuccessRates.length - 1 ? 'bg-[#000000]' : 'bg-[#001453] opacity-60 group-hover:opacity-100'}`}
                                        style={{ height: `${rate}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center px-2">
                            <div className="flex flex-col">
                                <span className="text-2xl font-headline font-black text-[#0b1c30]">
                                    {paymentSuccessRates[paymentSuccessRates.length - 1]}%
                                </span>
                                <span className="text-[10px] text-[#45464d] font-medium mt-1">Average across all gateways</span>
                            </div>
                            <div className="text-right">
                                <button className="text-xs font-bold text-[#000000] flex items-center gap-1 hover:underline">
                                    View Log
                                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dynamic Institutional Transaction Ledger */}
            <div className="bg-[#eff4ff] rounded-xl p-4 md:p-8 shadow-sm border border-[#c6c6cd]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 className="font-headline font-bold text-xl text-[#0b1c30]">Institutional Transaction Ledger</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#45464d]">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#45464d]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#b8c4ff]"></span> Processing
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-[#c6c6cd]/20">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#f8f9ff] text-[10px] uppercase tracking-widest text-[#45464d] border-b border-[#c6c6cd]/30">
                                <th className="px-6 py-4 font-bold">Entity / Customer</th>
                                <th className="px-6 py-4 font-bold text-right">Revenue (INR)</th>
                                <th className="px-6 py-4 font-bold text-right">Taxes (INR)</th>
                                <th className="px-6 py-4 font-bold text-right">Discount (INR)</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#c6c6cd]/20">
                            {transactions.map((txn) => (
                                <tr key={txn.id} className="hover:bg-[#f8f9ff] transition-colors group">
                                    <td className="px-6 py-5 font-semibold text-[#0b1c30]">{txn.entity}</td>
                                    <td className="px-6 py-5 text-right font-headline font-bold text-[#0b1c30]">{formatINR(txn.revenue)}</td>
                                    <td className="px-6 py-5 text-right text-[#45464d] font-medium">{formatINR(txn.taxes)}</td>
                                    <td className={`px-6 py-5 text-right font-medium ${txn.discount > 0 ? 'text-[#ba1a1a]' : 'text-[#45464d]'}`}>
                                        {txn.discount > 0 ? `-${formatINR(txn.discount)}` : '₹0.00'}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${txn.status === 'Completed'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-[#e5eeff] text-[#173bab]'
                                            }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#000000] text-white rounded-full shadow-2xl shadow-[#000000]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 border border-white/10">
                <span className="material-symbols-outlined">download</span>
            </button>

        </div>
    );
}