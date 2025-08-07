import React from 'react';

export const TokenEthIcon = React.forwardRef(function TokenEthIcon(
  props: React.SVGProps<SVGSVGElement>,
  svgRef?: React.Ref<SVGSVGElement>,
) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={svgRef}
      {...props}
    >
      <g fill="#000" clipPath="url(#a)">
        <rect width="20" height="20" fillOpacity=".04" rx="10" />
        <path
          d="m9.926 8.263-4.093 1.861 4.093 2.419 4.092-2.419z"
          opacity=".6"
        />
        <path d="m5.833 10.124 4.093 2.419v-9.21z" opacity=".45" />
        <path d="M9.925 3.333v9.21l4.091-2.419z" opacity=".8" />
        <path d="m5.833 10.9 4.093 5.767v-3.348z" opacity=".45" />
        <path d="M9.925 13.318v3.348l4.095-5.767z" opacity=".8" />
        <g filter="url(#b)" opacity=".3">
          <path
            d="M12.093 8.18 8 10.04l4.093 2.419 4.092-2.419z"
            opacity=".6"
          />
          <path d="m8 10.041 4.093 2.419V3.25z" opacity=".45" />
          <path d="M12.092 3.25v9.21l4.091-2.419z" opacity=".8" />
          <path d="m8 10.817 4.093 5.767v-3.348z" opacity=".45" />
          <path d="M12.092 13.235v3.348l4.095-5.767z" opacity=".8" />
        </g>
      </g>
      <defs>
        <clipPath id="a">
          <rect width="20" height="20" fill="#fff" rx="10" />
        </clipPath>
        <filter
          id="b"
          width="36.187"
          height="41.334"
          x="-6"
          y="-10.75"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_10520_12249"
            stdDeviation="7"
          />
        </filter>
      </defs>
    </svg>
  );
});
