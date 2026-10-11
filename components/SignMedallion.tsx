import type { Sign } from "@/lib/catalog";

/**
 * Placeholder character art.
 *
 * Renders an elegant zodiac medallion until final character art is ready.
 * When `sign.images.hero` is set, pages render the real image instead —
 * this component is only the stand-in. (See content/README.md.)
 */
export default function SignMedallion({
  sign,
  className = "",
  glow = true,
}: {
  sign: Sign;
  className?: string;
  glow?: boolean;
}) {
  const id = `med-${sign.id}`;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={`${sign.name} zodiac medallion (concept art placeholder)`}
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sign.accent} stopOpacity="0.35" />
          <stop offset="60%" stopColor={sign.accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={sign.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <circle cx="100" cy="100" r="98" fill={`url(#${id}-glow)`} />}

      {/* Orbit rings — thin and quiet */}
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="#faf7ef"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="100"
        r="72"
        fill="none"
        stroke="#faf7ef"
        strokeOpacity="0.12"
        strokeWidth="1"
        strokeDasharray="2 6"
      />

      {/* Orbiting dot */}
      <circle cx="100" cy="12" r="3" fill={sign.accent} opacity="0.9" />
      <circle cx="172" cy="140" r="2" fill="#faf7ef" opacity="0.5" />

      {/* The glyph — the star of the show for now */}
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="76"
        fill="#faf7ef"
        opacity="0.95"
        fontFamily="Georgia, serif"
      >
        {sign.symbol}
      </text>

      {/* Sign name on the ring */}
      <text
        x="100"
        y="168"
        textAnchor="middle"
        fontSize="11"
        letterSpacing="4"
        fill="#faf7ef"
        opacity="0.55"
        fontFamily="Outfit, sans-serif"
      >
        {sign.name.toUpperCase()}
      </text>
    </svg>
  );
}
