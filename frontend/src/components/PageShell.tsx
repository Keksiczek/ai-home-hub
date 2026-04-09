import type { ReactNode } from 'react';

interface PageShellProps {
  /** One or two sentences describing what this section does. */
  description?: string;
  /** Primary action button shown top-right. */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Consistent page wrapper: optional description row + main content area.
 * The topbar already shows the page title; PageShell adds the description
 * and optional CTA so every section has the same structural pattern.
 */
export function PageShell({ description, action, children }: PageShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {(description || action) && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: action ? 'space-between' : 'flex-start',
          gap: '16px',
          flexShrink: 0,
        }}>
          {description && (
            <p style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              flex: 1,
            }}>
              {description}
            </p>
          )}
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
