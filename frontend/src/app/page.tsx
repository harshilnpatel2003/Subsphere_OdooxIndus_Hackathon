'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import Link from 'next/link';
import { formatINR } from '@/lib/formatters';
import Cookies from 'js-cookie';

export default function HomePage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = Cookies.get('access');
        setIsLoggedIn(!!token);

        setLoading(true);
        Promise.all([
            api.get('/plans/'),
            api.get('/products/?limit=4')
        ]).then(([pRes, prodRes]) => {
            setPlans(pRes.data.slice(0, 3));
            setProducts(prodRes.data);
        }).catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ background: 'var(--surface)', minHeight: '100vh', color: 'var(--on-surface)' }}>
            <PortalNav />

            {/* Hero Section - Refined with better typography and spacing */}
            <section style={{
                padding: '140px 40px 120px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, var(--primary-container) 0%, var(--surface) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <span className="label-lg" style={{
                        color: 'var(--primary)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '32px',
                        display: 'block',
                        opacity: 0.8
                    }}>
                        Next-Gen Infrastructure
                    </span>
                    <h1 className="display-lg" style={{ letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '28px' }}>
                        The Architectural Standard for <br />
                        <span style={{ color: 'var(--primary)' }}>Scale and Precision.</span>
                    </h1>
                    <p className="body-lg text-muted" style={{ maxWidth: '680px', margin: '0 auto 48px', lineHeight: 1.6, fontSize: '1.25rem' }}>
                        Access functional sophistication with SubSphere — the architectural standard
                        for enterprise subscription management and modern ecosystem infrastructure.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link href="/shop" className="btn btn-primary" style={{ padding: '18px 42px', fontSize: '1rem', fontWeight: 700, boxShadow: 'var(--shadow-lg)' }}>
                            Explore Catalog
                        </Link>

                        {isLoggedIn ? (
                            <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '18px 42px', fontSize: '1rem', fontWeight: 700, border: '1px solid var(--outline-variant)' }}>
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="btn btn-secondary" style={{ padding: '18px 42px', fontSize: '1rem', fontWeight: 700, border: '1px solid var(--outline-variant)' }}>
                                Access Ledger
                            </Link>
                        )}
                    </div>
                </div>

                {/* Aesthetic bottom border line */}
                <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '1px', background: 'var(--outline-variant)', opacity: 0.2 }} />
            </section>

            {/* Value Proposition - Improved Card Design */}
            <section style={{ padding: '100px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '120px' }}>
                    {[
                        { icon: 'speed', title: 'Real-time Sync', desc: 'Financial transactions mirror your ledger with sub-millisecond latency.' },
                        { icon: 'security', title: 'Enterprise Guard', desc: 'Compliant architectural standards built for high-stakes operations.' },
                        { icon: 'auto_graph', title: 'Global Scaling', desc: 'Seamlessly distribute architectural infrastructure across regions.' }
                    ].map((item, i) => (
                        <div key={i} className="card-hover" style={{
                            textAlign: 'left',
                            padding: '40px',
                            borderRadius: 'var(--radius-xl)',
                            background: 'var(--surface-container-lowest)',
                            border: '1px solid var(--surface-container-high)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                        }}>
                            <div style={{ width: 64, height: 64, borderRadius: '20px', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
                                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '32px' }}>{item.icon}</span>
                            </div>
                            <h3 className="headline-sm" style={{ fontWeight: 800 }}>{item.title}</h3>
                            <p className="body-md text-muted" style={{ marginTop: '12px', lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Enterprise Plans - Enhanced Visual Distinction */}
                <div style={{ marginBottom: '120px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px' }}>
                        <div>
                            <h2 className="headline-md" style={{ fontWeight: 900 }}>Enterprise Plans</h2>
                            <p className="body-lg text-muted">Select a billing structure tailored to your enterprise scale.</p>
                        </div>
                        <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid transparent', paddingBottom: '4px' }}>
                            View All Plans <span className="material-icons" style={{ fontSize: '20px' }}>arrow_forward</span>
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
                        {plans.map(p => (
                            <div key={p.id} className="card" style={{
                                padding: '48px',
                                border: '1px solid var(--surface-container-high)',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 'var(--radius-xl)',
                                background: 'var(--surface-container-low)'
                            }}>
                                <div className="label-lg" style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.1em' }}>{p.billing_period}</div>
                                <h3 className="headline-sm" style={{ marginBottom: '12px', fontWeight: 800 }}>{p.name}</h3>
                                <div style={{ fontSize: '3rem', fontWeight: 950, letterSpacing: '-0.04em', marginBottom: '32px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                    {formatINR(p.price)}
                                    <span className="body-md" style={{ color: 'var(--on-surface-variant)', fontWeight: 500, opacity: 0.6 }}> / {p.billing_period}</span>
                                </div>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                                        <span className="material-icons" style={{ fontSize: '20px', color: 'var(--primary)' }}>check_circle</span>
                                        Standard Enterprise Nodes
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem' }}>
                                        <span className="material-icons" style={{ fontSize: '20px', color: 'var(--primary)' }}>check_circle</span>
                                        Min Quantity: {p.min_quantity} units
                                    </li>
                                </ul>

                                <Link href="/shop" className="btn btn-primary" style={{ marginTop: 'auto', justifyContent: 'center', padding: '16px', fontWeight: 700 }}>
                                    Analyze Structure
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Products - Refined Grid and Typography */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px' }}>
                        <div>
                            <h2 className="headline-md" style={{ fontWeight: 900 }}>Inventory Registry</h2>
                            <p className="body-lg text-muted">A curated selection of our physical and service assets.</p>
                        </div>
                        <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Access Full Registry <span className="material-icons" style={{ fontSize: '20px' }}>arrow_forward</span>
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                        {products.map(p => (
                            <div key={p.id} className="card-hover" style={{
                                padding: '20px',
                                cursor: 'pointer',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--surface-container)',
                                background: 'var(--surface-container-lowest)'
                            }}>
                                <div style={{
                                    height: '260px',
                                    background: 'var(--surface-container-low)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '20px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {p.photo ? (
                                        <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span className="material-icons" style={{ fontSize: '56px', color: 'var(--outline-variant)', opacity: 0.5 }}>inventory_2</span>
                                    )}
                                </div>
                                <div style={{ padding: '0 8px 12px' }}>
                                    <div className="label-sm" style={{
                                        background: 'var(--primary-container)',
                                        color: 'var(--on-primary-container)',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        display: 'inline-block',
                                        marginBottom: '12px',
                                        fontWeight: 700,
                                        fontSize: '0.7rem'
                                    }}>
                                        {p.product_type}
                                    </div>
                                    <h3 className="title-lg" style={{ marginBottom: '8px', fontWeight: 700 }}>{p.name}</h3>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>{formatINR(p.sales_price)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer Area - Dark and Professional */}
            <footer style={{ background: '#0a0a0a', color: '#ffffff', padding: '100px 40px 60px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '120px', paddingBottom: '80px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div>
                            <h3 style={{ fontSize: '1.8rem', fontWeight: 950, marginBottom: '24px', letterSpacing: '-0.5px' }}>SubSphere</h3>
                            <p style={{ opacity: 0.5, lineHeight: 1.8, fontSize: '1rem' }}>
                                The SubSphere architectural standard for subscription management and financial infrastructure automation.
                                Built for high-frequency enterprise scaling and compliant ecosystem orchestration.
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                            {[
                                { label: 'Ecosystem', links: ['Marketplace', 'Cloud Ledger', 'API Registry'] },
                                { label: 'Governance', links: ['Standard Terms', 'Privacy Protocol', 'Security'] },
                                { label: 'Network', links: ['Operations', 'Support Gateway', 'Status'] }
                            ].map((group, i) => (
                                <div key={i}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)' }}>{group.label}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {group.links.map(l => (
                                            <Link key={l} href="#" style={{ color: '#fff', opacity: 0.4, textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.2s' }}>{l}</Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px' }}>
                        <p style={{ fontSize: '0.8rem', opacity: 0.3, fontWeight: 500 }}>© 2026 SubSphere Architectural Infrastructure. All protocols observed.</p>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            {['X', 'GitHub', 'LinkedIn'].map(social => (
                                <span key={social} style={{ fontSize: '0.85rem', opacity: 0.4, cursor: 'pointer', fontWeight: 600 }}>{social}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}