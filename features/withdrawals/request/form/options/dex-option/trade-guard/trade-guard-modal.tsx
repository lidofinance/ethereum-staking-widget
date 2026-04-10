import { Modal, Button } from '@lidofinance/lido-ui';
import styled from 'styled-components';

import type { TradeGuardLevel } from './types';

const ModalContent = styled.div`
  text-align: center;
  padding: 0 8px 8px;
`;

const Title = styled.h3<{ $blocked: boolean }>`
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 12px;
  color: ${({ $blocked }) =>
    $blocked
      ? 'var(--lido-color-error, #e14d4d)'
      : 'var(--lido-color-warning, #f5a623)'};
`;

const MessageList = styled.ul`
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

export const TradeGuardModal = ({ state, onClose }: TradeGuardModalProps) => {
  const { open, level, messages, oracleVerified } = state;
  const isBlocked = level === 'blocked';

  return (
    <Modal open={open} onClose={() => onClose(false)}>
      <ModalContent>
        <Title $blocked={isBlocked}>
          {isBlocked
            ? 'Trade blocked for your protection'
            : 'Potential value loss detected'}
        </Title>

        {oracleVerified && (
          <OracleBadge>Verified by Chainlink oracle</OracleBadge>
        )}

        <MessageList>
          {messages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </MessageList>

        <ButtonGroup>
          {!isBlocked && (
            <Button
              size="sm"
              fullwidth
              color="warning"
              variant="outlined"
              onClick={() => onClose(true)}
            >
              Proceed anyway
            </Button>
          )}
          <Button
            size="sm"
            fullwidth
            variant="filled"
            onClick={() => onClose(false)}
          >
            {isBlocked ? 'Close' : 'Cancel'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};
