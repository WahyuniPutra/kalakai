"use client";

import type { InvitationElement, InvitationWebDesign } from "../../invitation-web-types";

type Props = { design: InvitationWebDesign; event: { title: string; groom_name: string | null; bride_name: string | null; event_date: string | null; location_name: string; location_address: string; map_url: string; spotify_track_id: string | null; theme_config: { quote?: string; quote_source?: string; hero_image_url?: string; love_story?: Array<{ year: string; title: string; desc: string }> } | null }; guestName?: string; timeLeft: { days: number; hours: number; minutes: number; seconds: number }; onRsvp: () => void };

const dateText = (date: string | null) => date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date(date)) : "Tanggal acara menyusul";

export default function InvitationWebRenderer({ design, event, guestName, timeLeft, onRsvp }: Props) {
  const theme = event.theme_config ?? {};
  const names = [event.groom_name, event.bride_name].filter(Boolean).join(" & ") || event.title;
  return <main className="invitation-web-page" data-transition={design.transition} style={{ fontFamily: design.fontFamily }}>
    {design.sections.filter((section) => section.visible).map((section) => <section key={section.id} id={section.type === "gifts" ? "gifts" : section.type === "rsvp" ? "rsvp" : section.id} className={`invitation-web-section layout-${section.layout} type-${section.type}`} style={{ backgroundColor: section.background }}>
      <div className="invitation-web-content">
        {section.eyebrow && <p className="invitation-web-eyebrow">{section.eyebrow}</p>}
        {section.type === "hero" && theme.hero_image_url && <img className="invitation-web-hero-image" src={theme.hero_image_url} alt="Foto pasangan"/>}
        <h1>{section.type === "hero" ? names : section.type === "couple" ? names : section.type === "event" ? section.heading : section.heading}</h1>
        {section.type === "hero" && <p className="invitation-web-subtitle">{section.description || event.title}</p>}
        {section.type === "hero" && <p className="invitation-web-guest">Kepada Yth. {guestName || "Tamu Undangan"}</p>}
        {section.type === "couple" && <div className="invitation-web-couple"><article><span>MEMPELAI</span><h2>{event.groom_name || event.title}</h2><p>Dengan keluarga besar</p></article><i>&amp;</i><article><span>MEMPELAI</span><h2>{event.bride_name || "Pasangan"}</h2><p>Dengan keluarga besar</p></article></div>}
        {section.type === "quote" && <blockquote>{theme.quote || section.description}<cite>{theme.quote_source}</cite></blockquote>}
        {section.type === "countdown" && <div className="invitation-web-countdown">{([[timeLeft.days,"Hari"],[timeLeft.hours,"Jam"],[timeLeft.minutes,"Menit"],[timeLeft.seconds,"Detik"]] as const).map(([value,label]) => <div key={label}><b>{String(value).padStart(2,"0")}</b><span>{label}</span></div>)}</div>}
        {section.type === "event" && <div className="invitation-web-event"><article><span>WAKTU</span><h2>{dateText(event.event_date)}</h2></article><article><span>TEMPAT</span><h2>{event.location_name || "Lokasi acara"}</h2><p>{event.location_address}</p>{event.map_url && <a href={event.map_url} target="_blank" rel="noreferrer">Buka Google Maps ↗</a>}</article></div>}
        {section.type === "gallery" && theme.hero_image_url && <img className="invitation-web-gallery-image" src={theme.hero_image_url} alt="Galeri momen"/>}
        {section.type === "story" && <div className="invitation-web-story">{(theme.love_story ?? []).map((story,index) => <article key={`${story.year}-${index}`}><span>{story.year}</span><h2>{story.title}</h2><p>{story.desc}</p></article>)}</div>}
        {section.type === "spotify" && event.spotify_track_id && <iframe className="invitation-web-spotify" src={`https://open.spotify.com/embed/track/${encodeURIComponent(event.spotify_track_id)}?utm_source=generator`} width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" title="Musik undangan"/>}
        {section.type === "gifts" && <div className="invitation-web-action"><p>{section.description}</p><a href="#gifts">Lihat tanda kasih</a></div>}
        {section.type === "rsvp" && <div className="invitation-web-action"><p>{section.description}</p><button type="button" onClick={onRsvp}>Kirim konfirmasi &amp; ucapan</button></div>}
        {section.elements.map((element) => <InvitationCustomElement key={element.id} element={element} />)}
        {!(["hero","couple","quote","countdown","event","gallery","story","spotify","gifts","rsvp"] as string[]).includes(section.type) && <p>{section.description}</p>}
        {section.type !== "hero" && section.type !== "couple" && section.type !== "quote" && section.type !== "countdown" && section.type !== "event" && section.type !== "story" && section.type !== "spotify" && section.type !== "gifts" && section.type !== "rsvp" && section.description && <p>{section.description}</p>}
      </div>
    </section>)}
    <footer className="invitation-web-footer">Dengan penuh sukacita · Kalakai</footer>
  </main>;
}

function InvitationCustomElement({ element }: { element: InvitationElement }) {
  const style: React.CSSProperties = { color: element.color, textAlign: element.align, fontFamily: element.fontFamily, fontSize: `clamp(${Math.min(element.fontSize, 24)}px, ${element.fontSize / 14}vw, ${element.fontSize}px)`, width: `${element.width}%`, margin: "20px auto", display: "block" };
  if (element.type === "image") {
    const url = element.imageUrl ?? "";
    if (!url || (!/^https?:\/\//i.test(url) && !url.startsWith("/"))) return null;
    return <img className={`invitation-web-custom-image frame-${element.frame}${element.shadow ? " has-shadow" : ""}`} style={style} src={url} alt={element.content || "Foto undangan"} loading="lazy"/>;
  }
  if (element.type === "divider") return <hr className="invitation-web-divider" style={{ width: `${element.width}%`, borderColor: element.color }} />;
  if (element.type === "ornament") return <div className="invitation-web-ornament" style={style} aria-hidden="true">{element.content || "✿"}</div>;
  if (element.type === "button") {
    const href = element.linkUrl ?? "#rsvp";
    const safeHref = href.startsWith("#") || /^https?:\/\//i.test(href) ? href : "#rsvp";
    return <a className="invitation-web-custom-button" href={safeHref} style={{ ...style, backgroundColor: element.color }} target={safeHref.startsWith("http") ? "_blank" : undefined} rel={safeHref.startsWith("http") ? "noreferrer" : undefined}>{element.content || "Lihat selengkapnya"}</a>;
  }
  return <p className="invitation-web-custom-text" style={style}>{element.content}</p>;
}
