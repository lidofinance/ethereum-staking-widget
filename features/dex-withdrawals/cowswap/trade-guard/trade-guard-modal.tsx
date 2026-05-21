import { Modal, Button } from '@lidofinance/lido-ui';
import styled from 'styled-components';

import type { TradeGuardLevel } from './types';

const ModalContent = styled.div`
  text-align: center;
  padding: 0 8px 8px;
`;

const Title = styled.h3<{ $level: 'blocked' | 'limit' }>`
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 12px;
  color: ${({ $level }) =>
    $level === 'limit'
      ? 'var(--lido-color-textSecondary, #7a8aa0)'
      : 'var(--lido-color-error, #e14d4d)'};
`;

const MessageList = styled.div`
  text-align: left;
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
  const titleLevel = level === 'limit' ? 'limit' : 'blocked';

  return (
    <Modal open={open} onClose={() => onClose(false)}>
      <ModalContent>
        <Title $level={titleLevel}>
          {TITLE_TEXT[level] ?? TITLE_TEXT.blocked}
        </Title>

        {oracleVerified && (
          <OracleBadge>Verified by Chainlink oracle</OracleBadge>
        )}

        <MessageList>
          {messages.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </MessageList>

        <Button
          size="sm"
          fullwidth
          variant="filled"
          onClick={() => onClose(false)}
        >
          Close
        </Button>
      </ModalContent>
    </Modal>
  );
};
