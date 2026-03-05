import type {
  SearchParams,
  FlightSearchResponse,
  FlightSearchError,
} from "@/lib/types/flight";

const BFF_SEARCH = "/api/flights/search";

export async function searchFlights(
  params: SearchParams
): Promise<FlightSearchResponse> {
  const q = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
  });
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${BFF_SEARCH}?${q}`
      : `http://localhost:3000${BFF_SEARCH}?${q}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    const err = data as FlightSearchError;
    throw new Error(err.error ?? "请求失败");
  }
  return data as FlightSearchResponse;
}
