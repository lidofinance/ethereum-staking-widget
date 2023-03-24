import { ComponentProps, FC, InputHTMLAttributes } from 'react';
import { Checkbox, External } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { getNFTUrl } from 'utils';

import {
  RequestStyled,
  RequestsStatusStyled,
  InlineLoaderStyled,
  LinkStyled,
} from './styles';

type RequestItemProps = InputHTMLAttributes<HTMLElement> & {
  status: 'pending' | 'ready' | 'loading';
  label: string;
  outerStyle: ComponentProps<'div'>['style'];
  onSelectToken?: (tokenId: string, value: boolean) => void;
  tokenId: string;
};

export const Request: FC<RequestItemProps> = ({
  status,
  children,
  onSelectToken,
  outerStyle,
  tokenId,
  ...rest
}) => {
  const { chainId } = useSDK();
  const isReady = status === 'ready';
  const isLoading = status === 'loading';
  const statusText = isReady ? 'Ready to claim' : 'Pending';

  return (
    <RequestStyled pending={isLoading} disabled={!isReady} style={outerStyle}>
      <Checkbox
        {...rest}
        disabled={!isReady}
        onChange={(e) => onSelectToken?.(tokenId, e.currentTarget.checked)}
      />
      {isLoading ? (
        <InlineLoaderStyled />
      ) : (
        <>
          <RequestsStatusStyled $variant={status}>
            {statusText}
          </RequestsStatusStyled>
          <LinkStyled href={getNFTUrl(chainId, tokenId)}>
            <External />
          </LinkStyled>
        </>
      )}
    </RequestStyled>
  );
};
