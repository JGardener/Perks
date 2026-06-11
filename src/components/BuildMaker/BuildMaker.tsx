import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { Build, Perk } from "../../types/dbd";
import { useConstraints } from "../../hooks/useConstraints";
import { useToast } from "../../hooks/useToast";
import { decodeBuild, encodeBuild } from "../../utils/buildShare";
import { buildToSlots } from "../../utils/buildToSlots";
import { exportBuildImage } from "../../utils/exportCanvas";
import { filterPerks } from "../../utils/perkSearch";
import { getPerkImageUrl, resolveDescription } from "../../utils/perkUtils";
import { SaveBuildModal } from "../SaveBuildModal/SaveBuildModal";
import { SavedBuilds } from "../SavedBuilds/SavedBuilds";
import styles from "./BuildMaker.module.scss";
import { ExportToolbar } from "./ExportToolbar";
import { RandomiserHero } from "./RandomiserHero";

const OCTAGON = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";

// ── Flying ghost ──────────────────────────────────────────────────────────────

interface FlyingPerkProps {
  perk: Perk;
  fromRect: DOMRect;
  toRect: DOMRect;
  onLand: () => void;
}

const FlyingPerk = ({ perk, fromRect, toRect, onLand }: FlyingPerkProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;
    const scale = toRect.width / fromRect.width;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const anim = el.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
      ],
      {
        duration: reducedMotion ? 0 : 400,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    anim.onfinish = () => onLandRef.current();
    return () => anim.cancel();
  }, [fromRect, toRect]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        left: fromRect.left,
        top: fromRect.top,
        width: fromRect.width,
        height: fromRect.height,
        clipPath: OCTAGON,
        background: "var(--bw-accent-bright)",
        padding: "3px",
        pointerEvents: "none",
        zIndex: 120, // --z-flight in variables.scss (inline styles can't read tokens)
        transformOrigin: "0 0",
        boxSizing: "border-box",
      }}
    >
      <img
        src={getPerkImageUrl(perk.image)}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          clipPath: OCTAGON,
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
      />
    </div>
  );
};

// ── BuildMaker ────────────────────────────────────────────────────────────────

interface BuildMakerProps {
  perks: Perk[];
  role: "survivor" | "killer";
  characterMap: Record<number, string>;
  hasRatings: boolean;
  onExportTierList: () => void;
  userId: string | null;
  onOpenAuthModal: () => void;
  onSave: (name: string, perks: (string | null)[]) => Promise<void>;
  builds: Build[];
  onDelete: (id: string) => Promise<void>;
}

interface Flight {
  perk: Perk;
  fromRect: DOMRect;
  toRect: DOMRect;
  targetIdx: number;
}

export const BuildMaker = ({ perks, role, characterMap, hasRatings, onExportTierList, userId, onOpenAuthModal, onSave, builds, onDelete }: BuildMakerProps) => {
  const { showToast } = useToast();
  const [slots, setSlots] = useState<(Perk | null)[]>([null, null, null, null]);
  const [search, setSearch] = useState("");
  const [flight, setFlight] = useState<Flight | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [revealTick, setRevealTick] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const [constraints, constraintActions, constraintDerived] = useConstraints(
    perks, slots, setSlots, characterMap, role
  );

  const slotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const hydrated = useRef(false);
  const urlReady = useRef(false);
  const prevRoleRef = useRef(role);

  // Clear build state when role changes from outside
  useEffect(() => {
    if (prevRoleRef.current === role) return;
    prevRoleRef.current = role;
    setSlots([null, null, null, null]);
    setSearch("");
    setFlight(null);
  }, [role]);

  const filteredPerks = useMemo(
    () => filterPerks(perks, search, characterMap),
    [perks, search, characterMap],
  );

  // Include in-flight perk in inBuild so its picker item dims during flight
  const inBuild = useMemo(() => {
    const set = new Set(slots.filter(Boolean).map((p) => p!.name));
    if (flight) set.add(flight.perk.name);
    return set;
  }, [slots, flight]);

  const isFull = inBuild.size >= 4;

  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  // setSearchParams gets a new identity every render in react-router v7;
  // keep the latest in a ref so the sync effect's deps stay [role, slots]
  // (including it would re-fire the effect on every render).
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  // Hydrate build from URL once perks are loaded (runs once)
  useEffect(() => {
    if (hydrated.current) return;
    if (!perks.length) return;
    hydrated.current = true;
    urlReady.current = true;
    const result = decodeBuild(location.search, perks);
    if (!result) return;
    setSlots(result.slots);
    // location.search is read once at hydration by design — later URL
    // changes flow FROM this component, not into it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perks]);

  // Keep URL in sync with build state (only after initial hydration).
  // BuildMaker is the single URL writer on /build — RoleToggle and
  // navigation must not write ?role=/p0..p3 here (see ADR-0008).
  useEffect(() => {
    if (!urlReady.current) return;
    setSearchParamsRef.current(new URLSearchParams(encodeBuild(role, slots)), { replace: true });
  }, [role, slots]);

  const removeSlot = (i: number) => {
    if (constraints.pinnedSlots.has(i)) constraintActions.togglePin(i);
    setSlots((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  };

  const handlePickerClick = (perk: Perk, buttonEl: HTMLButtonElement) => {
    if (inBuild.has(perk.name)) {
      setSlots((prev) => prev.map((s) => (s?.name === perk.name ? null : s)));
      return;
    }

    if (isFull || flight) return;

    const targetIdx = slots.findIndex((s) => s === null);
    const slotEl = slotRefs.current[targetIdx];
    const octaEl = buttonEl.querySelector("[data-octa]") as HTMLElement | null;

    if (!slotEl || !octaEl) {
      setSlots((prev) => {
        const next = [...prev];
        next[targetIdx] = perk;
        return next;
      });
      return;
    }

    setFlight({
      perk,
      fromRect: octaEl.getBoundingClientRect(),
      toRect: slotEl.getBoundingClientRect(),
      targetIdx,
    });
  };

  const handleLand = () => {
    if (!flight) return;

    setSlots((prev) => {
      const next = [...prev];
      next[flight.targetIdx] = flight.perk;
      return next;
    });

    // WAAPI ignores the CSS reduced-motion kill-switch — guard manually.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slotEl = slotRefs.current[flight.targetIdx];
    if (slotEl && !reducedMotion) {
      slotEl.animate(
        [
          { transform: "scale(0.85)", opacity: 0.6 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }

    setFlight(null);
  };

  // Randomise with a staggered flicker reveal on the slots; announce
  // the result for screen readers (the visual flicker is silent).
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const handleRandomise = () => {
    constraintActions.randomise();
    setRevealTick((t) => t + 1);
  };

  useEffect(() => {
    if (revealTick === 0) return;
    const names = slotsRef.current.filter(Boolean).map((p) => p!.name);
    if (names.length) setAnnouncement(`Build randomised: ${names.join(", ")}`);
  }, [revealTick]);

  const handleLoadBuild = (build: Build) => {
    setSlots(buildToSlots(build.perks, perks));
    setFlight(null);
  };

  const handleSaveClick = () => {
    if (!userId) { onOpenAuthModal(); return; }
    setIsSaveModalOpen(true);
  };

  const handleModalSave = async (name: string) => {
    await onSave(name, slots.map((p) => p?.name ?? null));
    setIsSaveModalOpen(false);
  };

  const handleShareUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
  };

  const handleCopyText = () => {
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    const lines = [`[${roleLabel} Build]`];
    slots.forEach((perk, i) => lines.push(`${i + 1}. ${perk?.name ?? "—"}`));
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
  };

  const hasPerks = inBuild.size > 0;

  return (
    <div className={styles.buildMaker}>
      {isSaveModalOpen && (
        <SaveBuildModal
          slots={slots}
          onSave={handleModalSave}
          onClose={() => setIsSaveModalOpen(false)}
        />
      )}

      {flight && (
        <FlyingPerk
          perk={flight.perk}
          fromRect={flight.fromRect}
          toRect={flight.toRect}
          onLand={handleLand}
        />
      )}

      {/* Screen-reader announcement for randomise results */}
      <div className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* The randomiser leads the page */}
      <RandomiserHero
        onRandomise={handleRandomise}
        constraints={constraints}
        constraintActions={constraintActions}
        constraintDerived={constraintDerived}
      />

      {/* Top band: slots + toolbar + actions */}
      <div className={styles.topBand}>
        <div className={styles.buildSlots}>
          {slots.map((perk, i) => (
            <div key={i} className={styles.slot}>
              <div
                ref={(el) => { slotRefs.current[i] = el; }}
                key={`reveal-${revealTick}`}
                className={`${styles["slot__octa"]} ${revealTick > 0 ? styles["slot__octa--reveal"] : ""}`}
                style={revealTick > 0 ? { animationDelay: `${i * 60}ms` } : undefined}
                data-filled={String(!!perk)}
                onClick={() => perk && removeSlot(i)}
                role={perk ? "button" : undefined}
                tabIndex={perk ? 0 : undefined}
                onKeyDown={(e) => e.key === "Enter" && perk && removeSlot(i)}
                title={perk ? `Remove ${perk.name}` : "Empty"}
                aria-label={perk ? `Remove ${perk.name}` : "Empty perk slot"}
              >
                {perk ? (
                  <img
                    className={styles["slot__img"]}
                    style={{ clipPath: OCTAGON }}
                    src={getPerkImageUrl(perk.image)}
                    alt={perk.name}
                    onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
                  />
                ) : (
                  <span className={styles["slot__plus"]}>+</span>
                )}
              </div>
              <span className={styles["slot__name"]}>{perk?.name ?? " "}</span>
              <button
                className={`${styles["slot__pinBtn"]} ${constraints.pinnedSlots.has(i) ? styles["slot__pinBtn--pinned"] : ""}`}
                onClick={() => constraintActions.togglePin(i)}
                disabled={!perk}
              >
                {constraints.pinnedSlots.has(i) ? "Pinned" : "Pin"}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.actionsRow}>
          <div className={styles.clearRow}>
            <button className={styles.saveBtn} onClick={handleSaveClick} disabled={!hasPerks}>
              Save Build
            </button>
            <button
              className={styles.clearBtn}
              onClick={() => {
                [...constraints.pinnedSlots].forEach((i) => {
                  if (slots[i]) constraintActions.togglePin(i);
                });
                setSlots([null, null, null, null]);
              }}
              disabled={!hasPerks}
            >
              Clear Build
            </button>
          </div>
          <ExportToolbar
            onShareUrl={handleShareUrl}
            onCopyText={handleCopyText}
            onDownloadImage={async () => {
              const ok = await exportBuildImage(slots, role);
              if (!ok) showToast("Failed to export image");
            }}
            buildActive={hasPerks}
            onExportTierList={hasRatings ? onExportTierList : undefined}
          />
        </div>
      </div>

      {/* Middle band: descriptions (left) + picker (right) */}
      <div className={styles.middleBand}>
        <div className={styles.leftPanel}>
          {hasPerks ? (
            <div className={styles.summary}>
              {slots.filter(Boolean).map((perk) => (
                <div key={perk!.name} className={styles["summary__row"]}>
                  <div className={styles["summary__iconWrap"]}>
                    <img
                      className={styles["summary__icon"]}
                      style={{ clipPath: OCTAGON }}
                      src={getPerkImageUrl(perk!.image)}
                      alt={perk!.name}
                      onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
                    />
                  </div>
                  <div className={styles["summary__body"]}>
                    <h3 className={styles["summary__name"]}>{perk!.name}</h3>
                    <p
                      className={styles["summary__description"]}
                      dangerouslySetInnerHTML={{ __html: resolveDescription(perk!.description, perk!.tunables) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyPanel}>Select perks to see their descriptions.</p>
          )}
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.searchRow}>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search perks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.picker}>
            {filteredPerks.map((perk) => {
              const active = inBuild.has(perk.name);
              const banned = constraints.blacklist.has(perk.name);
              const dimmed = !active && (isFull || banned);

              return (
                <div key={perk.name} style={{ position: "relative" }}>
                  <button
                    className={`${styles["pickerItem"]} ${active ? styles["pickerItem--active"] : ""} ${dimmed ? styles["pickerItem--dimmed"] : ""}`}
                    onClick={(e) => handlePickerClick(perk, e.currentTarget)}
                    disabled={!active && isFull}
                    title={banned ? `${perk.name} (blacklisted — click ⊘ to remove)` : perk.name}
                  >
                    <div
                      className={styles["pickerItem__octa"]}
                      data-active={String(active)}
                      data-octa
                      style={{ opacity: flight?.perk.name === perk.name ? 0 : 1 }}
                    >
                      <img
                        className={styles["pickerItem__img"]}
                        style={{ clipPath: OCTAGON }}
                        src={getPerkImageUrl(perk.image)}
                        alt={perk.name}
                        onError={(e) => (e.currentTarget.src = "/perk-placeholder.svg")}
                      />
                    </div>
                    <span className={styles["pickerItem__name"]}>{perk.name}</span>
                  </button>
                  <button
                    className={`${styles["banBtn"]} ${banned ? styles["banBtn--active"] : ""}`}
                    onClick={() => constraintActions.toggleBlacklist(perk.name)}
                    aria-label={banned ? `Remove ${perk.name} from blacklist` : `Exclude ${perk.name} from randomiser`}
                    title={banned ? "Remove from blacklist" : "Exclude from randomiser"}
                  >
                    ⊘
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div id="saved">
        <SavedBuilds
          builds={builds}
          role={role}
          perks={perks}
          userId={userId}
          onOpenAuthModal={onOpenAuthModal}
          isCurrentBuildEmpty={slots.every((s) => s === null)}
          onLoad={handleLoadBuild}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
