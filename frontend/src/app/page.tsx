'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import PortalNav from '@/components/PortalNav';
import Link from 'next/link';
import { formatINR } from '@/lib/formatters';

export default function HomePage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <PortalNav />

      {/* Hero Section */}
      <section style={{ 
        padding: '120px 40px 100px', 
        textAlign: 'center', 
        background: 'linear-gradient(180deg, var(--primary-container) 0%, var(--surface) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle mesh background effect could go here */}
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <span className="label-lg" style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '24px', display: 'block' }}>
                Next-Gen Infrastructure
            </span>
            <h1 className="display-md" style={{ letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '24px' }}>
                The Architectural Standard for <br/> 
                <span style={{ color: 'var(--primary)' }}>Scale and Precision.</span>
            </h1>
            <p className="body-lg text-muted" style={{ maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                Experience functional sophistication with SubSphere — the architectural standard <br/>
                for enterprise subscription management and modern ecosystem infrastructure.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link href="/shop" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem', boxShadow: 'var(--shadow-lg)' }}>
                    Explore Catalog
                </Link>
                <Link href="/login" className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                    Access Ledger
                </Link>
            </div>
        </div>

        {/* Decorative shadow line */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'var(--outline-variant)', opacity: 0.3 }} />
      </section>

      {/* Value Proposition */}
      <section style={{ padding: '100px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '100px' }}>
            {[
                { icon: 'speed', title: 'Real-time Sync', desc: 'Financial transactions mirror your ledger with sub-millisecond latency.' },
                { icon: 'security', title: 'Enterprise Guard', desc: 'Compliant architectural standards built for high-stakes operations.' },
                { icon: 'auto_graph', title: 'Global Scaling', desc: 'Seamlessly distribute architectural infrastructure across regions.' }
            ].map((item, i) => (
                <div key={i} style={{ textAlign: 'left', padding: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-container-lowest)', border: '1px solid var(--surface-container)' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '28px' }}>{item.icon}</span>
                    </div>
                    <h3 className="headline-sm">{item.title}</h3>
                    <p className="body-md text-muted" style={{ marginTop: '8px' }}>{item.desc}</p>
                </div>
            ))}
        </div>

        {/* Popular Plans Section */}
        <div style={{ marginBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 className="headline-md">Enterprise Plans</h2>
                    <p className="body-md text-muted">Select a billing structure tailored to your enterprise scale.</p>
                </div>
                <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    View All Plans <span className="material-icons" style={{ fontSize: '18px' }}>arrow_forward</span>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {plans.map(p => (
                <div key={p.id} className="card" style={{ padding: '40px', border: '1px solid var(--surface-container)', display: 'flex', flexDirection: 'column' }}>
                    <div className="label-lg" style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>{p.billing_period}</div>
                    <h3 className="headline-sm" style={{ marginBottom: '8px' }}>{p.name}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        {formatINR(p.price)}
                        <span className="label-lg" style={{ color: 'var(--on-surface-variant)', fontWeight: 400 }}> / {p.billing_period}</span>
                    </div>
                    
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--on-tertiary-container)' }}>done</span>
                            Standard Enterprise Nodes
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                            <span className="material-icons" style={{ fontSize: '18px', color: 'var(--on-tertiary-container)' }}>done</span>
                            Min Quantity: {p.min_quantity} units
                        </li>
                    </ul>

                    <Link href="/shop" className="btn btn-primary" style={{ marginTop: 'auto', justifyContent: 'center', padding: '14px' }}>
                        Analyze Structure
                    </Link>
                </div>
            ))}
            {loading && plans.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>Synchronizing ecosystem metadata...</div>
            )}
            </div>
        </div>

        {/* Featured Products */}
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h2 className="headline-md">Inventory Registry</h2>
                    <p className="body-md text-muted">A curated selection of our physical and service assets.</p>
                </div>
                <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Access Full Registry <span className="material-icons" style={{ fontSize: '18px' }}>arrow_forward</span>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {products.map(p => (
                <div key={p.id} className="card" style={{ padding: '16px', cursor: 'pointer' }}>
                    <div style={{ 
                        height: '240px', background: 'var(--surface-container-low)', 
                        borderRadius: 'var(--radius-md)', marginBottom: '16px',
                        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {p.photo ? (
                        <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                        <span className="material-icons" style={{ fontSize: '48px', color: 'var(--outline-variant)' }}>inventory_2</span>
                        )}
                    </div>
                    <div style={{ padding: '0 8px 8px' }}>
                        <div className="label-sm" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', padding: '2px 10px', borderRadius: '12px', display: 'inline-block', marginBottom: '8px', fontWeight: 600 }}>{p.product_type}</div>
                        <h3 className="title-lg" style={{ marginBottom: '8px' }}>{p.name}</h3>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{formatINR(p.sales_price)}</div>
                    </div>
                </div>
            ))}
            </div>
        </div>
      </section>

      {/* Standard Footer Area */}
      <footer style={{ background: 'var(--on-surface)', color: 'var(--surface-container-lowest)', padding: '80px 40px 40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '100px', paddingBottom: '60px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '20px' }}>SubSphere</h3>
                    <p style={{ opacity: 0.5, lineHeight: 1.6 }}>The SubSphere architectural standard for subscription management and financial infrastructure automation. Built for high-frequency enterprise scaling.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                    {[
                        { label: 'Ecosystem', links: ['Marketplace', 'Cloud Ledger', 'API Registry'] },
                        { label: 'Governance', links: ['Standard Terms', 'Privacy Protocol', 'Security'] },
                        { label: 'Network', links: ['Operations', 'Support Gateway', 'Status'] }
                    ].map((group, i) => (
                        <div key={i}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.label}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {group.links.map(l => (
                                    <Link key={l} href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem' }}>{l}</Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                <p style={{ fontSize: '0.75rem', opacity: 0.3 }}>© 2026 SubSphere Architectural Infrastructure. All protocols observed.</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    {['X', 'GitHub', 'LinkedIn'].map(social => (
                        <span key={social} style={{ fontSize: '0.75rem', opacity: 0.3, cursor: 'pointer' }}>{social}</span>
                    ))}
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
