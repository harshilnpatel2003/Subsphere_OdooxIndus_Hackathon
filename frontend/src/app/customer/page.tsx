'use client';
import React, { useState } from 'react';

// --- 1. Types & Initial Data ---
interface Customer {
    id: string;
    name: string;
    email: string;
    subscription: string;
    ltv: number;
    status: 'Active' | 'Canceled' | 'Pending Audit';
    avatarColor: string;
}

const initialCustomers: Customer[] = [
    { id: '1', name: 'Arcane Synergies Ltd.', email: 'billing@arcane.io', subscription: 'Enterprise Sovereign', ltv: 245000, status: 'Active', avatarColor: 'bg-blue-100 text-blue-700' },
    { id: '2', name: 'Novus Capital', email: 'contact@novus.cap', subscription: 'Professional Tier', ltv: 89200, status: 'Canceled', avatarColor: 'bg-purple-100 text-purple-700' },
    { id: '3', name: 'Quant Systems', email: 'ops@quantsys.com', subscription: 'Enterprise Sovereign', ltv: 1120000, status: 'Active', avatarColor: 'bg-emerald-100 text-emerald-700' },
    { id: '4', name: 'Vertex Global', email: 'finance@vertex.glob', subscription: 'Standard Ledger', ltv: 12450, status: 'Active', avatarColor: 'bg-amber-100 text-amber-700' },
];

export default function CustomersPage() {
    // --- 2. State Management ---
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Form State (used for both Add and Edit)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subscription: 'Standard Ledger',
        ltv: 0,
        status: 'Active' as Customer['status'],
    });

    // --- 3. Handlers ---
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const openAddModal = () => {
        setFormData({ name: '', email: '', subscription: 'Standard Ledger', ltv: 0, status: 'Active' });
        setIsAddModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingId(customer.id);
        setFormData({
            name: customer.name,
            email: customer.email,
            subscription: customer.subscription,
            ltv: customer.ltv,
            status: customer.status,
        });
        setIsEditModalOpen(true);
    };

    const handleSaveNew = (e: React.FormEvent) => {
        e.preventDefault();
        const newCustomer: Customer = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
            // Pick a random avatar color class for the new customer
            avatarColor: ['bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700', 'bg-teal-100 text-teal-700'][Math.floor(Math.random() * 3)],
        };
        setCustomers([newCustomer, ...customers]);
        setIsAddModalOpen(false);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        setCustomers(customers.map(c =>
            c.id === editingId ? { ...c, ...formData } : c
        ));
        setIsEditModalOpen(false);
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto text-[#0b1c30] font-body bg-[#f8f9ff] min-h-[80vh] p-4">

            {/* Hero Title / Editorial Section */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                        <nav className="flex space-x-2 text-[10px] font-bold uppercase tracking-widest text-[#45464d] mb-2">
                            <span>Directories</span>
                            <span className="text-[#76777d]">/</span>
                            <span className="text-[#b8c4ff]">Customers</span>
                        </nav>
                        <h2 className="text-4xl font-extrabold text-[#0b1c30] font-headline tracking-tighter">Customer Ledger</h2>
                        <p className="text-[#45464d] mt-2 max-w-2xl font-medium">A high-fidelity record of all active organizational entities and their fiscal commitment within the Subsphere ecosystem.</p>
                    </div>
                    <div className="flex space-x-3">
                        {/* NEW: Add Customer Button */}
                        <button onClick={openAddModal} className="bg-[#001453] text-white px-4 py-2 rounded-lg text-sm font-bold font-headline flex items-center space-x-2 transition-all hover:brightness-110 active:scale-95 shadow-md">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>add_circle</span>
                            <span>Add Customer</span>
                        </button>
                        <button className="bg-[#d3e4fe] text-[#001453] px-4 py-2 rounded-lg text-sm font-bold font-headline flex items-center space-x-2 transition-all hover:brightness-95 active:scale-95">
                            <span className="material-symbols-outlined text-sm">file_download</span>
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bento Filter Bar */}
            <div className="grid grid-cols-12 gap-4 mb-8">

                {/* Search & Filter Controls */}
                <div className="col-span-12 lg:col-span-8 bg-[#eff4ff] p-4 rounded-xl flex items-center space-x-4">
                    <div className="flex-1 flex items-center bg-[#ffffff] rounded-lg px-3 py-1.5 border border-[#c6c6cd]/30 shadow-sm">
                        <span className="material-symbols-outlined text-[#45464d] text-lg mr-2">filter_list</span>
                        <select className="bg-transparent border-none text-sm font-semibold text-[#0b1c30] focus:ring-0 p-0 pr-8 w-full outline-none appearance-none">
                            <option>All Statuses</option>
                            <option>Active Only</option>
                            <option>Canceled</option>
                            <option>Pending Audit</option>
                        </select>
                    </div>
                    <div className="flex-1 flex items-center bg-[#ffffff] rounded-lg px-3 py-1.5 border border-[#c6c6cd]/30 shadow-sm hidden md:flex">
                        <span className="material-symbols-outlined text-[#45464d] text-lg mr-2">layers</span>
                        <select className="bg-transparent border-none text-sm font-semibold text-[#0b1c30] focus:ring-0 p-0 pr-8 w-full outline-none appearance-none">
                            <option>All Subscription Plans</option>
                            <option>Enterprise Sovereign</option>
                            <option>Professional Tier</option>
                            <option>Standard Ledger</option>
                        </select>
                    </div>
                    <div className="h-8 w-px bg-[#c6c6cd]/50 mx-2 hidden md:block"></div>
                    <button className="text-[#001453] text-xs font-bold uppercase tracking-widest hover:underline px-2 hidden md:block">Clear Filters</button>
                </div>

                {/* Snapshot Metrics */}
                <div className="col-span-12 lg:col-span-4 bg-[#001453] p-4 rounded-xl flex items-center justify-around overflow-hidden relative group shadow-lg">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8c4ff] mb-1 leading-none">Total Directory Value</p>
                        <p className="text-2xl font-extrabold text-white font-headline tracking-tight leading-none">
                            {/* Dynamic total calculation based on state! */}
                            ${(customers.reduce((sum, c) => sum + c.ltv, 0) / 1000000).toFixed(2)}M
                        </p>
                    </div>
                    <div className="h-8 w-px bg-white/20 relative z-10"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8c4ff] mb-1 leading-none">Active Growth</p>
                        <p className="text-2xl font-extrabold text-[#fcdeb5] font-headline tracking-tight leading-none">+12.4%</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#001453] to-[#0b1c30] opacity-80"></div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-[#ffffff] rounded-xl shadow-sm overflow-hidden border border-[#c6c6cd]/30">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-[#eff4ff] border-b border-[#c6c6cd]/30">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#45464d]">Customer Entity</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#45464d]">Primary Subscription</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#45464d] text-right">Lifetime Value (LTV)</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#45464d] text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.05em] text-[#45464d] text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c6c6cd]/20">

                            {/* Dynamic Rows */}
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-[#f8f9ff] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-headline font-bold text-lg overflow-hidden ${customer.avatarColor}`}>
                                                {/* If no image, show first letter of name */}
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#0b1c30] leading-none">{customer.name}</p>
                                                <p className="text-[11px] text-[#45464d] mt-1.5">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#eff4ff] text-[#001453] uppercase tracking-tight border border-[#dce9ff]">
                                            {customer.subscription}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-headline font-extrabold text-[#0b1c30]">
                                            {formatCurrency(customer.ltv)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    customer.status === 'Canceled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500' :
                                                        customer.status === 'Canceled' ? 'bg-red-500' :
                                                            'bg-amber-500'
                                                    }`}></span>
                                                <span>{customer.status}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEditModal(customer)}
                                            className="p-1.5 rounded-md text-[#45464d] hover:bg-[#eff4ff] hover:text-[#001453] transition-all"
                                            title="Edit Customer"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-[#eff4ff] px-6 py-4 border-t border-[#c6c6cd]/30 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-widest">Displaying {customers.length} Entries</p>
                    <div className="flex space-x-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#c6c6cd]/50 text-[#45464d] hover:bg-[#ffffff] transition-all bg-transparent">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#001453] bg-[#001453] text-white font-bold text-[11px]">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded border border-[#c6c6cd]/50 text-[#45464d] hover:bg-[#ffffff] transition-all bg-transparent">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* ADD / EDIT MODAL OVERLAY */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="bg-[#001453] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-headline font-bold text-lg">
                                {isAddModalOpen ? 'Add New Customer' : 'Edit Customer Record'}
                            </h3>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={isAddModalOpen ? handleSaveNew : handleSaveEdit} className="p-6 space-y-4">

                            <div>
                                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-1.5">Entity Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#001453]/30 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-1.5">Contact Email</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#001453]/30 focus:bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-1.5">Subscription</label>
                                    <select
                                        value={formData.subscription}
                                        onChange={e => setFormData({ ...formData, subscription: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#001453]/30 focus:bg-white"
                                    >
                                        <option value="Enterprise Sovereign">Enterprise Sovereign</option>
                                        <option value="Professional Tier">Professional Tier</option>
                                        <option value="Standard Ledger">Standard Ledger</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Customer['status'] })}
                                        className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded-lg text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#001453]/30 focus:bg-white"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Pending Audit">Pending Audit</option>
                                        <option value="Canceled">Canceled</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#45464d] uppercase tracking-widest mb-1.5">Lifetime Value ($)</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.ltv}
                                    onChange={e => setFormData({ ...formData, ltv: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c6c6cd]/50 rounded-lg text-sm text-[#0b1c30] font-bold focus:outline-none focus:ring-2 focus:ring-[#001453]/30 focus:bg-white"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-[#c6c6cd]/20 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="px-5 py-2.5 text-sm font-bold text-[#45464d] hover:bg-[#eff4ff] rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-[#001453] hover:bg-[#173bab] rounded-lg shadow-md transition-all active:scale-95"
                                >
                                    {isAddModalOpen ? 'Create Customer' : 'Save Changes'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}