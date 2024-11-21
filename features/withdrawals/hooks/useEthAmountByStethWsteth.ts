import { ZERO, useStETHByWstETH } from 'modules/web3';

type useEthAmountByInputProps = {
  isSteth: boolean;
  amount: bigint | null;
};

export const useEthAmountByStethWsteth = ({
  isSteth,
  amount,
}: useEthAmountByInputProps) => {
  const fallbackedAmount = amount ?? ZERO;
  const wsteth = isSteth ? undefined : fallbackedAmount;
  const { data: stethByWstethBalance, isLoading } = useStETHByWstETH(wsteth);

  if (isSteth)
    return {
      amount: fallbackedAmount ?? ZERO,
      loading: false,
    };
  else return { amount: stethByWstethBalance, isLoading };
};
