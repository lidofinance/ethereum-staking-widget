import { FC } from 'react';
import { Close, Button, Link } from '@lidofinance/lido-ui';

import { useEscape } from 'shared/hooks/useEscape';

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
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';

type DrawerRightProps = {
  onClose: () => void;
  isOpen: boolean;
};

export const DrawerRight: FC<DrawerRightProps> = ({ onClose, isOpen }) => {
  const { handleKeyDown } = useEscape({ onClose });

  return (
    <DrawerRightStyled onKeyDown={handleKeyDown} tabIndex={-1} isOpen={isOpen}>
      <DrawerRightWrapper>
        <DrawerRightContent>
          <DrawerRightHeader>
            <div>What is EarnETH Vault and how it works</div>
            <DrawerRightClose
              icon={<Close />}
              size="xxs"
              variant="ghost"
              onClick={onClose}
            />
          </DrawerRightHeader>
          <DrawerDescription>
            EarnETH Vault is a meta-vault designed to optimize returns on
            deployed assets across Lido Earn strategies. Today, it allocates
            assets across GGV and stRATEGY, with the ability to dynamically
            evolve its allocation mix. By abstracting strategy selection, the
            meta-vault provides ETH-denominated exposure to Lido Earn with the
            objective of balancing different risk and return profiles for
            ETH-denominated assets.
          </DrawerDescription>
          <DrawerTable />
          <DrawerDescription>
            The table above describes structural differences between accessing a
            single vault strategy and accessing a meta-vault that allocates
            across multiple strategies. It is provided for informational
            purposes only and does not constitute a recommendation. Outcomes and
            rewards may vary based on strategy composition, market conditions,
            and protocol parameters.
          </DrawerDescription>
          <DrawerDescription>
            All Mellow points you accumulate remain yours, with your balance
            visible on the{' '}
            <Link href="https://app.mellow.finance/dashboard">
              Mellow Dashboard
            </Link>
          </DrawerDescription>
          <DrawerRightFooter>
            <LocalLink href={ETH_DEPOSIT_PATH}>
              <Button fullwidth>Upgrade now</Button>
            </LocalLink>
            <Button fullwidth variant="outlined">
              Get in touch
            </Button>
          </DrawerRightFooter>
        </DrawerRightContent>
      </DrawerRightWrapper>
    </DrawerRightStyled>
  );
};
