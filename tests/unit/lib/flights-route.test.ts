/**
 * BFF 数据源调度逻辑：通过 getFlightsForSearch 测试 config=mock 与 real 时的行为，
 * 无需加载 Next 的 route（避免 Request/NextRequest 在 Jest 中的兼容问题）。
 */
import { getFlightsForSearch } from "@/lib/flights";

jest.mock("@/lib/flights/data-source-config", () => ({
  getDataSourceConfig: jest.fn(),
}));

jest.mock("@/lib/flights/mock-flights", () => ({
  getMockFlights: jest.fn((origin: string, destination: string, date: string) => [
    {
      flightNumber: "CA1234",
      departureTime: `${date}T08:00:00+08:00`,
      arrivalTime: `${date}T10:30:00+08:00`,
      origin,
      destination,
      cabins: [{ name: "经济舱", price: 800 }],
    },
  ]),
}));

jest.mock("@/lib/flights/real-client", () => ({
  fetchFlightsFromRealApi: jest.fn(),
}));

const getDataSourceConfig =
  require("@/lib/flights/data-source-config").getDataSourceConfig;
const fetchFlightsFromRealApi =
  require("@/lib/flights/real-client").fetchFlightsFromRealApi;

describe("getFlightsForSearch（BFF 数据源调度）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("config 为 mock 时返回 mock 数据且不调用真实客户端", async () => {
    getDataSourceConfig.mockReturnValue({ mode: "mock" });
    const flights = await getFlightsForSearch("北京", "上海", "2026-04-01");
    expect(flights).toHaveLength(1);
    expect(flights[0].flightNumber).toBe("CA1234");
    expect(fetchFlightsFromRealApi).not.toHaveBeenCalled();
  });

  it("config 为 real 时调用真实客户端并返回其结果", async () => {
    getDataSourceConfig.mockReturnValue({
      mode: "real",
      baseUrl: "https://api.example.com",
      apiKey: "key",
    });
    fetchFlightsFromRealApi.mockResolvedValue([
      {
        flightNumber: "MU5678",
        departureTime: "2026-04-01T14:00:00+08:00",
        arrivalTime: "2026-04-01T16:00:00+08:00",
        origin: "北京",
        destination: "上海",
        cabins: [{ name: "经济舱", price: 720 }],
      },
    ]);
    const flights = await getFlightsForSearch("北京", "上海", "2026-04-01");
    expect(flights).toHaveLength(1);
    expect(flights[0].flightNumber).toBe("MU5678");
    expect(fetchFlightsFromRealApi).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "real", baseUrl: "https://api.example.com" }),
      { origin: "北京", destination: "上海", date: "2026-04-01" }
    );
  });

  it("真实客户端抛错时向上抛出", async () => {
    getDataSourceConfig.mockReturnValue({
      mode: "real",
      baseUrl: "https://api.example.com",
      apiKey: "key",
    });
    fetchFlightsFromRealApi.mockRejectedValue(new Error("network error"));
    await expect(
      getFlightsForSearch("北京", "上海", "2026-04-01")
    ).rejects.toThrow("network error");
  });
});
