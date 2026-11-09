/**
 * Official HireMind logo.
 *
 * The PNG (public/logo.png) contains the magnifying-glass icon + "HireMind"
 * wordmark stacked vertically. The asset is cropped to its artwork
 * (568 × 557, aspect ≈ 1.02 : 1) so its left edge sits flush with page content.
 *
 * Display sizes:
 *   size="lg"  → 68 px tall (marketing header — icon ~42px + text ~26px)
 *   size="md"  → 56 px tall (auth / registration headers)
 *   size="sm"  → 44 px tall (compact headers)
 *
 * Or pass an explicit `height` number for full control.
 */
import Image from "next/image";

interface Props {
  size?: "lg" | "md" | "sm";
  height?: number;
  className?: string;
}

const SIZE_MAP = { lg: 68, md: 56, sm: 44 } as const;
const ASPECT   = 1.02; // width / height of the (cropped) logo artwork

export default function BrandLogo({ size = "lg", height, className = "" }: Props) {
  const h = height ?? SIZE_MAP[size];
  const w = Math.round(h * ASPECT);
  return (
    // next/image serves a resized AVIF/WebP instead of the 480 KB source PNG.
    <Image
      src="/logo.png"
      alt="HireMind logo"
      loading="eager"
      height={h}
      width={w}
      className={className}
      style={{ height: `${h}px`, width: `${w}px`, objectFit: "contain", display: "block" }}
    />
  );
}
