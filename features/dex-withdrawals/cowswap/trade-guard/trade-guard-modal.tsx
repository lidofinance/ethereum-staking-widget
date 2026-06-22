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
  margin: 0 0 24px;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--lido-color-textSecondary);
`;

const OracleBadge = styled.span`
  display: block;
  font-size: 12px;
  color: var(--lido-color-textSecondary);
  margin-bottom: 16px;
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
  limit: 'Swap unavailable',
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
