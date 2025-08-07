import React from 'react';

export const TokenStethIcon = React.forwardRef(function TokenStethIcon(
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
        <rect width="20" height="20" fill="#000" fillOpacity=".04" rx="10" />
        <g fill="#00a3ff" filter="url(#b)" opacity=".7">
          <path
            d="m13.412 8.967.097.15a4.19 4.19 0 0 1-.59 5.3 4.38 4.38 0 0 1-3.07 1.247z"
            opacity=".6"
          />
          <path d="m9.848 11.002 3.563-2.035-3.563 6.697z" opacity=".2" />
          <path d="m6.28 8.967-.097.15a4.19 4.19 0 0 0 .59 5.3 4.38 4.38 0 0 0 3.071 1.247z" />
          <path d="M9.843 11.002 6.279 8.967l3.564 6.697z" opacity=".6" />
          <path d="M9.849 6.455v3.51l3.07-1.753z" opacity=".2" />
          <path d="M9.848 6.455 6.776 8.212l3.072 1.754z" opacity=".6" />
          <path d="m9.848 3.503-3.072 4.71 3.072-1.761z" />
          <path d="m9.849 6.451 3.072 1.761L9.849 3.5z" opacity=".6" />
        </g>
        <path
          fill="#00a3ff"
          d="m13.692 8.868.1.154a4.284 4.284 0 0 1-.61 5.447 4.55 4.55 0 0 1-3.18 1.281z"
          opacity=".6"
        />
        <path
          fill="#00a3ff"
          d="m10.002 10.96 3.69-2.092-3.69 6.882z"
          opacity=".2"
        />
        <path
          fill="#00a3ff"
          d="m6.308 8.868-.1.154a4.284 4.284 0 0 0 .61 5.447 4.55 4.55 0 0 0 3.18 1.281z"
        />
        <path
          fill="#00a3ff"
          d="m9.996 10.96-3.69-2.092 3.69 6.882z"
          opacity=".6"
        />
        <path
          fill="#00a3ff"
          d="M10.003 6.287v3.608l3.178-1.803z"
          opacity=".2"
        />
        <path
          fill="#00a3ff"
          d="m10.002 6.287-3.18 1.805 3.18 1.803z"
          opacity=".6"
        />
        <path fill="#00a3ff" d="m10.002 3.253-3.18 4.84 3.18-1.81z" />
        <path
          fill="#00a3ff"
          d="m10.003 6.282 3.18 1.81-3.18-4.842z"
          opacity=".6"
        />
      </g>
      <defs>
        <clipPath id="a">
          <rect width="20" height="20" fill="#fff" rx="10" />
        </clipPath>
        <filter
          id="b"
          width="44.692"
          height="48.164"
          x="-12.5"
          y="-14.5"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur
            result="effect1_foregroundBlur_10520_12255"
            stdDeviation="9"
          />
        </filter>
      </defs>
    </svg>
  );
});
