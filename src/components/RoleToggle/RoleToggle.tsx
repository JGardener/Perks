import type { Role } from "../../hooks/useRoleParam";
import styles from "./RoleToggle.module.scss";

interface RoleToggleProps {
  role: Role;
  onChange: (role: Role) => void;
}

export const RoleToggle = ({ role, onChange }: RoleToggleProps) => (
  <nav aria-label="Role selection">
    <div className={styles.roleToggle} role="tablist">
      {(["survivor", "killer"] as const).map((r) => (
        <button
          key={r}
          role="tab"
          aria-selected={role === r}
          className={`${styles.roleToggle__tab} ${role === r ? styles["roleToggle__tab--active"] : ""}`}
          onClick={() => onChange(r)}
        >
          {r}
        </button>
      ))}
    </div>
  </nav>
);
