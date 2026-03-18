import type { WhaleBannerConfig } from './types';

type WhaleBannerProps = {
  config: WhaleBannerConfig;
};

// Placeholder banner component – replace with your own design
export const WhaleBanner = ({ config }: WhaleBannerProps) => {
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        marginTop: '12px',
      }}
    >
      <p style={{ fontWeight: 'bold', margin: '0 0 8px' }}>{config.heading}</p>
      <p style={{ margin: '0 0 12px', fontSize: '14px' }}>{config.body}</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {config.ctas.map((cta) => (
          <a
            key={cta.href}
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#00a3ff',
              color: '#fff',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            {cta.text}
          </a>
        ))}
      </div>
    </div>
  );
};
