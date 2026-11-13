import type { CSSProperties, ReactNode } from "react";
import { collectionInitials, type CollectionLayout } from "../invitation-collection";
import type { OpenPageTheme } from "./schema";
import "./collection-cover.css";

interface Props {
  layout: CollectionLayout;
  theme: OpenPageTheme;
  title: string;
  eyebrow?: string;
  date?: string;
  description?: string;
  photo?: string;
  ornament?: ReactNode;
  miniature?: boolean;
}

export function CollectionCover({ layout, theme, title, eyebrow, date, description, photo, ornament, miniature }: Props) {
  const Heading = miniature ? "span" : "h1";
  const hasPhoto = layout === "botanical" || layout === "folio";
  return (
    <div
      className={`kalakai-cover-cover kalakai-cover-${layout}${miniature ? " kalakai-cover-miniature" : ""}`}
      data-layout={layout}
      style={{
        "--cover-paper": theme.bgColor, "--cover-panel": theme.cardBgColor, "--cover-ink": theme.textColor,
        "--cover-accent": theme.accentColor, "--cover-muted": theme.textMutedColor,
      } as CSSProperties}
    >
      <div className="kalakai-cover-sheet">
        {layout === "letter" && <span className="kalakai-cover-monogram" aria-hidden="true">{collectionInitials(title)}</span>}
        {ornament || (layout === "pavilion" && <span className="kalakai-cover-ornament" aria-hidden="true">✦</span>)}
        <span className="kalakai-cover-eyebrow">{eyebrow || "Undangan Pernikahan"}</span>
        <Heading className="kalakai-cover-heading">{title}</Heading>
        {hasPhoto && (photo || miniature) && (
          <div className="kalakai-cover-photo" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo && <img src={photo} alt="" />}
          </div>
        )}
        {date && <span className="kalakai-cover-date">{date}</span>}
        {description && <p className="kalakai-cover-description">{description}</p>}
      </div>
    </div>
  );
}
