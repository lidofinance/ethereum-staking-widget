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
      <g clipPath="url(#clip0_10520_12249)">
        <rect width="20" height="20" rx="10" fill="#eee" />
        <path
          opacity="0.6"
          d="M9.92617 8.2627L5.83301 10.1242L9.92617 12.5425L14.0177 10.1242L9.92617 8.2627Z"
          fill="black"
        />
        <path
          opacity="0.45"
          d="M5.83301 10.1244L9.92617 12.5426L9.92617 3.33301L5.83301 10.1244Z"
          fill="black"
        />
        <path
          opacity="0.8"
          d="M9.9248 3.33301L9.9248 12.5426L14.0164 10.1244L9.9248 3.33301Z"
          fill="black"
        />
        <path
          opacity="0.45"
          d="M5.83301 10.9004L9.92617 16.6669V13.3186L5.83301 10.9004Z"
          fill="black"
        />
        <path
          opacity="0.8"
          d="M9.9248 13.3177L9.9248 16.6659L14.0196 10.8994L9.9248 13.3177Z"
          fill="black"
        />
        <g opacity="0.3" filter="url(#filter0_f_10520_12249)">
          <path
            opacity="0.6"
            d="M12.0932 8.17969L8 10.0412L12.0932 12.4595L16.1847 10.0412L12.0932 8.17969Z"
            fill="black"
          />
          <path
            opacity="0.45"
            d="M8 10.0414L12.0932 12.4596L12.0932 3.25L8 10.0414Z"
            fill="black"
          />
          <path
            opacity="0.8"
            d="M12.0918 3.25L12.0918 12.4596L16.1833 10.0414L12.0918 3.25Z"
            fill="black"
          />
          <path
            opacity="0.45"
            d="M8 10.8174L12.0932 16.5839V13.2356L8 10.8174Z"
            fill="black"
          />
          <path
            opacity="0.8"
            d="M12.0918 13.2347L12.0918 16.5829L16.1866 10.8164L12.0918 13.2347Z"
            fill="black"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_f_10520_12249"
          x="-6"
          y="-10.75"
          width="36.1865"
          height="41.334"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="7"
            result="effect1_foregroundBlur_10520_12249"
          />
        </filter>
        <clipPath id="clip0_10520_12249">
          <rect width="20" height="20" rx="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
});
