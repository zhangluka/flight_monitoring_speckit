/** 搜索参数，与 data-model / contracts 一致 */
export interface SearchParams {
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
}

/** 舱位与价格 */
export interface Cabin {
  name: string;
  price: number;
}

/** 航班条目 */
export interface Flight {
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  cabins: Cabin[];
}

/** BFF 搜索响应 */
export interface FlightSearchResponse {
  flights: Flight[];
}

/** BFF 错误响应 */
export interface FlightSearchError {
  error: string;
  code?: string;
}
