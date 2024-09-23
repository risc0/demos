"use client";

export function cleanUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  window.history.replaceState({}, document.title, url.toString());
}
