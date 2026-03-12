import { getDataSourceConfig } from "@/lib/flights/data-source-config";
import { getMockFlights } from "@/lib/flights/mock-flights";
import { fetchFlightsFromRealApi } from "@/lib/flights/real-client";
import type { Flight } from "@/lib/types/flight";

/**
 * 根据当前数据源配置返回航班列表：mock 或真实 API。
 * 供 BFF 路由调用；便于单测时 mock 配置与数据源而无需加载 Next。
 */
export async function getFlightsForSearch(
  origin: string,
  destination: string,
  date: string
): Promise<Flight[]> {
  const config = getDataSourceConfig();
  if (config.mode === "mock") {
    return getMockFlights(origin, destination, date);
  }
  return fetchFlightsFromRealApi(config, { origin, destination, date });
}
