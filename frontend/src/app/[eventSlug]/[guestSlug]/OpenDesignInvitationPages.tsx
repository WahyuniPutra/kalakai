"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Page = { id: string; title: string; canvas_json: string; sort_order: number };
type FabricObject = Record<string, any>;
type ParsedPage = { page: Page; objects: FabricObject[] };

function textForObject(object: FabricObject, values: Record<string, string>, names: string, guestName: string, dateText: string, location: string) {
  const fieldName = typeof object.fieldName === "string" ? object.fieldName : "";
  let text = fieldName && values[fieldName] ? values[fieldName] : String(object.text ?? "");
  return text
    .replaceAll("{{nama_tamu}}", guestName || "Tamu Undangan")
    .replaceAll("{{pasangan}}", names || "Nama Pasangan")
    .replaceAll("Nama\n&\nPasangan", names.replace(" & ", "\n&\n") || "Nama\n&\nPasangan")
    .replaceAll("Nama Gedung · Kota", location || "Lokasi acara")
    .replaceAll("SABTU, 20 DESEMBER 2026", dateText.toLocaleUpperCase("id-ID"));
}

function cssColor(value: unknown, fallback = "transparent") {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && Array.isArray((value as any).colorStops)) {
    const stops = (value as any).colorStops.map((stop: any) => `${stop.color} ${Math.round((stop.offset ?? 0) * 100)}%`).join(", ");
    const coords = (value as any).coords ?? {};
    return `linear-gradient(${Math.atan2(coords.y2 - coords.y1, coords.x2 - coords.x1) * 180 / Math.PI}deg, ${stops})`;
  }
  return fallback;
}

function pathData(path: unknown) {
  if (!Array.isArray(path)) return "";
  return path.map((segment) => Array.isArray(segment) ? segment.map((part, index) => index === 0 ? String(part) : typeof part === "number" ? String(Number(part.toFixed(3))) : String(part)).join(" ") : "").join(" ");
}

function ObjectLayer({ object, width, height, fields, names, guestName, dateText, location, layerIndex, animationsEnabled }: {
  object: FabricObject; width: number; height: number; fields: Record<string, string>; names: string; guestName: string; dateText: string; location: string; layerIndex: number; animationsEnabled: boolean;
}) {
  const type = String(object.type ?? "").toLowerCase();
  const text = ["textbox", "text", "i-text"].includes(type) ? textForObject(object, fields, names, guestName, dateText, location) : "";
  const x = Number(object.left ?? 0);
  const y = Number(object.top ?? 0);
  const objectWidth = Math.max(0, Number(object.width ?? 0) * Math.abs(Number(object.scaleX ?? 1)));
  const fontSize = Number(object.fontSize ?? 24);
  const estimatedLines = Math.max(1, Math.ceil(text.length / Math.max(1, objectWidth / (fontSize * 0.52))));
  const objectHeight = Math.max(0, Number(object.height ?? (text ? estimatedLines * fontSize * Number(object.lineHeight ?? 1.18) : 0)) * Math.abs(Number(object.scaleY ?? 1)));
  const originX = object.originX === "center" ? "-50%" : object.originX === "right" ? "-100%" : "0";
  const originY = object.originY === "center" ? "-50%" : object.originY === "bottom" ? "-100%" : "0";
  const flipX = object.flipX ? -1 : 1;
  const flipY = object.flipY ? -1 : 1;
  const transform = `translate(${originX},${originY}) rotate(${Number(object.angle ?? 0)}deg) scale(${flipX},${flipY})`;
  const rawAnimation = animationsEnabled ? String(object.kalakaiAnimation ?? "none") : "none";
  const animation = ["fade", "slide-up", "zoom", "float"].includes(rawAnimation) ? rawAnimation : "none";
  const style: CSSProperties = {
    position: "absolute",
    left: `${x / width * 100}%`, top: `${y / height * 100}%`,
    width: `${objectWidth / width * 100}%`, height: `${objectHeight / height * 100}%`,
    opacity: animation === "none" ? Number(object.opacity ?? 1) : undefined, transform,
    transformOrigin: "top left", zIndex: layerIndex,
    mixBlendMode: (object.globalCompositeOperation as CSSProperties["mixBlendMode"]) ?? "normal",
    filter: object.shadow?.color ? `drop-shadow(${object.shadow.offsetX ?? 0}px ${object.shadow.offsetY ?? 0}px ${object.shadow.blur ?? 0}px ${object.shadow.color})` : undefined,
    pointerEvents: "none",
    ["--layer-opacity" as string]: Number(object.opacity ?? 1),
  };
  if (object.visible === false) return null;

  if (type === "group" && Array.isArray(object.objects)) {
    return <div className="opendesign-html-object" style={style} data-animation={animation}>{object.objects.map((child: FabricObject, index: number) => <ObjectLayer key={child.id ?? index} object={child} width={Number(object.width) || width} height={Number(object.height) || height} fields={fields} names={names} guestName={guestName} dateText={dateText} location={location} layerIndex={index} animationsEnabled={animationsEnabled} />)}</div>;
  }

  if (type === "image") {
    const src = String(object.src ?? object._originalElement?.src ?? "");
    if (!src) return null;
    const radius = object.clipPath?.type === "ellipse" ? "50%" : `${Math.max(Number(object.rx ?? 0), Number(object.ry ?? 0)) / Math.max(1, Math.min(objectWidth, objectHeight)) * 100}%`;
    const imageStyle: CSSProperties = { width: "100%", height: "100%", display: "block", objectFit: "cover", objectPosition: "center", borderRadius: radius, filter: object.filters?.length ? "saturate(.92)" : undefined };
    return <div className="opendesign-html-object" data-animation={animation} style={style}><img src={src} alt={String(object.alt ?? "Elemen undangan")} draggable={false} style={imageStyle} /></div>;
  }

  if (["textbox", "text", "i-text"].includes(type)) {
    const textStyle: CSSProperties = {
      display: "block", width: "100%", height: "100%", overflow: "hidden", whiteSpace: "pre-wrap", overflowWrap: "anywhere",
      color: cssColor(object.fill, "#222"), fontFamily: object.fontFamily ?? "Arial, sans-serif", fontSize: `${fontSize / width * 100}cqw`,
      fontWeight: object.fontWeight ?? (object.fontStyle?.includes("bold") ? 700 : 400), fontStyle: object.fontStyle?.includes("italic") ? "italic" : "normal",
      textAlign: object.textAlign ?? "left", lineHeight: Number(object.lineHeight ?? 1.16), letterSpacing: `${Number(object.charSpacing ?? 0) / 1000 * fontSize / width * 100}cqw`,
      textDecoration: object.underline ? "underline" : undefined,
      WebkitTextStroke: Number(object.strokeWidth ?? 0) > 0 ? `${Number(object.strokeWidth) / width * 100}cqw ${cssColor(object.stroke)}` : undefined,
      alignContent: object.verticalAlign === "middle" ? "center" : object.verticalAlign === "bottom" ? "end" : "start",
    };
    return <div className="opendesign-html-object" data-animation={animation} style={style}><span style={textStyle}>{text}</span></div>;
  }

  if (type === "path" || type === "polygon" || type === "polyline" || type === "line") {
    let d = pathData(object.path);
    if (!d && Array.isArray(object.points)) {
      d = object.points.map((point: any, index: number) => `${index ? "L" : "M"} ${Number(point.x)} ${Number(point.y)}`).join(" ");
      if (type === "polygon") d += " Z";
    }
    if (!d && type === "line") d = `M ${Number(object.x1 ?? 0)} ${Number(object.y1 ?? 0)} L ${Number(object.x2 ?? object.width ?? 0)} ${Number(object.y2 ?? object.height ?? 0)}`;
    const pathOffset = object.pathOffset ?? { x: 0, y: 0 };
    const pathStyle: CSSProperties = { width: "100%", height: "100%", overflow: "visible" };
    return <div className="opendesign-html-object" data-animation={animation} style={style}><svg viewBox={`0 0 ${Math.max(1, Number(object.width ?? 1))} ${Math.max(1, Number(object.height ?? 1))}`} preserveAspectRatio="none" style={pathStyle}><path d={d} transform={`translate(${-Number(pathOffset.x ?? 0)} ${-Number(pathOffset.y ?? 0)})`} fill={type === "line" || type === "polyline" ? "none" : cssColor(object.fill)} stroke={cssColor(object.stroke, "none")} strokeWidth={Number(object.strokeWidth ?? 1)} strokeDasharray={Array.isArray(object.strokeDashArray) ? object.strokeDashArray.join(" ") : undefined} strokeLinecap={object.strokeLineCap ?? "butt"} strokeLinejoin={object.strokeLineJoin ?? "miter"} vectorEffect="non-scaling-stroke" /></svg></div>;
  }

  if (["rect", "circle", "ellipse", "triangle", "roundrect"].includes(type)) {
    const shapeStyle: CSSProperties = {
      width: "100%", height: "100%", boxSizing: "border-box", background: cssColor(object.fill),
      border: Number(object.strokeWidth ?? 0) > 0 ? `${Number(object.strokeWidth) / width * 100}cqw ${object.strokeDashArray ? "dashed" : "solid"} ${cssColor(object.stroke)}` : undefined,
      borderRadius: type === "circle" || type === "ellipse" ? "50%" : type === "roundrect" ? "12%" : `${Math.max(Number(object.rx ?? 0), Number(object.ry ?? 0)) / Math.max(1, Math.min(objectWidth, objectHeight)) * 100}%`,
      clipPath: type === "triangle" ? "polygon(50% 0, 0 100%, 100% 100%)" : undefined,
      backgroundImage: typeof object.fill === "object" ? cssColor(object.fill) : undefined,
    };
    return <div className="opendesign-html-object" data-animation={animation} style={style}><div style={shapeStyle} /></div>;
  }

  return null;
}

export default function OpenDesignInvitationPages({ pages, width, height, names, guestName, eventDate, location, fields, packageCode, pageTransition, isActive }: {
  pages: Page[]; width: number; height: number; names: string; guestName: string; eventDate: string; location: string; fields: Record<string, string>; packageCode: string; pageTransition: string; isActive: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const sortedPages = useMemo(() => [...pages].sort((a, b) => a.sort_order - b.sort_order), [pages]);
  const parsedPages = useMemo<ParsedPage[]>(() => sortedPages.map((page) => {
    try {
      const json = JSON.parse(page.canvas_json || "{}") as { objects?: FabricObject[] };
      return { page, objects: Array.isArray(json.objects) ? json.objects : [] };
    } catch { return { page, objects: [] }; }
  }), [sortedPages]);
  const dateText = eventDate ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(eventDate)) : "Tanggal acara";
  const transition = packageCode === "free" ? "fade" : ["fade", "slide", "flip", "zoom"].includes(pageTransition) ? pageTransition : "fade";

  useEffect(() => {
    const container = host.current;
    if (!container || !isActive) return;
    const pagesToObserve = Array.from(container.querySelectorAll<HTMLElement>(".opendesign-public-page"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pagesToObserve.forEach((page) => page.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const page = entry.target as HTMLElement;
        page.classList.add("is-visible");
        page.querySelectorAll<HTMLElement>(".opendesign-html-object[data-animation]").forEach((object, index) => {
          if (packageCode === "free") return;
          object.style.setProperty("--element-delay", `${Math.min(index * 65, 520)}ms`);
          object.classList.add("is-visible");
        });
        observer.unobserve(page);
      });
    }, { threshold: 0.16 });
    pagesToObserve.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [isActive, parsedPages, packageCode]);

  return <div ref={host} className="opendesign-public-pages">
    {parsedPages.map(({ page, objects }) => <section key={page.id} className={`opendesign-public-page page-transition-${transition}`} aria-label={page.title || "Halaman undangan"}>
      <div className="opendesign-html-artboard" style={{ aspectRatio: `${width} / ${height}` }}>
        {objects.map((object, index) => <ObjectLayer key={object.id ?? `${page.id}-${index}`} object={object} width={width} height={height} fields={fields} names={names} guestName={guestName} dateText={dateText} location={location} layerIndex={index} animationsEnabled={packageCode !== "free"} />)}
      </div>
    </section>)}
  </div>;
}
