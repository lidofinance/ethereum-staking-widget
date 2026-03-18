import invariant from 'tiny-invariant';
import { parseEther } from 'viem';
import { config } from 'config';

export const overrideWithQAMockBoolean = (value: boolean, key: string) => {
  if (config.enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock) {
      return mock === 'true';
    }
  }
  return value;
};

export const overrideWithQAMockNumber = (value: number, key: string) => {
  if (config.enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock && !isNaN(Number(mock))) {
      return Number(mock);
    }
  }
  return value;
};

export const overrideWithQAMockString = (value: string, key: string) => {
  if (config.enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock) {
      return mock;
    }
  }
  return value;
};

export const overrideWithQAMockBigInt = (value: bigint, key: string) => {
  if (config.enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock) {
      try {
        return BigInt(mock);
      } catch {
        invariant(false, `Invalid BigInt QA mock for key "${key}": "${mock}"`);
      }
    }
  }
  return value;
};

// Accepts ETH value as a decimal string (e.g. "200") for QA ergonomics
export const overrideWithQAMockEther = (
  value: bigint | undefined,
  key: string,
): bigint | undefined => {
  if (config.enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock) {
      try {
        return parseEther(mock);
      } catch {
        invariant(false, `Invalid ETH QA mock for key "${key}": "${mock}"`);
      }
    }
  }
  return value;
};

export const overrideWithQAMockArray = <TArrayElement>(
  value: TArrayElement[],
  key: string,
): TArrayElement[] => {
  if (config.enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock) {
      const array = JSON.parse(mock);
      if (Array.isArray(array)) return array;
    }
  }
  return value;
};
