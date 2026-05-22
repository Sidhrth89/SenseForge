import type { StoredContext } from "./types";

chrome.runtime.onMessage.addListener((message: { type?: string; context?: StoredContext }, _sender, sendResponse) => {
  if (message.type !== "senseforge:selected-context" || !message.context) {
    return false;
  }

  chrome.storage.local.set({ senseforgeContext: message.context }, () => {
    sendResponse({ ok: true });
  });

  return true;
});
