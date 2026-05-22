import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimplePage } from "@/components/simple-page";

export default function SettingsPage() {
  return (
    <SimplePage title="Settings" description="Provider routing, usage limits, workspace memory, and extension configuration.">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Provider Layer", "OpenAI, Gemini, Anthropic, and OpenRouter keys are configured server-side."],
          ["Quota Controls", "Free plan limits, usage logs, and billing-ready event capture."],
          ["Extension", "Popup, selected text actions, and page context submission."],
          ["Memory", "Projects, templates, favorites, prompt versions, and workflow runs."]
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </SimplePage>
  );
}
