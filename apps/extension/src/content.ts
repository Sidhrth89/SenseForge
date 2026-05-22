import type { PlasmoCSConfig } from "plasmo";
import type { StoredContext } from "./types";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
};

let bubble: HTMLButtonElement | null = null;

function removeBubble() {
  bubble?.remove();
  bubble = null;
}

function getContext(): StoredContext | null {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();
  if (!selection || !selectedText) {
    return null;
  }

  return {
    source: "selection",
    url: window.location.href,
    title: document.title,
    selectedText: selectedText.slice(0, 12000),
    pageText: document.body?.innerText?.slice(0, 20000),
    capturedAt: new Date().toISOString()
  };
}

document.addEventListener("selectionchange", () => {
  const context = getContext();

  if (!context) {
    removeBubble();
    return;
  }

  const range = window.getSelection()?.rangeCount ? window.getSelection()?.getRangeAt(0) : undefined;
  const rect = range?.getBoundingClientRect();
  if (!rect) {
    return;
  }

  if (!bubble) {
    bubble = document.createElement("button");
    bubble.type = "button";
    bubble.textContent = "Forge";
    bubble.style.position = "fixed";
    bubble.style.zIndex = "2147483647";
    bubble.style.border = "1px solid rgba(0,0,0,0.12)";
    bubble.style.borderRadius = "8px";
    bubble.style.background = "#111111";
    bubble.style.color = "#ffffff";
    bubble.style.font = "500 12px Inter, system-ui, sans-serif";
    bubble.style.padding = "7px 10px";
    bubble.style.boxShadow = "0 16px 40px rgba(0,0,0,0.16)";
    bubble.addEventListener("click", () => {
      const latestContext = getContext();
      if (!latestContext) {
        return;
      }
      chrome.runtime.sendMessage({ type: "senseforge:selected-context", context: latestContext });
    });
    document.body.appendChild(bubble);
  }

  bubble.style.left = `${Math.min(window.innerWidth - 78, Math.max(12, rect.left))}px`;
  bubble.style.top = `${Math.max(12, rect.top - 40)}px`;
});
