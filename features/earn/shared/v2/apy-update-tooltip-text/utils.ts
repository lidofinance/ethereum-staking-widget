type ShouldShowApxUpdateTooltipParams = {
  apx?: number | null;
  isLoading?: boolean;
  apxUpdateTooltipText?: unknown;
};

export const shouldShowApxUpdateTooltip = ({
  apx,
  isLoading,
  apxUpdateTooltipText,
}: ShouldShowApxUpdateTooltipParams) =>
  apx != null && Number.isFinite(apx) && !isLoading && !!apxUpdateTooltipText;
