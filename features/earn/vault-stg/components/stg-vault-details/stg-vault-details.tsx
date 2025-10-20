import { useMemo } from 'react';
import { DataTableRow, Link } from '@lidofinance/lido-ui';
import { usePublicClient } from 'wagmi';
import invariant from 'tiny-invariant';
import { useDappStatus } from 'modules/web3';
import { getEtherscanTokenLink } from 'utils/etherscan';
import { Section } from 'shared/components';
import {
  VaultDetails,
  VaultDetailsItem,
} from 'features/earn/shared/vault-details';
import { getSTGVaultContract } from '../../contracts';

export const STGVaultDetails = () => {
  const { chainId } = useDappStatus();
  const publicClient = usePublicClient();

  // eslint-disable-next-line no-console
  console.log('--- DEBUG chainId', chainId);

  invariant(publicClient, 'Public client is not available');

  const stgVault = getSTGVaultContract(publicClient);

  const etherscanLink = useMemo(() => {
    return getEtherscanTokenLink(chainId, stgVault.address);
  }, [chainId, stgVault.address]);

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
          19 Sept 2025
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Deposit Period"
          tooltipText="The expected time it takes for deposit requests to be processed and fully reflected in the vault."
        >
          ~24 hours
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Withdraw Period"
          tooltipText="The expected time it takes for withdrawal requests to be processed and tokens to become available."
        >
          ~2 days
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
            <Link href="https://debank.com/bundles/218444/portfolio">
              View on DeBank
            </Link>
          }
        />
      </VaultDetails>
    </Section>
  );
};
