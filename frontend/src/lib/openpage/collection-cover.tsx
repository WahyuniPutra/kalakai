import type { CSSProperties } from "react";
import { collectionInitials, type CollectionLayout } from "../invitation-collection";
import type { OpenPageTheme } from "./schema";
import styles from "./collection-cover.module.css";

interface Props {
  layout: CollectionLayout;
  theme: OpenPageTheme;
  title: string;
  eyebrow?: string;
  date?: string;
  description?: string;
  photo?: string;
  miniature?: boolean;
}

export function CollectionCover({ layout, theme, title, eyebrow, date, description, photo, miniature }: Props) {
  const Heading = miniature ? "span" : "h1";
  const hasPhoto = layout === "botanical" || layout === "folio";
  return (
    <div
      className={`${styles.cover} ${styles[layout]}${miniature ? ` ${styles.miniature}` : ""}`}
      style={{
        "--cover-paper": theme.bgColor, "--cover-panel": theme.cardBgColor, "--cover-ink": theme.textColor,
        "--cover-accent": theme.accentColor, "--cover-muted": theme.textMutedColor,
      } as CSSProperties}
    >
      <div className={styles.sheet}>
        {layout === "letter" && <span className={styles.monogram} aria-hidden="true">{collectionInitials(title)}</span>}
        {layout === "pavilion" && <span className={styles.ornament} aria-hidden="true">✦</span>}
        <span className={styles.eyebrow}>{eyebrow || "Undangan Pernikahan"}</span>
        <Heading className={styles.heading}>{title}</Heading>
        {hasPhoto && (photo || miniature) && (
          <div className={styles.photo} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo && <img src={photo} alt="" />}
          </div>
        )}
        {date && <span className={styles.date}>{date}</span>}
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
}
