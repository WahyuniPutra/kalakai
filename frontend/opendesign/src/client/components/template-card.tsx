import { useState, useEffect, useRef } from "preact/hooks";
import * as fabric from "fabric";
import { Eye, Sparkles } from "lucide-preact";
import type { Template } from "../types";

interface Props {
  template: Template;
  onClick: () => void;
  compact?: boolean;
}

function colorFor(name: string) {
  const palettes = ["#172b25", "#eee7dc", "#351b25", "#28362e", "#f1e1e4", "#e8ece5", "#e9dfd0", "#24252d"];
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return palettes[index];
}

export function TemplateCard({ template, onClick, compact = false }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current) return;
    rendered.current = true;
    const el = document.createElement("canvas");
    const thumbWidth = 360;
    const thumbHeight = 640;
    const tempCanvas = new fabric.StaticCanvas(el, { width: thumbWidth, height: thumbHeight });
    try {
      tempCanvas.loadFromJSON(JSON.parse(template.canvas_json)).then(() => {
        const scale = Math.min(thumbWidth / template.width, thumbHeight / template.height);
        tempCanvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
        tempCanvas.renderAll();
        setPreview(tempCanvas.toDataURL({ format: "png" }));
        tempCanvas.dispose();
      }).catch(() => tempCanvas.dispose());
    } catch { tempCanvas.dispose(); }
  }, [template]);

  return (
    <article class="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-lg">
      <button type="button" class="relative flex w-full items-center justify-center overflow-hidden border-0 p-4 cursor-zoom-in" style={{ aspectRatio: "4 / 3", background: `radial-gradient(ellipse at 50% 45%, ${colorFor(template.name)} 0%, #101613 100%)` }} onClick={() => preview && setShowPreview(true)} title={`Pratinjau ${template.name}`}>
        <span class="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 10% 10%, #ffffff 0 1px, transparent 2px),radial-gradient(circle at 80% 75%, #ffffff 0 1px, transparent 2px)", backgroundSize: "42px 42px" }} />
        <span class="relative flex h-[94%] max-h-[250px] aspect-[9/16] items-center justify-center rounded-[18px] border-[5px] border-zinc-900 bg-black shadow-2xl ring-1 ring-white/30">
          <span class="absolute top-[3px] z-10 h-2 w-12 rounded-full bg-black" />
          {preview ? <img src={preview} alt={template.name} class="h-full w-full rounded-[12px] object-contain" /> : <span class="text-[10px] text-white/70">Memuat pratinjau…</span>}
          <span class="absolute bottom-[4px] h-1 w-8 rounded-full bg-white/75" />
        </span>
        <span class="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-700">{template.category}</span>
        <span class="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"><Eye size={11} /> Preview</span>
      </button>
      <div class="flex items-center justify-between gap-2 border-t border-zinc-100 px-3 py-2.5">
        <div class="min-w-0">
          <h3 class="m-0 truncate text-[12px] font-semibold text-zinc-800">{template.name}</h3>
          <p class="m-0 mt-0.5 text-[9px] text-zinc-400">{template.pages?.length ?? 1} halaman · {template.width} × {template.height}</p>
        </div>
        <button type="button" class="inline-flex shrink-0 items-center gap-1 rounded-lg border-0 bg-[#173d31] px-2.5 py-2 text-[10px] font-semibold text-white cursor-pointer hover:bg-[#23513f]" onClick={onClick}>
          <Sparkles size={12} />{compact ? "Pilih" : "Gunakan"}
        </button>
      </div>
      {showPreview && preview && <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" onClick={() => setShowPreview(false)}>
        <div class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:flex-row" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Pratinjau ${template.name}`}>
          <div class="flex min-h-[45vh] flex-1 items-center justify-center bg-zinc-900 p-6 sm:min-h-0"><img src={preview} alt={`Desain ${template.name}`} class="max-h-[78vh] max-w-full rounded-lg shadow-2xl" /></div>
          <div class="flex w-full flex-col justify-center gap-4 p-5 sm:w-64"><span class="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-800">{template.category}</span><h2 class="m-0 font-serif text-2xl text-zinc-900">{template.name}</h2><p class="m-0 text-sm leading-relaxed text-zinc-500">Template undangan yang bisa Anda ubah lagi di editor: susun elemen, ganti warna, tambah foto, dan atur tipografi.</p><button type="button" class="rounded-lg border-0 bg-[#173d31] px-4 py-3 text-sm font-semibold text-white cursor-pointer" onClick={onClick}>Gunakan template</button><button type="button" class="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-600 cursor-pointer" onClick={() => setShowPreview(false)}>Kembali ke katalog</button></div>
        </div>
      </div>}
    </article>
  );
}
