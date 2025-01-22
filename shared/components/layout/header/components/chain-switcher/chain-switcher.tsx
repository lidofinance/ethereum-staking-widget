import {
  FC,
  useState,
  useRef,
  useMemo,
  createElement,
  ComponentType,
} from 'react';
import { ToastError } from '@lidofinance/lido-ui';

import { CHAIN_ICONS_MAP, useDappStatus } from 'modules/web3';
import { wagmiChainMap } from 'modules/web3/web3-provider/web3-provider';

import { useClickOutside } from './hooks/use-click-outside';
import {
  ChainSwitcherOptions,
  ChainOption,
} from './components/chain-switcher-options/chain-switcher-options';
import { SelectIconTooltip } from './components/select-icon-tooltip/select-icon-tooltip';
import {
  ChainSwitcherWrapperStyled,
  ChainSwitcherStyled,
  IconStyle,
  ArrowStyle,
} from './styles';

type IconsMapType = Record<number, ChainOption>;

export const ChainSwitcher: FC = () => {
  const { isDappActive, chainId, switchChainId, supportedChainIds } =
    useDappStatus();

  const [opened, setOpened] = useState(false);
  const [isLocked, setIsLocked] = useState(supportedChainIds.length < 2);
  const selectRef = useRef<HTMLDivElement>(null);

  useClickOutside(selectRef, () => setOpened(false));

  const iconsMap = useMemo(
    () =>
      supportedChainIds.reduce((acc: IconsMapType, chainId: number) => {
        acc[chainId] = {
          name: wagmiChainMap[chainId].name,
          iconComponent: CHAIN_ICONS_MAP.has(Number(chainId))
            ? createElement(
                CHAIN_ICONS_MAP.get(Number(chainId)) as ComponentType,
              )
            : null,
        };
        return acc;
      }, {}),
    [supportedChainIds],
  );

  return (
    <ChainSwitcherWrapperStyled>
      <ChainSwitcherStyled
        ref={selectRef}
        $disabled={isLocked}
        $showArrow={!isLocked}
        onClick={() => {
          if (!isLocked) {
            setOpened((prev) => !prev);
          }
        }}
      >
        <IconStyle>{iconsMap[chainId].iconComponent}</IconStyle>
        {!isLocked && <ArrowStyle $opened={opened} />}
      </ChainSwitcherStyled>

      {!isLocked && (
        <>
          <ChainSwitcherOptions
            currentChainId={chainId}
            onSelect={async (chainId) => {
              setOpened(false);
              setIsLocked(true);
              try {
                await switchChainId(chainId);
              } catch (err) {
                ToastError(String(err), {
                  toastId: 'SWITCH_CHAIN_ID_ERROR',
                  hideProgressBar: true,
                  closeOnClick: true,
                  position: 'bottom-left',
                });
              } finally {
                setIsLocked(false);
              }
            }}
            opened={opened}
            options={iconsMap}
          />
          {!isDappActive && (
            <SelectIconTooltip showArrow>
              This network doesn’t match your wallet’s network
            </SelectIconTooltip>
          )}
        </>
      )}
    </ChainSwitcherWrapperStyled>
  );
};
