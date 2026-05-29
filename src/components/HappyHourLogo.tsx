type HappyHourLogoProps = {
  size?: number;
  className?: string;
  /** Show the wordmark beside the icon */
  showWordmark?: boolean;
};

/** Shared hand-drawn cheers mark: beer mug + cocktail glass clinking. */
function CheersIcon({ idSuffix = "" }: { idSuffix?: string }) {
  const beerFill = `beer-fill${idSuffix}`;
  const cocktailFill = `cocktail-fill${idSuffix}`;

  return (
    <>
      {/* clink spark */}
      <path
        d="M29 11 L31 7 M33 12 L37 9 M30 15 L34 16"
        stroke="#EA580C"
        strokeLinecap="round"
        strokeWidth="2"
      />

      {/* beer mug — tilted in */}
      <g transform="rotate(10 20 28)">
        <path
          d="M10 20
             Q9 15 16 13
             Q22 11 27 14
             L26 37
             Q25 42 17 41
             Q10 40 10 33
             Q9 26 10 20 Z"
          fill={`url(#${beerFill})`}
          stroke="#C2410C"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M12 17 Q16 14 20 16 Q24 13 26 16"
          fill="none"
          stroke="#C2410C"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M10 23 C4 24 3 29 5 33 C7 36 10 34 10 32"
          fill="none"
          stroke="#C2410C"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      </g>

      {/* cocktail — tilted in */}
      <g transform="rotate(-10 44 28)">
        <path
          d="M36 19
             Q38 12 44 10
             Q50 9 53 14
             Q54 18 52 21
             Q48 30 46 36
             Q43 28 36 19 Z"
          fill={`url(#${cocktailFill})`}
          stroke="#C2410C"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.2"
        />
        <path
          d="M38 17 Q44 13 50 16"
          fill="none"
          stroke="#C2410C"
          strokeLinecap="round"
          strokeWidth="1.6"
          opacity="0.7"
        />
        <path
          d="M46 36 L47 47"
          stroke="#C2410C"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <path
          d="M43 49 L51 49"
          stroke="#C2410C"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <path
          d="M49 13 Q52 11 54 15"
          fill="none"
          stroke="#C2410C"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <circle cx="55" cy="15" fill="#84CC16" r="1.8" stroke="#65A30D" strokeWidth="1" />
      </g>

      <defs>
        <linearGradient id={beerFill} x1="10" x2="27" y1="13" y2="41">
          <stop stopColor="#FDE68A" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FBBF24" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={cocktailFill} x1="36" x2="54" y1="9" y2="36">
          <stop stopColor="#FDBA74" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FB923C" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </>
  );
}

export function HappyHourLogo({
  size = 40,
  className,
  showWordmark = false,
}: HappyHourLogoProps) {
  const icon = (
    <svg
      aria-hidden={showWordmark ? true : undefined}
      className={className}
      fill="none"
      height={size}
      role={showWordmark ? undefined : "img"}
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {!showWordmark ? <title>STA Happy Hour</title> : null}
      <CheersIcon idSuffix="" />
    </svg>
  );

  if (!showWordmark) {
    return icon;
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      {icon}
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight text-stone-900">
          STA Happy Hour
        </span>
      </span>
    </span>
  );
}
