import styles from "./BloodwebBackdrop.module.scss";

interface BloodwebBackdropProps {
  variant?: "full" | "dim";
}

// Octagonal web rings (8 spokes at 45°) around centre 400,400 —
// the in-game bloodweb rendered as a quiet constellation.
const RING_POINTS = [
  "520,400 484.9,484.9 400,520 315.1,484.9 280,400 315.1,315.1 400,280 484.9,315.1",
  "640,400 569.7,569.7 400,640 230.3,569.7 160,400 230.3,230.3 400,160 569.7,230.3",
  "760,400 654.6,654.6 400,760 145.4,654.6 40,400 145.4,145.4 400,40 654.6,145.4",
];

const SPOKE_ENDS = [
  [760, 400],
  [654.6, 654.6],
  [400, 760],
  [145.4, 654.6],
  [40, 400],
  [145.4, 145.4],
  [400, 40],
  [654.6, 145.4],
] as const;

// Nodes sit on the middle ring; a handful of them breathe.
const NODES = [
  [640, 400],
  [569.7, 569.7],
  [400, 640],
  [230.3, 569.7],
  [160, 400],
  [230.3, 230.3],
  [400, 160],
  [569.7, 230.3],
] as const;

// Decorative ambience only: aria-hidden, no pointer events, and every
// animation here dies under the global prefers-reduced-motion switch.
export const BloodwebBackdrop = ({ variant = "full" }: BloodwebBackdropProps) => (
  <div className={`${styles.backdrop} ${variant === "dim" ? styles["backdrop--dim"] : ""}`} aria-hidden="true">
    <div className={styles.fog} />
    <div className={`${styles.fog} ${styles["fog--second"]}`} />
    <svg className={styles.web} viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
      {SPOKE_ENDS.map(([x, y]) => (
        <line key={`${x}-${y}`} x1="400" y1="400" x2={x} y2={y} />
      ))}
      {RING_POINTS.map((points) => (
        <polygon key={points.slice(0, 12)} points={points} />
      ))}
      {NODES.map(([cx, cy], i) => (
        <circle key={`${cx}-${cy}`} className={styles.node} style={{ animationDelay: `${i * 1.7}s` }} cx={cx} cy={cy} r="4" />
      ))}
      <circle className={styles.node} cx="400" cy="400" r="6" />
    </svg>
  </div>
);
