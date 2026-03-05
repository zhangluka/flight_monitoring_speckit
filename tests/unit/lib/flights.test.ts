import { searchFlights } from "@/lib/api/flights";

describe("searchFlights", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("请求参数正确拼接到 URL", async () => {
    let capturedUrl = "";
    global.fetch = async (url: string) => {
      capturedUrl = url;
      return new Response(JSON.stringify({ flights: [] }), { status: 200 });
    };
    await searchFlights({
      origin: "北京",
      destination: "上海",
      date: "2025-03-10",
    });
    expect(capturedUrl).toContain("origin=北京");
    expect(capturedUrl).toContain("destination=上海");
    expect(capturedUrl).toContain("date=2025-03-10");
  });

  it("成功时返回 flights 数组", async () => {
    const mockFlights = [
      {
        flightNumber: "CA1234",
        departureTime: "2025-03-10T08:00:00+08:00",
        arrivalTime: "2025-03-10T10:30:00+08:00",
        origin: "北京",
        destination: "上海",
        cabins: [{ name: "经济舱", price: 800 }],
      },
    ];
    global.fetch = async () =>
      new Response(JSON.stringify({ flights: mockFlights }), { status: 200 });
    const res = await searchFlights({
      origin: "北京",
      destination: "上海",
      date: "2025-03-10",
    });
    expect(res.flights).toHaveLength(1);
    expect(res.flights[0].flightNumber).toBe("CA1234");
    expect(res.flights[0].cabins[0].price).toBe(800);
  });

  it("4xx/5xx 时抛出包含 error 信息的异常", async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: "请选择今日或之后的日期" }), {
        status: 400,
      });
    await expect(
      searchFlights({ origin: "北京", destination: "上海", date: "2020-01-01" })
    ).rejects.toThrow(/日期|请求失败|error/);
  });
});
