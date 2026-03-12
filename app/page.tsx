"use client";

import { useState } from "react";
import { FlightSearchForm } from "@/components/flight-search-form";
import { FlightList } from "@/components/flight-list";
import type { Flight } from "@/lib/types/flight";
import type { FlightListStatus } from "@/components/flight-list";

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status: FlightListStatus = error
    ? "error"
    : loading
      ? "loading"
      : flights.length === 0 && !loading
        ? "empty"
        : "idle";

  return (
    <main id="main-content" className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">国内航班与价格查询</h1>
      <div className="mt-6">
        <FlightSearchForm
          onResults={setFlights}
          onLoading={setLoading}
          onError={setError}
        />
      </div>
      <section className="mt-8" aria-live="polite" aria-atomic="true">
        <h2 className="mb-4 text-lg font-semibold">搜索结果</h2>
        <FlightList
          flights={flights}
          status={status}
          errorMessage={error ?? undefined}
        />
      </section>
    </main>
  );
}
