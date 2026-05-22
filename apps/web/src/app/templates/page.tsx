import { templates } from "@senseforge/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimplePage } from "@/components/simple-page";

export default function TemplatesPage() {
  return (
    <SimplePage title="Templates" description="Reusable intelligence systems for strategy, creative, build, and workflow generation.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <Badge>{template.mode}</Badge>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </SimplePage>
  );
}
