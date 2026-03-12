"use client";

import { useState, useRef } from "react";
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
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setInlineError(null);
    const validation = validateSearchParams({ origin, destination, date });
    if (!validation.valid) {
      const err = validation.error ?? "请补全必填项";
      setInlineError(err);
      onError(err);
      const trimmedOrigin = origin.trim();
      const trimmedDest = destination.trim();
      const trimmedDate = date.trim();
      if (!trimmedOrigin) originRef.current?.focus();
      else if (!trimmedDest) destinationRef.current?.focus();
      else if (!trimmedDate) dateRef.current?.focus();
      else if (trimmedOrigin === trimmedDest) originRef.current?.focus();
      else dateRef.current?.focus();
      return;
    }
    setIsLoading(true);
    onLoading(true);
    try {
      const res = await searchFlights({ origin, destination, date });
      onResults(res.flights);
    } catch (err) {
      onError(err instanceof Error ? err.message : "请求失败");
      onResults([]);
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <label htmlFor="origin" className="flex flex-col gap-1">
        <span className="text-sm font-medium">出发地</span>
        <Input
          id="origin"
          ref={originRef}
          name="origin"
          autoComplete="off"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="城市或机场，如 北京…"
          required
        />
      </label>
      <label htmlFor="destination" className="flex flex-col gap-1">
        <span className="text-sm font-medium">目的地</span>
        <Input
          id="destination"
          ref={destinationRef}
          name="destination"
          autoComplete="off"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="城市或机场，如 上海…"
          required
        />
      </label>
      <label htmlFor="date" className="flex flex-col gap-1">
        <span className="text-sm font-medium">出行日期</span>
        <Input
          id="date"
          ref={dateRef}
          name="date"
          autoComplete="off"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <div className="flex flex-col gap-1">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "搜索中…" : "搜索"}
        </Button>
        {inlineError && (
          <p className="text-sm text-red-600" role="alert">
            {inlineError}
          </p>
        )}
      </div>
    </form>
  );
}
