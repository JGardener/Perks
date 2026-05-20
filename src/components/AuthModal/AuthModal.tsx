import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./AuthModal.module.scss";

interface AuthModalProps {
  onClose: () => void;
}

type Mode = "signin" | "signup";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
);

export const AuthModal = ({ onClose }: AuthModalProps) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape + focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(
        "button, input, [href], [tabindex]:not([tabindex='-1'])",
      ),
    ).filter((el) => !el.hasAttribute("disabled"));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    window.addEventListener("keydown", onKey);
    first?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, success]); // re-run when success changes (different focusable elements)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password);

    setLoading(false);

    if (error) { setError(error.message); return; }
    if (mode === "signup") { setSuccess(true); } else { onClose(); }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setSuccess(false);
  };

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        ref={modalRef}
      >
        <h2 id="auth-modal-title" className={styles.visuallyHidden}>
          {mode === "signin" ? "Sign in to your account" : "Create an account"}
        </h2>

        <button className={styles.close} onClick={onClose} aria-label="Close sign in dialog">
          ✕
        </button>

        <div className={styles.tabs} role="tablist" aria-label="Authentication mode">
          <button
            role="tab"
            aria-selected={mode === "signin"}
            className={`${styles["tabs__tab"]} ${mode === "signin" ? styles["tabs__tab--active"] : ""}`}
            onClick={() => switchMode("signin")}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={mode === "signup"}
            className={`${styles["tabs__tab"]} ${mode === "signup" ? styles["tabs__tab--active"] : ""}`}
            onClick={() => switchMode("signup")}
          >
            Create Account
          </button>
        </div>

        {success ? (
          <p className={styles.successMsg} role="status">
            Account created — check your email to confirm, then sign in.
          </p>
        ) : (
          <>
            <button className={styles.googleBtn} type="button" onClick={() => signInWithGoogle()}>
              <GoogleIcon />
              Continue with Google
            </button>
            <div className={styles.divider} aria-hidden="true">or</div>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label className={styles.label}>
              Password
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </label>
            {error && <p className={styles.error} role="alert" aria-live="assertive">{error}</p>}
            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? "…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
          </>
        )}
      </div>
    </div>
  );
};
