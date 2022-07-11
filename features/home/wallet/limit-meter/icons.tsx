import limitSafeIconSource from 'assets/icons/limit-safe.svg';
import limitWarnIconSource from 'assets/icons/limit-warn.svg';
import limitReachedIconSource from 'assets/icons/limit-reached.svg';
import Image from 'next/image';

export const LimitSafeIcon = () => (
  <Image src={limitSafeIconSource} width="16" height="16" />
);

export const LimitWarnIcon = () => (
  <Image src={limitWarnIconSource} width="16" height="16" />
);

export const LimitReachedIcon = () => (
  <Image src={limitReachedIconSource} width="16" height="16" />
);
