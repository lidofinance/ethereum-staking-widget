const formatApyUpdateDate = (timestampMs: number) =>
  new Date(timestampMs).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const ApyUpdateTooltipText = ({
  timestampMs,
}: {
  timestampMs?: number;
}) => {
  if (!timestampMs) return null;

  return <>Last updated on {formatApyUpdateDate(timestampMs)}</>;
};
