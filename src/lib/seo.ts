import { useEffect } from "react";

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

export function getSiteUrl(): string {
  return SITE_URL;
}

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL || "";
  if (path.startsWith("http")) return path;
  const base = SITE_URL || "";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function setMetaTag(attr: "name" | "property", key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkTag(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  ogType?: "website" | "article";
  ogImage?: string;
}

export function useSeo({ title, description, path, ogType = "website", ogImage }: SeoOptions): void {
  useEffect(() => {
    document.title = title;
    setMetaTag("name", "description", description);

    const url = absoluteUrl(path ?? (typeof window !== "undefined" ? window.location.pathname : "/"));
    const image = ogImage ? absoluteUrl(ogImage) : absoluteUrl("/opengraph.jpg");

    setLinkTag("canonical", url);

    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", url);
    setMetaTag("property", "og:image", image);
    setMetaTag("property", "og:site_name", "Tax For Freelancers");

    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", image);
  }, [title, description, path, ogType, ogImage]);
}

export function useJsonLd(schema: Record<string, unknown> | Record<string, unknown>[] | null): void {
  useEffect(() => {
    if (!schema) return;
    const id = "jsonld-active";
    let script = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      const existing = document.head.querySelector(`script#${id}`);
      if (existing) existing.remove();
    };
  }, [JSON.stringify(schema)]);
}
