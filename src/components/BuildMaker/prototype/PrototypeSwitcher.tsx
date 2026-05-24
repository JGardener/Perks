// PROTOTYPE — delete this component when prototype is done
import { useEffect } from "react";
import styles from "./proto.module.scss";

const VARIANTS = [
  { key: "A", label: "Integrated Panel" },
  { key: "B", label: "Hero + Drawer" },
  { key: "C", label: "Control Strip" },
];

interface Props {
  current: string;
  onChange: (variant: string) => void;
}

export const PrototypeSwitcher = ({ current, onChange }: Props) => {
  const idx = VARIANTS.findIndex((v) => v.key === current);
  const prev = VARIANTS[(idx - 1 + VARIANTS.length) % VARIANTS.length];
  const next = VARIANTS[(idx + 1) % VARIANTS.length];

  const goTo = (key: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", key);
    window.history.replaceState(null, "", url.toString());
    onChange(key);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA"].includes(tag)) return;
      if (e.key === "ArrowLeft") goTo(prev.key);
      if (e.key === "ArrowRight") goTo(next.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className={styles.switcher}>
      <button className={styles.switcher_arrow} onClick={() => goTo(prev.key)} aria-label="Previous variant">
        ◀
      </button>
      <span className={styles.switcher_label}>
        {current} — {VARIANTS[idx]?.label ?? "Unknown"}
      </span>
      <button className={styles.switcher_arrow} onClick={() => goTo(next.key)} aria-label="Next variant">
        ▶
      </button>
    </div>
  );
};
