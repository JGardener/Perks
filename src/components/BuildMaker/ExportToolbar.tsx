import { useState } from "react";
import styles from "./ExportToolbar.module.scss";

interface ExportToolbarProps {
  onShareUrl: () => void;
  onCopyText: () => void;
  onDownloadImage: () => void;
  buildActive: boolean;
  onExportTierList?: () => void;
}

export const ExportToolbar = ({
  onShareUrl,
  onCopyText,
  onDownloadImage,
  buildActive,
  onExportTierList,
}: ExportToolbarProps) => {
  const [urlCopied, setUrlCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);

  const handleShareUrl = () => {
    onShareUrl();
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleCopyText = () => {
    onCopyText();
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  return (
    <div className={styles.toolbar}>
      <button
        className={`${styles.btn} ${urlCopied ? styles["btn--confirm"] : ""}`}
        onClick={handleShareUrl}
        disabled={!buildActive}
      >
        {urlCopied ? "Copied!" : "Share URL"}
      </button>
      <button
        className={`${styles.btn} ${textCopied ? styles["btn--confirm"] : ""}`}
        onClick={handleCopyText}
        disabled={!buildActive}
      >
        {textCopied ? "Copied!" : "Copy Text"}
      </button>
      <button className={styles.btn} onClick={onDownloadImage} disabled={!buildActive}>
        Download Image
      </button>
      {onExportTierList && (
        <>
          <div className={styles.separator} role="separator" aria-orientation="vertical" />
          <button className={styles.btn} onClick={onExportTierList}>
            Export Tier List
          </button>
        </>
      )}
    </div>
  );
};
