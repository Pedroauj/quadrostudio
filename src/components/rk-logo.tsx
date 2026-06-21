import type { CSSProperties } from "react";
import logoAsset from "@/assets/logo-rk.png.asset.json";

type Props = { size?: number; style?: CSSProperties; className?: string };

export function RkLogo({ size = 32, style, className }: Props) {
  return (
    <img
      src={logoAsset.url}
      alt="RK Films"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", ...style }}
    />
  );
}
