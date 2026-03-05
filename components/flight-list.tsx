"use client";

import { useState } from "react";
import type { Flight } from "@/lib/types/flight";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type FlightListStatus = "idle" | "loading" | "empty" | "error";

export interface FlightListProps {
  flights: Flight[];
  status: FlightListStatus;
  errorMessage?: string;
}

const PAGE_SIZE = 10;

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatPrice(price: number): string {
  return `¥${price}`;
}

export function FlightList({ flights, status, errorMessage }: FlightListProps) {
  const [page, setPage] = useState(1);

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
        加载中…
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {errorMessage ?? "加载失败，请稍后重试"}
      </div>
    );
  }
  if (status === "empty" || flights.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
        暂无符合条件的航班
      </div>
    );
  }
  const totalPages = Math.ceil(flights.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleFlights = flights.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <ul className="space-y-3">
        {visibleFlights.map((f, i) => (
          <li key={`${f.flightNumber}-${i}`}>
            <Card>
              <CardHeader className="pb-2 text-sm font-medium">
                {f.flightNumber} · {f.origin} → {f.destination}
              </CardHeader>
              <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 max-w-2xl">
                  <span className="font-medium text-gray-500">起飞</span>
                  <span>{formatTime(f.departureTime)}</span>
                  <span className="font-medium text-gray-500">到达</span>
                  <span>{formatTime(f.arrivalTime)}</span>
                  {f.cabins.length > 0 && (
                    <>
                      <span className="font-medium text-gray-500">舱位</span>
                      <span>
                        {f.cabins[0].name} {formatPrice(f.cabins[0].price)}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {flights.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
