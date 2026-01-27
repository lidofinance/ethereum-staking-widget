import { useDappStatus } from 'modules/web3';

import {
  UpgradeAssets,
  UpgradeAssetsText,
  UpgradeAssetsRow,
  UpgradeAssetsAmount,
  UpgradeAssetsButton,
  UpgradeAssetsIcon,
} from './styles';

export const UpgradeAssetsBlock = () => {
  const { isWalletConnected } = useDappStatus();

  if (!isWalletConnected) return null;

  return (
    <UpgradeAssets>
      <UpgradeAssetsText>
        <h4>Assets available to upgrade</h4>
        <p>From legacy Lido vaults into Lido Earn ETH</p>
      </UpgradeAssetsText>
      <UpgradeAssetsRow>
        <UpgradeAssetsAmount>
          <UpgradeAssetsIcon />
          {123}
        </UpgradeAssetsAmount>
        <UpgradeAssetsButton size="xs">Upgrade</UpgradeAssetsButton>
      </UpgradeAssetsRow>
    </UpgradeAssets>
  );
};
