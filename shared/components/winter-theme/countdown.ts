import { GREETING_DAYS, getNextNewYear } from './constants';

const pad = (n: number) => String(n).padStart(2, '0');

export type CountdownState =
  { kind: 'countdown'; label: string } | { kind: 'greeting'; label: string };

export const getCountdownState = (now: Date): CountdownState => {
  // early January: greet instead of counting to the next year
  if (now.getMonth() === 0 && now.getDate() <= GREETING_DAYS) {
    return { kind: 'greeting', label: `Happy New Year ${now.getFullYear()}!` };
  }

  let left = Math.max(
    0,
    Math.floor((getNextNewYear(now).getTime() - now.getTime()) / 1000),
  );
  const days = Math.floor(left / 86400);
  left -= days * 86400;
  const hours = Math.floor(left / 3600);
  left -= hours * 3600;
  const minutes = Math.floor(left / 60);
  const seconds = left - minutes * 60;

  return {
    kind: 'countdown',
    label: `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
};
