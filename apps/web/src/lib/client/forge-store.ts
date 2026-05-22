"use client";

import { create } from "zustand";
import type { AIProviderId, ForgeMode, ForgeRequest, ForgeResult } from "@senseforge/shared";

type ForgeState = {
  input: string;
  mode: ForgeMode;
  provider: AIProviderId;
  result?: ForgeResult;
  history: ForgeResult[];
  isRunning: boolean;
  error?: string;
  setInput(input: string): void;
  setMode(mode: ForgeMode): void;
  setProvider(provider: AIProviderId): void;
  runForge(overrides?: Partial<ForgeRequest>): Promise<void>;
};

export const useForgeStore = create<ForgeState>((set, get) => ({
  input: "Luxury jaggery chocolate campaign",
  mode: "create",
  provider: "openai",
  history: [],
  isRunning: false,
  setInput: (input) => set({ input }),
  setMode: (mode) => set({ mode }),
  setProvider: (provider) => set({ provider }),
  runForge: async (overrides) => {
    const state = get();
    set({ isRunning: true, error: undefined });

    try {
      const request: ForgeRequest = {
        input: overrides?.input ?? state.input,
        mode: overrides?.mode ?? state.mode,
        provider: overrides?.provider ?? state.provider,
        save: overrides?.save ?? true,
        context: overrides?.context ?? { source: "web" }
      };

      const response = await fetch("/api/forge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Forge request failed");
      }

      const payload = (await response.json()) as { result: ForgeResult };
      set((current) => ({
        result: payload.result,
        history: [payload.result, ...current.history].slice(0, 8),
        isRunning: false
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Forge request failed", isRunning: false });
    }
  }
}));
