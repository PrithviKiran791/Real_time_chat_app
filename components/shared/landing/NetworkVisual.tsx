import styles from "./landing.module.css";

const nodes = [
  { cx: 50, cy: 50, r: 4 },
  { cx: 20, cy: 30, r: 3 },
  { cx: 80, cy: 25, r: 3 },
  { cx: 15, cy: 70, r: 3 },
  { cx: 85, cy: 65, r: 3 },
  { cx: 35, cy: 85, r: 2.5 },
  { cx: 65, cy: 80, r: 2.5 },
  { cx: 50, cy: 15, r: 2.5 },
];

const connections = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
  [1, 3], [2, 4], [5, 6], [1, 7], [2, 7],
];

/**
 * Lightweight SVG network visual for the Global Connectivity section.
 * Complements the hero globe without duplicating the full 3D treatment.
 */
const NetworkVisual = () => {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-[320px]"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-[#2563EB]/10 blur-2xl" />
      <svg
        viewBox="0 0 100 100"
        className="relative h-full w-full"
        role="presentation"
      >
        <defs>
          <radialGradient id="networkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="networkLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="42" fill="url(#networkGlow)" />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#2563EB"
          strokeOpacity="0.2"
          strokeWidth="0.5"
        />

        {connections.map(([from, to], i) => {
          const a = nodes[from];
          const b = nodes[to];
          return (
            <line
              key={i}
              x1={a.cx}
              y1={a.cy}
              x2={b.cx}
              y2={b.cy}
              stroke="url(#networkLine)"
              strokeWidth="0.6"
              className={styles.networkLine}
            />
          );
        })}

        {nodes.map((node, i) => (
          <g key={i}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r + 2}
              fill="#2563EB"
              fillOpacity="0.15"
              className={styles.networkNode}
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            <circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="#60A5FA"
              className={styles.networkNode}
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default NetworkVisual;
