import { ETH_VAULT_ROUTES } from '../../consts';
import { SwitchStyled } from './styles';

export const ActionSwitch = ({
  isWithdraw = false,
}: {
  isWithdraw?: boolean;
}) => {
  return (
    <SwitchStyled routes={ETH_VAULT_ROUTES} checked={isWithdraw} fullwidth />
  );
};
