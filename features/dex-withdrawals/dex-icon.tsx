import styled from 'styled-components';

import CowSwap from 'assets/partner/cow-swap.svg';
import { useWithdrawalDex } from './use-withdrawal-dex';

export const CowSwapIcon = styled.img.attrs({
  src: CowSwap,
  alt: '',
})`
  display: block;
`;

type DexIconProps = React.ComponentProps<typeof CowSwapIcon>;

export const DexIcon = (props: DexIconProps) => {
  const { integration } = useWithdrawalDex();

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (integration) {
    case 'cowswap':
      return <CowSwapIcon {...props} />;
    default:
      return null;
  }
};
