"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ranges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "mtd", label: "Month to date" },
  { value: "last_month", label: "Last month" },
];

export function DateRangeSelect({
  value = "mtd",
  onValueChange,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => v && onValueChange?.(v)}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Date range" />
      </SelectTrigger>
      <SelectContent>
        {ranges.map((r) => (
          <SelectItem key={r.value} value={r.value}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
