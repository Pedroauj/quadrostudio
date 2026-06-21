import type { CSSProperties } from "react";

type Props = { size?: number; style?: CSSProperties; className?: string };

/** RK Films circle mark — gradient ring + RK initials. Pure SVG, no image asset. */
export function RkLogo({ size = 32, style, className }: Props) {
  const id = "rk-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={style}
      className={className}
      aria-label="RK Films"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D9C28A" />
          <stop offset="50%" stopColor="#B9A36C" />
          <stop offset="100%" stopColor="#8C7A4C" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="Work Sans, sans-serif"
        fontWeight={600}
        fontSize="20"
        fill={`url(#${id})`}
        letterSpacing="0.5"
      >
        RK
      </text>
    </svg>
  );
}