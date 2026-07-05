import styles from "./landing.module.css";
import { cn } from "@/lib/utils";

type GlobeProps = {
  className?: string;
  size?: number;
};

/**
 * A semi-transparent, slowly rotating "internet globe" built entirely from
 * SVG so it stays lightweight, crisp at any size, and needs no image assets.
 * Reused by the Hero and Global Connectivity sections.
 */
const Globe = ({ className, size = 560 }: GlobeProps) => {
  const nodes = [
    { cx: 180, cy: 120 },
    { cx: 340, cy: 90 },
    { cx: 420, cy: 220 },
    { cx: 120, cy: 260 },
    { cx: 300, cy: 340 },
    { cx: 440, cy: 380 },
    { cx: 200, cy: 400 },
  ];

  return (
    <div
      className={cn("pointer-events-none select-none", className)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 560 560"
        width={size}
        height={size}
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="globeFill" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineFade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* outer glow */}
        <circle cx="280" cy="280" r="260" fill="url(#globeFill)" />

        {/* static outer ring */}
        <circle
          cx="280"
          cy="280"
          r="220"
          fill="none"
          stroke="#38BDF8"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />

        {/* rotating longitude/latitude lines */}
        <g className={styles.globeSpin}>
          <ellipse
            cx="280"
            cy="280"
            rx="220"
            ry="90"
            fill="none"
            stroke="#38BDF8"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <ellipse
            cx="280"
            cy="280"
            rx="220"
            ry="150"
            fill="none"
            stroke="#38BDF8"
            strokeOpacity="0.22"
            strokeWidth="1"
          />
          <ellipse
            cx="280"
            cy="280"
            rx="90"
            ry="220"
            fill="none"
            stroke="#7DD3FC"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          <ellipse
            cx="280"
            cy="280"
            rx="150"
            ry="220"
            fill="none"
            stroke="#7DD3FC"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        </g>

        {/* counter-rotating connection lines between nodes */}
        <g className={styles.globeSpinSlow}>
          {nodes.map((from, i) =>
            nodes.slice(i + 1).map((to, j) => (
              <line
                key={`${i}-${j}`}
                x1={from.cx}
                y1={from.cy}
                x2={to.cx}
                y2={to.cy}
                stroke="url(#lineFade)"
                strokeWidth="1"
                className={styles.dashLine}
              />
            )),
          )}
          {nodes.map((n, i) => (
            <g key={i}>
              <circle cx={n.cx} cy={n.cy} r="4" fill="#38BDF8" />
              <circle
                cx={n.cx}
                cy={n.cy}
                r="4"
                fill="#7DD3FC"
                className={styles.node}
              />
            </g>
          ))}
        </g>

        {/* central sphere outline */}
        <circle
          cx="280"
          cy="280"
          r="150"
          fill="none"
          stroke="#0F172A"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default Globe;
