/**
 * 数据源配置：从环境变量读取，决定 BFF 使用 mock 还是真实 API。
 * 未设置或无效时 mode 为 mock，保证搜索可用。
 * 见 specs/002-real-api-integration/contracts/data-source-config.md
 */

export type DataSourceMode = "mock" | "real";

export interface DataSourceConfig {
  mode: DataSourceMode;
  baseUrl?: string;
  apiKey?: string;
}

const VALID_REAL = "real";

export function getDataSourceConfig(): DataSourceConfig {
  const raw = process.env.FLIGHT_DATA_SOURCE?.trim().toLowerCase();
  const mode: DataSourceMode =
    raw === VALID_REAL ? "real" : "mock";

  if (mode !== "real") {
    return { mode: "mock" };
  }

  const baseUrl = process.env.FLIGHT_API_BASE_URL?.trim();
  const apiKey = process.env.FLIGHT_API_KEY?.trim();

  // 配置为 real 但端点或认证缺失/无效时回退 mock
  if (!baseUrl) {
    return { mode: "mock" };
  }

  return {
    mode: "real",
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey: apiKey || undefined,
  };
}
