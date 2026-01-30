import {
  SidebarCard,
  VaultActionTabs,
  InfoBox,
  InfoBoxTitle,
  InfoBoxList,
  VaultForm,
} from './styles';

export const Widget = () => {
  return (
    <SidebarCard>
      <VaultActionTabs>
        <div>Deposit</div>
        <div>Withdraw</div>
      </VaultActionTabs>
      <VaultForm>
        <InfoBox>
          <InfoBoxTitle>
            Deposited funds cannot be withdrawn, and GG token is
            non-transferable for 24 hours after deposit
          </InfoBoxTitle>
          <InfoBoxList>
            <li>
              Withdrawals are only in wstETH, regardless of deposited asset(s).
            </li>
          </InfoBoxList>
        </InfoBox>
      </VaultForm>
    </SidebarCard>
  );
};
