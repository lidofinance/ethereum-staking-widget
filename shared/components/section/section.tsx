import React from 'react';
import { Component } from 'types';
import {
  SectionStyle,
  SectionHeaderStyle,
  SectionTitleStyle,
  SectionHeaderDecoratorStyle,
  SectionContentStyle,
} from './styles';

type SectionComponent = Component<
  'section',
  {
    title?: React.ReactNode;
    headerDecorator?: React.ReactNode;
    $noMargin?: boolean;
  }
>;

export const Section: SectionComponent = (props) => {
  const { title, headerDecorator, $noMargin, children, ...rest } = props;
  const hasDecorator = !!headerDecorator;

  return (
    <SectionStyle $noMargin={!title || $noMargin} {...rest}>
      {(title || headerDecorator) && (
        <SectionHeaderStyle>
          {title && <SectionTitleStyle>{title}</SectionTitleStyle>}
          {hasDecorator && (
            <SectionHeaderDecoratorStyle>
              {headerDecorator}
            </SectionHeaderDecoratorStyle>
          )}
        </SectionHeaderStyle>
      )}
      <SectionContentStyle>{children}</SectionContentStyle>
    </SectionStyle>
  );
};
