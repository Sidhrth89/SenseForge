import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimplePage } from "@/components/simple-page";

const projects = ["GUDLILY Launch Campaign", "AI SaaS Build System", "Creator Workflow OS"];

export default function ProjectsPage() {
  return (
    <SimplePage title="Projects" description="Project memory keeps prompts, workflows, brand tone, and generated systems together.">
      <div className="grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <Card key={project}>
            <CardHeader>
              <CardTitle>{project}</CardTitle>
              <CardDescription>Prompts, versions, workflows, and generation history are grouped here.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </SimplePage>
  );
}
