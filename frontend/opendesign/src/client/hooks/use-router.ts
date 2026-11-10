import { useState, useEffect, useCallback } from "preact/hooks";

export function useRouter() {
  const base = "/opendesign";
  const currentPath = () => window.location.pathname.replace(new RegExp(`^${base}`), "") || "/";
  const [path, setPath] = useState(currentPath);

  const navigate = useCallback((to: string) => {
    const query = window.location.search;
    window.history.pushState(null, "", `${base}${to === "/" ? "/" : to}${query}`);
    setPath(to);
    if (window.parent !== window) window.parent.postMessage({ type: "kalakai:opendesign:navigate", path: to }, window.location.origin);
  }, []);

  useEffect(() => {
    const handler = () => setPath(currentPath());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Parse /design/:id
  const match = path.match(/^\/design\/([^/]+)$/);
  const designId = match ? match[1] : null;

  return { path, navigate, designId };
}
