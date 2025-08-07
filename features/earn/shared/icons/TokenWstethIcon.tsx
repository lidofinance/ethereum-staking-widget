import React from 'react';

export const TokenWstethIcon = React.forwardRef(function TokenWstethIcon(
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
      <g clipPath="url(#a)">
        <rect width="20" height="20" fill="#00a3ff" rx="10" />
        <path
          fill="#fff"
          d="m13.692 8.985.1.155a4.34 4.34 0 0 1-.61 5.49 4.53 4.53 0 0 1-3.18 1.29z"
          opacity=".6"
        />
        <path
          fill="#fff"
          d="m10.002 11.093 3.69-2.108-3.69 6.935z"
          opacity=".2"
        />
        <path
          fill="#fff"
          d="m6.308 8.985-.1.155a4.34 4.34 0 0 0 .61 5.49c.878.86 2.029 1.29 3.18 1.29z"
        />
        <path
          fill="#fff"
          d="m9.996 11.093-3.69-2.108 3.69 6.935z"
          opacity=".6"
        />
        <path fill="#fff" d="M10.003 6.385v3.635l3.178-1.816z" opacity=".2" />
        <path
          fill="#fff"
          d="m10.002 6.385-3.18 1.818 3.18 1.817z"
          opacity=".6"
        />
        <path fill="#fff" d="m10.002 3.327-3.18 4.877 3.18-1.824z" />
        <path fill="#fff" d="m10.003 6.38 3.18 1.824-3.18-4.88z" opacity=".6" />
        <g fill="#fff" filter="url(#b)" opacity=".7">
          <path
            d="m15.559 11.309.106.162a4.57 4.57 0 0 1-.643 5.782 4.77 4.77 0 0 1-3.35 1.36z"
            opacity=".6"
          />
          <path d="m11.672 13.529 3.887-2.22-3.887 7.304z" opacity=".2" />
          <path d="m7.782 11.309-.106.162a4.57 4.57 0 0 0 .643 5.782 4.77 4.77 0 0 0 3.35 1.36z" />
          <path d="m11.667 13.529-3.887-2.22 3.887 7.304z" opacity=".6" />
          <path d="M11.674 8.57v3.828l3.348-1.913z" opacity=".2" />
          <path d="m11.673 8.57-3.35 1.915 3.35 1.913z" opacity=".6" />
          <path d="m11.673 5.35-3.35 5.137 3.35-1.921z" />
          <path d="m11.674 8.564 3.35 1.921-3.35-5.14z" opacity=".6" />
        </g>
      </g>
      <defs>
        <clipPath id="a">
          <rect width="20" height="20" fill="#fff" rx="10" />
        </clipPath>
        <filter
          id="b"
          width="77.48"
          height="81.268"
          x="-27.069"
          y="-28.654"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_10520_12258"
            stdDeviation="17"
          />
        </filter>
      </defs>
    </svg>
  );
});
