import React from 'react';

export const EarnNavIcon = React.forwardRef(function EarnPageIcon(
  props: React.SVGProps<SVGSVGElement>,
  svgRef?: React.Ref<SVGSVGElement>,
) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      ref={svgRef}
      {...props}
    >
      <path
        d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21M19 9L14 14L10 10L7 13"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
      />
    </svg>
  );
});
