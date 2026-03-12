import type { DataSourceConfig } from "@/lib/flights/data-source-config";
import type { Flight, Cabin } from "@/lib/types/flight";

/** 记录映射或请求失败日志，便于排查；不暴露原始错误给前端。 */
function logFlightService(message: string, detail?: Record<string, unknown>) {
  if (typeof console !== "undefined" && console.warn) {
    console.warn("[flight-real-client]", message, detail ?? "");
  }
}

/**
 * 将供应商单条航班原始数据尽力映射为 Flight；缺失字段用占位。
 */
function mapOneToFlight(
  raw: Record<string, unknown>,
  origin: string,
  destination: string,
  index: number
): Flight {
  const flightNumber =
    typeof raw.flightNumber === "string"
      ? raw.flightNumber
      : typeof raw.flight_number === "string"
        ? raw.flight_number
        : typeof raw.number === "string"
          ? raw.number
          : `FLT${index + 1}`;

  const dep =
    raw.departureTime ??
    raw.departure_time ??
    raw.departure ??
    raw.dep;
  const arr =
    raw.arrivalTime ?? raw.arrival_time ?? raw.arrival ?? raw.arr;
  const depStr = typeof dep === "string" ? dep : "";
  const arrStr = typeof arr === "string" ? arr : "";

  const cabinsRaw = raw.cabins ?? raw.cabin ?? raw.seats ?? raw.prices;
  let cabins: Cabin[] = [];
  if (Array.isArray(cabinsRaw) && cabinsRaw.length > 0) {
    cabins = cabinsRaw.map((c: unknown, i: number) => {
      const o = typeof c === "object" && c !== null ? (c as Record<string, unknown>) : {};
      const name =
        typeof o.name === "string"
          ? o.name
          : typeof o.cabin === "string"
            ? o.cabin
            : typeof o.class === "string"
              ? o.class
              : "舱位";
      const price =
        typeof o.price === "number"
          ? o.price
          : typeof o.amount === "number"
            ? o.amount
            : typeof o.price === "string"
              ? parseInt(o.price, 10) || 0
              : 0;
      return { name, price };
    });
  }
  if (cabins.length === 0) {
    cabins = [{ name: "经济舱", price: 0 }];
  }

  return {
    flightNumber,
    departureTime: depStr || "—",
    arrivalTime: arrStr || "—",
    origin: typeof raw.origin === "string" ? raw.origin : origin,
    destination: typeof raw.destination === "string" ? raw.destination : destination,
    cabins,
  };
}

/**
 * 从供应商响应体中提取航班数组并映射为 Flight[]；缺失字段占位并记录日志。
 */
function mapResponseToFlights(
  body: unknown,
  origin: string,
  destination: string
): Flight[] {
  if (!body || typeof body !== "object") {
    logFlightService("真实 API 响应非对象", { body: String(body) });
    return [];
  }
  const o = body as Record<string, unknown>;
  let list: unknown[] = [];
  if (Array.isArray(o.flights)) {
    list = o.flights;
  } else if (
    o.data &&
    typeof o.data === "object" &&
    Array.isArray((o.data as Record<string, unknown>).flights)
  ) {
    list = (o.data as Record<string, unknown>).flights as unknown[];
  } else if (Array.isArray(o.data)) {
    list = o.data;
  } else if (Array.isArray(o.results)) {
    list = o.results;
  }
  if (list.length === 0) {
    return [];
  }
  return list.map((item, index) => {
    const raw = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    return mapOneToFlight(raw, origin, destination, index);
  });
}

/** 用户可读的错误信息；不暴露堆栈与密钥。 */
export const REAL_API_ERROR_MESSAGE = "暂时无法查询航班，请稍后重试";
export const RATE_LIMIT_MESSAGE = "请求过于频繁，请稍后再试";

/**
 * 调用真实航班搜索 API，将响应尽力映射为 Flight[]。
 * 超时、4xx/5xx、网络错误时抛出带用户可读文案的 Error，并记录运维日志。
 */
export async function fetchFlightsFromRealApi(
  config: DataSourceConfig,
  params: { origin: string; destination: string; date: string }
): Promise<Flight[]> {
  if (config.mode !== "real" || !config.baseUrl) {
    throw new Error(REAL_API_ERROR_MESSAGE);
  }

  const { origin, destination, date } = params;
  const q = new URLSearchParams({ origin, destination, date });
  const url = `${config.baseUrl}/search?${q}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  let res: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logFlightService("真实 API 请求失败", {
      errorType: "network_or_timeout",
      origin,
      destination,
      date,
      detail: msg,
    });
    throw new Error(REAL_API_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 429) {
    logFlightService("真实 API 限流", {
      status: 429,
      origin,
      destination,
      date,
    });
    throw new Error(RATE_LIMIT_MESSAGE);
  }

  if (!res.ok) {
    const bodyText = await res.text();
    logFlightService("真实 API 错误响应", {
      status: res.status,
      origin,
      destination,
      date,
      bodyPreview: bodyText.slice(0, 200),
    });
    throw new Error(REAL_API_ERROR_MESSAGE);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    logFlightService("真实 API 响应非 JSON", { origin, destination, date });
    throw new Error(REAL_API_ERROR_MESSAGE);
  }

  const flights = mapResponseToFlights(body, origin, destination);
  return flights;
}
