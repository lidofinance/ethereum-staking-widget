import styled from 'styled-components';
import {
  CheckLarge,
  Close,
  Input,
  Loader,
  Text,
  Block,
  Button,
  Link,
} from '@lidofinance/lido-ui';

export const LidoAprStyled = styled.span`
  color: rgb(97, 183, 95);
`;

export const FlexCenterVertical = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export const InputStyled = styled(Input)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

export const TxLoader = styled(Loader)`
  margin: 0 auto;
`;

export const BoldText = styled(Text)`
  text-align: center;
  margin-top: 24px;
  font-weight: 800;
`;

export const LightText = styled(Text)`
  text-align: center;
`;

export const IconWrapper = styled.div`
  text-align: center;
`;

export const SuccessIcon = styled(CheckLarge)`
  padding: 20px;
  border: 2px solid ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.success};
`;

export const FailIcon = styled(Close)`
  padding: 20px;
  border: 2px solid ${({ theme }) => theme.colors.error};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.error};
`;

export const ReferralCardBlock = styled(Block)`
  margin-top: 32px;
  background: linear-gradient(
    52.01deg,
    rgb(58, 57, 95) 0.01%,
    rgb(128, 103, 89) 100%
  );
`;

export const ReferralTitleText = styled(Text)`
  color: white;
  margin-bottom: 10px;
`;

export const ReferralLinkBox = styled.div`
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 12px 6px 12px 12px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 12px;
`;

export const ReferralLinkBoxInside = styled(Text)`
  line-height: 20px;
  color: white;
  opacity: 0.5;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  margin-right: 9px;
`;

export const ReferralCopyBox = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  line-height: 0;
  padding: 0;
  min-width: 32px;

  svg {
    fill: white;
    margin: 4px;
  }
`;

export const ReferralInstructionText = styled(Text)`
  color: white;
`;

export const ReferralLink = styled(Link)`
  color: #e79271;

  :hover {
    cursor: pointer;
    color: #e79271;
  }
`;
