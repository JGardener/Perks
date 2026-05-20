import { useMemo, useState } from "react";
import type { Grade, Perk, PerkCategory } from "../../types/dbd";
import { CategoryFilter } from "../CategoryFilter/CategoryFilter";
import { PerkCard } from "../PerkCard/PerkCard";
import { PerkModal } from "../PerkModal/PerkModal";
import { RatingFilter } from "../RatingFilter/RatingFilter";
import type { RatingFilterValue } from "../RatingFilter/RatingFilter";
import { SortBar } from "../SortBar/SortBar";
import type { SortDirection, SortField } from "../SortBar/SortBar";
import { GRADE_ORDER } from "../../utils/gradeColors";
import styles from "./PerkSection.module.scss";

interface PerkSectionProps {
  role: "survivor" | "killer";
  perks: Perk[];
  characterMap: Record<number, string>;
  ratings: Record<string, Grade>;
  onRate: (perkName: string, grade: Grade | null) => void;
}

export const PerkSection = ({ role, perks, characterMap, ratings, onRate }: PerkSectionProps) => {
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [activeCategories, setActiveCategories] = useState<Set<PerkCategory>>(new Set());
  const [activeGrades, setActiveGrades] = useState<Set<RatingFilterValue>>(new Set());
  const [selectedPerk, setSelectedPerk] = useState<Perk | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleGrade = (value: RatingFilterValue) => {
    setActiveGrades((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const toggleCategory = (cat: PerkCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const characterLabel = role === "killer" ? "Killer" : "Survivor";
  const activeFilterCount = activeCategories.size + activeGrades.size;

  const availableCategories = useMemo(() => {
    const seen = new Set<PerkCategory>();
    for (const perk of perks) {
      for (const cat of perk.categories ?? []) seen.add(cat);
    }
    return [...seen].sort();
  }, [perks]);

  const sortedPerks = useMemo(() => {
    let filtered = activeCategories.size === 0
      ? perks
      : perks.filter((p) => p.categories?.some((c) => activeCategories.has(c)));

    if (activeGrades.size > 0) {
      filtered = filtered.filter((p) => {
        const grade = ratings[p.name];
        return grade ? activeGrades.has(grade) : activeGrades.has("unrated");
      });
    }

    return [...filtered].sort((a, b) => {
      let result = 0;

      if (sortBy === "name") {
        result = a.name.localeCompare(b.name);
      } else if (sortBy === "character") {
        const nameA = a.character !== null ? (characterMap[a.character] ?? "") : "";
        const nameB = b.character !== null ? (characterMap[b.character] ?? "") : "";
        if (!nameA && nameB) return 1;
        if (nameA && !nameB) return -1;
        result = nameA.localeCompare(nameB);
      } else if (sortBy === "grade") {
        const gradeA = ratings[a.name];
        const gradeB = ratings[b.name];
        if (!gradeA && !gradeB) return 0;
        if (!gradeA) return 1;
        if (!gradeB) return -1;
        result = GRADE_ORDER[gradeA] - GRADE_ORDER[gradeB];
      }

      return direction === "asc" ? result : -result;
    });
  }, [perks, sortBy, direction, characterMap, ratings, activeCategories, activeGrades]);

  const selectedCharacterName = selectedPerk?.character != null
    ? (characterMap[selectedPerk.character] ?? null)
    : null;

  return (
    <section className={styles.perkSection} aria-label={`${characterLabel} perks`}>
      <SortBar
        sortBy={sortBy}
        direction={direction}
        onSortChange={setSortBy}
        onDirectionToggle={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))}
        characterLabel={characterLabel}
      />

      <div className={styles.filtersRow}>
        <button
          className={`${styles.filtersToggle} ${filtersOpen ? styles["filtersToggle--open"] : ""} ${activeFilterCount > 0 ? styles["filtersToggle--active"] : ""}`}
          onClick={() => setFiltersOpen((f) => !f)}
          aria-expanded={filtersOpen}
          aria-controls="perk-filters-panel"
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
      </div>

      {filtersOpen && (
        <div id="perk-filters-panel">
          <CategoryFilter
            available={availableCategories}
            active={activeCategories}
            onToggle={toggleCategory}
            onClear={() => setActiveCategories(new Set())}
          />
          <RatingFilter
            active={activeGrades}
            onToggle={toggleGrade}
            onClear={() => setActiveGrades(new Set())}
          />
        </div>
      )}

      <div className={styles.perkList}>
        {sortedPerks.map((perk) => {
          const characterName = perk.character !== null ? (characterMap[perk.character] ?? null) : null;
          return (
            <PerkCard
              key={perk.name}
              perk={perk}
              characterName={characterName}
              rating={ratings[perk.name] ?? null}
              onRate={(grade) => onRate(perk.name, grade)}
              onClick={() => setSelectedPerk(perk)}
            />
          );
        })}
      </div>

      {selectedPerk && (
        <PerkModal
          perk={selectedPerk}
          characterName={selectedCharacterName}
          rating={ratings[selectedPerk.name] ?? null}
          onRate={(grade) => onRate(selectedPerk.name, grade)}
          onClose={() => setSelectedPerk(null)}
        />
      )}
    </section>
  );
};
