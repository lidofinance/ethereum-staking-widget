import { useMemo } from 'react';
import { DataTableRow, Link } from '@lidofinance/lido-ui';
import invariant from 'tiny-invariant';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { getEtherscanTokenLink } from 'utils/etherscan';
import { Section } from 'shared/components';
import {
  VaultDetails,
  VaultDetailsItem,
} from 'features/earn/shared/vault-details';
import { getGGVVaultContract } from '../../contracts';

export const GGVVaultDetails = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const chainId = publicClientMainnet?.chain?.id;

  invariant(publicClientMainnet, 'Public client is not available');
  invariant(chainId, 'Chain ID is not available');

  const ggvVault = getGGVVaultContract(publicClientMainnet);

  const etherscanLink = useMemo(() => {
    return getEtherscanTokenLink(chainId, ggvVault.address);
  }, [chainId, ggvVault.address]);

  return (
    <Section
      title="Vault details"
      headerDecorator={
        <Link href={etherscanLink} data-testid="statEtherscanBtn">
          View on Etherscan
        </Link>
      }
    >
      <VaultDetails>
        <VaultDetailsItem
          title="Vault Created"
          tooltipText="The date when the vault contract was deployed."
        >
          22 May 2025
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Deposit Period"
          tooltipText="The expected time it takes for deposit requests to be processed and fully reflected in the vault."
        >
          Immediately (with 24h lock on withdrawals)
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Withdraw Period"
          tooltipText="The expected time it takes for withdrawal requests to be processed and tokens to become available."
        >
          ~3 days
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Performance fee"
          tooltipText="The share of yield deducted from gains before they are reflected in the token price."
        >
          10%
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Platform fee"
          tooltipText="The annual, pro-rated fee applied for the duration that tokens remain in the vault. The fee is reflected in the token’s share price."
        >
          1%
        </VaultDetailsItem>
        <DataTableRow
          title={
            <Link href={`https://debank.com/profile/${ggvVault.address}`}>
              View on DeBank
            </Link>
          }
        />
      </VaultDetails>
    </Section>
  );
};
