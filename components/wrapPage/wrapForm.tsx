import React, { FC, memo, useCallback, useMemo, useState } from 'react';
import {
  Block,
  DataTable,
  DataTableRow,
  Input,
  SelectIcon,
  Option,
  Eth,
  Steth,
  Button,
  Lock,
  ButtonIcon,
} from '@lidofinance/lido-ui';
// import { getTokenAddress } from '@lido-sdk/constants';
import { useWeb3 } from '@lido-sdk/web3-react';
import {
  useWSTETHContractWeb3,
  // useApprove,
  // useEthereumSWR,
  // useSTETHContractWeb3,
} from '@lido-sdk/react';
import { CHAINS } from '@lido-sdk/constants';
import { parseEther } from '@ethersproject/units';
// import { AddressZero } from '@ethersproject/constants';
import { FormStyled, InputGroupStyled, MaxButton } from './styles';
import FormatToken from 'components/formatToken';
import WalletConnect from 'components/walletConnect/walletConnect';
import { useWstethBySteth, useTxCostInUsd } from 'hooks';

const approveGasLimit = 70000;

const iconsMap = {
  eth: <Eth />,
  steth: <Steth />,
};

const WrapForm: FC = () => {
  const { active, chainId } = useWeb3();

  const wrapGasLimit = useMemo(
    () => (chainId === CHAINS.Goerli ? 180000 : 140000),
    [chainId],
  );

  const approveTxCostInUsd = useTxCostInUsd(approveGasLimit);
  const wrapTxCostInUsd = useTxCostInUsd(wrapGasLimit);
  const wstethConverted = useWstethBySteth(parseEther('1'));

  const [selectedToken, setSelectedToken] =
    useState<keyof typeof iconsMap>('eth');

  const needsApproval = false;

  const wstethContractWeb3 = useWSTETHContractWeb3();
  // stETH to wstETH (approve)
  // const amount = parseEther('1');
  // const token = getTokenAddress(5, 'STETH');
  // const spender = getTokenAddress(5, 'WSTETH');
  // const { approve } = useApprove(amount, token, spender);
  // /stETH to wstETH (approve)

  // ETH to wstETH (wrap)
  // const wstethTokenAddress = getTokenAddress(5, 'WSTETH');
  // /ETH to wstETH (wrap)

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!wstethContractWeb3) {
        return;
      }

      // ETH to wstETH (wrap)
      // console.log('start: ETH to wstETH');
      // await wstethContractWeb3.signer.sendTransaction({
      //   to: wstethTokenAddress,
      //   value: parseEther('1'),
      // });
      // console.log('end: ETH to wstETH');

      // stETH to wstETH (approve and wrap)
      // console.log('start: stETH to wstETH');
      // await approve();
      // await wstethContractWeb3.wrap(parseEther('1'));
      // console.log('end: stETH to wstETH');

      // wstETH to stETH (unwrap)
      // console.log('start: wstETH to stETH');
      // await wstethContractWeb3.unwrap(parseEther('1'));
      // console.log('end: wstETH to stETH');
    },
    [wstethContractWeb3],
  );

  return (
    <Block>
      <FormStyled
        action=""
        method="post"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <InputGroupStyled fullwidth>
          <SelectIcon
            icon={iconsMap[selectedToken]}
            value={selectedToken}
            onChange={(value) =>
              setSelectedToken(value as keyof typeof iconsMap)
            }
          >
            <Option leftDecorator={iconsMap.steth} value="steth">
              Lido (STETH)
            </Option>
            <Option leftDecorator={iconsMap.eth} value="eth">
              Ethereum (ETH)
            </Option>
          </SelectIcon>
          <Input
            fullwidth
            placeholder="Amount"
            rightDecorator={
              <MaxButton size="xxs" variant="translucent">
                MAX
              </MaxButton>
            }
          />
        </InputGroupStyled>
        {active ? (
          needsApproval ? (
            <ButtonIcon icon={<Lock />} fullwidth type="submit">
              Unlock token to wrap
            </ButtonIcon>
          ) : (
            <Button fullwidth type="submit">
              Wrap
            </Button>
          )
        ) : (
          <WalletConnect fullwidth />
        )}
      </FormStyled>

      <DataTable>
        <DataTableRow title="Unlock fee" loading={!approveTxCostInUsd}>
          ${approveTxCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow title="Gas fee" loading={!wrapTxCostInUsd}>
          ${wrapTxCostInUsd?.toFixed(2)}
        </DataTableRow>
        <DataTableRow title="Exchange rate" loading={!wstethConverted}>
          1 stETH =
          <FormatToken amount={wstethConverted} symbol="wstETH" />
        </DataTableRow>
        <DataTableRow title="Allowance" loading={true}></DataTableRow>
        <DataTableRow title="You will receive" loading={true}></DataTableRow>
      </DataTable>
    </Block>
  );
};

export default memo(WrapForm);
