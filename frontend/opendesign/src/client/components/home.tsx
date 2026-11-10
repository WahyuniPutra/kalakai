import { useState, useCallback, useMemo } from "preact/hooks";
import { Plus, Trash2, Edit3, Sparkles, Search, LayoutGrid } from "lucide-preact";
import type { Design, Template } from "../types";
import { api } from "../api";
import { TemplateCard } from "./template-card";

interface HomeProps {
  designs: Design[];
  templates: Template[];
  navigate: (to: string) => void;
  createDesign: () => Promise<string | undefined>;
  deleteDesign: (id: string) => Promise<void>;
  renameDesign: (id: string, name: string) => Promise<void>;
  createFromTemplate: (template: Template) => Promise<string | undefined>;
}

export function Home({
  designs,
  templates,
  navigate,
  createDesign,
  deleteDesign,
  renameDesign,
  createFromTemplate,
}: HomeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [openingTemplateId, setOpeningTemplateId] = useState<string | null>(null);
  const [templateCategory, setTemplateCategory] = useState("Semua desain");
  const [templateQuery, setTemplateQuery] = useState("");
  const templateCategories = useMemo(() => ["Semua desain", ...new Set(templates.map((template) => template.category))], [templates]);
  const visibleTemplates = useMemo(() => templates.filter((template) =>
    (templateCategory === "Semua desain" || template.category === templateCategory) && template.name.toLocaleLowerCase("id-ID").includes(templateQuery.trim().toLocaleLowerCase("id-ID"))
  ), [templates, templateCategory, templateQuery]);

  const handleCreate = useCallback(async () => {
    const id = await createDesign();
    if (id) navigate(`/design/${id}`);
  }, [createDesign, navigate]);

  const handleTemplateClick = useCallback(
    async (t: Template) => {
      setTemplateError("");
      setOpeningTemplateId(t.id);
      try {
        const id = await createFromTemplate(t);
        if (!id) throw new Error("Desain belum mendapat ID dari server.");
        navigate(`/design/${id}`);
      } catch (error) {
        setTemplateError(error instanceof Error ? error.message : "Desain tidak dapat disimpan.");
        setOpeningTemplateId(null);
      }
    },
    [createFromTemplate, navigate]
  );

  const startRename = (id: string, name: string, e: Event) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) renameDesign(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div class="h-full overflow-y-auto bg-[#F3F4F7]">
      {/* Header */}
      <div class="bg-white border-b border-zinc-200">
        <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold text-zinc-800 m-0">Studio Undangan Kalakai</h1>
            <p class="text-xs text-zinc-400 mt-0.5 m-0">
              Pilih desain awal atau lanjutkan proyek yang pernah Anda edit.
            </p>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border-none cursor-pointer bg-[#6366f1] text-white hover:bg-[#5558e6] transition-all shadow-sm"
            onClick={handleCreate}
          >
            <Plus size={15} />
            Kanvas kosong
          </button>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-6 py-6">
        {/* Templates section */}
        {templates.length > 0 && (
          <div class="mb-8">
            <div class="rounded-2xl bg-[#153c31] px-5 py-6 text-white sm:px-8 sm:py-8 mb-5">
              <div class="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d3bd86]"><Sparkles size={14} /> Desain untuk setiap cerita</div>
              <h2 class="m-0 max-w-2xl font-serif text-2xl leading-tight sm:text-3xl">Pilih gaya undanganmu, lalu ubah setiap detailnya.</h2>
              <p class="mb-0 mt-2 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">Mulai dari desain luxury, floral, nuansa Nusantara, minimalis, atau tanpa foto. Semua bisa dibuka di editor dan dikustomisasi.</p>
            </div>
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-2 text-sm font-semibold text-zinc-800"><LayoutGrid size={16} class="text-[#547563]" /> Katalog desain <span class="text-xs font-normal text-zinc-400">{visibleTemplates.length} pilihan</span></div>
              <label class="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-400 sm:w-64"><Search size={14} /><input value={templateQuery} onInput={(event) => setTemplateQuery((event.target as HTMLInputElement).value)} placeholder="Cari desain" class="w-full border-0 bg-transparent text-xs text-zinc-700 outline-none" /></label>
            </div>
            <div class="mb-4 flex gap-2 overflow-x-auto pb-1">
              {templateCategories.map((category) => <button key={category} class={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] cursor-pointer transition-colors ${templateCategory === category ? "border-[#173d31] bg-[#173d31] text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-[#789783]"}`} onClick={() => setTemplateCategory(category)}>{category}</button>)}
            </div>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {visibleTemplates.map((t) => (
                <TemplateCard key={t.id} template={t} onClick={() => void handleTemplateClick(t)} />
              ))}
            </div>
            {visibleTemplates.length === 0 && <div class="rounded-xl border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-400">Desain tidak ditemukan. Coba kata kunci lain.</div>}
            {openingTemplateId && <p class="text-xs text-zinc-500 mt-3" role="status">Menyimpan desain dan membuka editor…</p>}
            {templateError && <p class="text-xs text-red-600 mt-3" role="alert">{templateError}</p>}
          </div>
        )}

        {/* Designs grid */}
        {designs.length === 0 ? (
          <div class="text-center py-20">
            <div class="w-16 h-16 rounded-2xl bg-zinc-200 flex items-center justify-center mx-auto mb-4">
              <Plus size={24} class="text-zinc-400" />
            </div>
            <p class="text-sm text-zinc-500 mb-1">No designs yet</p>
            <p class="text-xs text-zinc-400 mb-4">Create your first design to get started</p>
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border-none cursor-pointer bg-[#6366f1] text-white hover:bg-[#5558e6] transition-all"
              onClick={handleCreate}
            >
              <Plus size={14} />
              Create Design
            </button>
          </div>
        ) : (
          <>
            <h2 class="text-sm font-semibold text-zinc-700 mb-3 m-0">Recent designs</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((d) => (
                <div
                  key={d.id}
                  class="bg-white rounded-xl border border-zinc-200 overflow-hidden cursor-pointer transition-all hover:border-[#6366f1] hover:shadow-md group"
                  onClick={() => navigate(`/design/${d.id}`)}
                >
                  {/* Preview area */}
                  <div class="aspect-[4/3] bg-zinc-100 flex items-center justify-center">
                    {d.thumbnail_url ? (
                      <img
                        src={d.thumbnail_url}
                        alt={d.name}
                        class="w-full h-full object-cover"
                      />
                    ) : (
                      <div class="text-zinc-300 text-[10px] font-medium">
                        {d.width} x {d.height}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div class="p-3">
                    {editingId === d.id ? (
                      <input
                        class="w-full bg-zinc-100 border border-[#6366f1] rounded text-zinc-800 text-xs px-2 py-1 outline-none"
                        value={editName}
                        onInput={(e) => setEditName((e.target as HTMLInputElement).value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") finishRename();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div class="flex items-start justify-between">
                        <div class="min-w-0 flex-1">
                          <p class="text-xs font-semibold text-zinc-700 truncate m-0">
                            {d.name}
                          </p>
                          <p class="text-[10px] text-zinc-400 mt-0.5 m-0">
                            {d.width} x {d.height} &middot;{" "}
                            {new Date(d.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                          <button
                            class="p-1 rounded text-zinc-400 bg-transparent border-none cursor-pointer hover:text-zinc-700 transition-colors"
                            onClick={(e) => startRename(d.id, d.name, e)}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            class="p-1 rounded text-zinc-400 bg-transparent border-none cursor-pointer hover:text-red-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDesign(d.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
