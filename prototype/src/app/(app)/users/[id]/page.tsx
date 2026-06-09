"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserById } from "@/lib/mock-data";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoadEffect } from "@/hooks/use-load-effect";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { apiMode } = useAuth();
  const [loading, setLoading] = useState(apiMode);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("");
  const [cost, setCost] = useState(0);
  const [requests, setRequests] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [trend, setTrend] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!apiMode) {
      const user = getUserById(id);
      if (!user) {
        setNotFound(true);
        return;
      }
      setName(user.name);
      setEmail(user.email);
      setTeam(user.team);
      setCost(user.cost);
      setRequests(user.requests);
      setTokens(user.tokens);
      setTrend(user.trend);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const profile = await api.getUserProfile(id);
      setName(profile.name ?? profile.email);
      setEmail(profile.email);
      setTeam(profile.team ?? "Unassigned");
      setCost(profile.cost);
      setRequests(profile.requests);
      setTokens(profile.tokens);
      setTrend(null);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [apiMode, id]);

  useLoadEffect(load, [load]);

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">User not found.</p>
        <Link href="/users" className="text-sm text-primary hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading user…</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Users
      </Link>

      <PageHeader title={name} description={email}>
        <Badge variant="secondary">{team}</Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total cost (MTD)</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {formatCurrency(cost)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {trend != null ? `Trend ${formatPercent(trend)}` : "Month to date"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Requests</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {formatNumber(requests)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tokens</CardDescription>
            <CardTitle className="font-mono text-2xl">
              {formatNumber(tokens)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
