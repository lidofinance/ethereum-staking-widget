import { FC, ReactNode } from 'react';
import { AppProps } from 'next/app';

export type ComponentProps<
  T extends keyof JSX.IntrinsicElements,
  P extends Record<string, unknown> = { children?: ReactNode },
> = Omit<JSX.IntrinsicElements[T], 'ref' | 'key' | keyof P> & P;

export type Component<
  T extends keyof JSX.IntrinsicElements,
  P extends Record<string, unknown> = { children?: ReactNode },
> = FC<ComponentProps<T, P>>;

export type Override<
  T extends Record<string, unknown>,
  P extends Record<string, unknown>,
> = Omit<T, keyof P> & P;

// Probably will come in handy later, id not - just delete and use `AppProps`
export type AppWrapperProps = AppProps; // & {};

export type AppWrapperType = FC<AppWrapperProps>;
