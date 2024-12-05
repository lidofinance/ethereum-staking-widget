import { useStETHByWstETH } from 'modules/web3';

type useEthAmountByInputProps = {
  isSteth: boolean;
  amount: bigint | null;
};

export const useEthAmountByStethWsteth = ({
  isSteth,
  amount,
}: useEthAmountByInputProps) => {
  const fallbackedAmount = amount ?? 0n;
  const wsteth = isSteth ? undefined : fallbackedAmount;
  const { data: stethByWstethBalance, isLoading } = useStETHByWstETH(wsteth);

  if (isSteth)
    return {
      amount: fallbackedAmount ?? 0n,
      loading: false,
    };
  else return { amount: stethByWstethBalance, isLoading };
};
