import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {(title || actions) && (
          <header style={{
            padding: '28px 32px 0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div>
              {title && (
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.015em', lineHeight: 1.2 }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{ marginTop: 6, fontSize: '0.875rem', color: 'var(--on-surface-variant)', maxWidth: 560 }}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{actions}</div>}
          </header>
        )}
        <div style={{ padding: '24px 32px 48px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
