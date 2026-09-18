/**
 * Stat cards row (SectionCards in the shadcn dashboard block, adapted).
 * Pure presentation: pages compute the values from live API data; nothing
 * here fetches or mutates.
 */
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface StatCardItem {
  label: string;
  value: React.ReactNode;
  hint: React.ReactNode;
}

export function SectionCards({ items }: { items: StatCardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {items.map((item) => (
        <Card key={item.label} className="@container/card">
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {item.value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {item.hint}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}