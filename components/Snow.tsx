// Deterministic pseudo-random flakes so server and client markup match.
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export default function Snow({ count = 46 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const size = 2 + rand(i, 1) * 4;
        return (
          <span
            key={i}
            className="flake"
            style={
              {
                left: `${rand(i, 2) * 100}%`,
                width: size,
                height: size,
                opacity: 0.25 + rand(i, 3) * 0.55,
                animationDuration: `${9 + rand(i, 4) * 14}s`,
                animationDelay: `-${rand(i, 5) * 20}s`,
                filter: size > 4.5 ? "blur(1px)" : undefined,
                "--drift": `${(rand(i, 6) - 0.5) * 120}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
