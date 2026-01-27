import { FC } from 'react';
import { Close, Button } from '@lidofinance/lido-ui';

import { useEscape } from 'features/new-earn/hooks/useEscape';

import {
  DrawerRightStyled,
  DrawerRightContent,
  DrawerRightWrapper,
  DrawerRightHeader,
  DrawerDescription,
  DrawerRightClose,
  DrawerRightFooter,
} from './styles';
import { LocalLink } from 'shared/components/local-link';

import { DrawerTable } from './drawer-table';

type DrawerRightProps = {
  onClose: () => void;
  isOpen: boolean;
};

const EARN_NEW_ETH_VAULT_PATH = '/earn-new/eth';

export const DrawerRight: FC<DrawerRightProps> = ({ onClose, isOpen }) => {
  const { handleKeyDown } = useEscape({ onClose });

  return (
    <DrawerRightStyled onKeyDown={handleKeyDown} tabIndex={-1} isOpen={isOpen}>
      <DrawerRightWrapper>
        <DrawerRightContent>
          <DrawerRightClose
            icon={<Close />}
            size="xxs"
            variant="ghost"
            onClick={onClose}
          />
          <DrawerRightHeader>
            What is Lido Earn ETH Vault and how it works
          </DrawerRightHeader>
          <DrawerDescription>
            Lido Earn ETH Vault is a «meta-vault» that optimise rewards across
            Lido Earn products, today it&apos;s GGV and stRATEGY, but we plan to
            adapt strategies setup to reflect market situation and provide you
            with the best ballance of risk/reward for the ETH-denominated
            assets. Meta-vaults are future-proof and helps you to avoid choosing
            and switching between different available options of
            strategies/vaults.
          </DrawerDescription>
          <DrawerTable />
          <DrawerRightFooter>
            <LocalLink href={EARN_NEW_ETH_VAULT_PATH}>
              <Button fullwidth>Upgrade now</Button>
            </LocalLink>
            <Button fullwidth variant="outlined">
              Ask the Earn team
            </Button>
          </DrawerRightFooter>
        </DrawerRightContent>
      </DrawerRightWrapper>
    </DrawerRightStyled>
  );
};
