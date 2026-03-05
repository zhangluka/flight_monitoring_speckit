"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchFlights } from "@/lib/api/flights";
import { validateSearchParams } from "@/lib/validation/search-params";
import type { Flight } from "@/lib/types/flight";

export interface FlightSearchFormProps {
  onResults: (flights: Flight[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (message: string | null) => void;
}

export function FlightSearchForm({
  onResults,
  onLoading,
  onError,
}: FlightSearchFormProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    const validation = validateSearchParams({ origin, destination, date });
    if (!validation.valid) {
      onError(validation.error ?? "请补全必填项");
      return;
    }
    onLoading(true);
    try {
      const res = await searchFlights({ origin, destination, date });
      onResults(res.flights);
    } catch (err) {
      onError(err instanceof Error ? err.message : "请求失败");
      onResults([]);
    } finally {
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">出发地</span>
        <Input
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="城市或机场"
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">目的地</span>
        <Input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="城市或机场"
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">出行日期</span>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <Button type="submit">搜索</Button>
    </form>
  );
}
