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
  }
>;

export const Section: SectionComponent = (props) => {
  const { title, headerDecorator, children, ...rest } = props;
  const hasDecorator = !!headerDecorator;

  return (
    <SectionStyle {...rest}>
      <SectionHeaderStyle>
        <SectionTitleStyle>{title}</SectionTitleStyle>
        {hasDecorator && (
          <SectionHeaderDecoratorStyle>
            {headerDecorator}
          </SectionHeaderDecoratorStyle>
        )}
      </SectionHeaderStyle>
      <SectionContentStyle>{children}</SectionContentStyle>
    </SectionStyle>
  );
};
