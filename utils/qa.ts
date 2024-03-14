import { dynamics } from 'config';

export const enableQaHelpers = dynamics.enableQaHelpers;

export const overrideWithQAMockBoolean = (value: boolean, key: string) => {
  if (enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock) {
      return mock === 'true';
    }
  }
  return value;
};

export const overrideWithQAMockNumber = (value: number, key: string) => {
  if (enableQaHelpers && typeof window !== 'undefined') {
    const mock = localStorage.getItem(key);
    if (mock && !isNaN(Number(mock))) {
      return Number(mock);
    }
  }
  return value;
};
