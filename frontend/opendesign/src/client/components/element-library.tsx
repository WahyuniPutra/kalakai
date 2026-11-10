import { useEffect, useMemo, useState } from "preact/hooks";
import { Search } from "lucide-preact";
import { useEditor } from "../context";

type ElementAsset = { name: string; category: string; body: string };

const assets: ElementAsset[] = [
  { name: "Bunga ranunculus", category: "Bunga", body: `<g fill="none" stroke="COLOR" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M256 250c-22-54 8-110 53-112 45-2 70 48 37 84 48-28 101 4 93 49-8 44-62 58-96 25 22 53-8 108-53 110-45 2-70-48-37-84-48 28-101-4-93-49 8-44 62-58 96-25Z"/><circle cx="256" cy="255" r="30"/><path d="M256 406c-7 32-31 62-69 83m69-83c4 39 30 70 70 84m-70-83v114m0-60c-26-20-51-21-76-10m76-6c25-20 51-21 76-10"/></g>` },
  { name: "Mawar", category: "Bunga", body: `<g fill="none" stroke="COLOR" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M256 102c-54-36-112 18-78 63-59-2-78 68-22 91-43 40-6 101 50 84 13 59 88 68 111 13 50 28 101-28 65-73 53-30 30-100-28-97 15-57-49-94-94-56-3-56-78-61-95-25-14-1-27 0-39 7Z"/><path d="M256 136c-37 23-42 67-8 89-37 19-42 60-6 82 35-20 41-62 8-83 37-21 39-62 6-88Zm0 34c20 16 19 38-1 54-21-15-20-39 1-54Z"/><path d="M256 354v139m0-69c-31-19-58-16-80 5m80 7c29-20 56-20 82-4"/></g>` },
  { name: "Ranting zaitun", category: "Daun", body: `<g fill="none" stroke="COLOR" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M100 410c99-51 177-143 269-295M155 369c-14-61-61-77-101-70 13 55 49 79 101 70Zm52-50c-3-62-44-87-91-84 4 57 39 86 91 84Zm48-59c9-62-25-97-71-107-8 57 19 93 71 107Zm47-72c22-59-4-101-46-121-20 54-3 94 46 121Zm-95 153c43-47 90-42 125-10-37 44-79 53-125 10Zm57-73c45-43 92-33 123 3-42 38-85 42-123-3Zm47-72c48-37 93-19 117 22-48 31-90 26-117-22Z"/></g>` },
  { name: "Daun eucalyptus", category: "Daun", body: `<g fill="none" stroke="COLOR" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M114 420c87-72 166-160 279-318M148 390c-36-56-83-57-121-36 33 51 73 64 121 36Zm50-47c-24-62-69-73-111-42 25 55 65 73 111 42Zm52-56c-3-65-42-89-91-73 8 60 43 86 91 73Zm55-65c20-62-11-99-61-104-16 59 8 96 61 104Zm-98 143c44-53 94-52 130-15-41 50-86 60-130 15Zm58-72c50-46 100-30 124 14-49 37-94 36-124-14Zm53-67c55-37 101-12 117 35-55 28-99 18-117-35Z"/></g>` },
  { name: "Wreath dedaunan", category: "Daun", body: `<g fill="none" stroke="COLOR" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M256 66c-98 0-177 84-177 188 0 106 78 192 177 192s177-86 177-192C433 150 354 66 256 66Z"/><path d="M256 414c-42-75-62-154-55-253m54 252c45-75 64-155 56-253M203 339c-46-3-72-32-69-69 39 5 63 27 69 69Zm-13-79c-44-15-61-50-47-85 37 16 56 46 47 85Zm12-78c-33-30-34-68-7-95 28 30 35 61 7 95Zm109 157c44-3 72-32 69-69-39 5-63 27-69 69Zm13-79c44-15 61-50 47-85-37 16-56 46-47 85Zm-12-78c33-30 34-68 7-95-28 30-35 61-7 95Z"/></g>` },
  { name: "Cincin pernikahan", category: "Pernikahan", body: `<g fill="none" stroke="COLOR" stroke-width="15"><circle cx="205" cy="270" r="112"/><circle cx="307" cy="270" r="112"/><path d="m242 112 14-25 14 25-14 25z" fill="COLOR" stroke="none"/></g>` },
  { name: "Sepasang hati", category: "Pernikahan", body: `<path fill="COLOR" d="M255 438 83 270C-14 173 118 56 208 143l47 46 47-46c90-87 222 30 125 127L255 438Z"/><path fill="none" stroke="#fff" stroke-width="8" d="M256 190v188"/>` },
  { name: "Kue perayaan", category: "Pernikahan", body: `<g fill="none" stroke="COLOR" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"><path d="M103 380h306v76H103zM138 275h236v105H138zM175 173h162v102H175zM103 456h306M215 173v-42c0-29 42-29 42 0v42m42 0v-42c0-29 42-29 42 0v42"/><path d="M170 315h20m48 0h20m47 0h20m-155 98h20m48 0h20m47 0h20"/></g>` },
  { name: "Bingkai lengkung", category: "Bingkai", body: `<path fill="none" stroke="COLOR" stroke-width="9" d="M90 454V218C90 126 164 58 256 58s166 68 166 160v236M119 454V218c0-76 60-130 137-130s137 54 137 130v236M65 454h382"/><path fill="none" stroke="COLOR" stroke-width="5" d="M105 215c8-94 69-144 151-144s143 50 151 144"/>` },
  { name: "Bingkai oval", category: "Bingkai", body: `<ellipse cx="256" cy="256" rx="174" ry="224" fill="none" stroke="COLOR" stroke-width="9"/><ellipse cx="256" cy="256" rx="151" ry="201" fill="none" stroke="COLOR" stroke-width="3"/><path d="M256 30v40m0 372v40M82 256h38m272 0h38" stroke="COLOR" stroke-width="8"/>` },
  { name: "Sudut ornamen", category: "Bingkai", body: `<g fill="none" stroke="COLOR" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M75 200V75h125M437 200V75H312M75 312v125h125m237-125v125H312"/><path d="M75 140c45 0 65 27 66 67 39-3 61 20 59 59 39-2 62 20 59 58m178-184c-45 0-65 27-66 67-39-3-61 20-59 59-39-2-62 20-59 58M75 372c45 0 65-27 66-67 39 3 61-20 59-59m237 126c-45 0-65-27-66-67-39 3-61-20-59-59"/></g>` },
  { name: "Pemisah floral", category: "Ornamen", body: `<g fill="none" stroke="COLOR" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M48 256h143m130 0h143M191 256c15-67 115-67 130 0-15 67-115 67-130 0Z"/><path d="M256 189c-41-47-89-41-104-3 34 28 70 28 104 3Zm0 0c41-47 89-41 104-3-34 28-70 28-104 3Zm0 134c-41 47-89 41-104 3 34-28 70-28 104-3Zm0 0c41 47 89 41 104 3-34-28-70-28-104-3Z"/></g>` },
  { name: "Kilau bintang", category: "Simbol", body: `<path fill="COLOR" d="M256 38 295 205 462 256 295 295 256 474 217 295 50 256 217 205 256 38Z"/><circle cx="390" cy="111" r="21" fill="COLOR"/><circle cx="121" cy="383" r="15" fill="COLOR"/>` },
  { name: "Konstelasi", category: "Simbol", body: `<g fill="none" stroke="COLOR" stroke-width="7"><path d="m110 354 92-158 102 93 100-151M110 354l142 79 52-144m-102-93 154-58"/><circle cx="110" cy="354" r="22" fill="COLOR"/><circle cx="202" cy="196" r="17" fill="COLOR"/><circle cx="304" cy="289" r="28" fill="COLOR"/><circle cx="404" cy="138" r="19" fill="COLOR"/><circle cx="252" cy="433" r="13" fill="COLOR"/><circle cx="356" cy="104" r="11" fill="COLOR"/></g>` },
  { name: "Awan lembut", category: "Simbol", body: `<path fill="COLOR" d="M122 357c-55 0-84-35-84-80 0-47 39-84 86-84 22-62 74-98 134-88 48 8 84 40 99 84 66-13 120 29 120 88 0 48-38 80-91 80H122Z"/>` },
  { name: "Partitur musik", category: "Simbol", body: `<g fill="none" stroke="COLOR" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"><path d="M205 381V125l166-35v256"/><path d="M205 166 371 131"/><ellipse cx="163" cy="391" rx="44" ry="31" fill="COLOR" stroke="none"/><ellipse cx="329" cy="354" rx="44" ry="31" fill="COLOR" stroke="none"/></g>` },
  { name: "Bunga sakura", category: "Bunga", body: `<g fill="COLOR"><path d="M256 177c-79-88 38-156 47-57 52-79 151-3 57 43 95-5 83 117-7 74 58 77-47 137-75 54-35 91-152 29-59-45-91 32-130-81-20-80-35-84 91-95 57 11Z"/><circle cx="256" cy="256" r="25" fill="#fff"/></g>` },
  { name: "Bingkai foto lingkar", category: "Bingkai", body: `<circle cx="256" cy="256" r="173" fill="none" stroke="COLOR" stroke-width="25"/><circle cx="256" cy="256" r="144" fill="none" stroke="COLOR" stroke-width="4" stroke-dasharray="4 14"/>` },
  { name: "Pita", category: "Ornamen", body: `<g fill="none" stroke="COLOR" stroke-width="11" stroke-linejoin="round"><path d="M256 154c-74-104-181-28-115 45l115 95 115-95c66-73-41-149-115-45Z"/><path d="m256 294-97 122 24-117m73-5 97 122-24-117"/><circle cx="256" cy="239" r="27" fill="COLOR"/></g>` },
  { name: "Bunga matahari", category: "Bunga", body: `<g fill="none" stroke="COLOR" stroke-width="8" stroke-linejoin="round"><circle cx="256" cy="256" r="63" fill="COLOR"/><path d="M256 73c52 37 53 76 0 120-53-44-52-83 0-120Zm0 366c-52-37-53-76 0-120 53 44 52 83 0 120ZM73 256c37-52 76-53 120 0-44 53-83 52-120 0Zm366 0c-37 52-76 53-120 0 44-53 83-52 120 0ZM127 127c64 4 84 37 60 100-64-24-84-57-60-100Zm258 258c-64-4-84-37-60-100 64 24 84 57 60 100Zm0-258c-4 64-37 84-100 60 24-64 57-84 100-60ZM127 385c4-64 37-84 100-60-24 64-57 84-100 60Z"/></g>` },
  { name: "Daun monstera", category: "Daun", body: `<path d="M256 52C119 62 62 164 94 286c19 74 75 126 162 174 87-48 143-100 162-174C450 164 393 62 256 52Zm0 80v328m0-236c-42-51-86-56-119-26 16 46 60 63 119 54m0-4c42-51 86-56 119-26-16 46-60 63-119 54m-2 49c-44-34-83-30-111 1 24 39 62 45 111 25m2-26c44-34 83-30 111 1-24 39-62 45-111 25Z" fill="none" stroke="COLOR" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` },
];

const categories = ["Semua", "Bunga", "Daun", "Pernikahan", "Bingkai", "Ornamen", "Simbol"];
const iconSuggestions = ["wedding", "flower", "leaf", "heart", "frame", "ring", "cake", "music", "sparkles", "dove", "ornament", "butterfly"];
const iconQueryAliases: Record<string, string> = { bunga: "flower", daun: "leaf", pernikahan: "wedding", cincin: "ring", kupu: "butterfly", pita: "ribbon", bingkai: "frame", hati: "heart", burung: "dove", musik: "music", kue: "cake", bintang: "sparkles" };
type IconSearchResult = { icons: string[]; collections?: Record<string, { name?: string; license?: { title?: string; spdx?: string } }> };

function elementDataUrl(body: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${body.replaceAll("COLOR", color)}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function ElementLibrary() {
  const { addImage } = useEditor();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [color, setColor] = useState("#80674f");
  const [catalog, setCatalog] = useState<"ornamen" | "iconify">("ornamen");
  const [remoteIcons, setRemoteIcons] = useState<string[]>([]);
  const [collections, setCollections] = useState<IconSearchResult["collections"]>({});
  const [loadingIcons, setLoadingIcons] = useState(false);
  const [iconError, setIconError] = useState("");
  const [iconOffset, setIconOffset] = useState(0);
  const filtered = useMemo(() => assets.filter((asset) =>
    (category === "Semua" || asset.category === category) && asset.name.toLocaleLowerCase("id-ID").includes(query.toLocaleLowerCase("id-ID"))
  ), [category, query]);

  useEffect(() => {
    if (catalog !== "iconify") return;
    const term = query.trim();
    if (term.length < 2) { setRemoteIcons([]); setIconError(""); return; }
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoadingIcons(true);
      setIconError("");
      setIconOffset(0);
      try {
        const params = new URLSearchParams({ query: iconQueryAliases[term.toLocaleLowerCase("id-ID")] ?? term, limit: "48", start: "0" });
        const response = await fetch(`https://api.iconify.design/search?${params}`);
        if (!response.ok) throw new Error("Katalog ikon sedang tidak tersedia.");
        const data = await response.json() as IconSearchResult;
        if (active) { setRemoteIcons(data.icons ?? []); setCollections(data.collections ?? {}); }
      } catch (error) {
        if (active) setIconError(error instanceof Error ? error.message : "Katalog ikon gagal dimuat.");
      } finally { if (active) setLoadingIcons(false); }
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [catalog, query]);

  const iconSvgUrl = (icon: string) => {
    const [prefix, name] = icon.split(":");
    return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg?color=${encodeURIComponent(color)}`;
  };

  const addRemoteIcon = async (icon: string) => {
    try {
      const response = await fetch(iconSvgUrl(icon));
      if (!response.ok) throw new Error("Ikon tidak dapat diunduh.");
      const svg = await response.text();
      if (!svg.trim().startsWith("<svg")) throw new Error("Format ikon tidak valid.");
      const safeSvg = svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*(["']).*?\1/gi, "");
      void addImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(safeSvg)}`);
    } catch (error) {
      setIconError(error instanceof Error ? error.message : "Ikon tidak dapat ditambahkan.");
    }
  };

  const loadMoreIcons = async () => {
    const nextOffset = iconOffset + 48;
    setLoadingIcons(true);
    try {
      const params = new URLSearchParams({ query: query.trim(), limit: "48", start: String(nextOffset) });
      const response = await fetch(`https://api.iconify.design/search?${params}`);
      if (!response.ok) throw new Error("Hasil berikutnya tidak dapat dimuat.");
      const data = await response.json() as IconSearchResult;
      setRemoteIcons((items) => [...new Set([...items, ...(data.icons ?? [])])]);
      setCollections((current) => ({ ...current, ...data.collections }));
      setIconOffset(nextOffset);
    } catch (error) { setIconError(error instanceof Error ? error.message : "Katalog ikon gagal dimuat."); }
    finally { setLoadingIcons(false); }
  };

  return (
    <div class="flex flex-col gap-3">
      <p class="text-zinc-400 text-[11px] m-0">Klik atau seret elemen ke posisi yang diinginkan pada kanvas.</p>
      <div class="grid grid-cols-2 gap-1 p-1 bg-zinc-100 rounded-lg">
        <button class={`px-2 py-1.5 rounded-md border-none text-[10px] cursor-pointer ${catalog === "ornamen" ? "bg-white text-zinc-800 shadow-sm" : "bg-transparent text-zinc-500"}`} onClick={() => setCatalog("ornamen")}>Ornamen acara</button>
        <button class={`px-2 py-1.5 rounded-md border-none text-[10px] cursor-pointer ${catalog === "iconify" ? "bg-white text-zinc-800 shadow-sm" : "bg-transparent text-zinc-500"}`} onClick={() => setCatalog("iconify")}>Ikon 300K+</button>
      </div>
      <label class="flex items-center gap-2 px-2.5 py-2 border border-zinc-200 rounded-lg text-zinc-400 focus-within:border-accent">
        <Search size={14} />
        <input class="w-full border-none outline-none text-xs text-zinc-700 bg-transparent" value={query} onInput={(e) => setQuery((e.target as HTMLInputElement).value)} placeholder={catalog === "ornamen" ? "Cari ornamen" : "Cari ikon: flower, ring, music…"} />
      </label>
      {catalog === "ornamen" && <div class="flex gap-1.5 overflow-x-auto pb-1">{categories.map((item) => <button key={item} class={`shrink-0 px-2 py-1 rounded-full border text-[10px] cursor-pointer ${category === item ? "bg-accent text-white border-accent" : "bg-white text-zinc-500 border-zinc-200"}`} onClick={() => setCategory(item)}>{item}</button>)}</div>}
      <label class="flex items-center justify-between text-[11px] text-zinc-500">Warna elemen<input type="color" value={color} onInput={(e) => setColor((e.target as HTMLInputElement).value)} class="w-8 h-7 border border-zinc-200 rounded cursor-pointer bg-white" /></label>
      {catalog === "iconify" && <><p class="text-[10px] leading-snug text-zinc-400 m-0">Koleksi 300.000+ ikon open-source dimuat sesuai pencarian. Tiap set mengikuti lisensinya.</p><div class="flex flex-wrap gap-1">{iconSuggestions.map((suggestion) => <button key={suggestion} class="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[9px] text-zinc-600 cursor-pointer hover:border-accent" onClick={() => setQuery(suggestion)}>{suggestion}</button>)}</div></>}
      {catalog === "ornamen" && filtered.length ? <div class="grid grid-cols-2 gap-2">
        {filtered.map((asset) => {
          const src = elementDataUrl(asset.body, color);
          return <button key={asset.name} draggable title={`Klik atau seret ${asset.name}`} class="group flex flex-col items-center justify-center gap-1 h-[92px] p-2 rounded-lg bg-white border border-zinc-200 cursor-grab active:cursor-grabbing hover:border-accent hover:bg-accent/5 transition-all" onClick={() => void addImage(src)} onDragStart={(event) => { event.dataTransfer?.clearData(); event.dataTransfer?.setData("application/x-kalakai-element", src); event.dataTransfer?.setData("text/plain", ""); if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy"; }}>
            <img src={src} alt="" draggable={false} class="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
            <span class="w-full text-[10px] text-zinc-600 text-center truncate">{asset.name}</span>
          </button>;
        })}
      </div> : catalog === "iconify" && remoteIcons.length > 0 ? <div class="grid grid-cols-2 gap-2">
        {remoteIcons.map((icon) => { const collection = collections?.[icon.split(":")[0]]; return <button key={icon} draggable title={`${icon} · ${collection?.license?.title ?? "Periksa lisensi set"}`} class="group flex flex-col items-center justify-center gap-1 h-[92px] p-2 rounded-lg bg-white border border-zinc-200 cursor-grab active:cursor-grabbing hover:border-accent hover:bg-accent/5 transition-all" onClick={() => void addRemoteIcon(icon)} onDragStart={(event) => { event.dataTransfer?.clearData(); event.dataTransfer?.setData("application/x-kalakai-element", iconSvgUrl(icon)); event.dataTransfer?.setData("text/plain", ""); if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy"; }}><img src={iconSvgUrl(icon)} alt="" draggable={false} class="w-11 h-11 object-contain" /><span class="w-full text-[9px] text-zinc-600 text-center truncate">{icon.split(":")[1].replaceAll("-", " ")}</span><span class="w-full text-[8px] text-zinc-400 text-center truncate">{collection?.name ?? icon.split(":")[0]}</span></button>; })}
      </div> : <p class="text-[11px] text-zinc-400 text-center py-5">{loadingIcons ? "Mencari ikon…" : catalog === "iconify" && query.trim().length < 2 ? "Ketik minimal 2 karakter untuk mencari." : "Elemen tidak ditemukan."}</p>}
      {iconError && <p class="text-[10px] text-red-600 m-0" role="alert">{iconError}</p>}
      {catalog === "iconify" && remoteIcons.length >= 48 && <button class="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-[11px] text-zinc-600 cursor-pointer hover:border-accent" onClick={() => void loadMoreIcons()} disabled={loadingIcons}>{loadingIcons ? "Memuat…" : "Muat hasil berikutnya"}</button>}
    </div>
  );
}
