import { useEffect } from 'react';

const BASE_TITLE = 'ParthRahi';

const setTag = (selector, attr, value) => {
  if (!value) return null;
  let el = document.head.querySelector(selector);
  let created = false;
  if (!el) {
    el = document.createElement('meta');
    const [, name] = selector.match(/\[(?:name|property)="(.+)"\]/) || [];
    if (selector.includes('property')) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
    created = true;
  }
  const prev = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return () => {
    if (created) el.remove();
    else if (prev != null) el.setAttribute(attr, prev);
  };
};

/**
 * Lightweight per-page metadata. Note: this app is a client-rendered SPA, so this
 * only helps the browser tab and link-preview crawlers that execute JS — full SEO
 * would need prerendering/SSR (tracked as a follow-up).
 */
export default function useDocumentMeta({ title, description, image } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = `${title}`.includes(BASE_TITLE) ? title : `${title} | ${BASE_TITLE}`;

    const cleanups = [
      setTag('meta[name="description"]', 'content', description),
      setTag('meta[property="og:title"]', 'content', title),
      setTag('meta[property="og:description"]', 'content', description),
      setTag('meta[property="og:image"]', 'content', image),
    ].filter(Boolean);

    return () => {
      document.title = prevTitle;
      cleanups.forEach((fn) => fn());
    };
  }, [title, description, image]);
}
