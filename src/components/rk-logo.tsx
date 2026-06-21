import type { CSSProperties } from "react";

type Props = { size?: number; style?: CSSProperties; className?: string };

/**
 * RK Films logo — orange gradient arc ring (330°, gap at lower-left),
 * accent dot at ~1 o'clock, and the actual brand mark:
 *   • Я  — backwards R (spine on right, bowl curves left, leg lower-left)
 *   • K  — stylised as a running person (head circle + diagonals)
 */
export function RkLogo({ size = 32, style, className }: Props) {
  const id = "rk-or";
  const mark = "rgba(220,215,200,0.80)";
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

      {/* 330° arc ring — gap at lower-left (7→8 o'clock) */}
      <path
        d="M 9.5 45 A 26 26 0 1 1 19 54.5"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Accent dot at ~1 o'clock */}
      <circle cx="45" cy="9.5" r="2.8" fill="#F07828" />

      {/* ── Inner brand mark ── */}
      <g
        fill="none"
        stroke={mark}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Я — backwards R
            Spine on right (x=30), bowl arcs to the left, leg goes lower-left */}
        {/* Spine */}
        <line x1="30" y1="23" x2="30" y2="43" />
        {/* Bowl: from spine-top, arc left, return to spine at mid-height */}
        <path d="M 30 23 C 30 17 21 17 21 24 C 21 31 30 31 30 31" />
        {/* Leg: lower-left diagonal */}
        <line x1="30" y1="31" x2="23" y2="43" />

        {/* K — stylised running person
            Stem + two diagonals; head is a filled circle */}
        {/* Stem */}
        <line x1="36" y1="28" x2="36" y2="43" />
        {/* Upper diagonal (arm reaching toward head) */}
        <line x1="36" y1="33" x2="41" y2="26" />
        {/* Lower diagonal (leg) */}
        <line x1="36" y1="38" x2="43" y2="43" />
      </g>

      {/* Head of the K-person */}
      <circle cx="42" cy="22" r="2.3" fill={mark} />
    </svg>
  );
}
