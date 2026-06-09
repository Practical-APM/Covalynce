"use client";

import { useCallback, useState } from "react";
import { Calculator, TrendingDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { useLoadEffect } from "@/hooks/use-load-effect";
import { api } from "@/lib/api";

type SimModel = Awaited<ReturnType<typeof api.simulationModels>>[number];
type SimResult = Awaited<ReturnType<typeof api.simulateCost>>;

export function WhatIfSimulator() {
  const { apiMode } = useAuth();
  const [models, setModels] = useState<SimModel[]>([]);
  const [fromModel, setFromModel] = useState("");
  const [toModel, setToModel] = useState("");
  const [volumeChange, setVolumeChange] = useState("0");
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!apiMode) return;
    const data = await api.simulationModels();
    setModels(data);
    if (data.length > 0 && !fromModel) {
      setFromModel(data[0].model);
      setToModel(data[0].suggestedAlternative ?? "");
    }
  }, [apiMode, fromModel]);

  useLoadEffect(load, [load]);

  const selected = models.find((m) => m.model === fromModel);

  async function runSimulation() {
    if (!fromModel || !toModel) return;
    setLoading(true);
    try {
      const res = await api.simulateCost({
        swaps: [{ fromModel, toModel }],
        volumeChangePercent: Number(volumeChange),
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  if (!apiMode || models.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4" />
          What-if cost simulator
        </CardTitle>
        <CardDescription>
          Project monthly savings if you swap models or change volume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Current model</Label>
            <Select
              value={fromModel}
              onValueChange={(v) => v && setFromModel(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.model} value={m.model}>
                    {m.model} ({formatCurrency(m.cost30d)}/30d)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Swap to</Label>
            <Select value={toModel} onValueChange={(v) => v && setToModel(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Target model" />
              </SelectTrigger>
              <SelectContent>
                {selected?.suggestedAlternative && (
                  <SelectItem value={selected.suggestedAlternative}>
                    {selected.suggestedAlternative} (suggested)
                  </SelectItem>
                )}
                {models
                  .filter((m) => m.model !== fromModel)
                  .map((m) => (
                    <SelectItem key={m.model} value={m.model}>
                      {m.model}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Volume change</Label>
            <Select
              value={volumeChange}
              onValueChange={(v) => v && setVolumeChange(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-20">−20% requests</SelectItem>
                <SelectItem value="0">No change</SelectItem>
                <SelectItem value="20">+20% requests</SelectItem>
                <SelectItem value="50">+50% requests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={runSimulation} disabled={loading || !toModel}>
          {loading ? "Calculating…" : "Run simulation"}
        </Button>

        {result && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Projected monthly savings
                </p>
                <p className="font-mono text-xl font-semibold">
                  {formatCurrency(result.monthlySavings)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({result.savingsPercent}%)
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(result.currentMonthlyProjected)} →{" "}
                  {formatCurrency(result.projectedMonthly)}/mo
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
