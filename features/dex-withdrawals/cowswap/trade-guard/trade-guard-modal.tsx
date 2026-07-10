import { Modal } from '@lidofinance/lido-ui';
import styled from 'styled-components';

import {
  TransactionModalContent,
  ModalFooterButton,
  StageIconFail,
} from 'shared/transaction-modal';

import type { TradeGuardLevel } from './types';

const MessageList = styled.div`
  text-align: center;
  margin: 0 0 ${({ theme }) => theme.spaceMap.xl}px;
  padding: 0 ${({ theme }) => theme.spaceMap.md}px;
  font-size: 14px;
  color: var(--lido-color-textSecondary);
`;

const OracleBadge = styled.span`
  display: block;
  margin: 0 auto ${({ theme }) => theme.spaceMap.sm}px;
  padding: ${({ theme }) => theme.spaceMap.xs}px 12px;
  width: fit-content;
  border-radius: 15px;

  font-size: 12px;
  color: var(--lido-color-textSecondary);
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? 'var(--custom-background-dark)' : '#F5F5F7'};
`;

export type TradeGuardModalState = {
  open: boolean;
  level: TradeGuardLevel;
  messages: string[];
  oracleVerified: boolean;
};

export const MODAL_INITIAL_STATE: TradeGuardModalState = {
  open: false,
  level: 'safe',
  messages: [],
  oracleVerified: false,
};

type TradeGuardModalProps = {
  state: TradeGuardModalState;
  onClose: (result: boolean) => void;
};

const TITLE_TEXT: Record<string, string> = {
  blocked: 'Swap unavailable',
};

export const TradeGuardModal = ({ state, onClose }: TradeGuardModalProps) => {
  const { open, level, messages, oracleVerified } = state;

  return (
    <Modal open={open} onClose={() => onClose(false)}>
      <TransactionModalContent
        icon={<StageIconFail />}
        title={TITLE_TEXT[level] ?? TITLE_TEXT.blocked}
        description={
          <>
            {oracleVerified && (
              <OracleBadge>Verified by Chainlink oracle</OracleBadge>
            )}

            <MessageList>
              {messages.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </MessageList>
          </>
        }
        footerHint={
          <ModalFooterButton onClick={() => onClose(false)}>
            Close
          </ModalFooterButton>
        }
      />
    </Modal>
  );
};
