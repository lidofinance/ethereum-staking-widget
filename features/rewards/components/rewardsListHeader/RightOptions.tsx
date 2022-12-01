import { FC } from 'react';
import CurrencySelector from 'features/rewards/components/CurrencySelector';
import { Export } from 'features/rewards/components/export';

import { RightOptionsWrapper, ExportWrapper } from './RightOptionsStyles';
import { RightOptionsProps } from './types';

export const RightOptions: FC<RightOptionsProps> = (props) => {
  const { currency, setCurrency, address, archiveRate, onlyRewards } = props;

  return (
    <RightOptionsWrapper>
      <CurrencySelector currency={currency} onChange={setCurrency} />
      <ExportWrapper>
        <Export
          currency={currency}
          address={address}
          archiveRate={archiveRate}
          onlyRewards={onlyRewards}
        />
      </ExportWrapper>
    </RightOptionsWrapper>
  );
};
