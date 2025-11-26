import { Link } from '@lidofinance/lido-ui';
import { config } from 'config';

export const LegalDisclaimer = () => (
  <div data-testid="legal-disclaimer">
    <p>
      Your privacy matters. We use cookieless analytics and collect only
      anonymized data for improvements. Cookies are used for functionality only.
      For more info read{' '}
      <Link href={`${config.rootOrigin}/privacy-notice`}>Privacy Notice</Link>.
    </p>
  </div>
);
