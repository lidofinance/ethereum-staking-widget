import { useCallback } from 'react';

type KeyDownHandle = (event: React.KeyboardEvent<HTMLDivElement>) => void;
type UseEscapeProps = {
  onClose?: () => void;
  onKeyDown?: KeyDownHandle;
};
type UseEscape = (props: UseEscapeProps) => {
  handleKeyDown: KeyDownHandle;
};

export const useEscape: UseEscape = (props) => {
  const { onClose, onKeyDown } = props;

  const handleKeyDown: KeyDownHandle = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        if (onClose) onClose();
      }

      if (onKeyDown) onKeyDown(event);
    },
    [onClose, onKeyDown],
  );

  return { handleKeyDown };
};
