import type {
  WithdrawalRequestNFTAbi,
  WithdrawalRequestedEvent,
} from 'generated/WithdrawalRequestNFTAbi';

type WithdrawalRequestedEventDecoded = WithdrawalRequestedEvent['args'];

export const getEventsWithdrawalRequested = async (
  contract: WithdrawalRequestNFTAbi,
  requestor: string,
  block: string | number,
) => {
  const filter = contract.filters.WithdrawalRequested(undefined, requestor);
  const events = await contract.queryFilter(
    filter,
    Number(block),
    Number(block) + 1,
  );
  return events.map<WithdrawalRequestedEventDecoded>((event) =>
    event.decode?.(event.data, event.topics),
  );
};
