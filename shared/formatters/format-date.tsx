import { memo } from 'react';
import { Component } from 'types';

import { getConfig } from 'config';
const { LOCALE } = getConfig();

export type FormatDateComponent = Component<'time', { timeStamp: number }>;
export const FormatDate: FormatDateComponent = memo((props) => {
  const { timeStamp, ...rest } = props;

  const date = new Date(timeStamp);
  const value = date.toLocaleString(LOCALE, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <time dateTime={date.toISOString()} {...rest}>
      {value}
    </time>
  );
});
