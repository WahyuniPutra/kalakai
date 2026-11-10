"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  ArrowDown, ArrowUp, Copy, Eye, EyeOff, GripVertical, ImagePlus, Monitor, MousePointerClick,
  Play, Plus, RotateCcw, Smartphone, Sparkles, Trash2, Wand2, Lock, Palette, Film, Zap,
  Type, Heading as HeadingIcon, MousePointer2, Minus, Flower2, Clock, MoveVertical,
} from "lucide-react";
import {
  actionOptions, applyThemePreset, buttonVariants, dividerVariants, createElement, createSection,
  effectOptions, elementLabels, entranceOptions, filterOptions, fontOptions, frameOptions,
  hoverOptions, invitationSectionLabels, isLocked, loopOptions, maxSectionsFor, ornamentChoices,
  readyTemplates, revealOptions, ruleActionOptions, ruleWhenOptions, sectionDescriptions, sectionPresets, shadowOptions,
  textTokens, themePresets, uid, type Align, type ElementActionType, type ElementEntrance,
  type ElementHover, type ElementLoop, type ImageFilter, type InvitationElement, type InvitationElementType,
  type InvitationSectionType, type InvitationWebDesign, type InvitationWebSection, type MotionEasing,
  type MotionSpeed, type PackageCode, type ReadyTemplate, type RuleAction, type RuleWhen, type SectionReveal,
} from "../invitation-web-types";
import InvitationWebRenderer, { DND, type DropPayload, type RendererEvent, type SectionCommand } from "../[eventSlug]/[guestSlug]/InvitationWebRenderer";

const elementToolbox: Array<{ type: InvitationElementType; icon: typeof Type; hint: string }> = [
  { type: "heading", icon: HeadingIcon, hint: "Judul besar atau nama" },
  { type: "text", icon: Type, hint: "Paragraf atau kutipan" },
  { type: "image", icon: ImagePlus, hint: "Foto momen atau ilustrasi" },
  { type: "button", icon: MousePointer2, hint: "Tombol lokasi, RSVP, dll." },
  { type: "divider", icon: Minus, hint: "Garis pemisah elegan" },
  { type: "ornament", icon: Flower2, hint: "Simbol pemanis halaman" },
  { type: "countdown", icon: Clock, hint: "Hitung mundur hari-H" },
  { type: "spacer", icon: MoveVertical, hint: "Ruang pemisah vertikal" },
];

const sectionCatalogue = Object.keys(invitationSectionLabels) as InvitationSectionType[];

type Props = {
  value: InvitationWebDesign;
  onChange: (value: InvitationWebDesign) => void;
  title: string;
  groom: string;
  bride: string;
  date: string;
  location: string;
  quote: string;
  photo: string;
  primary: string;
  accent: string;
  plan?: PackageCode;
  eventId?: string | number;
  onUploadImage?: (file: File) => Promise<string>;
  onUpdateEventData?: (field: string, value: string) => void;
  onUpdatePrimaryColor?: (color: string) => void;
  onUpdateAccentColor?: (color: string) => void;
};

export default function InvitationHTMLBuilder({
  value, onChange, title, groom, bride, date, location, quote, photo, primary, accent,
  plan = "free", onUploadImage, onUpdateEventData, onUpdatePrimaryColor, onUpdateAccentColor,
}: Props) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(value.sections[0]?.id ?? "");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [interactive, setInteractive] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const [tab, setTab] = useState<"style" | "motion" | "action">("style");
  const [leftTab, setLeftTab] = useState<"templates" | "elements" | "sections" | "themes">("templates");
  const [uploading, setUploading] = useState(false);

  const applyTemplate = (tpl: ReadyTemplate) => {
    if (confirm(`Terapkan template "${tpl.name}"? Seluruh section siap pakai akan disusun otomatis dengan informasi acara Anda.`)) {
      const fullDesign = tpl.build({ title, groom, bride, date, location, quote });
      onChange(fullDesign);
      onUpdatePrimaryColor?.(tpl.primary);
      onUpdateAccentColor?.(tpl.accent);
      setSelectedSectionId(fullDesign.sections[0]?.id ?? "");
      setSelectedElementId(null);
    }
  };

  const maxSections = maxSectionsFor(plan);
  const activeSection = value.sections.find((section) => section.id === selectedSectionId) ?? value.sections[0];
  const activeElement = activeSection?.elements.find((element) => element.id === selectedElementId) ?? null;

  const mockEvent: RendererEvent = useMemo(() => ({
    title,
    event_type: "wedding",
    groom_name: groom || "Mempelai Pria",
    bride_name: bride || "Mempelai Wanita",
    event_date: date || null,
    location_name: location || "Lokasi Acara",
    location_address: "",
    map_url: "https://maps.google.com",
    spotify_track_id: null,
    theme_config: { quote, hero_image_url: photo },
  }), [title, groom, bride, date, location, quote, photo]);

  // ── Mutators ──
  const patchSection = (patch: Partial<InvitationWebSection>) => {
    if (!activeSection) return;
    onChange({ ...value, sections: value.sections.map((section) => section.id === activeSection.id ? { ...section, ...patch } : section) });
  };

  const patchSectionById = (id: string, patch: Partial<InvitationWebSection>) => {
    onChange({ ...value, sections: value.sections.map((section) => section.id === id ? { ...section, ...patch } : section) });
  };

  const patchElement = (patch: Partial<InvitationElement>) => {
    if (!activeSection || !activeElement) return;
    onChange({
      ...value,
      sections: value.sections.map((section) => section.id === activeSection.id ? {
        ...section,
        elements: section.elements.map((element) => element.id === activeElement.id ? { ...element, ...patch } : element),
      } : section),
    });
  };

  const addSection = (type: InvitationSectionType, atIndex?: number) => {
    if (value.sections.length >= maxSections) return;
    const created = createSection(type);
    const sections = [...value.sections];
    const index = typeof atIndex === "number" ? Math.min(sections.length, Math.max(0, atIndex)) : sections.length;
    sections.splice(index, 0, created);
    onChange({ ...value, sections });
    setSelectedSectionId(created.id);
    setSelectedElementId(null);
  };

  const addElement = (type: InvitationElementType, targetSectionId?: string, atIndex?: number) => {
    const target = value.sections.find((section) => section.id === (targetSectionId || activeSection?.id));
    if (!target || target.elements.length >= 30) return;
    const created = createElement(type, accent, value.fontFamily);
    const elements = [...target.elements];
    const index = typeof atIndex === "number" ? Math.min(elements.length, Math.max(0, atIndex)) : elements.length;
    elements.splice(index, 0, created);
    onChange({ ...value, sections: value.sections.map((section) => section.id === target.id ? { ...section, elements } : section) });
    setSelectedSectionId(target.id);
    setSelectedElementId(created.id);
  };

  const handleDropSection = (index: number, payload: DropPayload) => {
    if (payload.kind === "new") {
      addSection(payload.type as InvitationSectionType, index);
      return;
    }
    const fromIndex = value.sections.findIndex((section) => section.id === payload.id);
    if (fromIndex === -1) return;
    const sections = [...value.sections];
    const [moved] = sections.splice(fromIndex, 1);
    if (!moved) return;
    const target = fromIndex < index ? index - 1 : index;
    sections.splice(Math.max(0, Math.min(sections.length, target)), 0, moved);
    onChange({ ...value, sections });
  };

  const handleDropElement = (sectionId: string, index: number, payload: DropPayload) => {
    if (payload.kind === "new") {
      addElement(payload.type as InvitationElementType, sectionId, index);
      return;
    }
    const fromSection = value.sections.find((section) => section.id === payload.from);
    const targetSection = value.sections.find((section) => section.id === sectionId);
    if (!fromSection || !targetSection) return;
    const fromIndex = fromSection.elements.findIndex((element) => element.id === payload.id);
    if (fromIndex === -1) return;
    const element = fromSection.elements[fromIndex];
    if (!element) return;

    if (fromSection.id === targetSection.id) {
      const elements = [...fromSection.elements];
      elements.splice(fromIndex, 1);
      const target = fromIndex < index ? index - 1 : index;
      elements.splice(Math.max(0, Math.min(elements.length, target)), 0, element);
      onChange({ ...value, sections: value.sections.map((section) => section.id === sectionId ? { ...section, elements } : section) });
    } else {
      if (targetSection.elements.length >= 30) return;
      onChange({
        ...value,
        sections: value.sections.map((section) => {
          if (section.id === fromSection.id) return { ...section, elements: section.elements.filter((item) => item.id !== payload.id) };
          if (section.id === targetSection.id) {
            const elements = [...section.elements];
            elements.splice(Math.max(0, Math.min(elements.length, index)), 0, element);
            return { ...section, elements };
          }
          return section;
        }),
      });
      setSelectedSectionId(targetSection.id);
    }
    setSelectedElementId(payload.id);
  };

  const handleSectionCommand = (id: string, command: SectionCommand) => {
    const index = value.sections.findIndex((section) => section.id === id);
    if (index === -1) return;
    const sections = [...value.sections];
    if (command === "up" && index > 0) {
      const [item] = sections.splice(index, 1);
      if (item) sections.splice(index - 1, 0, item);
    } else if (command === "down" && index < sections.length - 1) {
      const [item] = sections.splice(index, 1);
      if (item) sections.splice(index + 1, 0, item);
    } else if (command === "duplicate" && sections.length < maxSections) {
      const source = sections[index];
      if (source) {
        const copy: InvitationWebSection = { ...source, id: uid(`section-${source.type}`), elements: source.elements.map((element) => ({ ...element, id: uid("element") })) };
        sections.splice(index + 1, 0, copy);
        setSelectedSectionId(copy.id);
      }
    } else if (command === "delete" && sections.length > 1) {
      sections.splice(index, 1);
      setSelectedSectionId(sections[Math.max(0, index - 1)]?.id ?? "");
      setSelectedElementId(null);
    }
    onChange({ ...value, sections });
  };

  const handleElementCommand = (sectionId: string, elementId: string, command: SectionCommand) => {
    const section = value.sections.find((item) => item.id === sectionId);
    if (!section) return;
    const index = section.elements.findIndex((element) => element.id === elementId);
    if (index === -1) return;
    const elements = [...section.elements];
    if (command === "up" && index > 0) {
      const [item] = elements.splice(index, 1);
      if (item) elements.splice(index - 1, 0, item);
    } else if (command === "down" && index < elements.length - 1) {
      const [item] = elements.splice(index, 1);
      if (item) elements.splice(index + 1, 0, item);
    } else if (command === "duplicate" && elements.length < 30) {
      const source = elements[index];
      if (source) {
        const copy: InvitationElement = { ...source, id: uid("element") };
        elements.splice(index + 1, 0, copy);
        setSelectedElementId(copy.id);
      }
    } else if (command === "delete") {
      elements.splice(index, 1);
      setSelectedElementId(null);
    }
    onChange({ ...value, sections: value.sections.map((item) => item.id === sectionId ? { ...item, elements } : item) });
  };

  const convertSectionTextsToElements = (sectionId: string) => {
    const section = value.sections.find((item) => item.id === sectionId);
    if (!section) return;
    const newElements: InvitationElement[] = [];
    if (section.eyebrow) {
      newElements.push({
        ...createElement("text", accent, value.fontFamily),
        id: uid("element"),
        content: section.eyebrow,
        fontSize: 13,
        letterSpacing: 2,
        fontWeight: 600,
        align: section.layout === "center" ? "center" : "left",
        marginTop: 0,
      });
    }
    if (section.heading) {
      newElements.push({
        ...createElement("heading", accent, value.headingFont || "Cinzel"),
        id: uid("element"),
        content: section.heading,
        fontSize: 38,
        fontWeight: 700,
        align: section.layout === "center" ? "center" : "left",
        marginTop: 10,
      });
    }
    if (section.description) {
      newElements.push({
        ...createElement("text", accent, value.fontFamily),
        id: uid("element"),
        content: section.description,
        fontSize: 15,
        fontWeight: 400,
        align: section.layout === "center" ? "center" : "left",
        marginTop: 12,
      });
    }
    if (newElements.length === 0) return;
    onChange({
      ...value,
      sections: value.sections.map((item) => item.id === sectionId ? {
        ...item,
        eyebrow: "",
        heading: "",
        description: "",
        elements: [...newElements, ...item.elements],
      } : item),
    });
    setSelectedElementId(newElements[0]?.id ?? null);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadImage) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      if (activeElement && activeElement.type === "image") patchElement({ imageUrl: url });
      else if (activeSection) patchSection({ backgroundImage: url });
    } catch {
      alert("Gagal mengunggah foto. Pastikan ukuran di bawah 5MB.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return <div className="html-builder-root">
    {/* Top Studio Toolbar */}
    <header className="hb-toolbar">
      <div className="hb-toolbar-group">
        <span className="hb-badge">HTML BUILDER</span>
        <div className="hb-title-stack">
          <strong>Visual Web Invitation Studio</strong>
          <small>{value.sections.length}/{maxSections} section · {plan === "free" ? "Kerabat Free" : plan === "bahagia" ? "Paket Bahagia" : "Paket Resepsi Sultan"}</small>
        </div>
      </div>

      <div className="hb-toolbar-center">
        <button type="button" className={`hb-toggle-btn${!interactive ? " active" : ""}`} onClick={() => setInteractive(false)} title="Mode desain visual">
          <Palette size={14} /><span>Mode Desain</span>
        </button>
        <button type="button" className={`hb-toggle-btn${interactive ? " active" : ""}`} onClick={() => setInteractive(true)} title="Uji animasi dan tombol klik interaktif">
          <MousePointerClick size={14} /><span>Uji Interaktif</span>
        </button>
        <button type="button" className="hb-action-btn" onClick={() => setPlayKey((prev) => prev + 1)} title="Putar ulang semua animasi di layar">
          <RotateCcw size={13} /><span>Putar Gerakan</span>
        </button>
      </div>

      <div className="hb-toolbar-right">
        <div className="hb-viewport-toggle">
          <button type="button" className={previewMode === "desktop" ? "active" : ""} onClick={() => setPreviewMode("desktop")} title="Pratinjau Desktop"><Monitor size={14} /></button>
          <button type="button" className={previewMode === "mobile" ? "active" : ""} onClick={() => setPreviewMode("mobile")} title="Pratinjau Ponsel"><Smartphone size={14} /></button>
        </div>
      </div>
    </header>

    {/* Main Workspace Layout */}
    <div className="hb-workspace">
      {/* Left Sidebar: Toolbox & Structure */}
      <aside className="hb-left-sidebar">
        <div className="hb-tab-nav">
          <button type="button" className={leftTab === "templates" ? "active" : ""} onClick={() => setLeftTab("templates")}>Template</button>
          <button type="button" className={leftTab === "elements" ? "active" : ""} onClick={() => setLeftTab("elements")}>Elemen</button>
          <button type="button" className={leftTab === "sections" ? "active" : ""} onClick={() => setLeftTab("sections")}>Section</button>
          <button type="button" className={leftTab === "themes" ? "active" : ""} onClick={() => setLeftTab("themes")}>Gaya</button>
        </div>

        {leftTab === "templates" && <div className="hb-toolbox">
          <p className="hb-sidebar-hint">Pilih template siap pakai lengkap dengan tata letak, ornamen, dan warna. Cukup klik untuk menerapkan:</p>
          <div className="hb-template-catalog">
            {readyTemplates.map((tpl) => (
              <div key={tpl.id} className="hb-template-card">
                <div className="hb-template-preview-bar" style={{ background: tpl.thumbnailGradient }}>
                  <span className="hb-template-badge">{tpl.badge}</span>
                  <div className="hb-template-swatches">
                    <span style={{ backgroundColor: tpl.primary }} title="Warna Utama" />
                    <span style={{ backgroundColor: tpl.soft }} title="Warna Lembut" />
                    <span style={{ backgroundColor: tpl.accent }} title="Warna Aksen" />
                  </div>
                </div>
                <div className="hb-template-card-body">
                  <strong>{tpl.name}</strong>
                  <p>{tpl.description}</p>
                  <div className="hb-template-meta">
                    <small>Font: {tpl.headingFont} &amp; {tpl.fontFamily}</small>
                    <small>Efek: {tpl.effect !== "none" ? `Partikel ${tpl.effect}` : "Bersih"}</small>
                  </div>
                  <button type="button" className="hb-template-apply-btn" onClick={() => applyTemplate(tpl)}>
                    <Sparkles size={13} /> Terapkan Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {leftTab === "elements" && <div className="hb-toolbox">
          <p className="hb-sidebar-hint">Seret elemen ke section di kanvas atau klik untuk menambahkannya:</p>
          <div className="hb-elements-grid">
            {elementToolbox.map((tool) => {
              const Icon = tool.icon;
              return <div key={tool.type} className="hb-element-pill" draggable
                onDragStart={(event) => { event.dataTransfer.setData(DND.newElement, tool.type); event.dataTransfer.effectAllowed = "copy"; }}
                onClick={() => addElement(tool.type)}>
                <Icon size={16} />
                <div className="hb-pill-text">
                  <strong>{elementLabels[tool.type]}</strong>
                  <small>{tool.hint}</small>
                </div>
                <Plus size={13} className="hb-pill-plus" />
              </div>;
            })}
          </div>
        </div>}

        {leftTab === "sections" && <div className="hb-toolbox">
          <div className="hb-section-tree-header">
            <strong>Urutan Bagian Undangan</strong>
            <small>{value.sections.length}/{maxSections} bagian</small>
          </div>
          <p className="hb-sidebar-hint">Klik untuk memilih, geser urutan, atau sembunyikan bagian seperti di Elliott:</p>

          <div className="hb-active-sections-list">
            {value.sections.map((section, idx) => {
              const isActive = section.id === activeSection?.id && !selectedElementId;
              return (
                <div
                  key={section.id}
                  className={`hb-active-section-item${isActive ? " is-selected" : ""}${!section.visible ? " is-hidden" : ""}`}
                  onClick={() => { setSelectedSectionId(section.id); setSelectedElementId(null); }}
                >
                  <div className="hb-sec-item-main">
                    <span className="hb-sec-num">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="hb-sec-details">
                      <strong>{invitationSectionLabels[section.type]}</strong>
                      <small>{section.heading || sectionDescriptions[section.type]}</small>
                    </div>
                  </div>
                  <div className="hb-sec-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title={section.visible ? "Sembunyikan bagian ini" : "Tampilkan bagian ini"}
                      className={`hb-sec-action-btn${!section.visible ? " is-muted" : ""}`}
                      onClick={() => patchSectionById(section.id, { visible: !section.visible })}
                    >
                      {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button
                      type="button"
                      title="Pindah ke atas"
                      disabled={idx === 0}
                      className="hb-sec-action-btn"
                      onClick={() => handleSectionCommand(section.id, "up")}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      title="Pindah ke bawah"
                      disabled={idx === value.sections.length - 1}
                      className="hb-sec-action-btn"
                      onClick={() => handleSectionCommand(section.id, "down")}
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      title="Hapus bagian"
                      disabled={value.sections.length <= 1}
                      className="hb-sec-action-btn is-danger"
                      onClick={() => handleSectionCommand(section.id, "delete")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {isActive && section.elements.length > 0 && (
                    <div className="hb-sec-elements-sublist" onClick={(e) => e.stopPropagation()}>
                      <div className="hb-sublist-header">
                        <small>Elemen Kanvas ({section.elements.length}):</small>
                      </div>
                      {section.elements.map((el, elIdx) => (
                        <div
                          key={el.id}
                          className={`hb-sublist-item${el.id === selectedElementId ? " is-active" : ""}`}
                          onClick={() => setSelectedElementId(el.id)}
                        >
                          <span title={el.content || elementLabels[el.type]}>
                            <b>{elementLabels[el.type]}:</b> {el.content ? (el.content.length > 18 ? el.content.slice(0, 18) + "..." : el.content) : "(Kosong)"}
                          </span>
                          <div className="hb-sublist-actions">
                            <button
                              type="button"
                              disabled={elIdx === 0}
                              onClick={(e) => { e.stopPropagation(); handleElementCommand(section.id, el.id, "up"); }}
                              title="Pindah ke atas"
                            >
                              <ArrowUp size={11} />
                            </button>
                            <button
                              type="button"
                              disabled={elIdx === section.elements.length - 1}
                              onClick={(e) => { e.stopPropagation(); handleElementCommand(section.id, el.id, "down"); }}
                              title="Pindah ke bawah"
                            >
                              <ArrowDown size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hb-add-section-divider">
            <span>+ TAMBAH BAGIAN BARU</span>
          </div>

          <div className="hb-section-list">
            {sectionCatalogue.map((type) => (
              <div
                key={type}
                className="hb-section-card"
                draggable
                onDragStart={(event) => { event.dataTransfer.setData(DND.newSection, type); event.dataTransfer.effectAllowed = "copy"; }}
                onClick={() => addSection(type)}
              >
                <div className="hb-section-info">
                  <strong>{invitationSectionLabels[type]}</strong>
                  <small>{sectionDescriptions[type]}</small>
                </div>
                <Plus size={13} />
              </div>
            ))}
          </div>
        </div>}

        {leftTab === "themes" && <div className="hb-toolbox">
          <div className="hb-theme-controls">
            <strong>Palet Warna Halaman</strong>
            <label className="hb-field">
              <span>Warna Utama (Latar &amp; Header)</span>
              <div className="hb-color-row">
                <input type="color" value={primary} onChange={(e) => onUpdatePrimaryColor?.(e.target.value)} />
                <input type="text" value={primary} onChange={(e) => onUpdatePrimaryColor?.(e.target.value)} />
              </div>
            </label>
            <label className="hb-field">
              <span>Warna Aksen (Tombol &amp; Highlight)</span>
              <div className="hb-color-row">
                <input type="color" value={accent} onChange={(e) => onUpdateAccentColor?.(e.target.value)} />
                <input type="text" value={accent} onChange={(e) => onUpdateAccentColor?.(e.target.value)} />
              </div>
            </label>

            <strong style={{ marginTop: 14 }}>Tipografi Global</strong>
            <label className="hb-field">
              <span>Font Judul Acara</span>
              <select value={value.headingFont} onChange={(e) => onChange({ ...value, headingFont: e.target.value })}>
                {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="hb-field">
              <span>Font Paragraf &amp; Teks</span>
              <select value={value.fontFamily} onChange={(e) => onChange({ ...value, fontFamily: e.target.value })}>
                {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>

            <strong style={{ marginTop: 14 }}>Perilaku &amp; Transisi</strong>
            <label className="hb-field">
              <span>Efek Transisi Antarhalaman</span>
              <select value={value.transition} onChange={(e) => onChange({ ...value, transition: e.target.value as InvitationWebDesign["transition"] })}>
                <option value="fade">Fade Lembut</option>
                <option value="slide" disabled={isLocked(plan, "transition", "slide")}>Geser {isLocked(plan, "transition", "slide") ? "🔒" : ""}</option>
                <option value="flip" disabled={isLocked(plan, "transition", "flip")}>Balik 3D {isLocked(plan, "transition", "flip") ? "🔒" : ""}</option>
                <option value="zoom" disabled={isLocked(plan, "transition", "zoom")}>Zoom {isLocked(plan, "transition", "zoom") ? "🔒" : ""}</option>
              </select>
            </label>
            <label className="hb-field">
              <span>Mode Tampilan Undangan</span>
              <select value={value.mode} onChange={(e) => onChange({ ...value, mode: e.target.value as InvitationWebDesign["mode"] })}>
                <option value="scroll">Gulir Vertikal (Biasa)</option>
                <option value="pages" disabled={isLocked(plan, "mode", "pages")}>Per Halaman / Story {isLocked(plan, "mode", "pages") ? "🔒" : ""}</option>
              </select>
            </label>
          </div>

          <p className="hb-sidebar-hint" style={{ marginTop: 12 }}>Pilihan Tema Cepat (Otomatis atur warna &amp; font):</p>
          <div className="hb-theme-list">
            {themePresets.map((theme) => <button key={theme.id} type="button" className="hb-theme-card" onClick={() => {
              const updated = applyThemePreset(value, theme);
              onUpdatePrimaryColor?.(theme.dark);
              onUpdateAccentColor?.(theme.accent);
              onChange(updated);
            }}>
              <div className="hb-theme-swatches">
                <span style={{ backgroundColor: theme.dark }} />
                <span style={{ backgroundColor: theme.soft }} />
                <span style={{ backgroundColor: theme.accent }} />
              </div>
              <div className="hb-theme-name">
                <strong>{theme.name}</strong>
                <small>{theme.headingFont} · {theme.effect !== "none" ? `Efek ${theme.effect}` : "Bersih"}</small>
              </div>
              <Wand2 size={13} />
            </button>)}
          </div>
        </div>}
      </aside>

      {/* Center Canvas Preview Area */}
      <section className={`hb-canvas-stage ${previewMode}`}>
        <div className="hb-canvas-frame">
          <InvitationWebRenderer
            design={value}
            event={mockEvent}
            guestName="Budi Santoso"
            primary={primary}
            accent={accent}
            loadAllFonts
            edit={{
              interactive,
              selectedSection: selectedSectionId,
              selectedElement: selectedElementId,
              playKey,
              onSelectSection: (id) => { setSelectedSectionId(id); setSelectedElementId(null); },
              onSelectElement: (sectionId, elementId) => { setSelectedSectionId(sectionId); setSelectedElementId(elementId); },
              onDropSection: handleDropSection,
              onDropElement: handleDropElement,
              onSectionCommand: handleSectionCommand,
              onElementCommand: handleElementCommand,
              onUpdateElementText: (sectionId, elementId, text) => {
                onChange({
                  ...value,
                  sections: value.sections.map((section) =>
                    section.id === sectionId
                      ? {
                          ...section,
                          elements: section.elements.map((el) =>
                            el.id === elementId ? { ...el, content: text } : el
                          ),
                        }
                      : section
                  ),
                });
              },
              onUpdateSectionText: (sectionId, field, text) => {
                onChange({
                  ...value,
                  sections: value.sections.map((section) =>
                    section.id === sectionId ? { ...section, [field]: text } : section
                  ),
                });
              },
              onUpdateEventText: (field, text) => {
                onUpdateEventData?.(field, text);
              },
            }}
          />
        </div>
      </section>

      {/* Right Sidebar: Inspector (Gaya, Gerakan/Animasi, Aksi/Logika) */}
      <aside className="hb-right-sidebar">
        {activeElement ? (() => {
          const elementIndex = activeSection ? activeSection.elements.findIndex((el) => el.id === activeElement.id) : -1;
          return <>
          <div className="hb-inspector-header">
            <div>
              <span className="hb-inspector-eyebrow">ELEMEN AKTIF</span>
              <h2>{elementLabels[activeElement.type]}</h2>
            </div>
            <button type="button" className="hb-btn-danger-icon" title="Hapus elemen" onClick={() => handleElementCommand(activeSection.id, activeElement.id, "delete")}>
              <Trash2 size={14} />
            </button>
          </div>

          <div className="hb-inspector-tabs">
            <button type="button" className={tab === "style" ? "active" : ""} onClick={() => setTab("style")}><Palette size={13} /> Gaya</button>
            <button type="button" className={tab === "motion" ? "active" : ""} onClick={() => setTab("motion")}><Film size={13} /> Gerakan</button>
            <button type="button" className={tab === "action" ? "active" : ""} onClick={() => setTab("action")}><Zap size={13} /> Aksi</button>
          </div>

          <div className="hb-inspector-content">
            {tab === "style" && <>
              <div className="hb-el-position-card">
                <div className="hb-el-position-title">
                  <GripVertical size={14} />
                  <span>Posisi &amp; Urutan Elemen</span>
                  {elementIndex >= 0 && <small>Urutan ke-{elementIndex + 1} dari {activeSection.elements.length}</small>}
                </div>
                <div className="hb-el-move-btns">
                  <button
                    type="button"
                    disabled={elementIndex <= 0}
                    onClick={() => handleElementCommand(activeSection.id, activeElement.id, "up")}
                    title="Pindah urutan ke atas"
                  >
                    <ArrowUp size={13} /> Pindah ke Atas
                  </button>
                  <button
                    type="button"
                    disabled={elementIndex < 0 || elementIndex >= activeSection.elements.length - 1}
                    onClick={() => handleElementCommand(activeSection.id, activeElement.id, "down")}
                    title="Pindah urutan ke bawah"
                  >
                    <ArrowDown size={13} /> Pindah ke Bawah
                  </button>
                </div>
                <span className="hb-el-hint">
                  💡 <b>Pindah Bebas di Kanvas:</b> Arahkan kursor ke elemen teks ini di kanvas, tahan pegangan <b>✥</b> lalu seret ke posisi mana pun yang diinginkan.
                </span>
              </div>
              {["heading", "text", "button", "ornament"].includes(activeElement.type) && <label className="hb-field">
                <span>Konten Teks</span>
                <textarea rows={3} value={activeElement.content} onChange={(e) => patchElement({ content: e.target.value })} />
                <div className="hb-tokens">
                  {textTokens.map(([token, label]) => <button key={token} type="button" onClick={() => patchElement({ content: activeElement.content + token })} title={label}>{token}</button>)}
                </div>
              </label>}

              {activeElement.type === "image" && <div className="hb-field">
                <span>Foto Elemen</span>
                {onUploadImage && <label className="hb-upload-button">
                  <ImagePlus size={14} /><span>{uploading ? "Mengunggah..." : "Pilih dari Komputer"}</span>
                  <input type="file" accept="image/*" disabled={uploading} onChange={handleFileUpload} />
                </label>}
                <input type="url" placeholder="https://... atau /api/assets/..." value={activeElement.imageUrl} onChange={(e) => patchElement({ imageUrl: e.target.value })} />
                <label className="hb-field">
                  <span>Bingkai Foto</span>
                  <select value={activeElement.frame} onChange={(e) => patchElement({ frame: e.target.value as InvitationElement["frame"] })}>
                    {frameOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </label>
                <label className="hb-field">
                  <span>Filter Warna Foto</span>
                  <select value={activeElement.filter} onChange={(e) => patchElement({ filter: e.target.value as ImageFilter })}>
                    {filterOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </label>
              </div>}

              {activeElement.type === "button" && <div className="hb-field">
                <span>Gaya Tombol</span>
                <select value={activeElement.variant} onChange={(e) => patchElement({ variant: e.target.value })}>
                  {buttonVariants.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
                <label className="hb-field">
                  <span>Warna Tombol</span>
                  <div className="hb-color-row">
                    <input type="color" value={activeElement.background || accent} onChange={(e) => patchElement({ background: e.target.value })} />
                    <input type="text" value={activeElement.background || accent} onChange={(e) => patchElement({ background: e.target.value })} />
                  </div>
                </label>
              </div>}

              {activeElement.type === "divider" && <div className="hb-field">
                <span>Model Garis</span>
                <select value={activeElement.variant} onChange={(e) => patchElement({ variant: e.target.value })}>
                  {dividerVariants.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>}

              {activeElement.type === "ornament" && <div className="hb-field">
                <span>Simbol Ornamen</span>
                <div className="hb-ornament-picker">
                  {ornamentChoices.map((sym) => <button key={sym} type="button" className={activeElement.content === sym ? "active" : ""} onClick={() => patchElement({ content: sym })}>{sym}</button>)}
                </div>
              </div>}

              {activeElement.type !== "image" && activeElement.type !== "divider" && activeElement.type !== "spacer" && <>
                <label className="hb-field">
                  <span>Font Huruf</span>
                  <select value={activeElement.fontFamily} onChange={(e) => patchElement({ fontFamily: e.target.value })}>
                    {fontOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </label>
                <label className="hb-field">
                  <span>Warna Teks</span>
                  <div className="hb-color-row">
                    <input type="color" value={activeElement.color || accent} onChange={(e) => patchElement({ color: e.target.value })} />
                    <input type="text" value={activeElement.color || accent} onChange={(e) => patchElement({ color: e.target.value })} />
                  </div>
                </label>
              </>}

              <label className="hb-field">
                <span>Ukuran ({activeElement.fontSize}px)</span>
                <input type="range" min={12} max={110} value={activeElement.fontSize} onChange={(e) => patchElement({ fontSize: Number(e.target.value) })} />
              </label>

              <label className="hb-field">
                <span>Lebar ({activeElement.width}%)</span>
                <input type="range" min={15} max={100} value={activeElement.width} onChange={(e) => patchElement({ width: Number(e.target.value) })} />
              </label>

              <label className="hb-field">
                <span>Jarak Atas ({activeElement.marginTop}px)</span>
                <input type="range" min={0} max={120} value={activeElement.marginTop} onChange={(e) => patchElement({ marginTop: Number(e.target.value) })} />
              </label>

              <label className="hb-field">
                <span>Bayangan</span>
                <select value={activeElement.shadow} onChange={(e) => patchElement({ shadow: e.target.value as InvitationElement["shadow"] })}>
                  {shadowOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </label>

              <label className="hb-field">
                <span>Perataan</span>
                <div className="hb-btn-group">
                  {(["left", "center", "right"] as Align[]).map((align) => <button key={align} type="button" className={activeElement.align === align ? "active" : ""} onClick={() => patchElement({ align })}>{align === "left" ? "Kiri" : align === "center" ? "Tengah" : "Kanan"}</button>)}
                </div>
              </label>
            </>}

            {tab === "motion" && <>
              <label className="hb-field">
                <span>Animasi Masuk</span>
                <select value={activeElement.motion.entrance} onChange={(e) => patchElement({ motion: { ...activeElement.motion, entrance: e.target.value as ElementEntrance } })}>
                  {entranceOptions.map(([val, label]) => {
                    const locked = isLocked(plan, "entrance", val);
                    return <option key={val} value={val} disabled={locked}>{label}{locked ? " 🔒 (Paket Bahagia)" : ""}</option>;
                  })}
                </select>
              </label>

              <label className="hb-field">
                <span>Gerakan Berulang (Loop)</span>
                <select value={activeElement.motion.loop} onChange={(e) => patchElement({ motion: { ...activeElement.motion, loop: e.target.value as ElementLoop } })}>
                  {loopOptions.map(([val, label]) => {
                    const locked = isLocked(plan, "loop", val);
                    return <option key={val} value={val} disabled={locked}>{label}{locked ? " 🔒 (Paket Bahagia)" : ""}</option>;
                  })}
                </select>
              </label>

              <label className="hb-field">
                <span>Efek Saat Kursor Di Atasnya (Hover)</span>
                <select value={activeElement.motion.hover} onChange={(e) => patchElement({ motion: { ...activeElement.motion, hover: e.target.value as ElementHover } })}>
                  {hoverOptions.map(([val, label]) => {
                    const locked = isLocked(plan, "hover", val);
                    return <option key={val} value={val} disabled={locked}>{label}{locked ? " 🔒 (Paket Bahagia)" : ""}</option>;
                  })}
                </select>
              </label>

              <label className="hb-field">
                <span>Kecepatan Animasi</span>
                <select value={activeElement.motion.speed} onChange={(e) => patchElement({ motion: { ...activeElement.motion, speed: e.target.value as MotionSpeed } })}>
                  <option value="slow">Lambat &amp; Anggun</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Cepat</option>
                </select>
              </label>

              <label className="hb-field">
                <span>Jeda Tampil ({activeElement.motion.delay} ms)</span>
                <input type="range" min={0} max={3000} step={100} value={activeElement.motion.delay} onChange={(e) => patchElement({ motion: { ...activeElement.motion, delay: Number(e.target.value) } })} />
              </label>

              <label className="hb-field">
                <span>Gaya Laju (Easing)</span>
                <select value={activeElement.motion.easing} onChange={(e) => patchElement({ motion: { ...activeElement.motion, easing: e.target.value as MotionEasing } })}>
                  <option value="smooth">Lembut Alami</option>
                  <option value="bounce">Memantul Ceria</option>
                  <option value="sharp">Tegas</option>
                </select>
              </label>
            </>}

            {tab === "action" && <>
              <label className="hb-field">
                <span>Aksi Saat Elemen Diklik</span>
                <select value={activeElement.action.type} onChange={(e) => patchElement({ action: { type: e.target.value as ElementActionType, value: "" } })}>
                  {actionOptions.map(([val, label]) => {
                    const locked = isLocked(plan, "action", val);
                    return <option key={val} value={val} disabled={locked}>{label}{locked ? " 🔒" : ""}</option>;
                  })}
                </select>
              </label>

              {activeElement.action.type === "link" && <label className="hb-field">
                <span>Tautan Web Tujuan (URL)</span>
                <input type="url" placeholder="https://..." value={activeElement.action.value} onChange={(e) => patchElement({ action: { ...activeElement.action, value: e.target.value } })} />
              </label>}

              {activeElement.action.type === "section" && <label className="hb-field">
                <span>Tujuan Section</span>
                <select value={activeElement.action.value} onChange={(e) => patchElement({ action: { ...activeElement.action, value: e.target.value } })}>
                  <option value="">Pilih section...</option>
                  {value.sections.map((section) => <option key={section.id} value={section.id}>{invitationSectionLabels[section.type]} ({section.heading})</option>)}
                </select>
              </label>}

              {activeElement.action.type === "whatsapp" && <label className="hb-field">
                <span>Nomor WhatsApp (Contoh: 08123456789)</span>
                <input type="tel" placeholder="08..." value={activeElement.action.value} onChange={(e) => patchElement({ action: { ...activeElement.action, value: e.target.value } })} />
              </label>}

              {activeElement.action.type === "copy" && <label className="hb-field">
                <span>Teks Yang Disalin (Misal No. Rekening)</span>
                <input type="text" placeholder="1234567890" value={activeElement.action.value} onChange={(e) => patchElement({ action: { ...activeElement.action, value: e.target.value } })} />
              </label>}

              {activeElement.action.type === "burst" && <label className="hb-field">
                <span>Model Efek Perayaan</span>
                <select value={activeElement.action.value || "confetti"} onChange={(e) => patchElement({ action: { ...activeElement.action, value: e.target.value } })}>
                  <option value="confetti">Hujan Konfeti</option>
                  <option value="hearts">Ledakan Hati</option>
                  <option value="petals">Tabur Kelopak Bunga</option>
                  <option value="sparkle">Percikan Bintang</option>
                </select>
              </label>}
            </>}
          </div>
        </>; })() : activeSection ? <>
          <div className="hb-inspector-header">
            <div>
              <span className="hb-inspector-eyebrow">PENGATURAN SECTION</span>
              <h2>{invitationSectionLabels[activeSection.type]}</h2>
            </div>
            <button type="button" className="hb-btn-danger-icon" title="Hapus section" disabled={value.sections.length <= 1} onClick={() => handleSectionCommand(activeSection.id, "delete")}>
              <Trash2 size={14} />
            </button>
          </div>

          <div className="hb-inspector-tabs">
            <button type="button" className={tab === "style" ? "active" : ""} onClick={() => setTab("style")}><Palette size={13} /> Tampilan</button>
            <button type="button" className={tab === "motion" ? "active" : ""} onClick={() => setTab("motion")}><Film size={13} /> Efek Latar</button>
            <button type="button" className={tab === "action" ? "active" : ""} onClick={() => setTab("action")}><Zap size={13} /> Logika / Trigger</button>
          </div>

          <div className="hb-inspector-content">
            {tab === "style" && <>
              <label className="hb-field-check">
                <input type="checkbox" checked={activeSection.visible} onChange={(e) => patchSection({ visible: e.target.checked })} />
                <span>Tampilkan section ini di undangan tamu</span>
              </label>

              <label className="hb-field-check">
                <input type="checkbox" checked={activeSection.showDefault} onChange={(e) => patchSection({ showDefault: e.target.checked })} />
                <span>Gunakan tata letak bawaan tema ({invitationSectionLabels[activeSection.type]})</span>
              </label>

              <label className="hb-field">
                <span>Label Kecil (Eyebrow)</span>
                <input type="text" value={activeSection.eyebrow} onChange={(e) => patchSection({ eyebrow: e.target.value })} />
              </label>

              <label className="hb-field">
                <span>Judul Utama Section</span>
                <input type="text" value={activeSection.heading} onChange={(e) => patchSection({ heading: e.target.value })} />
              </label>

              <label className="hb-field">
                <span>Deskripsi / Pengantar</span>
                <textarea rows={3} value={activeSection.description} onChange={(e) => patchSection({ description: e.target.value })} />
              </label>

              {(activeSection.eyebrow || activeSection.heading || activeSection.description) && (
                <button
                  type="button"
                  className="hb-convert-btn"
                  onClick={() => convertSectionTextsToElements(activeSection.id)}
                  title="Ubah teks section ini menjadi elemen kanvas agar bisa dipindah-pindah bebas"
                >
                  <Sparkles size={13} /> Jadikan Teks Elemen Kanvas (Bisa Dipindah Bebas)
                </button>
              )}

              <label className="hb-field">
                <span>Warna Latar Belakang</span>
                <div className="hb-color-row">
                  <input type="color" value={activeSection.background} onChange={(e) => patchSection({ background: e.target.value })} />
                  <input type="text" value={activeSection.background} onChange={(e) => patchSection({ background: e.target.value })} />
                </div>
              </label>

              <label className="hb-field">
                <span>Warna Gradasi Tambahan (Opsional)</span>
                <div className="hb-color-row">
                  <input type="color" value={activeSection.background2 || activeSection.background} onChange={(e) => patchSection({ background2: e.target.value })} />
                  <input type="text" placeholder="Kosongkan jika warna polos" value={activeSection.background2} onChange={(e) => patchSection({ background2: e.target.value })} />
                </div>
              </label>

              <label className="hb-field">
                <span>Foto Sampul Latar</span>
                {onUploadImage && <label className="hb-upload-button">
                  <ImagePlus size={14} /><span>{uploading ? "Mengunggah..." : "Pilih dari Komputer"}</span>
                  <input type="file" accept="image/*" disabled={uploading} onChange={handleFileUpload} />
                </label>}
                <input type="url" placeholder="https://..." value={activeSection.backgroundImage} onChange={(e) => patchSection({ backgroundImage: e.target.value })} />
              </label>

              {activeSection.backgroundImage && <label className="hb-field">
                <span>Kegelapan Lapisan Overlay ({activeSection.overlay}%)</span>
                <input type="range" min={0} max={90} value={activeSection.overlay} onChange={(e) => patchSection({ overlay: Number(e.target.value) })} />
              </label>}

              <label className="hb-field">
                <span>Tata Letak Konten</span>
                <select value={activeSection.layout} onChange={(e) => patchSection({ layout: e.target.value as InvitationWebSection["layout"] })}>
                  <option value="center">Terpusat (Klasik &amp; Elegan)</option>
                  <option value="split">Dua Kolom Bersisian (Split)</option>
                  <option value="cards">Kartu Berbingkai Elegan (Cards)</option>
                  <option value="editorial">Gaya Majalah (Editorial)</option>
                </select>
              </label>

              <label className="hb-field">
                <span>Lebar Konten Halaman</span>
                <select value={activeSection.contentWidth} onChange={(e) => patchSection({ contentWidth: e.target.value as InvitationWebSection["contentWidth"] })}>
                  <option value="narrow">Ramping (720px)</option>
                  <option value="normal">Standar Desktop (1020px - Bawaan)</option>
                  <option value="wide">Lebar Penuh (1240px)</option>
                </select>
              </label>

              <label className="hb-field">
                <span>Kerapatan Jarak (Padding)</span>
                <select value={activeSection.spacing} onChange={(e) => patchSection({ spacing: e.target.value as InvitationWebSection["spacing"] })}>
                  <option value="compact">Rapat (Padding Tipis)</option>
                  <option value="normal">Standar Proporsional</option>
                  <option value="spacious">Lega &amp; Mewah (Padding Luas)</option>
                </select>
              </label>

              <label className="hb-field">
                <span>Tinggi Bagian</span>
                <select value={activeSection.height} onChange={(e) => patchSection({ height: e.target.value as InvitationWebSection["height"] })}>
                  <option value="auto">Menyesuaikan Isi Konten</option>
                  <option value="screen">Penuh Satu Layar (100vh / Story)</option>
                </select>
              </label>
            </>}

            {tab === "motion" && <>
              <label className="hb-field">
                <span>Transisi Saat Digulir Ke Layar (Reveal)</span>
                <select value={activeSection.reveal} onChange={(e) => patchSection({ reveal: e.target.value as SectionReveal })}>
                  {revealOptions.map(([val, label]) => {
                    const locked = isLocked(plan, "reveal", val);
                    return <option key={val} value={val} disabled={locked}>{label}{locked ? " 🔒" : ""}</option>;
                  })}
                </select>
              </label>

              <label className="hb-field">
                <span>Efek Partikel Latar Belakang</span>
                <select value={activeSection.effect} onChange={(e) => patchSection({ effect: e.target.value as InvitationWebSection["effect"] })}>
                  {effectOptions.map(([val, label]) => {
                    const locked = isLocked(plan, "effect", val);
                    return <option key={val} value={val} disabled={locked}>{label}{locked ? " 🔒" : ""}</option>;
                  })}
                </select>
              </label>

              <label className="hb-field-check">
                <input type="checkbox" checked={activeSection.replay} onChange={(e) => patchSection({ replay: e.target.checked })} />
                <span>Ulangi animasi setiap kali tamu kembali menggulir ke section ini</span>
              </label>
            </>}

            {tab === "action" && <>
              <div className="hb-rules-section">
                <div className="hb-rules-title">
                  <strong>Aturan Otomatis Section (Trigger Logika)</strong>
                  <button type="button" className="hb-add-rule-btn" disabled={activeSection.rules.length >= 4 || isLocked(plan, "rules", "rules")} onClick={() => patchSection({ rules: [...activeSection.rules, { id: uid("rule"), when: "first", action: "burst", value: "confetti", delay: 300 }] })}>
                    <Plus size={12} /> Tambah Logika
                  </button>
                </div>
                {isLocked(plan, "rules", "rules") && <small className="hb-locked-notice"><Lock size={12} /> Fitur pemicu logika otomatis terbuka pada Paket Bahagia dan Resepsi.</small>}
                {activeSection.rules.map((rule, idx) => <div key={rule.id} className="hb-rule-card">
                  <div className="hb-rule-row">
                    <label>Bila:
                      <select value={rule.when} onChange={(e) => {
                        const rules = [...activeSection.rules];
                        rules[idx] = { ...rule, when: e.target.value as RuleWhen };
                        patchSection({ rules });
                      }}>
                        {ruleWhenOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </label>
                    <button type="button" className="hb-rule-del" onClick={() => patchSection({ rules: activeSection.rules.filter((r) => r.id !== rule.id) })}><Trash2 size={12} /></button>
                  </div>
                  <div className="hb-rule-row">
                    <label>Maka:
                      <select value={rule.action} onChange={(e) => {
                        const rules = [...activeSection.rules];
                        rules[idx] = { ...rule, action: e.target.value as RuleAction };
                        patchSection({ rules });
                      }}>
                        {ruleActionOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </label>
                    {rule.action === "burst" && <select value={rule.value || "confetti"} onChange={(e) => {
                      const rules = [...activeSection.rules];
                      rules[idx] = { ...rule, value: e.target.value };
                      patchSection({ rules });
                    }}>
                      <option value="confetti">Konfeti</option>
                      <option value="hearts">Hati</option>
                      <option value="petals">Kelopak</option>
                      <option value="sparkle">Kilau</option>
                    </select>}
                    {rule.action === "toast" && <input placeholder="Pesan toast..." value={rule.value} onChange={(e) => {
                      const rules = [...activeSection.rules];
                      rules[idx] = { ...rule, value: e.target.value };
                      patchSection({ rules });
                    }} />}
                  </div>
                </div>)}
                {activeSection.rules.length === 0 && <p className="hb-empty-rules">Belum ada logika otomatis pada section ini. Misal: taburkan konfeti saat tamu membuka ucapan.</p>}
              </div>
            </>}
          </div>
        </> : <div className="hb-inspector-empty">
          <p>Pilih elemen atau section di kanvas untuk mulai mengatur tampilan dan gerakannya.</p>
        </div>}
      </aside>
    </div>
  </div>;
}
