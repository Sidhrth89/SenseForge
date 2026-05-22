import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimplePage } from "@/components/simple-page";

const items = [
  "Luxury jaggery chocolate campaign",
  "Premium market positioning analysis",
  "Next.js SaaS dashboard architecture"
];

export default function HistoryPage() {
  return (
    <SimplePage title="History" description="Saved generations and prompt versions will appear here after workspace use.">
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle>{item}</CardTitle>
              <CardDescription>Saved generation preview from the SenseForge workspace.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </SimplePage>
  );
}
