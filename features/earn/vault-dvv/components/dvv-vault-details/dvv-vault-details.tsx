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
import { getDVVVaultContract } from '../../contracts';

export const DVVVaultDetails = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  const chainId = publicClientMainnet?.chain?.id;

  invariant(publicClientMainnet, 'Public client is not available');
  invariant(chainId, 'Chain ID is not available');

  const dvvVault = getDVVVaultContract(publicClientMainnet);

  const etherscanLink = useMemo(() => {
    return getEtherscanTokenLink(chainId, dvvVault.address);
  }, [chainId, dvvVault.address]);

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
          02 Aug 2024
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Deposit Period"
          tooltipText="The expected time it takes for deposit requests to be processed and fully reflected in the vault."
        >
          Immediately
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Withdraw Period"
          tooltipText="The expected time it takes for withdrawal requests to be processed and tokens to become available."
        >
          Immediately
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Performance fee"
          tooltipText="The share of yield deducted from gains before they are reflected in the token price."
        >
          0%
        </VaultDetailsItem>
        <VaultDetailsItem
          title="Platform fee"
          tooltipText="The annual, pro-rated fee applied for the duration that tokens remain in the vault. The fee is reflected in the token’s share price."
        >
          0%
        </VaultDetailsItem>
        <DataTableRow
          title={
            <Link href={`https://debank.com/profile/${dvvVault.address}`}>
              View on DeBank
            </Link>
          }
        />
      </VaultDetails>
    </Section>
  );
};
