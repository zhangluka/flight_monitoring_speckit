import {
  fetchFlightsFromRealApi,
  REAL_API_ERROR_MESSAGE,
  RATE_LIMIT_MESSAGE,
} from "@/lib/flights/real-client";
import type { DataSourceConfig } from "@/lib/flights/data-source-config";

describe("fetchFlightsFromRealApi", () => {
  const config: DataSourceConfig = {
    mode: "real",
    baseUrl: "https://api.example.com",
    apiKey: "test-key",
  };
  const params = { origin: "北京", destination: "上海", date: "2026-04-01" };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("响应为 { flights: [...] } 时映射为 Flight[]", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          flights: [
            {
              flightNumber: "CA1234",
              departureTime: "2026-04-01T08:00:00+08:00",
              arrivalTime: "2026-04-01T10:30:00+08:00",
              origin: "北京",
              destination: "上海",
              cabins: [{ name: "经济舱", price: 800 }],
            },
          ],
        }),
    });

    const flights = await fetchFlightsFromRealApi(config, params);
    expect(flights).toHaveLength(1);
    expect(flights[0].flightNumber).toBe("CA1234");
    expect(flights[0].departureTime).toBe("2026-04-01T08:00:00+08:00");
    expect(flights[0].cabins[0].name).toBe("经济舱");
    expect(flights[0].cabins[0].price).toBe(800);
  });

  it("供应商返回部分字段时使用占位", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          flights: [
            {
              flight_number: "MU5678",
              origin: "北京",
              destination: "上海",
            },
          ],
        }),
    });

    const flights = await fetchFlightsFromRealApi(config, params);
    expect(flights).toHaveLength(1);
    expect(flights[0].flightNumber).toBe("MU5678");
    expect(flights[0].departureTime).toBe("—");
    expect(flights[0].arrivalTime).toBe("—");
    expect(flights[0].cabins).toEqual([{ name: "经济舱", price: 0 }]);
  });

  it("网络/超时失败时抛出用户可读错误", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network error"));

    await expect(fetchFlightsFromRealApi(config, params)).rejects.toThrow(
      REAL_API_ERROR_MESSAGE
    );
  });

  it("429 时抛出限流文案", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve(""),
    });

    await expect(fetchFlightsFromRealApi(config, params)).rejects.toThrow(
      RATE_LIMIT_MESSAGE
    );
  });

  it("5xx 时抛出用户可读错误", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    await expect(fetchFlightsFromRealApi(config, params)).rejects.toThrow(
      REAL_API_ERROR_MESSAGE
    );
  });

  it("config 非 real 或无 baseUrl 时抛出", async () => {
    await expect(
      fetchFlightsFromRealApi({ mode: "mock" }, params)
    ).rejects.toThrow(REAL_API_ERROR_MESSAGE);
  });
});
