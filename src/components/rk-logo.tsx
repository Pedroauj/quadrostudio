import type { CSSProperties } from "react";

type Props = { size?: number; style?: CSSProperties; className?: string };

/**
 * RK Films logo — orange gradient arc ring with gap at bottom-left,
 * accent dot at 1 o'clock, and RK mark inside.
 *
 * Arc geometry (viewBox 0 0 64 64, center 32 32, radius 26):
 *   Start: 8 o'clock → (9.5, 45)   [SVG 150°]
 *   End:   7 o'clock → (19, 54.5)  [SVG 120°]
 *   330° clockwise arc (sweep=1, large-arc=1), leaving a 30° gap at bottom-left.
 *   Dot:   1 o'clock → (45, 9.5)   [SVG 300°]
 */
export function RkLogo({ size = 32, style, className }: Props) {
  const id = "rk-or";
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
        <linearGradient id={id} x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#C04010" />
          <stop offset="100%" stopColor="#F07828" />
        </linearGradient>
      </defs>

      {/* 330° arc ring — gap at bottom-left */}
      <path
        d="M 9.5 45 A 26 26 0 1 1 19 54.5"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Accent dot at 1 o'clock */}
      <circle cx="45" cy="9.5" r="2.8" fill="#F07828" />

      {/* RK mark */}
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontFamily="Work Sans, sans-serif"
        fontWeight={500}
        fontSize="18"
        fill="rgba(237,234,227,0.80)"
        letterSpacing="1"
      >
        RK
      </text>
    </svg>
  );
}
