import { Brain, Code2, Sparkles, Workflow } from "lucide-react";
import type { ForgeMode } from "@senseforge/shared";

export function ModeIcon({ mode }: { mode: ForgeMode }) {
  const Icon = {
    think: Brain,
    create: Sparkles,
    build: Code2,
    agents: Workflow
  }[mode];

  return <Icon aria-hidden="true" />;
}
